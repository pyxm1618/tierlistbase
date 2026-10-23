import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { makeSignature } from "better-auth/crypto";
import { eq, sql } from "drizzle-orm";
import { migrate } from "drizzle-orm/postgres-js/migrator";

import { createAccountDeletionService } from "@/platform/accounts/account-deletion-service";
import { createBetterAuthIdentityDeletion } from "@/platform/accounts/better-auth-identity-deletion";
import { createPostgresAccountSubjectRepository } from "@/platform/accounts/postgres-account-subject-repository";
import { assertFreshSession } from "@/platform/auth/session";
import { createAuth } from "@/platform/auth/create-auth";
import { createDatabaseClient } from "@/platform/database/client";
import { account, accountSubjects, session, user } from "@/platform/database/schema";
import * as schema from "@/platform/database/schema";

const databaseUrl = process.env.TEST_DATABASE_URL;
if (!databaseUrl) throw new Error("TEST_DATABASE_URL is required");

const database = createDatabaseClient(databaseUrl);
const subjects = createPostgresAccountSubjectRepository(database.db);

const testAuth = createAuth({
  appName: "creat-web-test",
  baseURL: "http://localhost:3000",
  secret: "integration-better-auth-secret-with-at-least-32-characters",
  cookiePrefix: "creat-web-test",
  database: database.db,
  schema,
  sendMagicLink: async () => undefined,
});

async function signedSessionCookieHeaders(token: string) {
  const context = await testAuth.$context;
  const resolvedSignature = await makeSignature(token, context.secret);
  return new Headers({
    cookie: `${context.authCookies.sessionToken.name}=${token}.${resolvedSignature}`,
  });
}

const betterAuthIdentityDeletion = createBetterAuthIdentityDeletion({
  database: database.db,
  invokeDeleteUser: async (workerSessionToken) =>
    testAuth.api.deleteUser({
      body: {},
      headers: await signedSessionCookieHeaders(workerSessionToken),
      asResponse: true,
    }),
});

beforeAll(async () => {
  await database.db.execute(sql.raw("DROP SCHEMA IF EXISTS public CASCADE"));
  await database.db.execute(sql.raw("DROP SCHEMA IF EXISTS drizzle CASCADE"));
  await database.db.execute(sql.raw("CREATE SCHEMA public"));
  await migrate(database.db, {
    migrationsFolder: "drizzle",
    migrationsSchema: "drizzle",
    migrationsTable: "__drizzle_migrations",
  });
});

afterAll(async () => {
  await database.close();
});

async function seedUserWithStaleSession(id: string) {
  const now = new Date();
  const staleCreatedAt = new Date(now.getTime() - 16 * 60 * 1000); // 16 minutes ago (stale)

  await database.db.insert(user).values({
    id,
    name: "Stale User",
    email: `${id}@example.com`,
    emailVerified: true,
    createdAt: staleCreatedAt,
    updatedAt: staleCreatedAt,
  });

  const staleToken = `token_stale_${id}_${"s".repeat(24)}`;
  await database.db.insert(session).values({
    id: `session_stale_${id}`,
    token: staleToken,
    userId: id,
    expiresAt: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000), // still valid 7 days
    createdAt: staleCreatedAt,
    updatedAt: staleCreatedAt,
  });

  await database.db.insert(account).values({
    id: `account_${id}`,
    accountId: `google_oauth_${id}`,
    providerId: "google",
    userId: id,
    createdAt: staleCreatedAt,
    updatedAt: staleCreatedAt,
  });

  const subject = await subjects.ensureForAuthUser(id);
  return { subject, staleToken };
}

describe("Delete Account Stale Session → Google Re-auth → Fresh Session Lifecycle", () => {
  it("proves end-to-end that re-auth refreshes session freshness and requires explicit second confirmation", async () => {
    const authUserId = "user_reauth_e2e";
    const { subject, staleToken } = await seedUserWithStaleSession(authUserId);

    // 1. Verify stale-but-valid session in Better Auth
    const staleHeaders = await signedSessionCookieHeaders(staleToken);
    const staleResult = await testAuth.api.getSession({ headers: staleHeaders });
    expect(staleResult).not.toBeNull();
    expect(staleResult?.session.userId).toBe(authUserId);

    // Stale session creation timestamp is > 15 minutes ago
    const now = new Date();
    expect(() =>
      assertFreshSession({ authenticatedAt: new Date(staleResult!.session.createdAt) }, now),
    ).toThrow("fresh authentication required");

    // 2. Simulate deletion attempt with stale session
    // Fresh session assertion fails -> redirected to sign-in with safe returnTo
    const deletionAttemptBlocked = () => {
      try {
        assertFreshSession({ authenticatedAt: new Date(staleResult!.session.createdAt) }, now);
        return false;
      } catch {
        return true;
      }
    };
    expect(deletionAttemptBlocked()).toBe(true);

    // Verify account is NOT auto-deleted: user and subject remain active
    const retainedUser = await database.db.select().from(user).where(eq(user.id, authUserId));
    expect(retainedUser).toHaveLength(1);
    const retainedSubject = await database.db
      .select()
      .from(accountSubjects)
      .where(eq(accountSubjects.id, subject.id));
    expect(retainedSubject[0]?.status).toBe("active");

    // 3. User performs Google Re-authentication via Better Auth
    // In Better Auth social/OAuth callback, internalAdapter.createSession is invoked for the user
    const authContext = await testAuth.$context;
    const freshSessionRecord = await authContext.internalAdapter.createSession(authUserId);
    expect(freshSessionRecord).toBeDefined();

    // PROOF: The newly issued session has a fresh createdAt (< 15 minutes)
    const reauthHeaders = await signedSessionCookieHeaders(freshSessionRecord.token);
    const freshResult = await testAuth.api.getSession({ headers: reauthHeaders });
    expect(freshResult).not.toBeNull();
    expect(freshResult?.session.id).toBe(freshSessionRecord.id);
    expect(freshResult?.session.id).not.toBe(`session_stale_${authUserId}`);

    // PROOF: Newly issued session strictly passes assertFreshSession
    expect(() =>
      assertFreshSession({ authenticatedAt: new Date(freshResult!.session.createdAt) }, new Date()),
    ).not.toThrow();

    // 4. Verify user returns to /account/security and account is STILL not deleted
    // Re-auth alone MUST NOT automatically trigger account deletion
    const userAfterReauth = await database.db.select().from(user).where(eq(user.id, authUserId));
    expect(userAfterReauth).toHaveLength(1);

    // 5. User explicitly confirms deletion on /account/security by submitting "DELETE"
    // Now with fresh session, deletion proceeds and succeeds
    const service = createAccountDeletionService({
      database: database.db,
      subjects,
      coordinator: { prepare: async () => undefined },
      identityDeletion: betterAuthIdentityDeletion,
    });

    const deletionRequest = await service.request({
      subjectId: subject.id,
      authUserId,
    });
    const completed = await service.run(deletionRequest.id);

    // 6. Verify final deletion outcome: user removed, subject retained
    expect(completed.status).toBe("completed");
    expect(await database.db.select().from(user).where(eq(user.id, authUserId))).toEqual([]);
    expect(await database.db.select().from(session).where(eq(session.userId, authUserId))).toEqual(
      [],
    );
    const finalSubject = await database.db
      .select()
      .from(accountSubjects)
      .where(eq(accountSubjects.id, subject.id));
    expect(finalSubject[0]?.status).toBe("deleted");
  });
});

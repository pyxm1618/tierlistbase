import { and, desc, eq, gt } from "drizzle-orm";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { AccountShell } from "@/components/account/account-shell";
import {
  bodyText,
  buttonDanger,
  buttonSecondary,
  input,
  label,
  listDivided,
  metaText,
  panel,
  subTitle,
} from "@/components/ui/styles";
import { getAccountContext } from "@/platform/auth/account-context";
import { db } from "@/platform/database/application-database";
import { session } from "@/platform/database/schema";

import {
  revokeAllSessionsAction,
  revokeOtherSessionsAction,
  revokeSessionAction,
  signOutAction,
} from "./actions";

function formatDate(value: Date | string): string {
  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "UTC",
  }).format(new Date(value));
}

export default async function AccountSecurityPage() {
  const requestHeaders = await headers();
  const context = await getAccountContext(requestHeaders);
  if (!context) redirect("/sign-in");

  const sessions = await db
    .select({
      id: session.id,
      createdAt: session.createdAt,
      expiresAt: session.expiresAt,
      userAgent: session.userAgent,
    })
    .from(session)
    .where(and(eq(session.userId, context.user.id), gt(session.expiresAt, new Date())))
    .orderBy(desc(session.createdAt));

  return (
    <AccountShell
      eyebrow="Account"
      title="Security"
      titleId="security-title"
      intro="Manage active sessions and account deletion."
    >
      <h2 className={subTitle}>Active sessions</h2>
      <ul className={`mt-4 ${panel} ${listDivided} px-5`}>
        {sessions.map((sessionRecord) => {
          const current = sessionRecord.id === context.session.id;
          return (
            <li
              key={sessionRecord.id}
              className="flex flex-wrap items-start justify-between gap-4 py-4"
            >
              <div className="min-w-0">
                <p className="text-sm font-medium text-foreground">
                  {current ? "Current session" : "Other session"}
                </p>
                <p className={`mt-1 ${metaText}`}>
                  {sessionRecord.userAgent ?? "Unknown browser"}
                </p>
                <p className={`mt-1 ${metaText}`}>
                  Created {formatDate(sessionRecord.createdAt)} · Expires{" "}
                  {formatDate(sessionRecord.expiresAt)}
                </p>
              </div>
              {!current ? (
                <form action={revokeSessionAction}>
                  <input type="hidden" name="sessionId" value={sessionRecord.id} />
                  <button type="submit" className={buttonSecondary}>
                    Revoke this session
                  </button>
                </form>
              ) : null}
            </li>
          );
        })}
      </ul>

      <div className="mt-6 flex flex-wrap gap-3">
        <form action={revokeOtherSessionsAction}>
          <button type="submit" className={buttonSecondary}>
            Revoke all other sessions
          </button>
        </form>
        <form action={signOutAction}>
          <button type="submit" className={buttonSecondary}>
            Sign out this session
          </button>
        </form>
        <form action={revokeAllSessionsAction}>
          <button type="submit" className={buttonSecondary}>
            Revoke every session
          </button>
        </form>
      </div>

      <div className="mt-12 rounded-xl border border-red-200 bg-red-50/50 p-6 dark:border-red-900/60 dark:bg-red-950/20">
        <h2 className={subTitle}>Delete account</h2>
        <p className={`mt-3 ${bodyText}`}>
          This revokes all access and permanently removes your authentication identity. Required
          financial or security records may remain pseudonymized according to the published policy.
        </p>
        <p className={`mt-2 ${bodyText}`}>
          Deleting your account will not release your Vanguard Seat; Seat IDs are permanent and
          never reassigned. Inscribed personal text and images are removed or hidden, and the seat
          permanently remains as an Unavailable Plate in the Monument.
        </p>
        <form action="/api/account/delete" method="post" className="mt-5 max-w-sm">
          <label htmlFor="delete-confirmation" className={label}>
            Type DELETE to confirm
          </label>
          <input
            id="delete-confirmation"
            name="confirmation"
            type="text"
            autoComplete="off"
            pattern="DELETE"
            required
            className={input}
          />
          <button type="submit" className={`mt-4 ${buttonDanger}`}>
            Permanently delete account
          </button>
        </form>
      </div>
    </AccountShell>
  );
}

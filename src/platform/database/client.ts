import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import * as schema from "./schema";

export function createDatabaseClient(url: string, maxConnections = 5) {
  const client = postgres(url, {
    max: maxConnections,
    prepare: false,
    connect_timeout: 10,
  });

  return {
    db: drizzle(client, { schema }),
    close: async () => client.end({ timeout: 5 }),
  };
}

export type DatabaseClient = ReturnType<typeof createDatabaseClient>["db"];
export type DatabaseTransaction = Parameters<Parameters<DatabaseClient["transaction"]>[0]>[0];

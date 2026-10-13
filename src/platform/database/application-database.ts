import "server-only";

import { AsyncLocalStorage } from "node:async_hooks";

import { env } from "@/platform/config/env";

import { createDatabaseClient } from "./client";

const applicationDatabase = createDatabaseClient(env.databaseUrl);
const requestDatabase = new AsyncLocalStorage<ReturnType<typeof createDatabaseClient>>();

// Workers sockets belong to one request; Node keeps its existing shared pool.
export const db = new Proxy(applicationDatabase.db, {
  get(target, property) {
    const database = requestDatabase.getStore()?.db ?? target;
    const value = Reflect.get(database, property);
    return typeof value === "function" ? value.bind(database) : value;
  },
});

export function runWithRequestDatabase<T>(operation: (close: () => Promise<void>) => T): T {
  const database = createDatabaseClient(env.databaseUrl);
  return requestDatabase.run(database, () => operation(database.close));
}

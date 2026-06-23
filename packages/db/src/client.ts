import { drizzle, type NodePgDatabase } from "drizzle-orm/node-postgres";
import type { Pool } from "pg";
import { env } from "./env";

export type DatabaseInstance = NodePgDatabase & { $client: Pool };

export const db: DatabaseInstance = drizzle({
  connection: {
    connectionString: env.DATABASE_URL,
  },
});

export * as schema from "./schema";

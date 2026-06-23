import { PgClient } from "@effect/sql-pg";
import * as PgDrizzle from "drizzle-orm/effect-postgres";
import * as Effect from "effect/Effect";
import * as Redacted from "effect/Redacted";
import { env } from "./env";

export const pgClientLayer = PgClient.layer({
  url: Redacted.make(env.DATABASE_URL),
});

export const effectDb = PgDrizzle.makeWithDefaults();

export const effectDbLive = effectDb.pipe(Effect.provide(pgClientLayer));

export type EffectDatabaseInstance = Effect.Success<typeof effectDb>;

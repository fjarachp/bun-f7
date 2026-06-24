import { PgClient } from "@effect/sql-pg";
import * as PgDrizzle from "drizzle-orm/effect-postgres";
import * as Effect from "effect/Effect";
import { pool } from "./pool";

export const pgClientLayer = PgClient.layerFrom(
  PgClient.fromPool({
    acquire: Effect.succeed(pool),
  }),
);

export const effectDb = PgDrizzle.makeWithDefaults();

export const effectDbLive = effectDb.pipe(Effect.provide(pgClientLayer));

export type EffectDatabaseInstance = Effect.Success<typeof effectDb>;

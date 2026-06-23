import { type DatabaseInstance, db } from "@repo/db/client";
import { Context, Effect, Layer } from "effect";

export class DatabaseService extends Context.Service<
  DatabaseService,
  {
    readonly db: DatabaseInstance;
  }
>()("ApiDatabaseService", {
  make: Effect.succeed({ db }),
}) {
  static readonly layer = Layer.effect(this)(this.make);
}

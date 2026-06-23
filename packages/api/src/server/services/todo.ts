import { desc, eq } from "@repo/db";
import { type TodoCreate, type TodoUpdate, type TodoUpsert, todos } from "@repo/db/schema";
import { Context, Effect, Layer, Schema } from "effect";
import { DatabaseService } from "./database";
import { wrapDatabaseError } from "./errors";

export class TodoNotFoundError extends Schema.TaggedErrorClass<TodoNotFoundError>()(
  "TodoNotFoundError",
  { id: Schema.String },
) {}

export class TodoService extends Context.Service<
  TodoService,
  {
    readonly byId: (
      id: string,
    ) => Effect.Effect<
      typeof todos.$inferSelect,
      TodoNotFoundError | ReturnType<typeof wrapDatabaseError>
    >;
    readonly create: (
      input: TodoCreate,
    ) => Effect.Effect<typeof todos.$inferSelect, ReturnType<typeof wrapDatabaseError>>;
    readonly delete: (
      id: string,
    ) => Effect.Effect<
      typeof todos.$inferSelect,
      TodoNotFoundError | ReturnType<typeof wrapDatabaseError>
    >;
    readonly list: () => Effect.Effect<
      ReadonlyArray<typeof todos.$inferSelect>,
      ReturnType<typeof wrapDatabaseError>
    >;
    readonly update: (
      input: TodoUpdate & { id: string },
    ) => Effect.Effect<
      typeof todos.$inferSelect,
      TodoNotFoundError | ReturnType<typeof wrapDatabaseError>
    >;
    readonly upsert: (
      input: TodoUpsert,
    ) => Effect.Effect<
      typeof todos.$inferSelect,
      TodoNotFoundError | ReturnType<typeof wrapDatabaseError>
    >;
  }
>()("TodoService", {
  make: Effect.gen(function* () {
    const { db } = yield* DatabaseService;

    const fromDb = <A>(operation: () => PromiseLike<A>) =>
      Effect.tryPromise({
        try: () => Promise.resolve(operation()),
        catch: wrapDatabaseError,
      });

    const requireRow = <A>(row: A | undefined, id: string) =>
      row ? Effect.succeed(row) : Effect.fail(new TodoNotFoundError({ id }));

    const list = Effect.fn("TodoService.list")(function* () {
      const results = yield* fromDb(() => db.select().from(todos).orderBy(desc(todos.createdAt)));

      yield* Effect.logDebug("Listed todos").pipe(Effect.annotateLogs({ count: results.length }));

      return results;
    });

    const byId = Effect.fn("TodoService.byId")(function* (id: string) {
      yield* Effect.annotateCurrentSpan("todo.id", id);

      const [todo] = yield* fromDb(() => db.select().from(todos).where(eq(todos.id, id)));

      return yield* requireRow(todo, id);
    });

    const create = Effect.fn("TodoService.create")(function* (input: TodoCreate) {
      const [created] = yield* fromDb(() => db.insert(todos).values(input).returning());

      if (!created) {
        return yield* Effect.fail(wrapDatabaseError(new Error("Todo insert returned no rows")));
      }

      yield* Effect.logInfo("Todo created").pipe(Effect.annotateLogs({ todoId: created.id }));

      return created;
    });

    const update = Effect.fn("TodoService.update")(function* (input: TodoUpdate & { id: string }) {
      const { id, ...data } = input;
      yield* Effect.annotateCurrentSpan("todo.id", id);

      const [updated] = yield* fromDb(() =>
        db
          .update(todos)
          .set({ ...data, updatedAt: new Date() })
          .where(eq(todos.id, id))
          .returning(),
      );

      return yield* requireRow(updated, id);
    });

    const upsert = Effect.fn("TodoService.upsert")(function* (input: TodoUpsert) {
      const { id, ...data } = input;

      if (id) {
        return yield* update({ ...data, id });
      }

      return yield* create(data);
    });

    const deleteTodo = Effect.fn("TodoService.delete")(function* (id: string) {
      yield* Effect.annotateCurrentSpan("todo.id", id);

      const [deleted] = yield* fromDb(() => db.delete(todos).where(eq(todos.id, id)).returning());

      return yield* requireRow(deleted, id);
    });

    return {
      byId,
      create,
      delete: deleteTodo,
      list,
      update,
      upsert,
    };
  }),
}) {
  static readonly layer = Layer.effect(this)(this.make);
}

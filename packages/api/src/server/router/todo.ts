import { apiTodoCreate, apiTodoId, apiTodoUpdate, apiTodoUpsert } from "@repo/db/schema";

import { Effect } from "effect";
import { type TRPCRouterRecord } from "@trpc/server";
import { effectProtectedProcedure, effectPublicProcedure } from "../trpc";
import { MissingTodoIdError } from "../services/errors";
import { TodoService } from "../services/todo";
import type { RouterOutput } from "../utils";

export type TodoAllProcedure = RouterOutput["todo"]["list"];

const todoRouter = {
  list: effectPublicProcedure.query(() =>
    Effect.gen(function* () {
      const todoService = yield* TodoService;
      return yield* todoService.list();
    }),
  ),

  byId: effectPublicProcedure.input(apiTodoId).query(({ input }) =>
    Effect.gen(function* () {
      if (!input.id) {
        return yield* Effect.fail(new MissingTodoIdError());
      }

      const todoService = yield* TodoService;
      return yield* todoService.byId(input.id);
    }),
  ),

  create: effectProtectedProcedure.input(apiTodoCreate).mutation(({ input }) =>
    Effect.gen(function* () {
      const todoService = yield* TodoService;
      return yield* todoService.create(input);
    }),
  ),

  update: effectProtectedProcedure.input(apiTodoUpdate).mutation(({ input }) =>
    Effect.gen(function* () {
      if (!input.id) {
        return yield* Effect.fail(new MissingTodoIdError());
      }

      const todoService = yield* TodoService;
      return yield* todoService.update({ ...input, id: input.id });
    }),
  ),

  upsert: effectProtectedProcedure.input(apiTodoUpsert).mutation(({ input }) =>
    Effect.gen(function* () {
      const todoService = yield* TodoService;
      return yield* todoService.upsert(input);
    }),
  ),

  delete: effectProtectedProcedure.input(apiTodoId).mutation(({ input }) =>
    Effect.gen(function* () {
      if (!input.id) {
        return yield* Effect.fail(new MissingTodoIdError());
      }

      const todoService = yield* TodoService;
      return yield* todoService.delete(input.id);
    }),
  ),
} satisfies TRPCRouterRecord;

export default todoRouter;

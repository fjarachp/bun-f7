import { Layer, ManagedRuntime } from "effect";
import { DatabaseService } from "../services/database";
import { TodoService } from "../services/todo";

const TodoLive = TodoService.layer.pipe(Layer.provide(DatabaseService.layer));

const RuntimeLayer = Layer.mergeAll(DatabaseService.layer, TodoLive);

export const serverRuntime = ManagedRuntime.make(RuntimeLayer);

export type RuntimeContext = ManagedRuntime.ManagedRuntime.Services<typeof serverRuntime>;

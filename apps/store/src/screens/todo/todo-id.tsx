import TodoDetail from "@apps/store/components/todo/todo-detail";
import { Route } from "@apps/store/routes/todo/$todoId";
import { useTRPC } from "@apps/store/trpc/react";
import { useSuspenseQuery } from "@tanstack/react-query";

const TodoIdScreen = () => {
  const trpc = useTRPC();
  const { todoId } = Route.useParams();
  const todoQuery = useSuspenseQuery(trpc.todo.byId.queryOptions({ id: todoId }));

  return <TodoDetail todo={todoQuery.data} todoId={todoId} />;
};

export default TodoIdScreen;

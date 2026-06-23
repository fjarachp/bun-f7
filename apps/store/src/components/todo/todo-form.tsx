import { useTRPC } from "@apps/store/trpc/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Trans, useLingui } from "@lingui/react/macro";
import { apiTodoUpsert, type Todo, TodoStatus, type TodoUpsert } from "@repo/db/schema";
import { Button } from "@repo/ui/components/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@repo/ui/components/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@repo/ui/components/form";
import { Input } from "@repo/ui/components/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@repo/ui/components/select";
import { Switch } from "@repo/ui/components/switch";
import { Textarea } from "@repo/ui/components/textarea";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

interface TodoFormProps {
  todo?: Todo;
  children?: React.ReactNode;
}

const TodoForm = ({ todo, children }: TodoFormProps) => {
  const { t } = useLingui();
  const [open, setOpen] = useState(false);
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const form = useForm<TodoUpsert>({
    resolver: zodResolver(apiTodoUpsert),
    defaultValues: {
      id: todo?.id,
      text: todo?.text || "",
      description: todo?.description || "",
      status: todo?.status || TodoStatus.NOT_STARTED,
      active: todo?.active ?? true,
    },
  });

  // Upsert mutation with optimistic updates
  const upsertMutation = useMutation(
    trpc.todo.upsert.mutationOptions({
      onMutate: async (variables) => {
        await queryClient.cancelQueries({
          queryKey: trpc.todo.list.queryKey(),
          exact: true,
        });

        const previousData = queryClient.getQueryData(trpc.todo.list.queryKey());

        const isUpdate = !!variables.id;

        if (isUpdate) {
          // Optimistic update for existing todo
          queryClient.setQueryData(trpc.todo.list.queryKey(), (old) => {
            if (!old) {
              return previousData;
            }
            return old.map((todo) =>
              todo.id === variables.id ? { ...todo, ...variables, updatedAt: new Date() } : todo,
            );
          });

          return { previousData, isUpdate, tempId: undefined };
        }

        // Optimistic create for new todo
        const tempId = `temp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

        const optimisticTodo: Todo = {
          id: tempId,
          active: variables.active ?? true,
          text: variables.text,
          status: variables.status ?? TodoStatus.NOT_STARTED,
          description: variables.description ?? null,
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        queryClient.setQueryData(trpc.todo.list.queryKey(), (old) => {
          if (!old) {
            return [optimisticTodo];
          }
          return [optimisticTodo, ...old];
        });

        return { previousData, isUpdate, tempId };
      },
      onError: (_err, _variables, context) => {
        queryClient.setQueryData(trpc.todo.list.queryKey(), context?.previousData);
      },
      onSuccess: async (result, _variables, context) => {
        if (!result) return;

        queryClient.setQueryData(trpc.todo.list.queryKey(), (old) => {
          if (!old) {
            return [result];
          }

          if (context?.isUpdate) {
            return old.map((todo) => (todo.id === result.id ? result : todo));
          }

          // Replace optimistic todo with real one
          return old.map((todo) => (todo.id === context?.tempId ? result : todo));
        });

        if (context?.isUpdate) {
          await queryClient.invalidateQueries({
            queryKey: trpc.todo.byId.queryKey({
              id: result.id,
            }),
          });
        } else {
          form.reset();
        }

        setOpen(false);
      },
    }),
  );

  const onSubmit = (data: TodoUpsert) => {
    const isUpdate = !!data.id;
    toast.promise(upsertMutation.mutateAsync(data), {
      loading: isUpdate ? t`Updating todo...` : t`Creating todo...`,
      success: (result) => {
        if (!result) return t`Todo saved successfully`;
        return isUpdate
          ? t`"${result.text}" has been updated`
          : t`"${result.text}" has been added to your list`;
      },
      error: (err) =>
        isUpdate ? t`Error updating todo: ${err.message}` : t`Error creating todo: ${err.message}`,
    });
  };

  return (
    <Dialog onOpenChange={setOpen} open={open}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {todo ? <Trans>Edit Todo</Trans> : <Trans>Create New Todo</Trans>}
          </DialogTitle>
          <DialogDescription>
            {todo ? (
              <Trans>Make changes to your todo item</Trans>
            ) : (
              <Trans>Add a new task to your todo list</Trans>
            )}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
            <FormField
              control={form.control}
              name="text"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    <Trans>Task</Trans>
                  </FormLabel>
                  <FormControl>
                    <Input placeholder={t`Enter task description`} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    <Trans>Description</Trans>
                  </FormLabel>
                  <FormControl>
                    <Textarea placeholder={t`Enter optional description`} rows={3} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    <Trans>Status</Trans>
                  </FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder={t`Select status`} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value={TodoStatus.NOT_STARTED}>
                        <Trans>Not Started</Trans>
                      </SelectItem>
                      <SelectItem value={TodoStatus.IN_PROGRESS}>
                        <Trans>In Progress</Trans>
                      </SelectItem>
                      <SelectItem value={TodoStatus.COMPLETED}>
                        <Trans>Completed</Trans>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="active"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                  <div className="space-y-0.5">
                    <FormLabel>
                      <Trans>Active</Trans>
                    </FormLabel>
                    <div className="text-muted-foreground text-sm">
                      <Trans>Set whether this todo is active</Trans>
                    </div>
                  </div>
                  <FormControl>
                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                </FormItem>
              )}
            />
            <Button className="w-full" disabled={upsertMutation.isPending} type="submit">
              {todo ? <Trans>Update Todo</Trans> : <Trans>Create Todo</Trans>}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default TodoForm;

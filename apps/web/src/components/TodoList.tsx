import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../api";
import { motion, AnimatePresence } from "framer-motion";
import clsx from "clsx";
import { Check, Trash2, Plus } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import dayjs from "dayjs";

export function TodoList() {
  const queryClient = useQueryClient();
  const [newTodo, setNewTodo] = useState("");

  const { data: todos, isLoading } = useQuery({
    queryKey: ["todos"],
    queryFn: api.getTodos,
  });

  const toggleMutation = useMutation({
    mutationFn: api.toggleTodo,
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ["todos"] });
      const previousTodos = queryClient.getQueryData(["todos"]);
      queryClient.setQueryData(["todos"], (old: any[]) => {
        return old.map((t) =>
          t.id === id ? { ...t, completed: !t.completed } : t,
        );
      });
      return { previousTodos };
    },
    onError: (_err, _newTodo, context: any) => {
      queryClient.setQueryData(["todos"], context.previousTodos);
      toast.error("Failed to update task");
    },
    onSuccess: () => {
      // No invalidation needed immediately if SSE is working, but harmless
    },
  });

  const createMutation = useMutation({
    mutationFn: api.createTodo,
    onMutate: async (text) => {
      await queryClient.cancelQueries({ queryKey: ["todos"] });
      const previousTodos = queryClient.getQueryData(["todos"]);
      const newTodo = { id: `temp-${Date.now()}`, text, completed: false };
      queryClient.setQueryData(["todos"], (old: any[] = []) => [
        newTodo,
        ...old,
      ]);
      setNewTodo("");
      return { previousTodos };
    },
    onError: (_err, _newTodo, context: any) => {
      queryClient.setQueryData(["todos"], context.previousTodos);
      setNewTodo(_newTodo);
      toast.error("Failed to create task");
    },
    onSuccess: () => {
      // Replace temp ID with real one or invalidate
      queryClient.invalidateQueries({ queryKey: ["todos"] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: api.deleteTodo,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["todos"] }),
    onError: () => toast.error("Failed to delete task"),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTodo.trim()) {
      createMutation.mutate(newTodo);
    }
  };

  if (isLoading) return <div className="text-slate-400">Loading todos...</div>;

  return (
    <div className="h-full flex flex-col">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-slate-200">Tasks</h2>
      </div>

      <form onSubmit={handleSubmit} className="mb-4 flex gap-2">
        <input
          type="text"
          value={newTodo}
          onChange={(e) => setNewTodo(e.target.value)}
          placeholder="Add a task..."
          className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-slate-200 focus:outline-none focus:border-indigo-500 transition-colors"
        />
        <button
          type="submit"
          disabled={!newTodo.trim() || createMutation.isPending}
          className="bg-indigo-600 hover:bg-indigo-500 text-white p-3 rounded-lg disabled:opacity-50 transition-colors"
        >
          <Plus size={24} />
        </button>
      </form>

      <div className="flex-1 overflow-y-auto space-y-2 pr-2">
        <AnimatePresence mode="popLayout">
          {todos?.map((todo) => (
            <motion.div
              key={todo.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              layout
              className={clsx(
                "group flex items-center p-3 rounded-xl border transition-colors cursor-pointer select-none",
                todo.completed
                  ? "bg-slate-900/50 border-slate-800 text-slate-500"
                  : "bg-slate-800 border-slate-700 text-slate-200 hover:border-slate-600",
              )}
              onClick={() => toggleMutation.mutate(todo.id)}
            >
              <div
                className={clsx(
                  "w-6 h-6 rounded-full border-2 flex items-center justify-center mr-4 transition-colors",
                  todo.completed
                    ? "bg-emerald-600 border-emerald-600 text-white"
                    : "border-slate-500 group-hover:border-indigo-400",
                )}
              >
                {todo.completed && <Check size={14} strokeWidth={3} />}
              </div>

              <div className="flex-1 flex flex-col justify-center min-w-0">
                <span
                  className={clsx(
                    "text-lg font-medium truncate",
                    todo.completed &&
                      "line-through decoration-slate-600 text-slate-500",
                  )}
                >
                  {todo.text}
                </span>

                {!todo.completed && (
                  <div className="flex mt-1">
                    <span
                      className={clsx(
                        "text-[10px] font-bold px-1.5 py-0.5 rounded-md uppercase tracking-wider",
                        dayjs().diff(todo.createdAt, "day") >= 14
                          ? "bg-rose-500/20 text-rose-400 border border-rose-500/30"
                          : dayjs().diff(todo.createdAt, "day") >= 7
                            ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                            : "text-slate-500",
                      )}
                    >
                      {dayjs().diff(todo.createdAt, "day") === 0
                        ? "Added today"
                        : `${dayjs().diff(todo.createdAt, "day")}d old`}
                    </span>
                  </div>
                )}
              </div>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (confirm("Delete task?")) deleteMutation.mutate(todo.id);
                }}
                className="opacity-0 group-hover:opacity-100 p-2 text-slate-500 hover:text-rose-400 stop-propagation transition-opacity"
              >
                <Trash2 size={20} />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>

        {todos?.length === 0 && (
          <div className="text-center text-slate-500 py-12">
            No tasks. Great job!
          </div>
        )}
      </div>
    </div>
  );
}

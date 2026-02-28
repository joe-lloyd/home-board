import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../api";
import { motion, AnimatePresence } from "framer-motion";
import clsx from "clsx";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(relativeTime);

export function ChoreList({ filter }: { filter?: "upcoming" | "all" }) {
  const queryClient = useQueryClient();
  const { data: chores, isLoading } = useQuery({
    queryKey: ["chores"],
    queryFn: api.getChores,
    select: (data) => {
      if (filter === "upcoming") {
        // Show overdue + next 3 upcoming
        const overdue = data.filter((c) => c.status === "overdue");
        const soon = data
          .filter((c) => c.status !== "overdue" && c.status !== "ok")
          .sort((a, b) => a.daysRemaining - b.daysRemaining);
        const ok = data
          .filter((c) => c.status === "ok")
          .sort((a, b) => a.daysRemaining - b.daysRemaining);

        // Combine: Overdue -> Soon -> OK (limited)
        return [...overdue, ...soon, ...ok].slice(0, 5);
      }
      return data;
    },
  });

  const completeMutation = useMutation({
    mutationFn: api.completeChore,
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ["chores"] });
      const previousChores = queryClient.getQueryData(["chores"]);

      // Optimistically update to 'ok' status
      queryClient.setQueryData(["chores"], (old: any[]) => {
        return old.map((c) =>
          c.id === id
            ? {
                ...c,
                status: "ok",
                daysRemaining: c.intervalDays,
                nextDue: dayjs().add(c.intervalDays, "day").toISOString(),
              }
            : c,
        );
      });

      return { previousChores };
    },
    onError: (_err, _variables, context: any) => {
      queryClient.setQueryData(["chores"], context.previousChores);
    },
    onSuccess: () => {
      // Invalidate is handled by SSE usually, but optimistic update or immediate invalidate is good UX
      queryClient.invalidateQueries({ queryKey: ["chores"] });
    },
  });

  if (isLoading) return <div className="text-slate-400">Loading chores...</div>;

  return (
    <div className="h-full flex flex-col">
      <h2 className="text-xl font-bold mb-4 text-slate-200">Chores</h2>
      <div className="space-y-3 overflow-y-auto pr-2">
        <AnimatePresence>
          {chores?.map((chore) => (
            <motion.div
              key={chore.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className={clsx(
                "p-4 rounded-xl border border-slate-800 flex justify-between items-center transition-colors",
                {
                  "bg-emerald-950/30 border-emerald-900/50":
                    chore.status === "ok",
                  "bg-amber-950/30 border-amber-900/50":
                    chore.status === "soon",
                  "bg-rose-950/30 border-rose-900/50":
                    chore.status === "overdue",
                },
              )}
            >
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-lg truncate">{chore.name}</h3>
                <div className="flex items-center mt-1.5">
                  <span
                    className={clsx(
                      "text-xs font-bold px-2 py-0.5 rounded-md tracking-wide",
                      chore.status === "overdue"
                        ? "bg-rose-500/20 text-rose-400 border border-rose-500/30"
                        : chore.status === "soon"
                          ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                          : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20",
                    )}
                  >
                    {chore.status === "overdue"
                      ? `OVERDUE (${Math.abs(chore.daysRemaining)}d)`
                      : chore.status === "soon"
                        ? `DUE IN ${chore.daysRemaining}d`
                        : `NEXT: ${dayjs(chore.nextDue).format("MMM D")}`}
                  </span>
                </div>
              </div>

              <button
                onClick={() => completeMutation.mutate(chore.id)}
                disabled={completeMutation.isPending}
                className={clsx(
                  "px-4 py-2 rounded-lg font-medium text-sm transition-all active:scale-95",
                  {
                    "bg-emerald-600 hover:bg-emerald-500 text-white":
                      chore.status !== "ok",
                    "bg-slate-800 hover:bg-slate-700 text-slate-300":
                      chore.status === "ok",
                  },
                )}
              >
                {completeMutation.isPending
                  ? "..."
                  : chore.status === "ok"
                    ? "Done"
                    : "Complete"}
              </button>
            </motion.div>
          ))}
        </AnimatePresence>

        {chores?.length === 0 && (
          <div className="text-center text-slate-500 py-8">
            No chores set up.
          </div>
        )}
      </div>
    </div>
  );
}

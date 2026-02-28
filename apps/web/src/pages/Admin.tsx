import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../api";
import { Link } from "react-router-dom";
import { ArrowLeft, RefreshCw, Trash2 } from "lucide-react";
import { toast } from "sonner";

export function Admin() {
  const [tab, setTab] = useState<"chores" | "calendars" | "todos" | "system">(
    "chores",
  );

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-4">
            <Link
              to="/"
              className="p-2 hover:bg-slate-800 rounded-full transition-colors"
            >
              <ArrowLeft />
            </Link>
            <h1 className="text-2xl font-bold">Admin Panel</h1>
          </div>
        </div>

        <div className="flex gap-2 mb-6 border-b border-slate-800">
          <TabButton active={tab === "chores"} onClick={() => setTab("chores")}>
            Chores
          </TabButton>
          <TabButton
            active={tab === "calendars"}
            onClick={() => setTab("calendars")}
          >
            Calendars
          </TabButton>
          <TabButton active={tab === "todos"} onClick={() => setTab("todos")}>
            Todos
          </TabButton>
          <TabButton active={tab === "system"} onClick={() => setTab("system")}>
            System
          </TabButton>
        </div>

        <div className="bg-slate-900 rounded-xl p-6 border border-slate-800">
          {tab === "chores" && <ChoresSettings />}
          {tab === "calendars" && <CalendarsSettings />}
          {tab === "todos" && <TodosSettings />}
          {tab === "system" && <SystemSettings />}
        </div>
      </div>
    </div>
  );
}

function TabButton({
  children,
  active,
  onClick,
}: {
  children: React.ReactNode;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 font-medium transition-colors border-b-2 ${active ? "border-indigo-500 text-indigo-400" : "border-transparent text-slate-400 hover:text-slate-200"}`}
    >
      {children}
    </button>
  );
}

function ChoresSettings() {
  const queryClient = useQueryClient();
  const { data: chores } = useQuery({
    queryKey: ["chores"],
    queryFn: api.getChores,
  });

  const [newName, setNewName] = useState("");
  const [newInterval, setNewInterval] = useState(7);

  const createMutation = useMutation({
    mutationFn: api.createChore,
    onSuccess: () => {
      setNewName("");
      setNewInterval(7);
      queryClient.invalidateQueries({ queryKey: ["chores"] });
      toast.success("Chore created");
    },
    onError: () => toast.error("Failed to create chore"),
  });

  const deleteMutation = useMutation({
    mutationFn: api.deleteChore,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["chores"] });
      toast.success("Chore deleted");
    },
    onError: () => toast.error("Failed to delete chore"),
  });

  const updateMutation = useMutation({
    mutationFn: (data: { id: string; interval: number }) =>
      api.updateChore(data.id, { intervalDays: data.interval }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["chores"] });
      toast.success("Chore updated");
    },
    onError: () => toast.error("Failed to update chore"),
  });

  return (
    <div className="space-y-6">
      <div className="flex gap-4 items-end">
        <div className="flex-1">
          <label className="block text-sm font-medium text-slate-400 mb-1">
            Chore Name
          </label>
          <input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            className="w-full bg-slate-950 border border-slate-700 rounded p-2"
          />
        </div>
        <div className="w-32">
          <label className="block text-sm font-medium text-slate-400 mb-1">
            Interval (Days)
          </label>
          <input
            type="number"
            value={newInterval}
            onChange={(e) => setNewInterval(Number(e.target.value))}
            className="w-full bg-slate-950 border border-slate-700 rounded p-2"
          />
        </div>
        <button
          onClick={() =>
            createMutation.mutate({ name: newName, intervalDays: newInterval })
          }
          disabled={!newName}
          className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-500 disabled:opacity-50"
        >
          Add
        </button>
      </div>

      <div className="space-y-2">
        {chores?.map((chore) => (
          <div
            key={chore.id}
            className="flex justify-between items-center p-3 bg-slate-950 rounded border border-slate-800"
          >
            <div>
              <div className="font-medium">{chore.name}</div>
              <div className="text-sm text-slate-400">
                Every {chore.intervalDays} days
              </div>
            </div>
            <div className="flex items-center gap-3">
              <input
                type="number"
                className="w-16 bg-slate-900 border border-slate-700 rounded p-1 text-sm"
                defaultValue={chore.intervalDays}
                onBlur={(e) => {
                  const val = Number(e.target.value);
                  if (val !== chore.intervalDays) {
                    updateMutation.mutate({ id: chore.id, interval: val });
                  }
                }}
              />
              <button
                onClick={() => deleteMutation.mutate(chore.id)}
                className="text-rose-500 hover:text-rose-400"
              >
                <Trash2 size={18} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function CalendarsSettings() {
  const queryClient = useQueryClient();
  const { data: calendars } = useQuery({
    queryKey: ["calendars"],
    queryFn: api.getCalendars,
  });

  const [newUrl, setNewUrl] = useState("");
  const [newName, setNewName] = useState("");

  const createMutation = useMutation({
    mutationFn: api.createCalendar,
    onSuccess: () => {
      setNewName("");
      setNewUrl("");
      queryClient.invalidateQueries({ queryKey: ["calendars"] });
      toast.success("Calendar added");
    },
    onError: (err) => {
      console.error(err);
      toast.error("Failed to add calendar (check URL)");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: api.deleteCalendar,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["calendars"] });
      toast.success("Calendar deleted");
    },
    onError: () => toast.error("Failed to delete calendar"),
  });

  const refreshMutation = useMutation({
    mutationFn: api.refreshCalendars,
    onMutate: () => {
      toast.loading("Syncing calendars...");
    },
    onSuccess: () => {
      toast.dismiss();
      toast.success("Calendars synced successfully");
      queryClient.invalidateQueries({ queryKey: ["events"] });
    },
    onError: () => {
      toast.dismiss();
      toast.error("Failed to sync calendars");
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Sources</h3>
        <button
          onClick={() => refreshMutation.mutate()}
          disabled={refreshMutation.isPending}
          className="flex items-center gap-2 text-sm bg-slate-800 px-3 py-1.5 rounded hover:bg-slate-700 disabled:opacity-50"
        >
          <RefreshCw
            size={14}
            className={refreshMutation.isPending ? "animate-spin" : ""}
          />
          Sync All
        </button>
      </div>

      <div className="flex gap-4 items-end">
        <div className="w-48">
          <label className="block text-sm font-medium text-slate-400 mb-1">
            Name
          </label>
          <input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            className="w-full bg-slate-950 border border-slate-700 rounded p-2"
          />
        </div>
        <div className="flex-1">
          <label className="block text-sm font-medium text-slate-400 mb-1">
            ICS URL
          </label>
          <input
            value={newUrl}
            onChange={(e) => setNewUrl(e.target.value)}
            className="w-full bg-slate-950 border border-slate-700 rounded p-2"
            placeholder="https://..."
          />
        </div>
        <button
          onClick={() =>
            createMutation.mutate({ name: newName, icsUrl: newUrl })
          }
          disabled={!newName || !newUrl}
          className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-500 disabled:opacity-50"
        >
          Add
        </button>
      </div>

      <div className="space-y-2">
        {calendars?.map((cal) => (
          <div
            key={cal.id}
            className="flex justify-between items-center p-3 bg-slate-950 rounded border border-slate-800"
          >
            <div className="overflow-hidden">
              <div className="font-medium">{cal.name}</div>
              <div className="text-sm text-slate-500 truncate max-w-md">
                {cal.icsUrl}
              </div>
            </div>
            <button
              onClick={() => deleteMutation.mutate(cal.id)}
              className="text-rose-500 hover:text-rose-400"
            >
              <Trash2 size={18} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

function TodosSettings() {
  const queryClient = useQueryClient();
  const { data: todos } = useQuery({
    queryKey: ["todos"],
    queryFn: api.getTodos,
  });

  const deleteMutation = useMutation({
    mutationFn: api.deleteTodo,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["todos"] }),
  });

  return (
    <div className="space-y-4">
      <p className="text-slate-400 text-sm">
        Manage existing todos. Use Dashboard to add/toggle.
      </p>

      <div className="space-y-2">
        {todos?.map((todo) => (
          <div
            key={todo.id}
            className="flex justify-between items-center p-3 bg-slate-950 rounded border border-slate-800"
          >
            <div
              className={todo.completed ? "line-through text-slate-500" : ""}
            >
              {todo.text}
            </div>
            <button
              onClick={() => deleteMutation.mutate(todo.id)}
              className="text-rose-500 hover:text-rose-400"
            >
              <Trash2 size={18} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

function SystemSettings() {
  const [isUpdating, setIsUpdating] = useState(false);

  const handleUpdate = async () => {
    if (
      !confirm(
        "Checking for updates will pull the latest code and rebuild the application. The system will be temporarily unavailable.",
      )
    ) {
      return;
    }

    setIsUpdating(true);
    toast.loading("Initiating update sequence...", { id: "update-toast" });

    try {
      const res = await api.triggerUpdate();

      if (res.success) {
        toast.success(res.message, { id: "update-toast" });
        // The server will go down shortly, show a reassuring message
        setTimeout(() => {
          toast.loading(
            "Rebuilding containers... Please wait a minute before refreshing.",
            { id: "update-toast", duration: 30000 },
          );
        }, 1500);
      } else {
        toast.error("Failed to start update.", { id: "update-toast" });
      }
    } catch (err) {
      console.error(err);
      toast.error("Error communicating with server for update.", {
        id: "update-toast",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="border border-slate-800 rounded-xl p-6 bg-slate-950">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-lg font-semibold text-slate-200">
            Application Updates
          </h3>
          <div className="text-xs font-mono text-slate-500 bg-slate-900 px-2 py-1 rounded border border-slate-800">
            v{__APP_VERSION__}
          </div>
        </div>
        <p className="text-sm text-slate-400 mb-6 max-w-lg">
          Manually check for updates from the master repository. If a new
          version is found, HomeBoard will automatically pull the code, rebuild
          its Docker containers, and restart.
        </p>

        <button
          onClick={handleUpdate}
          disabled={isUpdating}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2.5 rounded-lg transition-colors font-medium disabled:opacity-50"
        >
          <RefreshCw size={18} className={isUpdating ? "animate-spin" : ""} />
          {isUpdating ? "Updating System..." : "Check for Updates"}
        </button>
      </div>
    </div>
  );
}

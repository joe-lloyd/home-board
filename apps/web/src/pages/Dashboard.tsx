import { MonthCalendar, TodayEvents } from "../components/Calendar";
import { ChoreList } from "../components/ChoreList";
import { TodoList } from "../components/TodoList";
import { Overview } from "../components/Overview";
import { useSSE } from "../hooks/use-sse";
import { Link } from "react-router-dom";
import dayjs from "dayjs";
import {
  Settings,
  Calendar,
  CheckSquare,
  ListTodo,
  LayoutDashboard,
} from "lucide-react";
import { useState } from "react";
import clsx from "clsx";
import { motion, AnimatePresence } from "framer-motion";

type Tab = "overview" | "calendar" | "chores" | "todos";

export function Dashboard() {
  useSSE();
  const [activeTab, setActiveTab] = useState<Tab>("overview");
  const [selectedCalendarDate, setSelectedCalendarDate] = useState<string>(() =>
    dayjs().format("YYYY-MM-DD"),
  );

  return (
    <div className="h-screen w-screen bg-slate-950 text-slate-50 flex flex-col overflow-hidden">
      {/* Main Content Area - Maximized Space */}
      <main className="flex-1 overflow-y-auto overflow-x-hidden relative p-4">
        <AnimatePresence mode="wait">
          {activeTab === "overview" && (
            <motion.div
              key="overview"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              className="h-auto min-h-full md:h-full"
            >
              <Overview onNavigateToCalendar={() => setActiveTab("calendar")} />
            </motion.div>
          )}

          {activeTab === "calendar" && (
            <motion.div
              key="calendar"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="h-auto min-h-full lg:h-full flex flex-col lg:grid lg:grid-cols-3 gap-6 pb-6 lg:pb-0"
            >
              <div className="min-h-[500px] lg:col-span-2 lg:h-full lg:min-h-0">
                <MonthCalendar
                  selectedDate={selectedCalendarDate}
                  onSelectDate={setSelectedCalendarDate}
                />
              </div>
              <div className="min-h-[400px] lg:h-full lg:min-h-0">
                <TodayEvents date={selectedCalendarDate} />
              </div>
            </motion.div>
          )}

          {activeTab === "chores" && (
            <motion.div
              key="chores"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="h-auto min-h-full md:h-full max-w-4xl mx-auto pb-6 md:pb-0"
            >
              <ChoreList filter="all" />
            </motion.div>
          )}

          {activeTab === "todos" && (
            <motion.div
              key="todos"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="h-auto min-h-full md:h-full max-w-3xl mx-auto pb-6 md:pb-0"
            >
              <TodoList />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Bottom Navigation Bar */}
      <nav className="h-20 bg-slate-900 border-t border-slate-800 flex items-center justify-between px-2 md:px-6 shrink-0 z-10 overflow-x-auto nice-scroll">
        {/* Tabs */}
        <div className="flex items-center gap-1 md:gap-2 h-full py-3">
          <NavButton
            active={activeTab === "overview"}
            onClick={() => setActiveTab("overview")}
            icon={<LayoutDashboard size={24} />}
            label="Overview"
          />
          <NavButton
            active={activeTab === "calendar"}
            onClick={() => setActiveTab("calendar")}
            icon={<Calendar size={24} />}
            label="Calendar"
          />
          <NavButton
            active={activeTab === "chores"}
            onClick={() => setActiveTab("chores")}
            icon={<CheckSquare size={24} />}
            label="Chores"
          />
          <NavButton
            active={activeTab === "todos"}
            onClick={() => setActiveTab("todos")}
            icon={<ListTodo size={24} />}
            label="Todos"
          />
        </div>

        {/* Admin Link */}
        <Link
          to="/admin"
          className="p-3 text-slate-500 hover:text-slate-300 hover:bg-slate-800 rounded-xl transition-all"
          title="Settings"
        >
          <Settings size={28} />
        </Link>
      </nav>
    </div>
  );
}

function NavButton({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      className={clsx(
        "h-full px-4 md:px-6 rounded-xl flex flex-col items-center justify-center gap-1 transition-all min-w-[80px] md:min-w-[100px]",
        active
          ? "bg-indigo-600 text-white shadow-lg shadow-indigo-900/50"
          : "text-slate-400 hover:bg-slate-800 hover:text-slate-200",
      )}
    >
      {icon}
      <span className="text-xs font-medium">{label}</span>
    </button>
  );
}

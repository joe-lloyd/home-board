import { TodayEvents, MiniCalendar } from "./Calendar";
import { TodoList } from "./TodoList";
import { ChoreList } from "./ChoreList";

export function Overview({
  onNavigateToCalendar,
}: {
  onNavigateToCalendar?: () => void;
}) {
  return (
    <div className="h-auto min-h-full md:h-full flex flex-col md:grid md:grid-cols-3 gap-6 pb-6 md:pb-0">
      {/* 1. Calendar Column: Mini Calendar + Agenda */}
      <div className="flex flex-col gap-4 min-h-[500px] md:min-h-0 md:h-full">
        <div className="h-1/2 md:h-1/3 min-h-0 shrink-0">
          <MiniCalendar onClick={onNavigateToCalendar} />
        </div>
        <div className="flex-1 min-h-0 bg-slate-900/50 rounded-2xl border border-slate-800/50 overflow-hidden">
          <TodayEvents />
        </div>
      </div>

      {/* 2. Todos */}
      <div className="min-h-[400px] md:min-h-0 md:h-full bg-slate-900/50 rounded-2xl border border-slate-800/50 overflow-hidden p-4">
        <TodoList />
      </div>

      {/* 3. Upcoming Chores - reusing ChoreList for now, will filter later */}
      <div className="min-h-[400px] md:min-h-0 md:h-full bg-slate-900/50 rounded-2xl border border-slate-800/50 overflow-hidden p-4">
        <ChoreList filter="upcoming" />
      </div>
    </div>
  );
}

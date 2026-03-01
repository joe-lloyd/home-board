import { TodayEvents, MiniCalendar } from "./Calendar";
import { TodoList } from "./TodoList";
import { ChoreList } from "./ChoreList";
import { WeatherTimeWidget } from "./WeatherTimeWidget";

export function Overview({
  onNavigateToCalendar,
}: {
  onNavigateToCalendar?: () => void;
}) {
  return (
    <div className="h-auto min-h-full md:h-full flex flex-col md:grid md:grid-cols-3 md:grid-rows-2 gap-6 pb-6 md:pb-0">
      {/* Target Column 1, Row 1 & 2 (Spans full height): Calendar & Events */}
      <div className="flex flex-col gap-4 min-h-[500px] md:min-h-0 md:h-full md:row-span-2">
        <div className="h-1/2 md:h-1/3 min-h-0 shrink-0">
          <MiniCalendar onClick={onNavigateToCalendar} />
        </div>
        <div className="flex-1 min-h-0 bg-slate-900/50 rounded-2xl border border-slate-800/50 overflow-hidden">
          <TodayEvents />
        </div>
      </div>

      {/* Target Column 2, Row 1 (Top Center): Todos */}
      <div className="min-h-[400px] md:min-h-0 md:h-full bg-slate-900/50 rounded-2xl border border-slate-800/50 overflow-hidden p-4">
        <TodoList />
      </div>

      {/* Target Column 3, Row 1 (Top Right): Weather Amsterdam */}
      <div className="min-h-[250px] md:min-h-0 md:h-full">
        <WeatherTimeWidget
          city="Amsterdam"
          timezone="Europe/Amsterdam"
          title="Amsterdam, NL"
        />
      </div>

      {/* Target Column 2, Row 2 (Bottom Center): Chores */}
      <div className="min-h-[400px] md:min-h-0 md:h-full bg-slate-900/50 rounded-2xl border border-slate-800/50 overflow-hidden p-4">
        <ChoreList filter="upcoming" />
      </div>

      {/* Target Column 3, Row 2 (Bottom Right): Weather Yuxi */}
      <div className="min-h-[250px] md:min-h-0 md:h-full">
        <WeatherTimeWidget
          city="Yuxi"
          timezone="Asia/Shanghai"
          title="Yuxi, CN"
        />
      </div>
    </div>
  );
}

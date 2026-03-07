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
    <div className="h-auto min-h-full xl:h-full flex flex-col xl:grid xl:grid-cols-3 gap-4 pb-6 xl:pb-0">
      {/* Column 1: Calendar & Events */}
      <div className="flex flex-col gap-4 min-h-[500px] xl:min-h-0 xl:h-full">
        <div className="h-1/2 xl:h-1/3 min-h-0 shrink-0">
          <MiniCalendar onClick={onNavigateToCalendar} />
        </div>
        <div className="flex-1 min-h-0 bg-slate-900/50 rounded-2xl border border-slate-800/50 overflow-hidden">
          <TodayEvents />
        </div>
      </div>

      {/* Column 2: Weather Amsterdam & Todos */}
      <div className="flex flex-col gap-4 min-h-[500px] xl:min-h-0 xl:h-full">
        <div className="shrink-0">
          <WeatherTimeWidget
            city="Amsterdam"
            timezone="Europe/Amsterdam"
            title="Amsterdam, NL"
          />
        </div>
        <div className="flex-1 min-h-[300px] xl:min-h-0 bg-slate-900/50 rounded-2xl border border-slate-800/50 overflow-hidden p-3 md:p-4">
          <TodoList />
        </div>
      </div>

      {/* Column 3: Weather Yuxi & Chores */}
      <div className="flex flex-col gap-4 min-h-[500px] xl:min-h-0 xl:h-full">
        <div className="shrink-0">
          <WeatherTimeWidget
            city="Yuxi"
            timezone="Asia/Shanghai"
            title="Yuxi, CN"
          />
        </div>
        <div className="flex-1 min-h-[300px] xl:min-h-0 bg-slate-900/50 rounded-2xl border border-slate-800/50 overflow-hidden p-3 md:p-4">
          <ChoreList filter="upcoming" />
        </div>
      </div>
    </div>
  );
}

import { useQuery } from "@tanstack/react-query";
import { api } from "../api";
import dayjs from "dayjs";
import clsx from "clsx";
import { useMemo } from "react";

// Shared hook or pass data
function useEvents() {
  return useQuery({
    queryKey: ["events"],
    queryFn: api.getEvents,
  });
}

export function MonthCalendar({
  selectedDate,
  onSelectDate,
}: {
  selectedDate?: string;
  onSelectDate?: (date: string) => void;
} = {}) {
  const { data: events } = useEvents();

  const now = dayjs();
  const startOfMonth = now.startOf("month");
  const daysInMonth = now.daysInMonth();
  const startDayOfWeek = startOfMonth.day(); // 0 = Sunday

  const monthEvents = useMemo(() => {
    if (!events) return [];
    return events.filter((e) => dayjs(e.start).isSame(now, "month"));
  }, [events, now]);

  const getEventsForDay = (day: number) => {
    const date = startOfMonth.date(day);
    return monthEvents.filter((e) => dayjs(e.start).isSame(date, "day"));
  };

  // if (isLoading)
  //   return <div className="text-slate-400">Loading calendar...</div>;

  return (
    <div className="bg-slate-900 rounded-2xl p-4 border border-slate-800 h-full flex flex-col">
      <h2 className="text-xl font-bold text-slate-200 mb-4 capitalize">
        {now.format("MMMM YYYY")}
      </h2>

      <div className="grid grid-cols-7 gap-1 text-center text-slate-500 text-sm mb-2">
        {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => (
          <div key={`${d}-${i}`}>{d}</div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1 flex-1">
        {Array.from({ length: startDayOfWeek }).map((_, i) => (
          <div key={`empty-${i}`} className="bg-transparent" />
        ))}

        {Array.from({ length: daysInMonth }).map((_, i) => {
          const day = i + 1;
          const dayDate = startOfMonth.date(day);
          const isToday = day === now.date();
          const isSelected = selectedDate === dayDate.format("YYYY-MM-DD");
          const dayEvents = getEventsForDay(day);

          return (
            <div
              key={day}
              onClick={() => onSelectDate?.(dayDate.format("YYYY-MM-DD"))}
              className={clsx(
                "rounded-lg p-1 relative flex flex-col items-center justify-start border transition-colors min-h-[3rem] cursor-pointer hover:border-indigo-500/30",
                isSelected
                  ? "bg-indigo-600/30 border-indigo-500"
                  : isToday
                    ? "bg-indigo-900/40 border-indigo-500/50"
                    : "bg-slate-800/40 border-transparent",
              )}
            >
              <span
                className={clsx(
                  "text-sm font-medium",
                  isSelected
                    ? "text-indigo-100"
                    : isToday
                      ? "text-indigo-300"
                      : "text-slate-300",
                )}
              >
                {day}
              </span>

              <div className="flex gap-0.5 mt-1 flex-wrap justify-center w-full px-1">
                {dayEvents.slice(0, 4).map((ev) => (
                  <div
                    key={ev.id}
                    className="w-1.5 h-1.5 rounded-full bg-indigo-400"
                    title={ev.title}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function MiniCalendar({ onClick }: { onClick?: () => void }) {
  const { data: events } = useEvents();

  const now = dayjs();
  const startOfMonth = now.startOf("month");
  const daysInMonth = now.daysInMonth();
  const startDayOfWeek = startOfMonth.day(); // 0 = Sunday

  const monthEvents = useMemo(() => {
    if (!events) return [];
    return events.filter((e) => dayjs(e.start).isSame(now, "month"));
  }, [events, now]);

  const getEventsForDay = (day: number) => {
    const date = startOfMonth.date(day);
    return monthEvents.filter((e) => dayjs(e.start).isSame(date, "day"));
  };

  return (
    <div
      onClick={onClick}
      className={clsx(
        "bg-slate-900 rounded-2xl p-3 border border-slate-800 h-full flex flex-col cursor-pointer hover:border-indigo-500/50 transition-colors group",
      )}
    >
      <h2 className="text-sm font-bold text-slate-400 mb-2 capitalize group-hover:text-indigo-400 transition-colors">
        {now.format("MMMM YYYY")}
      </h2>

      <div className="grid grid-cols-7 gap-0.5 text-center text-slate-600 text-[10px] mb-1">
        {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => (
          <div key={`${d}-${i}`}>{d}</div>
        ))}
      </div>

      <div className="grid grid-cols-7 grid-rows-6 gap-0.5 flex-1 min-h-0">
        {Array.from({ length: startDayOfWeek }).map((_, i) => (
          <div key={`empty-${i}`} className="bg-transparent" />
        ))}

        {Array.from({ length: daysInMonth }).map((_, i) => {
          const day = i + 1;
          const isToday = day === now.date();
          const hasEvents = getEventsForDay(day).length > 0;

          return (
            <div
              key={day}
              className={clsx(
                "rounded-md relative flex items-center justify-center text-[10px] font-medium transition-colors w-full h-full",
                isToday
                  ? "bg-indigo-900 text-indigo-300"
                  : hasEvents
                    ? "text-slate-300 bg-slate-800/50"
                    : "text-slate-500",
              )}
            >
              {day}
              {hasEvents && !isToday && (
                <div className="absolute bottom-0.5 w-1 h-1 rounded-full bg-indigo-500/50" />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function TodayEvents({ date }: { date?: string }) {
  const { data: events } = useEvents();

  const targetDate = useMemo(() => (date ? dayjs(date) : dayjs()), [date]);

  const targetEvents = useMemo(() => {
    if (!events) return [];
    return events.filter((e) => dayjs(e.start).isSame(targetDate, "day"));
  }, [events, targetDate]);

  const isToday = targetDate.isSame(dayjs(), "day");
  const title = isToday
    ? "Today's Agenda"
    : `${targetDate.format("MMM D")} Agenda`;

  // if (isLoading) return <div className="text-slate-400">Loading events...</div>;

  return (
    <div className="bg-slate-900 rounded-2xl p-4 border border-slate-800 h-full overflow-y-auto">
      <h3 className="text-lg font-semibold text-slate-300 mb-3 sticky top-0 bg-slate-900 pb-2 border-b border-slate-800 z-10">
        {title}
      </h3>
      <div className="space-y-2">
        {targetEvents.length === 0 ? (
          <p className="text-slate-500 text-sm italic py-4 text-center">
            No events scheduled.
          </p>
        ) : (
          targetEvents.map((ev) => (
            <div
              key={ev.id}
              className="flex gap-3 items-center p-3 rounded-lg bg-slate-800/50 border border-slate-700/50"
            >
              <div className="text-xs font-mono font-bold text-indigo-400 bg-indigo-950/50 px-2 py-1 rounded">
                {dayjs(ev.start).format("HH:mm")}
              </div>
              <div className="text-sm text-slate-200 font-medium line-clamp-1">
                {ev.title}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

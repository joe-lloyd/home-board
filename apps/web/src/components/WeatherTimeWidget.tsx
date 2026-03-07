import { useQuery } from "@tanstack/react-query";
import { api } from "../api";
import { useEffect, useState } from "react";
import * as Icons from "lucide-react";

export function WeatherTimeWidget({
  city,
  timezone,
  title,
}: {
  city: string;
  timezone: string;
  title: string;
}) {
  const [time, setTime] = useState("");
  const [dateStr, setDateStr] = useState("");

  const {
    data: weather,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["weather", city],
    queryFn: () => api.getWeather(city),
    refetchInterval: 1000 * 60 * 30, // Refetch every 30 minutes
  });

  // Calculate local time for the specific timezone every second
  useEffect(() => {
    const tick = () => {
      const now = new Date();
      setTime(
        new Intl.DateTimeFormat("en-US", {
          timeZone: timezone,
          hour: "numeric",
          minute: "2-digit",
          hour12: true,
        }).format(now),
      );

      setDateStr(
        new Intl.DateTimeFormat("en-US", {
          timeZone: timezone,
          weekday: "short",
          month: "short",
          day: "numeric",
        }).format(now),
      );
    };

    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [timezone]);

  // Dynamically resolve the lucide icon component
  const WeatherIcon = weather?.iconPath
    ? (Icons as any)[weather.iconPath] || Icons.Cloud
    : Icons.Cloud;

  return (
    <div className="h-full w-full bg-slate-900/50 rounded-2xl border border-slate-800/50 p-4 flex flex-col justify-between">
      {/* Top Header & Time: Inline Layout */}
      <div className="flex flex-col gap-2">
        <h2 className="text-slate-400 font-medium text-lg tracking-wide uppercase truncate">
          {title}
        </h2>
        <div className="flex items-baseline justify-between overflow-hidden">
          <span className="text-4xl lg:text-3xl font-light text-slate-100 tabular-nums tracking-tight truncate pb-2">
            {time}
          </span>
          <span className="text-slate-500 text-sm whitespace-nowrap ml-2">
            {dateStr}
          </span>
        </div>
      </div>

      {/* Spacer to push weather to bottom */}
      <div className="flex-1"></div>

      {/* Bottom: Weather Condition */}
      <div className="border-t border-slate-800/50 pt-4 mt-auto">
        {isLoading ? (
          <div className="animate-pulse flex space-x-4 h-8 items-center">
            <div className="w-8 h-8 bg-slate-800 rounded-full"></div>
            <div className="flex-1 h-4 bg-slate-800 rounded"></div>
          </div>
        ) : isError ? (
          <div className="text-red-400 text-sm flex items-center gap-2">
            <Icons.AlertCircle size={16} />
            <span>Weather unavailable</span>
          </div>
        ) : weather ? (
          <div className="flex items-center gap-4 text-slate-200 overflow-hidden">
            <WeatherIcon size={28} className="text-indigo-400 shrink-0" />
            <div className="flex flex-col min-w-0">
              <span className="text-2xl font-semibold leading-none truncate">
                {weather.tempC}&deg;C
              </span>
              <span className="text-slate-400 text-sm capitalize truncate">
                {weather.condition}
              </span>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}

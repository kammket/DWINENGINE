"use client";

import { useMemo } from "react";

type Day = { date: string; composite: number | null };

function scoreToColor(composite: number | null): string {
  if (composite === null) return "bg-stone-100";
  if (composite >= 80) return "bg-emerald-500";
  if (composite >= 65) return "bg-emerald-300";
  if (composite >= 50) return "bg-amber-300";
  if (composite >= 35) return "bg-orange-300";
  return "bg-rose-300";
}

type Props = {
  pulses: Array<{ date: string; composite: number }>;
  daysBack?: number;
};

export function PulseHeatmap({ pulses, daysBack = 91 }: Props) {
  const days = useMemo<Day[]>(() => {
    const map = new Map(pulses.map((p) => [p.date, p.composite]));
    const result: Day[] = [];
    const now = new Date();
    for (let i = daysBack - 1; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split("T")[0];
      result.push({ date: dateStr, composite: map.get(dateStr) ?? null });
    }
    return result;
  }, [pulses, daysBack]);

  const filledCount = days.filter((d) => d.composite !== null).length;

  // Group by week columns for grid display
  const weeks: Day[][] = [];
  let week: Day[] = [];
  for (const day of days) {
    week.push(day);
    if (week.length === 7) { weeks.push(week); week = []; }
  }
  if (week.length > 0) weeks.push(week);

  return (
    <div>
      <div className="flex gap-1 flex-wrap">
        {days.map((d) => (
          <div
            key={d.date}
            title={
              d.composite !== null
                ? `${d.date} · ${d.composite}/100`
                : `${d.date} · no pulse recorded`
            }
            className={`w-4 h-4 rounded-sm ${scoreToColor(d.composite)} transition-colors cursor-default`}
          />
        ))}
      </div>
      <div className="flex items-center justify-between mt-3">
        <p className="text-xs text-stone-400">
          {filledCount} of {daysBack} days recorded
          {filledCount > 0 && (
            <span className="ml-1 text-stone-300">
              · {Math.round((filledCount / daysBack) * 100)}% consistency
            </span>
          )}
        </p>
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] text-stone-400">Low</span>
          {["bg-stone-100", "bg-rose-300", "bg-orange-300", "bg-amber-300", "bg-emerald-300", "bg-emerald-500"].map((c) => (
            <div key={c} className={`w-3.5 h-3.5 rounded-sm ${c}`} />
          ))}
          <span className="text-[10px] text-stone-400">High</span>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardDescription } from "./Card";

const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

function getColor(count: number): string {
  if (count === 0) return "#F0EFE8";
  if (count === 1) return "#F4D68D";
  if (count === 2) return "#E8B84B";
  return "#C9A84C";
}

export function DailyActivityMap() {
  const [activity, setActivity] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/analytics/activity")
      .then((r) => r.json())
      .then((json) => {
        if (json.success) setActivity(json.activity);
      })
      .finally(() => setLoading(false));
  }, []);

  // Build weeks: go back to the Sunday of 52 weeks ago
  const today = new Date();
  const start = new Date(today);
  start.setDate(start.getDate() - 364);
  start.setDate(start.getDate() - start.getDay()); // snap to Sunday

  const weeks: Array<Array<{ date: string; count: number; future: boolean }>> = [];
  const cur = new Date(start);
  while (cur.getTime() <= today.getTime() + 86400000 * 6 && weeks.length < 54) {
    const week: Array<{ date: string; count: number; future: boolean }> = [];
    for (let d = 0; d < 7; d++) {
      const key = cur.toISOString().slice(0, 10);
      const future = cur > today;
      week.push({ date: key, count: activity[key] ?? 0, future });
      cur.setDate(cur.getDate() + 1);
    }
    weeks.push(week);
  }

  // Month labels
  const monthLabels: Array<{ label: string; col: number }> = [];
  weeks.forEach((week, wi) => {
    const d = new Date(week[0].date);
    const label = MONTHS[d.getMonth()];
    const prev = monthLabels[monthLabels.length - 1];
    if (!prev || prev.label !== label) {
      monthLabels.push({ label, col: wi });
    }
  });

  const totalActivity = Object.values(activity).reduce((a, b) => a + b, 0);
  const DAY_LABELS = ["S", "", "T", "", "T", "", "S"];

  return (
    <Card padding="lg">
      <CardHeader>
        <CardTitle>Activity Map</CardTitle>
        <CardDescription>
          {totalActivity} actions logged in the past year — every cell is one day
        </CardDescription>
      </CardHeader>

      {loading ? (
        <div className="h-28 animate-pulse bg-stone-100 rounded-xl" />
      ) : (
        <div className="overflow-x-auto pb-1">
          <div style={{ minWidth: 580 }}>
            {/* Month row */}
            <div className="flex gap-[3px] mb-1 pl-7">
              {weeks.map((_, wi) => {
                const m = monthLabels.find((ml) => ml.col === wi);
                return (
                  <div key={wi} className="w-[12px] flex-shrink-0">
                    {m && (
                      <span className="text-[9px] text-stone-400 leading-none">
                        {m.label}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="flex gap-[3px]">
              {/* Day-of-week labels */}
              <div className="flex flex-col gap-[3px] mr-1 flex-shrink-0 w-5">
                {DAY_LABELS.map((d, i) => (
                  <div key={i} className="h-[12px] flex items-center justify-end">
                    <span className="text-[9px] text-stone-400 leading-none">
                      {d}
                    </span>
                  </div>
                ))}
              </div>

              {/* Grid columns */}
              {weeks.map((week, wi) => (
                <div key={wi} className="flex flex-col gap-[3px]">
                  {week.map(({ date, count, future }) => (
                    <div
                      key={date}
                      className="w-[12px] h-[12px] rounded-sm flex-shrink-0"
                      style={{
                        backgroundColor: future ? "transparent" : getColor(count),
                      }}
                      title={
                        future
                          ? undefined
                          : `${date}: ${count} action${count !== 1 ? "s" : ""}`
                      }
                    />
                  ))}
                </div>
              ))}
            </div>

            {/* Legend */}
            <div className="flex items-center gap-1.5 mt-3 justify-end">
              <span className="text-[10px] text-stone-400">Less</span>
              {[0, 1, 2, 3].map((level) => (
                <div
                  key={level}
                  className="w-[12px] h-[12px] rounded-sm"
                  style={{ backgroundColor: getColor(level) }}
                />
              ))}
              <span className="text-[10px] text-stone-400">More</span>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}

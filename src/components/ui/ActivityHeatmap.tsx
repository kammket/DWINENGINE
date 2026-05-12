"use client";

import { useMemo } from "react";

type Week = { weekKey: string; avg: number | null };

function parseWeekKey(wk: string): Date {
  const [year, week] = wk.split("-W").map(Number);
  // ISO week: find Monday of that week
  const jan4 = new Date(Date.UTC(year, 0, 4));
  const startOfWeek1 = new Date(jan4);
  startOfWeek1.setUTCDate(jan4.getUTCDate() - ((jan4.getUTCDay() + 6) % 7));
  const d = new Date(startOfWeek1);
  d.setUTCDate(d.getUTCDate() + (week - 1) * 7);
  return d;
}

function getColor(avg: number | null): string {
  if (avg === null) return "bg-stone-100";
  if (avg >= 8) return "bg-green-500";
  if (avg >= 6) return "bg-green-300";
  if (avg >= 4) return "bg-amber-300";
  if (avg >= 2) return "bg-orange-300";
  return "bg-red-300";
}

type Props = {
  checkins: Array<{
    weekKey: string;
    financialMood: number;
    burnoutMood: number;
    relationshipMood: number;
    decisionMood: number;
    timeMood: number;
  }>;
  /** how many weeks back to show — default 26 (6 months) */
  weeksBack?: number;
};

export function ActivityHeatmap({ checkins, weeksBack = 26 }: Props) {
  const weeks = useMemo<Week[]>(() => {
    const now = new Date();
    const today = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
    const dayOfWeek = (today.getUTCDay() + 6) % 7; // Monday = 0
    const monday = new Date(today);
    monday.setUTCDate(today.getUTCDate() - dayOfWeek);

    const checkinMap = new Map(
      checkins.map((c) => {
        const avg =
          (c.financialMood + c.burnoutMood + c.relationshipMood + c.decisionMood + c.timeMood) / 5;
        return [c.weekKey, avg];
      })
    );

    const result: Week[] = [];
    for (let i = weeksBack - 1; i >= 0; i--) {
      const d = new Date(monday);
      d.setUTCDate(monday.getUTCDate() - i * 7);
      const year = d.getUTCFullYear();
      const jan4 = new Date(Date.UTC(year, 0, 4));
      const startOfWeek1 = new Date(jan4);
      startOfWeek1.setUTCDate(jan4.getUTCDate() - ((jan4.getUTCDay() + 6) % 7));
      const weekNum =
        Math.floor((d.getTime() - startOfWeek1.getTime()) / (7 * 86400000)) + 1;
      const weekKey = `${year}-W${String(weekNum).padStart(2, "0")}`;
      result.push({ weekKey, avg: checkinMap.get(weekKey) ?? null });
    }
    return result;
  }, [checkins, weeksBack]);

  const filledCount = weeks.filter((w) => w.avg !== null).length;

  return (
    <div>
      <div className="flex gap-1 flex-wrap">
        {weeks.map((w) => (
          <div
            key={w.weekKey}
            title={
              w.avg !== null
                ? `${w.weekKey} · avg ${w.avg.toFixed(1)}/10`
                : `${w.weekKey} · no check-in`
            }
            className={`w-5 h-5 rounded-sm ${getColor(w.avg)} transition-colors cursor-default`}
          />
        ))}
      </div>
      <div className="flex items-center justify-between mt-3">
        <p className="text-xs text-stone-400">
          {filledCount}/{weeksBack} weeks checked in
        </p>
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] text-stone-400">Low</span>
          {["bg-stone-100", "bg-orange-300", "bg-amber-300", "bg-green-300", "bg-green-500"].map((c) => (
            <div key={c} className={`w-3.5 h-3.5 rounded-sm ${c}`} />
          ))}
          <span className="text-[10px] text-stone-400">High</span>
        </div>
      </div>
    </div>
  );
}

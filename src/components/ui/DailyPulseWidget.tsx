"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Zap } from "lucide-react";

type TodayPulse = {
  energy: number;
  calm: number;
  clarity: number;
  gratitude: number;
  connection: number;
} | null;

export function DailyPulseWidget() {
  const [today, setToday] = useState<TodayPulse | null>(null);
  const [streak, setStreak] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/pulse")
      .then((r) => r.json())
      .then((json) => {
        if (json.success) {
          setToday(json.today ?? null);
          setStreak(json.streak ?? 0);
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const composite = today
    ? Math.round(
        (today.energy +
          today.calm +
          today.clarity +
          today.gratitude +
          today.connection) /
          5
      )
    : null;

  if (loading) {
    return (
      <div className="flex flex-col gap-1.5 p-4 rounded-2xl border border-stone-100 bg-stone-50 animate-pulse h-[72px]" />
    );
  }

  return (
    <Link href="/pulse">
      <div
        className={`group flex flex-col gap-1.5 p-4 rounded-2xl border cursor-pointer transition-all hover:shadow-sm ${
          today
            ? "bg-teal-50 border-teal-200"
            : "bg-stone-50 border-stone-200 hover:border-teal-200 hover:bg-teal-50/50"
        }`}
      >
        <Zap
          className={`w-5 h-5 ${
            today ? "text-teal-500" : "text-stone-300 group-hover:text-teal-400"
          } transition-colors`}
        />
        <p className="text-xs font-semibold text-matte-black leading-tight">
          {today && composite !== null ? `Pulse: ${composite}/10` : "Daily Pulse"}
        </p>
        <p className="text-[11px] text-slate-calm">
          {today
            ? streak > 1
              ? `${streak}-day streak`
              : "Logged today"
            : "Log your pulse"}
        </p>
      </div>
    </Link>
  );
}

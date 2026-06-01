"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Zap, TrendingUp, TrendingDown, Minus, ChevronDown, ChevronUp } from "lucide-react";
import Link from "next/link";
import { getWeeklyQuote } from "@/lib/stoic";

type XPData = {
  total: number;
  breakdown: {
    pulses: number;
    calcs: number;
    journals: number;
    checkins: number;
    intentions: number;
    reflections: number;
  };
};

type Props = {
  maxXP?: number; // soft weekly goal, defaults to 200
};

const EARN_GUIDE = [
  { label: "Daily Pulse", xp: 10, href: "/pulse" },
  { label: "Run Calculator", xp: 25, href: "/calculators" },
  { label: "Journal Entry", xp: 20, href: "/journal" },
  { label: "Weekly Check-in", xp: 50, href: "/checkin" },
  { label: "Morning Intention", xp: 10, href: "/intention" },
  { label: "AI Reflection", xp: 30, href: "/reflections" },
];

export function WeeklyXPWidget({ maxXP = 200 }: Props) {
  const [thisWeek, setThisWeek] = useState<XPData | null>(null);
  const [lastWeek, setLastWeek] = useState<XPData | null>(null);
  const [loading, setLoading] = useState(true);
  const [showGuide, setShowGuide] = useState(false);
  const weeklyQuote = getWeeklyQuote("progress");

  useEffect(() => {
    fetch("/api/analytics/xp")
      .then((r) => r.json())
      .then((json) => {
        if (json.success) {
          setThisWeek(json.thisWeek);
          setLastWeek(json.lastWeek);
        }
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="rounded-2xl border border-stone-100 bg-stone-50 p-5 animate-pulse h-36" />
    );
  }

  const current = thisWeek?.total ?? 0;
  const previous = lastWeek?.total ?? 0;
  const pct = Math.min((current / maxXP) * 100, 100);
  const delta = current - previous;
  const isComplete = pct >= 100;

  const barColor = isComplete
    ? "#C9A84C"
    : pct >= 60
    ? "#E8B84B"
    : pct >= 30
    ? "#F4D68D"
    : "#E5E7EB";

  const TrendIcon = delta > 0 ? TrendingUp : delta < 0 ? TrendingDown : Minus;
  const trendColor = delta > 0 ? "text-emerald-500" : delta < 0 ? "text-rose-400" : "text-stone-400";
  const trendBg = delta > 0 ? "bg-emerald-50 text-emerald-700" : delta < 0 ? "bg-rose-50 text-rose-600" : "bg-stone-100 text-stone-500";

  // Milestone markers at 25%, 50%, 75%, 100%
  const milestones = [25, 50, 75, 100];

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className={`rounded-2xl border p-5 flex flex-col gap-0 transition-all ${
        isComplete
          ? "bg-gradient-to-br from-amber-50 via-yellow-50/60 to-stone-50 border-amber-200 shadow-sm"
          : "bg-gradient-to-br from-stone-50 via-amber-50/20 to-white border-stone-200"
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className={`w-7 h-7 rounded-full flex items-center justify-center ${isComplete ? "bg-amber-400" : "bg-amber-100"}`}>
            <Zap className={`w-3.5 h-3.5 ${isComplete ? "text-white" : "text-soft-gold"}`} />
          </div>
          <div>
            <p className="text-sm font-semibold text-matte-black leading-none">Weekly XP</p>
            <p className="text-[10px] text-stone-400 mt-0.5">Resets every Monday</p>
          </div>
        </div>
        <span className={`inline-flex items-center gap-1 text-[10px] font-semibold rounded-full px-2 py-0.5 ${trendBg}`}>
          <TrendIcon className="w-3 h-3" />
          {delta > 0 ? `+${delta}` : delta < 0 ? `${delta}` : "same"} vs last week
        </span>
      </div>

      {/* Score + bar */}
      <div className="mb-1 flex items-baseline gap-1.5">
        <motion.span
          className="text-4xl font-bold text-matte-black tabular-nums"
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 260, delay: 0.1 }}
        >
          {current}
        </motion.span>
        <span className="text-sm text-stone-400 font-medium">/ {maxXP} XP</span>
        {isComplete && (
          <motion.span
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.4, type: "spring" }}
            className="ml-1 text-amber-600 font-bold text-xs bg-amber-100 rounded-full px-2 py-0.5"
          >
            🏆 Goal crushed
          </motion.span>
        )}
      </div>

      {/* Bar with milestone ticks */}
      <div className="relative mb-4">
        <div className="w-full h-2.5 bg-stone-100 rounded-full overflow-hidden">
          <motion.div
            className="h-full rounded-full"
            style={{ backgroundColor: barColor }}
            initial={{ width: 0 }}
            animate={{ width: `${pct}%` }}
            transition={{ duration: 1, ease: [0.34, 1.56, 0.64, 1] }}
          />
        </div>
        {/* Milestone markers */}
        <div className="absolute inset-0 flex items-center pointer-events-none">
          {milestones.slice(0, -1).map((m) => (
            <div
              key={m}
              className="absolute top-0 bottom-0 w-px"
              style={{ left: `${m}%`, backgroundColor: pct >= m ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.08)" }}
            />
          ))}
        </div>
        <div className="flex justify-between mt-1">
          {milestones.map((m) => (
            <span key={m} className={`text-[9px] font-medium ${pct >= m ? "text-amber-600" : "text-stone-300"}`}>
              {Math.round((m / 100) * maxXP)}
            </span>
          ))}
        </div>
      </div>

      {/* How to earn toggle */}
      <button
        onClick={() => setShowGuide((v) => !v)}
        className="flex items-center gap-1 text-[11px] text-soft-gold hover:text-amber-600 font-semibold transition-colors w-fit"
      >
        {showGuide ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
        How to earn XP
      </button>

      <AnimatePresence>
        {showGuide && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-3 grid grid-cols-2 gap-1.5 overflow-hidden"
          >
            {EARN_GUIDE.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center justify-between bg-white rounded-lg px-2.5 py-2 hover:bg-amber-50/60 border border-stone-100 hover:border-amber-100 transition-all"
              >
                <span className="text-[10px] text-slate-calm">{item.label}</span>
                <span className="text-[10px] font-bold text-soft-gold">+{item.xp}</span>
              </Link>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Weekly Stoic quote — soft footer */}
      <div className="mt-4 pt-3 border-t border-stone-100">
        <p className="text-[11px] text-stone-400 italic leading-relaxed">
          &ldquo;{weeklyQuote.text}&rdquo;
          {weeklyQuote.author && (
            <span className="not-italic font-medium text-stone-400"> — {weeklyQuote.author}</span>
          )}
        </p>
      </div>
    </motion.div>
  );
}

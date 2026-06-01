"use client";

import { useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, Circle, Trophy, Flame, Calculator, BookOpen, Activity, Sun, Star } from "lucide-react";
import Link from "next/link";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { getWeeklyQuote } from "@/lib/stoic";

type Props = {
  hasCheckinThisWeek: boolean;
  pulseDaysThisWeek: number;
  hasCalcThisWeek: boolean;
  hasJournalThisWeek: boolean;
  hasIntentionThisWeek: boolean;
  streak: number;
};

type Challenge = {
  id: string;
  icon: React.ReactNode;
  label: string;
  detail: string;
  xp: number;
  done: boolean;
  href: string;
  progress?: { current: number; target: number };
};

export function WeeklyChallengesCard({
  hasCheckinThisWeek,
  pulseDaysThisWeek,
  hasCalcThisWeek,
  hasJournalThisWeek,
  hasIntentionThisWeek,
  streak,
}: Props) {
  const now = new Date();
  // Rotate challenges weekly: week number changes the seed
  const weekOfYear = Math.floor(
    (now.getTime() - new Date(now.getFullYear(), 0, 1).getTime()) / (7 * 24 * 3600 * 1000)
  );

  const challenges = useMemo<Challenge[]>(() => {
    const pool: Challenge[] = [
      {
        id: "checkin",
        icon: <Flame className="w-4 h-4 text-amber-500" />,
        label: "Complete your weekly check-in",
        detail: "Keep your streak alive",
        xp: 50,
        done: hasCheckinThisWeek,
        href: "/checkin",
      },
      {
        id: "pulse4",
        icon: <Activity className="w-4 h-4 text-teal-500" />,
        label: "Log your pulse 4 days",
        detail: "Build your daily tracking habit",
        xp: 40,
        done: pulseDaysThisWeek >= 4,
        href: "/pulse",
        progress: { current: Math.min(pulseDaysThisWeek, 4), target: 4 },
      },
      {
        id: "calc",
        icon: <Calculator className="w-4 h-4 text-soft-gold" />,
        label: "Run a calculator this week",
        detail: "Scores drift — keep them fresh",
        xp: 25,
        done: hasCalcThisWeek,
        href: "/calculators",
      },
      {
        id: "journal",
        icon: <BookOpen className="w-4 h-4 text-violet-500" />,
        label: "Log a decision in your journal",
        detail: "Your future self will thank you",
        xp: 20,
        done: hasJournalThisWeek,
        href: "/journal",
      },
      {
        id: "intention3",
        icon: <Sun className="w-4 h-4 text-amber-400" />,
        label: "Set your intention 3 mornings",
        detail: "Small ritual, lasting discipline",
        xp: 30,
        done: hasIntentionThisWeek,
        href: "/intention",
      },
      {
        id: "streak",
        icon: <Trophy className="w-4 h-4 text-soft-gold" />,
        label: `Maintain a ${Math.max(streak, 1)}-week streak`,
        detail: "Consistency is the real metric",
        xp: 60,
        done: streak >= 1 && hasCheckinThisWeek,
        href: "/checkin",
      },
    ];

    // Pick 3 challenges, rotating by week number so they feel fresh weekly
    const ordered = [
      pool[weekOfYear % pool.length],
      pool[(weekOfYear + 1) % pool.length],
      pool[(weekOfYear + 2) % pool.length],
    ];

    // Always prioritise incomplete ones first
    return [...ordered].sort((a, b) => (a.done === b.done ? 0 : a.done ? 1 : -1));
  }, [hasCheckinThisWeek, pulseDaysThisWeek, hasCalcThisWeek, hasJournalThisWeek, hasIntentionThisWeek, streak, weekOfYear]);

  const completedCount = challenges.filter((c) => c.done).length;
  const totalXP = challenges.reduce((sum, c) => sum + (c.done ? c.xp : 0), 0);
  const maxXP = challenges.reduce((sum, c) => sum + c.xp, 0);
  const allDone = completedCount === challenges.length;
  const weeklyQuote = getWeeklyQuote("habits");

  return (
    <Card padding="lg" className={allDone ? "border-amber-200 bg-gradient-to-br from-amber-50/60 via-yellow-50/30 to-white" : ""}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>This Week's Challenges</CardTitle>
            <CardDescription>
              Challenges reset every Monday
            </CardDescription>
          </div>
          {/* Progress pill */}
          <div className="flex items-center gap-1.5">
            {allDone ? (
              <motion.span
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="inline-flex items-center gap-1 text-xs font-bold text-amber-700 bg-amber-100 rounded-full px-2.5 py-1"
              >
                <Star className="w-3 h-3" /> All done!
              </motion.span>
            ) : (
              <span className="inline-flex items-center gap-1 text-xs font-semibold text-stone-500 bg-stone-100 rounded-full px-2.5 py-1">
                {completedCount}/{challenges.length}
                <span className="text-stone-400 font-normal">· {totalXP}/{maxXP} XP</span>
              </span>
            )}
          </div>
        </div>
      </CardHeader>

      <div className="space-y-2.5 mt-1">
        {challenges.map((c, i) => (
          <motion.div
            key={c.id}
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.07, type: "spring", stiffness: 300, damping: 24 }}
          >
            <Link href={c.done ? "#" : c.href} className={c.done ? "cursor-default pointer-events-none" : "group"}>
              <div
                className={`flex items-start gap-3 p-3.5 rounded-xl border transition-all duration-200 ${
                  c.done
                    ? "bg-gradient-to-r from-emerald-50/70 to-teal-50/30 border-emerald-100/80"
                    : "bg-stone-50/80 border-stone-100 group-hover:border-amber-200 group-hover:bg-amber-50/40 group-hover:shadow-sm"
                }`}
              >
                {/* Check icon */}
                <div className="shrink-0 mt-0.5">
                  <AnimatePresence mode="wait">
                    {c.done ? (
                      <motion.div
                        key="done"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", stiffness: 400 }}
                      >
                        <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                      </motion.div>
                    ) : (
                      <Circle className="w-5 h-5 text-stone-300 group-hover:text-amber-300 transition-colors" />
                    )}
                  </AnimatePresence>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-1.5">
                      <span className={c.done ? "opacity-50" : ""}>{c.icon}</span>
                      <p className={`text-xs font-semibold leading-snug ${c.done ? "line-through text-stone-400" : "text-matte-black"}`}>
                        {c.label}
                      </p>
                    </div>
                    <span className={`shrink-0 text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                      c.done ? "text-emerald-500 bg-emerald-50" : "text-amber-600 bg-amber-50"
                    }`}>
                      {c.done ? "✓" : `+${c.xp}`}
                    </span>
                  </div>
                  <p className={`text-[11px] mt-0.5 ${c.done ? "text-stone-300" : "text-slate-calm"}`}>
                    {c.detail}
                  </p>
                  {/* Progress bar for pulse challenge */}
                  {c.progress && !c.done && (
                    <div className="mt-2">
                      <div className="flex justify-between text-[10px] text-stone-400 mb-1">
                        <span>{c.progress.current}/{c.progress.target} days</span>
                      </div>
                      <div className="w-full h-1 bg-stone-200 rounded-full overflow-hidden">
                        <motion.div
                          className="h-full bg-teal-400 rounded-full"
                          initial={{ width: 0 }}
                          animate={{ width: `${(c.progress.current / c.progress.target) * 100}%` }}
                          transition={{ duration: 0.6, delay: i * 0.1 }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>

      {/* Progress bar */}
      <div className="mt-4 pt-3 border-t border-stone-100">
        <div className="w-full h-1.5 bg-stone-100 rounded-full overflow-hidden mb-3">
          <motion.div
            className={`h-full rounded-full ${allDone ? "bg-gradient-to-r from-amber-400 to-yellow-400" : "bg-gradient-to-r from-amber-200 to-amber-400"}`}
            initial={{ width: 0 }}
            animate={{ width: `${(completedCount / challenges.length) * 100}%` }}
            transition={{ duration: 0.8, ease: [0.34, 1.56, 0.64, 1] }}
          />
        </div>
        {/* Stoic footer quote */}
        <p className="text-[11px] text-stone-400 italic leading-relaxed">
          &ldquo;{weeklyQuote.text}&rdquo;
          {weeklyQuote.author && (
            <span className="not-italic font-medium"> — {weeklyQuote.author}</span>
          )}
        </p>
      </div>
    </Card>
  );
}

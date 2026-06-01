"use client";

import { motion } from "framer-motion";
import { Lock } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription } from "./Card";
import Link from "next/link";

const ALL_ACHIEVEMENT_META: Record<
  string,
  { label: string; icon: string; desc: string; hint: string; href: string }
> = {
  FIRST_CALCULATOR: {
    label: "First Step",
    icon: "🏛️",
    desc: "Ran your first calculator",
    hint: "Run any calculator",
    href: "/calculators",
  },
  ALL_CALCULATORS_DONE: {
    label: "Full Picture",
    icon: "🗺️",
    desc: "All 5 calculators completed",
    hint: "Run all 5 calculators",
    href: "/calculators",
  },
  SCORE_STABLE: {
    label: "Stable Ground",
    icon: "⚖️",
    desc: "Average score reached 50+",
    hint: "Improve your scores to 50+",
    href: "/calculators",
  },
  SCORE_THRIVING: {
    label: "Thriving",
    icon: "🌿",
    desc: "Average score reached 70+",
    hint: "Improve your scores to 70+",
    href: "/calculators",
  },
  SCORE_FLOURISHING: {
    label: "Flourishing",
    icon: "✨",
    desc: "Average score reached 85+",
    hint: "Improve your scores to 85+",
    href: "/calculators",
  },
  STREAK_4_WEEKS: {
    label: "4-Week Discipline",
    icon: "🔥",
    desc: "4 consecutive weekly check-ins",
    hint: "Check in for 4 consecutive weeks",
    href: "/checkin",
  },
  STREAK_8_WEEKS: {
    label: "8-Week Resolve",
    icon: "⚡",
    desc: "8 consecutive weekly check-ins",
    hint: "Check in for 8 consecutive weeks",
    href: "/checkin",
  },
  STREAK_12_WEEKS: {
    label: "12-Week Mastery",
    icon: "🔱",
    desc: "12 consecutive weekly check-ins",
    hint: "Check in for 12 weeks straight",
    href: "/checkin",
  },
  IMPROVED_10_POINTS: {
    label: "10-Point Leap",
    icon: "📈",
    desc: "Improved a score by 10+ points",
    hint: "Run the same calculator twice and improve",
    href: "/calculators",
  },
  FIRST_REFLECTION: {
    label: "Inner Voice",
    icon: "💭",
    desc: "First AI reflection requested",
    hint: "Request a Logos reflection on your dashboard",
    href: "/dashboard",
  },
  FIRST_GOAL: {
    label: "Goal Setter",
    icon: "🎯",
    desc: "Set your first score goal",
    hint: "Set a goal after running any calculator",
    href: "/calculators",
  },
  GOAL_REACHED: {
    label: "Goal Reached",
    icon: "🏆",
    desc: "Achieved a score target",
    hint: "Hit your goal score on any calculator",
    href: "/calculators",
  },
  FIRST_SIMULATION: {
    label: "Scenario Builder",
    icon: "🔭",
    desc: "Ran your first simulation",
    hint: "Try the life scenario simulator",
    href: "/simulate",
  },
};

type AchievementRecord = { id: string; type: string; unlockedAt: string };

export function AchievementGallery({
  achievements,
}: {
  achievements: AchievementRecord[];
}) {
  const unlockedSet = new Set(achievements.map((a) => a.type));
  const unlockedMap: Record<string, string> = {};
  for (const a of achievements) unlockedMap[a.type] = a.unlockedAt;

  const unlockedCount = achievements.length;
  const totalCount = Object.keys(ALL_ACHIEVEMENT_META).length;

  return (
    <Card padding="lg">
      <CardHeader>
        <CardTitle>Achievement Gallery</CardTitle>
        <CardDescription>
          {unlockedCount} of {totalCount} unlocked — each reflects real
          progress, not gamification
        </CardDescription>
      </CardHeader>

      {/* Progress bar */}
      <div className="h-1.5 bg-stone-100 rounded-full overflow-hidden mb-5">
        <motion.div
          className="h-full rounded-full bg-gradient-to-r from-soft-gold to-amber-300"
          initial={{ width: 0 }}
          animate={{ width: `${(unlockedCount / totalCount) * 100}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        />
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {Object.entries(ALL_ACHIEVEMENT_META).map(([type, meta], i) => {
          const unlocked = unlockedSet.has(type);
          const dateLabel = unlocked
            ? new Date(unlockedMap[type]).toLocaleDateString("en-GB", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })
            : null;

          return (
            <motion.div
              key={type}
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.035 }}
            >
              {unlocked ? (
                <div
                  className="flex items-start gap-3 bg-amber-50/60 border border-amber-100 rounded-xl p-3 h-full"
                  title={`Earned ${dateLabel}`}
                >
                  <span className="text-xl leading-none flex-shrink-0">
                    {meta.icon}
                  </span>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-matte-black leading-tight">
                      {meta.label}
                    </p>
                    <p className="text-[10px] text-stone-400 mt-0.5 leading-tight">
                      {meta.desc}
                    </p>
                    {dateLabel && (
                      <p className="text-[10px] text-soft-gold mt-1 font-medium">
                        {dateLabel}
                      </p>
                    )}
                  </div>
                </div>
              ) : (
                <Link href={meta.href}>
                  <div className="flex items-start gap-3 bg-stone-50 border border-stone-100 rounded-xl p-3 h-full opacity-55 hover:opacity-80 transition-opacity cursor-pointer group">
                    <div className="relative flex-shrink-0">
                      <span className="text-xl leading-none grayscale">
                        {meta.icon}
                      </span>
                      <Lock className="w-2.5 h-2.5 text-stone-400 absolute -bottom-0.5 -right-0.5" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-stone-400 leading-tight">
                        {meta.label}
                      </p>
                      <p className="text-[10px] text-stone-400 mt-0.5 leading-tight group-hover:text-soft-gold transition-colors">
                        {meta.hint}
                      </p>
                    </div>
                  </div>
                </Link>
              )}
            </motion.div>
          );
        })}
      </div>

      {unlockedCount < totalCount && (
        <p className="text-xs text-stone-400 mt-4 text-center">
          {totalCount - unlockedCount} more achievements to discover
        </p>
      )}
    </Card>
  );
}

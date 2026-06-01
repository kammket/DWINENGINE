"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { DashboardLayout } from "@/components/layout/Sidebar";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { DailyActivityMap } from "@/components/ui/DailyActivityMap";
import { AchievementGallery } from "@/components/ui/AchievementGallery";
import { formatRelativeTime } from "@/lib/utils";

type AchievementRecord = { id: string; type: string; unlockedAt: string };
type CalcResult = {
  id: string;
  type: string;
  score: number;
  createdAt: string;
};
type GoalRecord = {
  id: string;
  calculatorType: string;
  targetScore: number;
  reachedAt: string | null;
};

const ACHIEVEMENT_META: Record<string, { label: string; icon: string }> = {
  FIRST_CALCULATOR: { label: "First Step", icon: "🏛️" },
  ALL_CALCULATORS_DONE: { label: "Full Picture", icon: "🗺️" },
  SCORE_STABLE: { label: "Stable Ground", icon: "⚖️" },
  SCORE_THRIVING: { label: "Thriving", icon: "🌿" },
  SCORE_FLOURISHING: { label: "Flourishing", icon: "✨" },
  STREAK_4_WEEKS: { label: "4-Week Discipline", icon: "🔥" },
  STREAK_8_WEEKS: { label: "8-Week Resolve", icon: "⚡" },
  STREAK_12_WEEKS: { label: "12-Week Mastery", icon: "🔱" },
  IMPROVED_10_POINTS: { label: "10-Point Leap", icon: "📈" },
  FIRST_REFLECTION: { label: "Inner Voice", icon: "💭" },
  FIRST_GOAL: { label: "Goal Setter", icon: "🎯" },
  GOAL_REACHED: { label: "Goal Reached", icon: "🏆" },
  FIRST_SIMULATION: { label: "Scenario Builder", icon: "🔭" },
};

const CALC_LABELS: Record<string, string> = {
  FINANCIAL_PEACE: "Financial Peace",
  BURNOUT_RISK: "Burnout Risk",
  RELATIONSHIP_SUSTAINABILITY: "Relationship Health",
  DECISION_REGRET: "Decision Quality",
  TIME_VALUE: "Time Value",
};

type TimelineEvent = {
  id: string;
  date: string;
  icon: string;
  label: string;
  desc: string;
  category: "achievement" | "calculator" | "goal";
};

export default function JourneyPage() {
  const [achievements, setAchievements] = useState<AchievementRecord[]>([]);
  const [calcResults, setCalcResults] = useState<CalcResult[]>([]);
  const [goals, setGoals] = useState<GoalRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/achievements").then((r) => r.json()),
      fetch("/api/calculators?limit=50").then((r) => r.json()),
      fetch("/api/goals").then((r) => r.json()),
    ])
      .then(([achRes, calcRes, goalsRes]) => {
        if (achRes.success) setAchievements(achRes.achievements);
        if (calcRes.success) setCalcResults(calcRes.results ?? []);
        if (goalsRes.success) setGoals(goalsRes.goals ?? []);
      })
      .finally(() => setLoading(false));
  }, []);

  // Build timeline
  const events: TimelineEvent[] = [];

  // Achievements
  for (const a of achievements) {
    const meta = ACHIEVEMENT_META[a.type];
    if (meta) {
      events.push({
        id: `ach-${a.id}`,
        date: a.unlockedAt,
        icon: meta.icon,
        label: meta.label,
        desc: "Achievement unlocked",
        category: "achievement",
      });
    }
  }

  // First run per calculator type (oldest → newest, keep first occurrence)
  const firstRuns: Record<string, CalcResult> = {};
  for (const c of [...calcResults].sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  )) {
    if (!firstRuns[c.type]) firstRuns[c.type] = c;
  }
  for (const [type, calc] of Object.entries(firstRuns)) {
    events.push({
      id: `calc-${type}`,
      date: calc.createdAt,
      icon: "📊",
      label: `First ${CALC_LABELS[type] || type} run`,
      desc: `Score: ${Math.round(calc.score)}`,
      category: "calculator",
    });
  }

  // Goals reached
  for (const g of goals) {
    if (g.reachedAt) {
      events.push({
        id: `goal-${g.id}`,
        date: g.reachedAt,
        icon: "🎯",
        label: `Goal reached — ${CALC_LABELS[g.calculatorType] || g.calculatorType}`,
        desc: `Target score of ${g.targetScore} achieved`,
        category: "goal",
      });
    }
  }

  // Sort newest first
  events.sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  const categoryBg: Record<string, string> = {
    achievement: "bg-amber-50 border-amber-100",
    calculator: "bg-blue-50 border-blue-100",
    goal: "bg-green-50 border-green-100",
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="font-serif text-2xl font-bold text-matte-black">
            Your Journey
          </h1>
          <p className="text-slate-calm text-sm mt-1">
            Every action you&apos;ve taken — a record of your commitment to
            self-knowledge.
          </p>
        </motion.div>

        {/* Activity Heat Map */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <DailyActivityMap />
        </motion.div>

        {/* Achievement Gallery */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <AchievementGallery achievements={achievements} />
        </motion.div>

        {/* Milestone Timeline */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card padding="lg">
            <CardHeader>
              <CardTitle>Milestone Timeline</CardTitle>
              <CardDescription>
                Every key moment on your path — each step forward counted
              </CardDescription>
            </CardHeader>

            {loading ? (
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <div
                    key={i}
                    className="h-14 bg-stone-100 rounded-xl animate-pulse"
                  />
                ))}
              </div>
            ) : events.length === 0 ? (
              <div className="text-center py-10">
                <p className="text-3xl mb-3">🏛️</p>
                <p className="text-sm text-slate-calm mb-1">
                  Your journey starts here.
                </p>
                <p className="text-xs text-stone-400">
                  Run your first calculator to place your first milestone.
                </p>
              </div>
            ) : (
              <div className="relative">
                {/* Vertical line */}
                <div className="absolute left-4 top-3 bottom-3 w-px bg-stone-100" />
                <div className="space-y-3 pl-10">
                  {events.map((ev, i) => (
                    <motion.div
                      key={ev.id}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.04 }}
                      className="relative"
                    >
                      {/* Icon dot */}
                      <div
                        className={`absolute -left-10 top-1 w-8 h-8 rounded-full border-2 flex items-center justify-center text-sm ${categoryBg[ev.category]}`}
                      >
                        {ev.icon}
                      </div>

                      <div className="bg-stone-50 rounded-xl px-3 py-2.5">
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-sm font-semibold text-matte-black truncate">
                            {ev.label}
                          </p>
                          <span className="text-[10px] text-stone-400 whitespace-nowrap flex-shrink-0">
                            {formatRelativeTime(ev.date)}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-calm mt-0.5">
                          {ev.desc}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}
          </Card>
        </motion.div>
      </div>
    </DashboardLayout>
  );
}

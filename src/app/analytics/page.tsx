"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { DashboardLayout } from "@/components/layout/Sidebar";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { MetricBar } from "@/components/ui/ScoreVisuals";
import { ActivityHeatmap } from "@/components/ui/ActivityHeatmap";
import {
  Lock, TrendingUp, BarChart3, Calendar, Filter, Flame, Target,
  DollarSign, Brain, Heart, Lightbulb, Clock, Sparkles,
} from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
  BarChart, Bar,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
} from "recharts";
import { useAuth } from "@/components/providers/AuthProvider";
import Link from "next/link";

type CheckinRecord = {
  weekKey: string;
  financialMood: number;
  burnoutMood: number;
  relationshipMood: number;
  decisionMood: number;
  timeMood: number;
};

type GoalRecord = {
  id: string;
  calculatorType: string;
  targetScore: number;
  startScore: number | null;
  currentScore: number | null;
  reachedAt: string | null;
};

type TrendPoint = {
  date: string;
  label: string;
  overall?: number;
  financial?: number;
  burnout?: number;
  relationship?: number;
  decision?: number;
  timeValue?: number;
};

type CheckinMoodKey =
  | "financialMood"
  | "burnoutMood"
  | "relationshipMood"
  | "decisionMood"
  | "timeMood";

function getISOWeek(date: Date): string {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const day = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - day);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const week = Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
  return `${d.getUTCFullYear()}-W${String(week).padStart(2, "0")}`;
}

const MOOD_EMOJI: Record<number, string> = {
  1: "😓", 2: "😔", 3: "😕", 4: "😐", 5: "🙂",
  6: "😊", 7: "😄", 8: "🌟", 9: "💪", 10: "🔥",
};

const DIMENSIONS: Array<{
  moodKey: CheckinMoodKey;
  calcType: string;
  calcHref: string;
  label: string;
  Icon: React.ElementType;
  scoreColor: string;
  moodFill: string;
}> = [
  {
    moodKey: "financialMood",
    calcType: "FINANCIAL_PEACE",
    calcHref: "/calculators/financial-peace",
    label: "Financial",
    Icon: DollarSign,
    scoreColor: "#C9A84C",
    moodFill: "#3B82F6",
  },
  {
    moodKey: "burnoutMood",
    calcType: "BURNOUT_RISK",
    calcHref: "/calculators/burnout-risk",
    label: "Energy",
    Icon: Brain,
    scoreColor: "#4F61A8",
    moodFill: "#F97316",
  },
  {
    moodKey: "relationshipMood",
    calcType: "RELATIONSHIP_SUSTAINABILITY",
    calcHref: "/calculators/relationship-sustainability",
    label: "Relationship",
    Icon: Heart,
    scoreColor: "#22C55E",
    moodFill: "#F43F5E",
  },
  {
    moodKey: "decisionMood",
    calcType: "DECISION_REGRET",
    calcHref: "/calculators/decision-regret",
    label: "Decision",
    Icon: Lightbulb,
    scoreColor: "#EC4899",
    moodFill: "#F59E0B",
  },
  {
    moodKey: "timeMood",
    calcType: "TIME_VALUE",
    calcHref: "/calculators/time-value",
    label: "Time",
    Icon: Clock,
    scoreColor: "#F97316",
    moodFill: "#8B5CF6",
  },
];

const CALC_LABEL: Record<string, string> = {
  FINANCIAL_PEACE: "Financial Peace",
  BURNOUT_RISK: "Burnout Risk",
  RELATIONSHIP_SUSTAINABILITY: "Relationship Health",
  DECISION_REGRET: "Decision Quality",
  TIME_VALUE: "Time Value",
};

const CHART_COLORS: Record<string, string> = {
  financial: "#C9A84C",
  burnout: "#4F61A8",
  relationship: "#22C55E",
  decision: "#EC4899",
  timeValue: "#F97316",
  overall: "#1C1917",
};

type FilterRange = "30d" | "90d" | "6mo" | "1yr" | "all";

function generateInsights(
  thisWeek: CheckinRecord | null,
  latestByType: Record<string, number>,
  streak: number
): string[] {
  const insights: string[] = [];
  const scores = Object.entries(latestByType);

  if (scores.length > 0) {
    const sorted = [...scores].sort((a, b) => b[1] - a[1]);
    const [bestType, bestScore] = sorted[0];
    insights.push(
      `Your strongest area is ${CALC_LABEL[bestType] ?? bestType} at ${Math.round(bestScore)}/100.`
    );
    if (sorted.length > 1) {
      const [worstType, worstScore] = sorted[sorted.length - 1];
      if (worstScore < 60) {
        insights.push(
          `${CALC_LABEL[worstType] ?? worstType} (${Math.round(worstScore)}) is your biggest growth opportunity right now.`
        );
      }
    }
  }

  if (thisWeek) {
    let maxDiff = 0;
    let maxDiffLabel = "";
    for (const d of DIMENSIONS) {
      const calcScore = latestByType[d.calcType];
      if (calcScore === undefined) continue;
      const mood = thisWeek[d.moodKey];
      const diff = mood * 10 - calcScore;
      if (Math.abs(diff) > Math.abs(maxDiff)) {
        maxDiff = diff;
        maxDiffLabel = d.label;
      }
    }
    if (Math.abs(maxDiff) > 20 && maxDiffLabel) {
      if (maxDiff > 0) {
        insights.push(
          `You feel more confident about your ${maxDiffLabel} situation than your score reflects — worth exploring why.`
        );
      } else {
        insights.push(
          `Your ${maxDiffLabel} score outpaces how you feel day-to-day — hidden strengths worth acknowledging.`
        );
      }
    }
  }

  if (streak >= 4) {
    insights.push(
      `${streak}-week check-in streak — your consistency is building a meaningful data picture.`
    );
  } else if (streak === 0 && !thisWeek) {
    insights.push(
      "Complete your first weekly check-in to unlock personalised mood-score correlations."
    );
  }

  return insights.slice(0, 4);
}

export default function AnalyticsPage() {
  const { user } = useAuth();
  const isPremium = user?.subscription?.tier !== "FREE";

  const [trendData, setTrendData] = useState<TrendPoint[]>([]);
  const [calculatorData, setCalculatorData] = useState<
    Array<{ name: string; score: number; count: number }>
  >([]);
  const [latestByType, setLatestByType] = useState<Record<string, number>>({});
  const [range, setRange] = useState<FilterRange>("90d");
  const [loading, setLoading] = useState(true);
  const [checkins, setCheckins] = useState<CheckinRecord[]>([]);
  const [thisWeek, setThisWeek] = useState<CheckinRecord | null>(null);
  const [goals, setGoals] = useState<GoalRecord[]>([]);
  const [streak, setStreak] = useState(0);

  useEffect(() => {
    async function fetchAll() {
      setLoading(true);
      try {
        const [ciRes, goalsRes, calcRes] = await Promise.all([
          fetch("/api/checkin"),
          fetch("/api/goals"),
          fetch(`/api/calculators?limit=50&range=${range}`),
        ]);
        const [ci, gl, calc] = await Promise.all([
          ciRes.json(),
          goalsRes.json(),
          calcRes.json(),
        ]);

        if (ci.success) {
          setCheckins(ci.history ?? []);
          setStreak(ci.streak ?? 0);
          setThisWeek(ci.thisWeek ?? null);
        }
        if (gl.success) setGoals(gl.goals ?? []);

        if (calc.success) {
          const results: Array<{ type: string; score: number; createdAt: string }> =
            calc.results || [];

          // Latest score per type (results sorted desc)
          const byType: Record<string, number> = {};
          const typeCounts: Record<string, number> = {};
          results.forEach((r) => {
            typeCounts[r.type] = (typeCounts[r.type] || 0) + 1;
            if (byType[r.type] === undefined) byType[r.type] = r.score;
          });
          setLatestByType(byType);
          setCalculatorData(
            Object.entries(byType).map(([type, score]) => ({
              name: CALC_LABEL[type] || type,
              score,
              count: typeCounts[type],
            }))
          );

          if (isPremium) {
            const byWeek: Record<string, Record<string, number[]>> = {};
            results.forEach((r) => {
              const d = new Date(r.createdAt);
              const wk = getISOWeek(d);
              if (!byWeek[wk]) byWeek[wk] = {};
              const key = r.type.toLowerCase().replace(/_/g, "");
              if (!byWeek[wk][key]) byWeek[wk][key] = [];
              byWeek[wk][key].push(r.score);
            });
            const avg = (arr: number[]) =>
              arr.reduce((a, b) => a + b, 0) / arr.length;
            const timeline: TrendPoint[] = Object.entries(byWeek)
              .sort(([a], [b]) => a.localeCompare(b))
              .map(([wk, types]) => {
                const point: TrendPoint = { date: wk, label: wk };
                if (types["financialpeace"]) point.financial = avg(types["financialpeace"]);
                if (types["burnoutrisk"]) point.burnout = avg(types["burnoutrisk"]);
                if (types["relationshipsustainability"])
                  point.relationship = avg(types["relationshipsustainability"]);
                if (types["decisionregret"]) point.decision = avg(types["decisionregret"]);
                if (types["timevalue"]) point.timeValue = avg(types["timevalue"]);
                const allScores = Object.values(types).map(avg);
                point.overall = allScores.reduce((a, b) => a + b, 0) / allScores.length;
                return point;
              });
            setTrendData(timeline);
          }
        }
      } catch {
        // silently fail
      }
      setLoading(false);
    }
    fetchAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPremium, range]);

  const insights = generateInsights(thisWeek, latestByType, streak);

  const radarData = DIMENSIONS.map((d) => ({
    dimension: d.label,
    Calculator: latestByType[d.calcType] !== undefined
      ? Math.round(latestByType[d.calcType])
      : null,
    Mood: thisWeek ? thisWeek[d.moodKey] * 10 : null,
  }));
  const hasRadarData = radarData.some((d) => d.Calculator !== null || d.Mood !== null);

  const RANGES: { value: FilterRange; label: string }[] = [
    { value: "30d", label: "30 days" },
    { value: "90d", label: "90 days" },
    { value: "6mo", label: "6 months" },
    { value: "1yr", label: "1 year" },
    { value: "all", label: "All time" },
  ];

  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto space-y-8">
        <PageHeader
          title="Life Intelligence"
          description="Your well-being dimensions — linked, compared, and understood."
          badge={isPremium ? { label: "Premium", color: "gold" } : undefined}
        />

        {/* ── Dimension Grid ─────────────────────────────────────────── */}
        {loading ? (
          <div>
            <div className="mb-3 flex items-center justify-between">
              <div className="h-5 w-40 bg-stone-100 rounded-lg animate-pulse" />
              <div className="h-4 w-48 bg-stone-100 rounded-lg animate-pulse" />
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
              {DIMENSIONS.map((d) => (
                <div key={d.calcType} className="bg-stone-100 rounded-2xl h-36 animate-pulse" />
              ))}
            </div>
          </div>
        ) : (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
            <div className="mb-3 flex items-center justify-between">
              <h2 className="font-serif text-base font-bold text-matte-black">
                Dimension Overview
              </h2>
              <p className="text-xs text-stone-400">Calculator score vs. self-reported mood</p>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
              {DIMENSIONS.map((d) => {
                const calcScore = latestByType[d.calcType];
                const mood = thisWeek ? thisWeek[d.moodKey] : undefined;
                const moodScaled = mood !== undefined ? mood * 10 : undefined;
                const hasCalc = calcScore !== undefined;
                const hasMood = mood !== undefined;
                const aligned =
                  hasCalc && hasMood && Math.abs(moodScaled! - calcScore) <= 20;
                const Icon = d.Icon;

                return (
                  <div
                    key={d.calcType}
                    className="bg-white border border-stone-200 rounded-2xl p-4 flex flex-col gap-2.5 shadow-sm hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-center gap-1.5">
                      <div
                        className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                        style={{ backgroundColor: d.scoreColor + "1a" }}
                      >
                        <Icon className="w-3.5 h-3.5" style={{ color: d.scoreColor }} />
                      </div>
                      <span className="text-xs font-semibold text-matte-black">{d.label}</span>
                      {hasCalc && hasMood && (
                        <span
                          className={`ml-auto text-[8px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded-full ${
                            aligned
                              ? "bg-green-50 text-green-600"
                              : "bg-amber-50 text-amber-600"
                          }`}
                        >
                          {aligned ? "aligned" : "gap"}
                        </span>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-1.5">
                      <div className="bg-stone-50 rounded-xl p-2 text-center">
                        <p className="text-[8px] text-stone-400 uppercase tracking-wide mb-0.5">
                          Score
                        </p>
                        {hasCalc ? (
                          <p
                            className="text-lg font-bold leading-none"
                            style={{ color: d.scoreColor }}
                          >
                            {Math.round(calcScore)}
                          </p>
                        ) : (
                          <Link href={d.calcHref}>
                            <span className="text-[9px] text-soft-gold font-medium hover:underline">
                              Run →
                            </span>
                          </Link>
                        )}
                      </div>
                      <div className="bg-stone-50 rounded-xl p-2 text-center">
                        <p className="text-[8px] text-stone-400 uppercase tracking-wide mb-0.5">
                          Mood
                        </p>
                        {hasMood ? (
                          <>
                            <span className="text-base leading-none">{MOOD_EMOJI[mood!]}</span>
                            <p className="text-[8px] text-stone-400">{mood}/10</p>
                          </>
                        ) : (
                          <Link href="/checkin">
                            <span className="text-[9px] text-soft-gold font-medium hover:underline">
                              Check in →
                            </span>
                          </Link>
                        )}
                      </div>
                    </div>

                    {hasCalc && hasMood && (
                      <div className="space-y-1 pt-0.5">
                        <div className="flex items-center gap-1">
                          <div className="flex-1 h-1 bg-stone-100 rounded-full overflow-hidden">
                            <div
                              className="h-full rounded-full transition-all duration-700"
                              style={{ width: `${calcScore}%`, backgroundColor: d.scoreColor }}
                            />
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          <div className="flex-1 h-1 bg-stone-100 rounded-full overflow-hidden">
                            <div
                              className="h-full rounded-full transition-all duration-700"
                              style={{ width: `${moodScaled}%`, backgroundColor: d.moodFill }}
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
            <div className="flex items-center gap-5 mt-2 ml-1">
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-0.5 rounded-full bg-stone-500" />
                <span className="text-[10px] text-stone-400">Top bar = Calculator score</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-0.5 rounded-full bg-blue-400" />
                <span className="text-[10px] text-stone-400">Bottom bar = Mood (×10)</span>
              </div>
            </div>
          </motion.div>
        )}

        {/* ── Insights Panel ─────────────────────────────────────────── */}
        {!loading && insights.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
          >
            <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-100 rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="w-4 h-4 text-soft-gold" />
                <h2 className="font-serif text-sm font-bold text-matte-black">
                  Personalised Insights
                </h2>
              </div>
              <ul className="space-y-2">
                {insights.map((insight, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-stone-700">
                    <span className="text-soft-gold mt-0.5 flex-shrink-0 font-bold">›</span>
                    <span>{insight}</span>
                  </li>
                ))}
              </ul>
              {!thisWeek && (
                <div className="mt-3 pt-3 border-t border-amber-100">
                  <Link href="/checkin">
                    <span className="text-xs text-soft-gold font-semibold hover:underline">
                      Complete this week&apos;s check-in for richer insights →
                    </span>
                  </Link>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* ── Check-in Heatmap ───────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card padding="lg">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Flame className="w-4 h-4 text-orange-500" />
                  <CardTitle>Weekly Check-in Activity</CardTitle>
                </div>
                {streak > 0 && (
                  <span className="flex items-center gap-1.5 text-xs font-semibold text-orange-600 bg-orange-50 border border-orange-200 px-3 py-1 rounded-full">
                    <Flame className="w-3 h-3" />
                    {streak}-week streak
                  </span>
                )}
              </div>
              <CardDescription>
                26-week mood history — coloured by average wellbeing score
              </CardDescription>
            </CardHeader>
            {checkins.length > 0 ? (
              <ActivityHeatmap checkins={checkins} weeksBack={26} />
            ) : (
              <div className="text-center py-8">
                <p className="text-sm text-slate-calm mb-3">
                  No check-ins yet. Start your weekly habit to see your activity here.
                </p>
                <Link href="/checkin">
                  <Button variant="secondary" size="sm">
                    Start Check-in
                  </Button>
                </Link>
              </div>
            )}
          </Card>
        </motion.div>

        {/* ── Goals ─────────────────────────────────────────────────── */}
        {goals.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
          >
            <Card padding="lg">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Target className="w-4 h-4 text-soft-gold" />
                  <CardTitle>Goal Progress</CardTitle>
                </div>
                <CardDescription>Your score targets across all calculators</CardDescription>
              </CardHeader>
              <div className="space-y-5">
                {goals.map((goal) => {
                  const current = goal.currentScore ?? goal.startScore ?? 0;
                  const pct = Math.min(100, Math.round((current / goal.targetScore) * 100));
                  const reached = !!goal.reachedAt || current >= goal.targetScore;
                  return (
                    <div key={goal.id}>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-sm font-semibold text-matte-black">
                          {CALC_LABEL[goal.calculatorType] ?? goal.calculatorType}
                        </span>
                        <div className="flex items-center gap-2">
                          {reached && (
                            <span className="text-[10px] bg-green-100 text-green-700 font-semibold px-2 py-0.5 rounded-full">
                              Reached ✓
                            </span>
                          )}
                          <span className="text-xs text-stone-400">
                            {Math.round(current)} → {goal.targetScore}
                          </span>
                        </div>
                      </div>
                      <div className="h-2 bg-stone-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-700 ${
                            reached ? "bg-green-400" : "bg-soft-gold"
                          }`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <p className="text-right text-[10px] text-stone-400 mt-0.5">
                        {reached
                          ? "Goal achieved!"
                          : `${pct}% · ${goal.targetScore - Math.round(current)} pts to go`}
                      </p>
                    </div>
                  );
                })}
              </div>
            </Card>
          </motion.div>
        )}

        {/* ── FREE upgrade wall ─────────────────────────────────────── */}
        {!isPremium && (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
            <div className="relative rounded-3xl overflow-hidden border border-stone-200">
              <div className="pointer-events-none select-none blur-sm opacity-40 p-6 bg-white space-y-4">
                <div className="h-6 w-40 bg-stone-200 rounded-lg" />
                <div className="h-[220px] bg-gradient-to-br from-amber-50 via-stone-50 to-blue-50 rounded-2xl flex items-end gap-2 p-4">
                  {[60, 75, 55, 80, 70, 65, 85, 72, 68, 90, 78, 82].map((h, i) => (
                    <div
                      key={i}
                      className="flex-1 rounded-t-lg bg-gradient-to-t from-soft-gold to-amber-300"
                      style={{ height: `${h}%` }}
                    />
                  ))}
                </div>
                <div className="grid grid-cols-3 gap-3">
                  {["Financial Peace", "Burnout Risk", "Decision Quality"].map((label) => (
                    <div key={label} className="bg-stone-50 rounded-xl p-3">
                      <div className="h-3 w-20 bg-stone-200 rounded mb-2" />
                      <div className="h-8 w-12 bg-stone-200 rounded" />
                    </div>
                  ))}
                </div>
              </div>
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/80 backdrop-blur-[2px] p-8 text-center">
                <div className="w-14 h-14 bg-amber-50 rounded-2xl flex items-center justify-center mb-4 shadow-sm">
                  <Lock className="w-6 h-6 text-soft-gold" />
                </div>
                <h2 className="font-serif text-2xl font-bold text-matte-black mb-2">
                  Unlock Advanced Analytics
                </h2>
                <p className="text-slate-calm text-sm max-w-sm mb-6">
                  Track how every dimension of your well-being evolves over weeks and months —
                  trend charts, correlation radar, and longitudinal history.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-6 text-left max-w-xs w-full">
                  {[
                    "Full trend charts (up to 1 year)",
                    "Mood vs. score correlation radar",
                    "Longitudinal history comparison",
                    "Advanced date range filtering",
                  ].map((f) => (
                    <div key={f} className="flex items-center gap-2 text-xs text-matte-black">
                      <span className="w-4 h-4 rounded-full bg-amber-100 text-soft-gold flex items-center justify-center text-[10px] font-bold flex-shrink-0">
                        ✓
                      </span>
                      {f}
                    </div>
                  ))}
                </div>
                <Link href="/pricing">
                  <Button
                    variant="gold"
                    size="md"
                    icon={<TrendingUp className="w-4 h-4" />}
                  >
                    Upgrade to Premium — $19/mo
                  </Button>
                </Link>
                <p className="text-xs text-stone-400 mt-3">Cancel any time. No hidden fees.</p>
              </div>
            </div>
          </motion.div>
        )}

        {/* ── PREMIUM sections ──────────────────────────────────────── */}
        {isPremium && (
          <>
            {/* Mood vs Score Radar */}
            {hasRadarData && (
              <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
                <Card padding="lg" variant="elevated">
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-soft-gold" />
                      <CardTitle>Mood vs. Score Correlation</CardTitle>
                    </div>
                    <CardDescription>
                      Where your self-reported mood and calculator scores align — and where they
                      diverge
                    </CardDescription>
                  </CardHeader>
                  <ResponsiveContainer width="100%" height={300}>
                    <RadarChart data={radarData}>
                      <PolarGrid stroke="#F1F0EF" />
                      <PolarAngleAxis
                        dataKey="dimension"
                        tick={{ fontSize: 11, fill: "#44403C", fontWeight: 600 }}
                      />
                      <PolarRadiusAxis
                        angle={90}
                        domain={[0, 100]}
                        tick={{ fontSize: 9, fill: "#94A3B8" }}
                        tickCount={5}
                      />
                      <Radar
                        name="Calculator Score"
                        dataKey="Calculator"
                        stroke="#C9A84C"
                        fill="#C9A84C"
                        fillOpacity={0.25}
                        strokeWidth={2}
                      />
                      <Radar
                        name="Mood (×10)"
                        dataKey="Mood"
                        stroke="#4F61A8"
                        fill="#4F61A8"
                        fillOpacity={0.12}
                        strokeWidth={2}
                        strokeDasharray="4 2"
                      />
                      <Legend
                        iconType="circle"
                        iconSize={6}
                        wrapperStyle={{ fontSize: "11px" }}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "#FAFAF7",
                          border: "1px solid #E7E5E4",
                          borderRadius: "8px",
                          fontSize: "11px",
                        }}
                        formatter={(v: number) => [`${v}/100`, ""]}
                      />
                    </RadarChart>
                  </ResponsiveContainer>
                </Card>
              </motion.div>
            )}

            {/* Range filter */}
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-slate-calm" />
              <span className="text-xs text-slate-calm mr-1">Show:</span>
              {RANGES.map((r) => (
                <button
                  key={r.value}
                  onClick={() => setRange(r.value)}
                  className={`px-3 py-1 text-xs font-medium rounded-lg border transition-all ${
                    range === r.value
                      ? "bg-matte-black text-warm-white border-matte-black"
                      : "bg-white text-slate-calm border-stone-200 hover:border-stone-300"
                  }`}
                >
                  {r.label}
                </button>
              ))}
            </div>

            {loading ? (
              <div className="flex items-center justify-center h-40">
                <div className="w-6 h-6 border-2 border-soft-gold border-t-transparent rounded-full animate-spin" />
              </div>
            ) : (
              <>
                {/* Overall Trend */}
                {trendData.length > 1 ? (
                  <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
                    <Card padding="lg" variant="elevated">
                      <CardHeader>
                        <div className="flex items-center gap-2">
                          <TrendingUp className="w-4 h-4 text-soft-gold" />
                          <CardTitle>Well-Being Trend</CardTitle>
                        </div>
                        <CardDescription>
                          All calculator scores over time, grouped by week
                        </CardDescription>
                      </CardHeader>
                      <ResponsiveContainer width="100%" height={280}>
                        <AreaChart data={trendData}>
                          <defs>
                            {Object.entries(CHART_COLORS).map(([key, color]) => (
                              <linearGradient
                                key={key}
                                id={`grad-${key}`}
                                x1="0"
                                y1="0"
                                x2="0"
                                y2="1"
                              >
                                <stop offset="5%" stopColor={color} stopOpacity={0.18} />
                                <stop offset="95%" stopColor={color} stopOpacity={0} />
                              </linearGradient>
                            ))}
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="#F1F0EF" />
                          <XAxis
                            dataKey="label"
                            tick={{ fontSize: 10, fill: "#94A3B8" }}
                            axisLine={false}
                            tickLine={false}
                          />
                          <YAxis
                            domain={[0, 100]}
                            tick={{ fontSize: 10, fill: "#94A3B8" }}
                            axisLine={false}
                            tickLine={false}
                          />
                          <Tooltip
                            contentStyle={{
                              backgroundColor: "#FAFAF7",
                              border: "1px solid #E7E5E4",
                              borderRadius: "8px",
                              fontSize: "11px",
                            }}
                            formatter={(v: number) => [v.toFixed(1), ""]}
                          />
                          <Legend
                            iconType="circle"
                            iconSize={6}
                            wrapperStyle={{ fontSize: "11px" }}
                          />
                          <Area
                            type="monotone"
                            dataKey="overall"
                            name="Overall"
                            stroke={CHART_COLORS.overall}
                            fill={`url(#grad-overall)`}
                            strokeWidth={2.5}
                            dot={false}
                          />
                          <Area
                            type="monotone"
                            dataKey="financial"
                            name="Financial"
                            stroke={CHART_COLORS.financial}
                            fill={`url(#grad-financial)`}
                            strokeWidth={1.5}
                            dot={false}
                          />
                          <Area
                            type="monotone"
                            dataKey="burnout"
                            name="Burnout"
                            stroke={CHART_COLORS.burnout}
                            fill={`url(#grad-burnout)`}
                            strokeWidth={1.5}
                            dot={false}
                          />
                          <Area
                            type="monotone"
                            dataKey="relationship"
                            name="Relationship"
                            stroke={CHART_COLORS.relationship}
                            fill={`url(#grad-relationship)`}
                            strokeWidth={1.5}
                            dot={false}
                          />
                          <Area
                            type="monotone"
                            dataKey="decision"
                            name="Decision"
                            stroke={CHART_COLORS.decision}
                            fill={`url(#grad-decision)`}
                            strokeWidth={1.5}
                            dot={false}
                          />
                          <Area
                            type="monotone"
                            dataKey="timeValue"
                            name="Time"
                            stroke={CHART_COLORS.timeValue}
                            fill={`url(#grad-timeValue)`}
                            strokeWidth={1.5}
                            dot={false}
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </Card>
                  </motion.div>
                ) : (
                  <Card padding="lg" className="text-center">
                    <BarChart3 className="w-8 h-8 text-stone-300 mx-auto mb-2" />
                    <p className="text-sm text-slate-calm">
                      Not enough data yet. Run calculators regularly to build your trend chart.
                    </p>
                    <Link href="/calculators" className="mt-3 inline-block">
                      <Button variant="secondary" size="sm">
                        Go to Calculators
                      </Button>
                    </Link>
                  </Card>
                )}

                {/* Calculator Scores Bar Chart */}
                {calculatorData.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                  >
                    <Card padding="lg">
                      <CardHeader>
                        <div className="flex items-center gap-2">
                          <BarChart3 className="w-4 h-4 text-soft-gold" />
                          <CardTitle>Latest Scores by Calculator</CardTitle>
                        </div>
                        <CardDescription>
                          Most recent score per calculator in the selected period
                        </CardDescription>
                      </CardHeader>
                      <ResponsiveContainer width="100%" height={220}>
                        <BarChart data={calculatorData} layout="vertical">
                          <CartesianGrid
                            strokeDasharray="3 3"
                            stroke="#F1F0EF"
                            horizontal={false}
                          />
                          <XAxis
                            type="number"
                            domain={[0, 100]}
                            tick={{ fontSize: 10, fill: "#94A3B8" }}
                            axisLine={false}
                            tickLine={false}
                          />
                          <YAxis
                            type="category"
                            dataKey="name"
                            tick={{ fontSize: 11, fill: "#44403C" }}
                            axisLine={false}
                            tickLine={false}
                            width={110}
                          />
                          <Tooltip
                            contentStyle={{
                              backgroundColor: "#FAFAF7",
                              border: "1px solid #E7E5E4",
                              borderRadius: "8px",
                              fontSize: "11px",
                            }}
                            formatter={(v: number, _, entry) => [
                              `${v.toFixed(1)} (${entry.payload.count} runs)`,
                              "",
                            ]}
                          />
                          <Bar dataKey="score" fill="#C9A84C" radius={[0, 4, 4, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </Card>
                  </motion.div>
                )}

                {/* Score Comparison */}
                {calculatorData.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    <Card padding="lg">
                      <CardHeader>
                        <CardTitle>Score Comparison</CardTitle>
                        <CardDescription>
                          Visual comparison of your latest scores across all calculators
                        </CardDescription>
                      </CardHeader>
                      <div className="space-y-3">
                        {calculatorData.map((d) => (
                          <MetricBar
                            key={d.name}
                            label={`${d.name} (${d.count} runs)`}
                            score={d.score}
                            animate
                          />
                        ))}
                      </div>
                    </Card>
                  </motion.div>
                )}

                {calculatorData.length === 0 && (
                  <Card padding="lg" className="text-center">
                    <Calendar className="w-8 h-8 text-stone-300 mx-auto mb-2" />
                    <p className="text-sm text-slate-calm mb-3">
                      No calculator data found for this period.
                    </p>
                    <Link href="/calculators">
                      <Button variant="secondary" size="sm">
                        Start a Calculator
                      </Button>
                    </Link>
                  </Card>
                )}
              </>
            )}
          </>
        )}
      </div>
    </DashboardLayout>
  );
}

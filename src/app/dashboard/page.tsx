"use client";

export const dynamic = 'force-dynamic';

import { useEffect, useState } from "react";
import { Suspense } from "react";
import { motion } from "framer-motion";
import { DashboardLayout } from "@/components/layout/Sidebar";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { ScoreRing, MetricBar } from "@/components/ui/ScoreVisuals";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/components/providers/AuthProvider";
import { UpgradeToast } from "@/components/dashboard/UpgradeToast";
import Link from "next/link";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import {
  Calculator, Zap, TrendingUp, TrendingDown, Sparkles, ArrowRight, Clock,
  Brain, DollarSign, Heart, Battery, Flame, Target, CheckCircle2,
} from "lucide-react";
import type { Assessment, TrendData } from "@/types";
import { getScoreColor, getScoreLabel } from "@/types";
import { formatRelativeTime } from "@/lib/utils";
import { DailyReflection } from "@/components/ui/DailyReflection";
import { getDailyReflection } from "@/lib/stoic";
import { MementoMori } from "@/components/ui/MementoMori";
import { VirtueCompass } from "@/components/ui/VirtueCompass";
import { CrossScoreSummary } from "@/components/ui/CrossScoreSummary";
import { DailyOneThingCard } from "@/components/ui/DailyOneThingCard";
import { ScoreTrendNarrative } from "@/components/ui/ScoreTrendNarrative";
import { AchievementGallery } from "@/components/ui/AchievementGallery";
import { ProfileCompleteMeter } from "@/components/ui/ProfileCompleteMeter";
import { OutcomeReminderBanner } from "@/components/ui/OutcomeReminderBanner";
import { DailyPulseWidget } from "@/components/ui/DailyPulseWidget";
import { WeeklyXPWidget } from "@/components/ui/WeeklyXPWidget";
import { WeeklyChallengesCard } from "@/components/ui/WeeklyChallengesCard";
import { DailyInsightCard } from "@/components/ui/DailyInsightCard";
import { StreakAtRiskBanner } from "@/components/ui/StreakAtRiskBanner";
import { MonthComparisonCard } from "@/components/ui/MonthComparisonCard";
import type { ProfileFlags } from "@/components/ui/ProfileCompleteMeter";
import toast from "react-hot-toast";

type DashboardData = {
  latestAssessment: Assessment | null;
  recentCalculators: Array<{ id: string; type: string; score: number; createdAt: string }>;
  trendHistory: TrendData[];
  recentSimulations: Array<{ id: string; title: string; scenarioType: string; createdAt: string }>;
  reflectionCount: number;
};

type GoalWithProgress = {
  id: string;
  calculatorType: string;
  targetScore: number;
  startScore: number | null;
  currentScore: number | null;
  reachedAt: string | null;
};

type AchievementRecord = {
  id: string;
  type: string;
  unlockedAt: string;
};

const CALC_TYPE_SHORT: Record<string, string> = {
  FINANCIAL_PEACE: "Financial Peace",
  BURNOUT_RISK: "Burnout Risk",
  RELATIONSHIP_SUSTAINABILITY: "Relationship Health",
  DECISION_REGRET: "Decision Quality",
  TIME_VALUE: "Time Value",
};

const METRIC_LABELS: Record<string, string> = {
  peaceScore: "Peace Score",
  burnoutRisk: "Burnout Risk",
  financialStab: "Financial Stability",
  emotionalRec: "Emotional Recovery",
  timeFreedom: "Time Freedom",
  cognitiveLoad: "Cognitive Clarity",
  decisionStab: "Decision Stability",
  futureSustain: "Future Sustainability",
};

const CALC_TYPE_LABELS: Record<string, string> = {
  FINANCIAL_PEACE: "Financial Peace",
  BURNOUT_RISK: "Burnout Risk",
  RELATIONSHIP_SUSTAINABILITY: "Relationship Health",
  DECISION_REGRET: "Decision Quality",
  TIME_VALUE: "Time Value",
};

export default function DashboardPage() {
  const { user } = useAuth();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [aiReflection, setAiReflection] = useState<string | null>(null);
  const [loadingReflection, setLoadingReflection] = useState(false);
  const [streak, setStreak] = useState(0);
  const [hasCheckinThisWeek, setHasCheckinThisWeek] = useState(false);
  const [goals, setGoals] = useState<GoalWithProgress[]>([]);
  const [achievements, setAchievements] = useState<AchievementRecord[]>([]);
  const [virtueRating, setVirtueRating] = useState<{ wisdom: number; courage: number; justice: number; temperance: number } | null>(null);
  const [intentionToday, setIntentionToday] = useState<{ virtue: string; completed: boolean } | null>(null);
  const [pulseToday, setPulseToday] = useState(false);
  const [pulseDaysThisWeek, setPulseDaysThisWeek] = useState(0);
  const [hasCalcThisWeek, setHasCalcThisWeek] = useState(false);
  const [hasJournalThisWeek, setHasJournalThisWeek] = useState(false);
  const [hasIntentionThisWeek, setHasIntentionThisWeek] = useState(false);
  const dailyReflection = getDailyReflection();

  useEffect(() => {
    Promise.all([
      fetch("/api/dashboard").then((r) => r.json()),
      fetch("/api/checkin").then((r) => r.json()),
      fetch("/api/goals").then((r) => r.json()),
      fetch("/api/achievements").then((r) => r.json()),
      fetch("/api/virtues").then((r) => r.json()),
      fetch("/api/intention").then((r) => r.json()),
      fetch("/api/pulse").then((r) => r.json()),
      fetch("/api/journal?limit=7").then((r) => r.json()),
    ]).then(([dash, checkin, goalsRes, achRes, virtues, intention, pulse, journal]) => {
      if (dash.success) setData(dash.data);
      if (checkin.success) {
        setStreak(checkin.streak);
        setHasCheckinThisWeek(!!checkin.thisWeek);
      }
      if (goalsRes.success) setGoals(goalsRes.goals);
      if (achRes.success) setAchievements(achRes.achievements);
      if (virtues.success && virtues.thisWeek) setVirtueRating(virtues.thisWeek);
      if (intention.success) {
        if (intention.today) setIntentionToday(intention.today);
        // Check if any intention was set this week
        const monday = new Date();
        monday.setDate(monday.getDate() - ((monday.getDay() + 6) % 7));
        monday.setHours(0, 0, 0, 0);
        const thisWeekIntentions = (intention.recent ?? []).filter(
          (i: { createdAt: string }) => new Date(i.createdAt) >= monday
        );
        setHasIntentionThisWeek(thisWeekIntentions.length > 0);
      }
      if (pulse.success) {
        setPulseToday(!!pulse.today);
        // Count pulse days this week
        const monday = new Date();
        monday.setDate(monday.getDate() - ((monday.getDay() + 6) % 7));
        monday.setHours(0, 0, 0, 0);
        const days = (pulse.history ?? []).filter(
          (p: { date: string }) => new Date(p.date) >= monday
        ).length;
        setPulseDaysThisWeek(days);
      }
      if (journal.success) {
        const monday = new Date();
        monday.setDate(monday.getDate() - ((monday.getDay() + 6) % 7));
        monday.setHours(0, 0, 0, 0);
        const thisWeekJournals = (journal.entries ?? []).filter(
          (j: { createdAt: string }) => new Date(j.createdAt) >= monday
        );
        setHasJournalThisWeek(thisWeekJournals.length > 0);
      }
    }).finally(() => setLoading(false));

    // Separately check if any calculator was run this week
    const monday = new Date();
    monday.setDate(monday.getDate() - ((monday.getDay() + 6) % 7));
    monday.setHours(0, 0, 0, 0);
    fetch("/api/calculators?limit=5").then((r) => r.json()).then((json) => {
      if (json.success) {
        const thisWeek = (json.results ?? []).some(
          (c: { createdAt: string }) => new Date(c.createdAt) >= monday
        );
        setHasCalcThisWeek(thisWeek);
      }
    });
  }, []);

  const requestReflection = async () => {
    if (!data?.latestAssessment) return;
    setLoadingReflection(true);
    try {
      const res = await fetch("/api/ai/reflect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          scores: {
            "Peace Score": data.latestAssessment.peaceScore,
            "Burnout Risk": data.latestAssessment.burnoutRisk,
            "Financial Stability": data.latestAssessment.financialStab,
            "Emotional Recovery": data.latestAssessment.emotionalRec,
            "Future Sustainability": data.latestAssessment.futureSustain,
          },
        }),
      });
      const json = await res.json();
      if (json.success) {
        setAiReflection(json.reflection);
      } else if (json.upgradeRequired) {
        toast.error("Upgrade to Premium for unlimited AI reflections.");
      } else {
        toast.error("Reflection unavailable. Please try again.");
      }
    } catch {
      toast.error("Reflection failed. Please try again.");
    }
    setLoadingReflection(false);
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="space-y-8 animate-pulse">
          {/* Header skeleton */}
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <div className="h-7 bg-stone-100 rounded-xl w-48" />
              <div className="h-4 bg-stone-100 rounded-lg w-72" />
            </div>
            <div className="h-9 bg-stone-100 rounded-2xl w-32" />
          </div>
          {/* Reflection card skeleton */}
          <div className="h-20 bg-stone-100 rounded-3xl" />
          {/* Score grid skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="h-64 bg-stone-100 rounded-3xl" />
            <div className="md:col-span-2 h-64 bg-stone-100 rounded-3xl" />
          </div>
          {/* Actions skeleton */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 bg-stone-100 rounded-3xl" />
            ))}
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const assessment = data?.latestAssessment;

  // Compute stalest calculator age in days (among most-recent-per-type)
  const latestPerType: Record<string, number> = {};
  for (const c of data?.recentCalculators ?? []) {
    const t = new Date(c.createdAt).getTime();
    if (!latestPerType[c.type] || t > latestPerType[c.type]) {
      latestPerType[c.type] = t;
    }
  }
  const stalestCalcDays =
    Object.values(latestPerType).length > 0
      ? Math.max(
          ...Object.values(latestPerType).map((t) =>
            Math.floor((Date.now() - t) / 86400000)
          )
        )
      : null;

  // Profile completeness flags
  const profileFlags: ProfileFlags = {
    hasOnboarding: !!user?.onboardingDone,
    hasCalculator: (data?.recentCalculators?.length ?? 0) > 0,
    hasAllCalculators: new Set(data?.recentCalculators?.map((c) => c.type)).size >= 5,
    hasCheckin: streak > 0,
    hasGoal: goals.length > 0,
    hasJournal: false, // we don't fetch this count here; treat as false by default
    hasReflection: (data?.reflectionCount ?? 0) > 0,
    hasSimulation: (data?.recentSimulations?.length ?? 0) > 0,
  };

  return (
    <DashboardLayout>
      <Suspense fallback={null}>
        <UpgradeToast />
      </Suspense>
      <div className="space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-start justify-between"
        >
          <div>
            <h1 className="font-serif text-2xl font-bold text-matte-black">
              Good {new Date().getHours() < 12 ? "morning" : new Date().getHours() < 17 ? "afternoon" : "evening"}, {user?.name?.split(" ")[0] || ""}
            </h1>
            <p className="text-slate-calm text-sm mt-1">
              Your current balance — a rational mirror of where you stand today.
            </p>
          </div>
          <Link href="/calculators">
            <Button variant="primary" size="sm" icon={<Calculator className="w-4 h-4" />}>
              Run Calculator
            </Button>
          </Link>
        </motion.div>

        {/* ── First-run empty state — shown when no assessment exists yet ── */}
        {!assessment && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-gradient-to-br from-amber-50 to-stone-50 border border-amber-100 rounded-3xl p-7"
          >
            <div className="flex items-start gap-4 mb-6">
              <div className="w-12 h-12 bg-soft-gold/10 rounded-2xl flex items-center justify-center flex-shrink-0">
                <Sparkles className="w-6 h-6 text-soft-gold" />
              </div>
              <div>
                <h2 className="font-serif text-lg font-bold text-matte-black">Welcome — let&apos;s build your profile.</h2>
                <p className="text-sm text-slate-calm mt-1">
                  Complete these three steps to unlock your Peace Score and begin tracking your life sustainability.
                </p>
              </div>
            </div>
            <div className="grid sm:grid-cols-3 gap-3">
              {[
                {
                  step: "01", title: "Run the assessment", desc: "10 questions. 3 minutes. Your full Peace Score.", href: "/onboarding",
                  icon: <Brain className="w-5 h-5 text-soft-gold" />, cta: "Start now →",
                },
                {
                  step: "02", title: "Try a calculator", desc: "Deep-dive into burnout, finances, time, or relationships.", href: "/calculators",
                  icon: <Calculator className="w-5 h-5 text-blue-500" />, cta: "Browse calculators →",
                },
                {
                  step: "03", title: "Set a morning intention", desc: "Pick a Stoic virtue to guide your day.", href: "/intention",
                  icon: <Target className="w-5 h-5 text-emerald-500" />, cta: "Set intention →",
                },
              ].map((item) => (
                <Link key={item.step} href={item.href}>
                  <div className="bg-white rounded-2xl p-5 border border-stone-100 hover:border-soft-gold/40 hover:shadow-sm transition-all cursor-pointer h-full">
                    <div className="flex items-center justify-between mb-3">
                      <div className="w-9 h-9 bg-stone-50 rounded-xl flex items-center justify-center">
                        {item.icon}
                      </div>
                      <span className="text-xs font-bold text-stone-200 tracking-[0.15em]">{item.step}</span>
                    </div>
                    <p className="text-sm font-semibold text-matte-black mb-1">{item.title}</p>
                    <p className="text-xs text-slate-calm mb-3 leading-relaxed">{item.desc}</p>
                    <span className="text-xs font-semibold text-soft-gold">{item.cta}</span>
                  </div>
                </Link>
              ))}
            </div>
          </motion.div>
        )}

        {/* ── Metrics Snapshot Bar ── quick-glance score/streak/trend */}
        {assessment && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="flex flex-wrap sm:flex-nowrap items-stretch bg-white border border-stone-100 rounded-2xl shadow-sm overflow-hidden divide-y sm:divide-y-0 sm:divide-x divide-stone-100"
          >
            {/* Peace Score mini-ring */}
            <div className="flex items-center gap-3 px-5 py-4 flex-1 min-w-[140px] bg-gradient-to-r from-amber-50/60 to-transparent">
              <div className="relative w-11 h-11 flex-shrink-0">
                <svg className="w-11 h-11 -rotate-90" viewBox="0 0 40 40">
                  <circle cx="20" cy="20" r="16" fill="none" stroke="#F5F0EB" strokeWidth="4" />
                  <circle
                    cx="20" cy="20" r="16" fill="none"
                    stroke={assessment.overallScore >= 70 ? "#16a34a" : assessment.overallScore >= 45 ? "#C9A84C" : "#ef4444"}
                    strokeWidth="4" strokeLinecap="round"
                    strokeDasharray={(2 * Math.PI * 16).toFixed(2)}
                    strokeDashoffset={(2 * Math.PI * 16 * (1 - assessment.overallScore / 100)).toFixed(2)}
                  />
                </svg>
                <span className="absolute inset-0 flex items-center justify-center text-[9px] font-bold text-matte-black">
                  {assessment.overallScore}
                </span>
              </div>
              <div>
                <p className="text-[10px] text-stone-400 leading-none mb-1">Peace Score</p>
                <p className="text-sm font-bold text-matte-black leading-none">{getScoreLabel(assessment.overallScore)}</p>
                <p className="text-[10px] text-stone-400 mt-0.5">Life sustainability index</p>
              </div>
            </div>

            {/* Streak */}
            <div className="flex items-center gap-3 px-5 py-4 flex-1 min-w-[120px]">
              <Flame className={`w-5 h-5 flex-shrink-0 ${streak > 0 ? "text-orange-500" : "text-stone-200"}`} />
              <div>
                <p className="text-[10px] text-stone-400 leading-none mb-1">Weekly Streak</p>
                <p className="text-sm font-bold text-matte-black leading-none">
                  {streak > 0 ? `${streak} week${streak === 1 ? "" : "s"}` : "None yet"}
                </p>
                <p className="text-[10px] text-stone-400 mt-0.5">{streak > 0 ? "Keep it going" : "Check in weekly"}</p>
              </div>
            </div>

            {/* Monthly trend — only shown when 2+ data points */}
            {data?.trendHistory && data.trendHistory.length > 1 && (() => {
              const t = data.trendHistory;
              const diff = (t[t.length - 1]?.peaceScore ?? 0) - (t[t.length - 2]?.peaceScore ?? 0);
              return (
                <div className="flex items-center gap-3 px-5 py-4 flex-1 min-w-[130px]">
                  {diff >= 0
                    ? <TrendingUp className="w-5 h-5 flex-shrink-0 text-emerald-500" />
                    : <TrendingDown className="w-5 h-5 flex-shrink-0 text-rose-400" />}
                  <div>
                    <p className="text-[10px] text-stone-400 leading-none mb-1">vs last month</p>
                    <p className={`text-sm font-bold leading-none ${diff >= 0 ? "text-emerald-600" : "text-rose-500"}`}>
                      {diff >= 0 ? "+" : ""}{diff} pts
                    </p>
                    <p className="text-[10px] text-stone-400 mt-0.5">{diff >= 0 ? "Improving" : "Needs attention"}</p>
                  </div>
                </div>
              );
            })()}

            {/* Dynamic CTA */}
            <Link
              href={hasCheckinThisWeek ? "/calculators" : "/checkin"}
              className="flex items-center gap-2 px-5 py-4 text-sm font-semibold text-soft-gold hover:bg-amber-50/60 transition-colors whitespace-nowrap ml-auto"
            >
              {hasCheckinThisWeek
                ? <><Calculator className="w-4 h-4" /><span>Run Calculator</span><ArrowRight className="w-4 h-4" /></>
                : <><Flame className="w-4 h-4" /><span>Weekly Check-In</span><ArrowRight className="w-4 h-4" /></>
              }
            </Link>
          </motion.div>
        )}

        {/* Streak at risk — shows Wed–Sat when streak > 0 and no checkin yet */}
        <StreakAtRiskBanner streak={streak} hasCheckinThisWeek={hasCheckinThisWeek} />

        {/* One Thing Today */}
        <DailyOneThingCard
          streak={streak}
          hasCheckinThisWeek={hasCheckinThisWeek}
          stalestCalcDays={stalestCalcDays}
          staleJournalCount={0}
          hasGoals={goals.length > 0}
          pulseToday={pulseToday}
        />

        {/* Outcome reminder — shows only when stale journal entries exist */}
        <OutcomeReminderBanner />

        {/* Today at a Glance */}
        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}>
          {/* Daily Ritual heading with animated progress ring */}
          {(() => {
            const done = [intentionToday !== null, pulseToday, hasCheckinThisWeek].filter(Boolean).length;
            const total = 3;
            const radius = 14;
            const circ = 2 * Math.PI * radius;
            const ringColor = done === total ? "#C9A84C" : done > 0 ? "#F59E0B" : "#E5E7EB";
            return (
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h2 className="text-sm font-semibold text-matte-black">Today&apos;s Ritual</h2>
                  <p className="text-xs text-stone-400">
                    {done === total
                      ? "All key habits held — well done."
                      : `${done} of ${total} key habits complete today`}
                  </p>
                </div>
                <div className="relative w-10 h-10 flex-shrink-0">
                  <svg className="w-10 h-10 -rotate-90" viewBox="0 0 36 36">
                    <circle cx="18" cy="18" r={radius} fill="none" stroke="#F5F0EB" strokeWidth="3.5" />
                    <motion.circle
                      cx="18" cy="18" r={radius} fill="none"
                      stroke={ringColor}
                      strokeWidth="3.5" strokeLinecap="round"
                      strokeDasharray={circ.toFixed(2)}
                      initial={{ strokeDashoffset: circ }}
                      animate={{ strokeDashoffset: circ * (1 - done / total) }}
                      transition={{ duration: 1, ease: "easeOut", delay: 0.4 }}
                    />
                  </svg>
                  <span className="absolute inset-0 flex items-center justify-center text-[9px] font-bold text-matte-black">
                    {done}/{total}
                  </span>
                </div>
              </div>
            );
          })()}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {/* Morning Intention */}
            <Link href="/intention">
              <div className={`relative group flex flex-col gap-1.5 p-4 rounded-2xl border cursor-pointer transition-all hover:shadow-sm ${
                intentionToday
                  ? "bg-green-50 border-green-200"
                  : "bg-stone-50 border-stone-200 hover:border-amber-200 hover:bg-amber-50/50"
              }`}>
                {!intentionToday && (
                  <span className="absolute top-2.5 right-2.5 text-[9px] font-bold text-amber-600 bg-amber-50 border border-amber-100 rounded-full px-1.5 py-0.5">+10 XP</span>
                )}
                <span className="text-xl">{intentionToday ? "✅" : "🏛️"}</span>
                <p className="text-xs font-semibold text-matte-black leading-tight">Morning Intention</p>
                <p className="text-[11px] text-slate-calm">
                  {intentionToday ? "Set for today" : "Tap to begin"}
                </p>
              </div>
            </Link>

            {/* Evening Review */}
            <Link href="/intention">
              <div className={`relative group flex flex-col gap-1.5 p-4 rounded-2xl border cursor-pointer transition-all hover:shadow-sm ${
                intentionToday?.completed
                  ? "bg-green-50 border-green-200"
                  : intentionToday
                  ? "bg-amber-50 border-amber-200"
                  : "bg-stone-50 border-stone-100 opacity-50 pointer-events-none"
              }`}>
                {intentionToday && !intentionToday.completed && (
                  <span className="absolute top-2.5 right-2.5 text-[9px] font-bold text-amber-600 bg-amber-50 border border-amber-100 rounded-full px-1.5 py-0.5">+10 XP</span>
                )}
                <span className="text-xl">{intentionToday?.completed ? "✅" : "🌙"}</span>
                <p className="text-xs font-semibold text-matte-black leading-tight">Evening Review</p>
                <p className="text-[11px] text-slate-calm">
                  {intentionToday?.completed
                    ? "Reflected"
                    : intentionToday
                    ? `Virtue: ${intentionToday.virtue}`
                    : "Set intention first"}
                </p>
              </div>
            </Link>

            {/* Weekly Check-in */}
            <Link href="/checkin">
              <div className={`relative group flex flex-col gap-1.5 p-4 rounded-2xl border cursor-pointer transition-all hover:shadow-sm ${
                hasCheckinThisWeek
                  ? "bg-orange-50 border-orange-200"
                  : "bg-stone-50 border-stone-200 hover:border-orange-200 hover:bg-orange-50/50"
              }`}>
                {!hasCheckinThisWeek && (
                  <span className="absolute top-2.5 right-2.5 text-[9px] font-bold text-orange-600 bg-orange-50 border border-orange-100 rounded-full px-1.5 py-0.5">+50 XP</span>
                )}
                <Flame className={`w-5 h-5 ${hasCheckinThisWeek ? "text-orange-500" : "text-stone-300"}`} />
                <p className="text-xs font-semibold text-matte-black leading-tight">
                  {streak > 0 ? `${streak}-week streak` : "No streak yet"}
                </p>
                <p className="text-[11px] text-slate-calm">Weekly check-in</p>
              </div>
            </Link>

            {/* Calculators */}
            <Link href="/calculators">
              <div className="relative group flex flex-col gap-1.5 p-4 rounded-2xl border border-stone-200 bg-stone-50 cursor-pointer hover:border-brand-200 hover:bg-brand-50/30 transition-all hover:shadow-sm">
                {!data?.recentCalculators?.[0] && (
                  <span className="absolute top-2.5 right-2.5 text-[9px] font-bold text-blue-600 bg-blue-50 border border-blue-100 rounded-full px-1.5 py-0.5">+25 XP</span>
                )}
                <Calculator className="w-5 h-5 text-slate-calm group-hover:text-soft-gold transition-colors" />
                <p className="text-xs font-semibold text-matte-black leading-tight">Calculators</p>
                <p className="text-[11px] text-slate-calm">
                  {data?.recentCalculators?.[0]
                    ? `Last: ${formatRelativeTime(data.recentCalculators[0].createdAt)}`
                    : "Run one today"}
                </p>
              </div>
            </Link>

            {/* Daily Pulse */}
            <DailyPulseWidget />
          </div>
        </motion.div>

        {/* Daily Reflection */}
        <DailyReflection reflection={dailyReflection} variant="card" />

        {/* Personalized AI-style insight */}
        {assessment && data && (
          <DailyInsightCard
            peaceScore={assessment.peaceScore}
            burnoutRisk={assessment.burnoutRisk}
            streak={streak}
            hasCheckinThisWeek={hasCheckinThisWeek}
            pulseDaysThisWeek={pulseDaysThisWeek}
            goals={goals}
            trendHistory={data.trendHistory}
          />
        )}

        {/* Weekly XP + Challenges — side by side */}
        <div className="grid md:grid-cols-2 gap-4">
          <WeeklyXPWidget />
          <WeeklyChallengesCard
            hasCheckinThisWeek={hasCheckinThisWeek}
            pulseDaysThisWeek={pulseDaysThisWeek}
            hasCalcThisWeek={hasCalcThisWeek}
            hasJournalThisWeek={hasJournalThisWeek}
            hasIntentionThisWeek={hasIntentionThisWeek || !!intentionToday}
            streak={streak}
          />
        </div>

        {/* No assessment yet */}
        {!assessment && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-6"
          >
            {/* Welcome hero */}
            <Card padding="lg" className="bg-gradient-to-br from-amber-50/40 to-stone-50 border border-amber-100 text-center">
              <div className="text-4xl mb-4">🏛️</div>
              <h2 className="font-serif text-2xl font-bold text-matte-black mb-2">
                Welcome to your clarity sanctuary.
              </h2>
              <p className="text-slate-calm text-sm mb-6 max-w-md mx-auto leading-relaxed">
                Constavita is a rational mirror for your life — grounded in Stoic philosophy and behavioural science.
                Begin by completing your baseline, then explore what matters most to you right now.
              </p>
              <Link href="/onboarding">
                <Button variant="gold" size="lg" icon={<ArrowRight className="w-4 h-4" />} iconPosition="right">
                  Begin My Baseline Assessment
                </Button>
              </Link>
            </Card>

            {/* Quick-start checklist — dynamic */}
            <Card padding="lg">
              <CardHeader>
                <CardTitle>Your first four steps</CardTitle>
                <CardDescription>Each one brings you closer to your Peace Intelligence profile</CardDescription>
              </CardHeader>
              <div className="space-y-2">
                {[
                  {
                    step: 1,
                    label: "Complete your baseline",
                    desc: "A calm 3-minute self-reflection to generate your starting profile.",
                    href: "/onboarding",
                    done: !!user?.onboardingDone,
                  },
                  {
                    step: 2,
                    label: "Explore a calculator",
                    desc: "Choose the area that feels most relevant right now: financial, energy, time, or relationships.",
                    href: "/calculators",
                    done: (data?.recentCalculators?.length ?? 0) > 0,
                  },
                  {
                    step: 3,
                    label: "Request a Logos reflection",
                    desc: "Receive a calm, Stoic-inspired perspective on your current patterns from your AI companion.",
                    href: "/dashboard",
                    done: (data?.reflectionCount ?? 0) > 0,
                  },
                  {
                    step: 4,
                    label: "Simulate a life change",
                    desc: "Explore how a major change might affect your life balance over the next 12 months — safely.",
                    href: "/simulate",
                    done: (data?.recentSimulations?.length ?? 0) > 0,
                  },
                ].map((item) => (
                  <Link key={item.step} href={item.done && item.step < 4 ? "#" : item.href}>
                    <div className={`flex items-start gap-4 p-3 rounded-xl transition-colors cursor-pointer group ${item.done ? "opacity-60" : "hover:bg-stone-50"}`}>
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 transition-colors ${
                        item.done
                          ? "bg-green-100 border-2 border-green-400"
                          : "border-2 border-stone-200 group-hover:border-soft-gold"
                      }`}>
                        {item.done
                          ? <span className="text-green-600 text-xs font-bold">✓</span>
                          : <span className="text-xs font-bold text-slate-calm group-hover:text-soft-gold">{item.step}</span>
                        }
                      </div>
                      <div className="flex-1">
                        <p className={`text-sm font-semibold ${item.done ? "line-through text-slate-calm" : "text-matte-black"}`}>{item.label}</p>
                        <p className="text-xs text-slate-calm leading-relaxed">{item.desc}</p>
                      </div>
                      {!item.done && <ArrowRight className="w-4 h-4 text-stone-300 group-hover:text-soft-gold flex-shrink-0 mt-1 transition-colors" />}
                    </div>
                  </Link>
                ))}
              </div>
              {/* Progress bar */}
              {(() => {
                const done = [
                  !!user?.onboardingDone,
                  (data?.recentCalculators?.length ?? 0) > 0,
                  (data?.reflectionCount ?? 0) > 0,
                  (data?.recentSimulations?.length ?? 0) > 0,
                ].filter(Boolean).length;
                return done > 0 ? (
                  <div className="mt-4 pt-4 border-t border-stone-100">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs text-slate-calm">{done} of 4 steps complete</span>
                      {done === 4 && <span className="text-xs font-semibold text-green-600">Profile complete 🎉</span>}
                    </div>
                    <div className="h-1.5 bg-stone-100 rounded-full overflow-hidden">
                      <motion.div
                        className="h-full rounded-full bg-gradient-to-r from-soft-gold to-green-400"
                        initial={{ width: 0 }}
                        animate={{ width: `${(done / 4) * 100}%` }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                      />
                    </div>
                  </div>
                ) : null;
              })()}
            </Card>

            {/* Calculator preview cards */}
            <div>
              <h2 className="font-semibold text-matte-black mb-4">Explore the calculators</h2>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                {[
                  { href: "/calculators/financial-peace", icon: DollarSign, label: "Financial Peace", color: "text-green-600 bg-green-50" },
                  { href: "/calculators/burnout-risk", icon: Battery, label: "Burnout Risk", color: "text-orange-600 bg-orange-50" },
                  { href: "/calculators/relationship-sustainability", icon: Heart, label: "Relationships", color: "text-rose-600 bg-rose-50" },
                  { href: "/calculators/decision-regret", icon: Brain, label: "Decision Quality", color: "text-purple-600 bg-purple-50" },
                  { href: "/calculators/time-value", icon: Clock, label: "Time Value", color: "text-blue-600 bg-blue-50" },
                ].map((c) => (
                  <Link key={c.href} href={c.href}>
                    <Card hover padding="md" className="text-center cursor-pointer h-full">
                      <div className={`w-10 h-10 rounded-2xl flex items-center justify-center mx-auto mb-2 ${c.color}`}>
                        <c.icon className="w-5 h-5" />
                      </div>
                      <p className="text-xs font-medium text-matte-black">{c.label}</p>
                    </Card>
                  </Link>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* Main metrics grid */}
        {assessment && (
          <>
            {/* Score overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Peace Score — Hero */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 }}
              >
                <Card padding="lg" variant="elevated" className="flex flex-col items-center text-center h-full bg-gradient-to-br from-amber-50/60 via-white to-brand-50/30 border-brand-100">
                  <p className="text-xs font-semibold text-soft-gold uppercase tracking-[0.18em] mb-1">
                    Overall Peace Score
                  </p>
                  <p className="text-xs text-slate-calm mb-4">
                    Life sustainability index
                  </p>
                  <ScoreRing score={assessment.overallScore} size="xl" animate />
                  <div className="w-full mt-6 pt-4 border-t border-amber-100">
                    <div className="flex justify-between items-center text-xs text-slate-calm">
                      <span>Foundation</span>
                      <span className="font-medium text-soft-gold">{Math.round(assessment.overallScore)} / 100</span>
                      <span>Flourishing</span>
                    </div>
                    <div className="h-1.5 bg-stone-100 rounded-full mt-2 overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-1000"
                        style={{
                          width: `${assessment.overallScore}%`,
                          background: `linear-gradient(90deg, #D97706, #C9A84C, #84CC16)`,
                        }}
                      />
                    </div>
                  </div>
                </Card>
              </motion.div>

              {/* 8 metric bars */}
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="md:col-span-2"
              >
                <Card padding="lg">
                  <CardHeader>
                    <CardTitle>Life Balance Dimensions</CardTitle>
                    <CardDescription>Sustainability indicators across your key life areas — areas for attention are opportunities, not verdicts</CardDescription>
                  </CardHeader>
                  <div className="space-y-4">
                    {[
                      { key: "peaceScore", value: assessment.peaceScore },
                      { key: "burnoutRisk", value: 100 - assessment.burnoutRisk, label: "Burnout Resiliency" },
                      { key: "financialStab", value: assessment.financialStab },
                      { key: "emotionalRec", value: assessment.emotionalRec },
                      { key: "timeFreedom", value: assessment.timeFreedom },
                      { key: "decisionStab", value: assessment.decisionStab },
                      { key: "futureSustain", value: assessment.futureSustain },
                    ].map(({ key, value, label }) => (
                      <MetricBar
                        key={key}
                        label={label || METRIC_LABELS[key]}
                        score={value}
                        animate
                      />
                    ))}
                  </div>
                </Card>
              </motion.div>
            </div>

            {/* Trend chart */}
            {data?.trendHistory && data.trendHistory.length > 1 && (
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                {/* Month vs month comparison */}
                <MonthComparisonCard trendHistory={data.trendHistory} />

                <Card padding="lg" className="mt-4">
                  <CardHeader>
                    <CardTitle>Your Progress Arc</CardTitle>
                    <CardDescription>Peace Score evolution over time — patterns matter more than any single moment</CardDescription>
                  </CardHeader>
                  <ScoreTrendNarrative history={data.trendHistory} />
                  <div className="h-48 mt-2">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={data.trendHistory}>
                        <defs>
                          <linearGradient id="peaceGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#C9A84C" stopOpacity={0.15} />
                            <stop offset="95%" stopColor="#C9A84C" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#F0EFE8" />
                        <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#94A3B8" }} />
                        <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: "#94A3B8" }} />
                        <Tooltip
                          contentStyle={{
                            background: "#1C1C1E",
                            border: "none",
                            borderRadius: "12px",
                            color: "#FAF9F6",
                            fontSize: "12px",
                          }}
                        />
                        <Area
                          type="monotone"
                          dataKey="peaceScore"
                          name="Peace Score"
                          stroke="#C9A84C"
                          strokeWidth={2}
                          fill="url(#peaceGrad)"
                          dot={{ fill: "#C9A84C", strokeWidth: 0, r: 3 }}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </Card>
              </motion.div>
            )}

            {/* AI Reflection */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Card padding="lg" className="border border-brand-100 bg-gradient-to-br from-white to-brand-50">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Sparkles className="w-4 h-4 text-soft-gold" />
                      <span className="text-xs font-semibold text-soft-gold uppercase tracking-widest">
                        Logos — AI Reflection
                      </span>
                    </div>
                    <p className="text-xs text-slate-calm">
                      Stoic-inspired analysis of your current patterns
                    </p>
                  </div>
                  {!aiReflection && (
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={requestReflection}
                      loading={loadingReflection}
                      icon={<Sparkles className="w-3.5 h-3.5" />}
                    >
                      Get Reflection
                    </Button>
                  )}
                </div>

                {aiReflection ? (
                  <div>
                    <p className="text-sm text-slate-calm leading-relaxed italic font-serif">
                      {aiReflection}
                    </p>
                    <p className="text-xs text-stone-400 mt-4 italic">
                      This reflection is provided for educational self-awareness purposes and does not constitute advice of any kind.
                    </p>
                  </div>
                ) : (
                  <div className="text-center py-6 text-slate-calm">
                    <div className="text-3xl mb-2">🏛️</div>
                    <p className="text-sm">
                      Request a reflection to receive Stoic-inspired insight on your current patterns.
                    </p>
                    <p className="text-xs text-stone-400 mt-1">
                      Premium feature — <Link href="/pricing" className="text-soft-gold hover:underline">upgrade to unlock</Link>
                    </p>
                  </div>
                )}
              </Card>
            </motion.div>

            {/* Quick actions */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <h2 className="font-semibold text-matte-black mb-4">Quick Actions</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { href: "/calculators/financial-peace", icon: DollarSign, label: "Financial Peace", desc: "Sustainability index", color: "text-green-700 bg-green-50" },
                  { href: "/calculators/burnout-risk", icon: Battery, label: "Burnout Risk", desc: "Recovery capacity", color: "text-orange-700 bg-orange-50" },
                  { href: "/simulate", icon: Zap, label: "Simulate Future", desc: "Explore scenarios", color: "text-blue-700 bg-blue-50" },
                  { href: "/analytics", icon: TrendingUp, label: "View Trends", desc: "Your evolution arc", color: "text-purple-700 bg-purple-50" },
                ].map((action) => (
                  <Link key={action.href} href={action.href}>
                    <Card hover padding="md" className="text-center cursor-pointer group">
                      <div className={`w-11 h-11 rounded-2xl flex items-center justify-center mx-auto mb-3 transition-transform duration-200 group-hover:scale-110 ${action.color}`}>
                        <action.icon className="w-5 h-5" />
                      </div>
                      <p className="text-sm font-semibold text-matte-black">{action.label}</p>
                      <p className="text-xs text-slate-calm mt-0.5">{action.desc}</p>
                    </Card>
                  </Link>
                ))}
              </div>
            </motion.div>

            {/* Recent activity */}
            {data?.recentCalculators && data.recentCalculators.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
              >
                <Card padding="lg">
                  <CardHeader>
                    <CardTitle>Recent Clarity Checks</CardTitle>
                    <CardDescription>Your latest reflections across life dimensions</CardDescription>
                  </CardHeader>
                  <div className="space-y-2">
                    {data.recentCalculators.map((calc) => (
                      <div key={calc.id} className="flex items-center justify-between py-3 px-3 rounded-2xl hover:bg-stone-50 transition-colors">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-2 h-2 rounded-full flex-shrink-0"
                            style={{ backgroundColor: getScoreColor(calc.score) }}
                          />
                          <div>
                            <p className="text-sm font-medium" style={{ color: "var(--page-text)" }}>
                              {CALC_TYPE_LABELS[calc.type] || calc.type}
                            </p>
                            <p className="text-xs text-slate-calm">{formatRelativeTime(calc.createdAt)}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span
                            className="text-xs font-semibold px-2.5 py-1 rounded-full"
                            style={{
                              color: getScoreColor(calc.score),
                              backgroundColor: `${getScoreColor(calc.score)}12`,
                            }}
                          >
                            {Math.round(calc.score)} · {getScoreLabel(calc.score)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              </motion.div>
            )}

            {/* Cross-score pattern analysis */}
            {data?.recentCalculators && data.recentCalculators.length >= 2 && (() => {
              const scoreMap: Record<string, number> = {};
              for (const c of data.recentCalculators) {
                if (!scoreMap[c.type]) scoreMap[c.type] = c.score;
              }
              return (
                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.65 }}
                >
                  <CrossScoreSummary scores={scoreMap} />
                </motion.div>
              );
            })()}

            {/* Goals panel */}
            {goals.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.65 }}
              >
                <Card padding="lg">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle>Your Goals</CardTitle>
                        <CardDescription>Score targets across your calculators</CardDescription>
                      </div>
                      <Link href="/calculators" className="text-xs text-soft-gold hover:underline font-medium">
                        Set goals
                      </Link>
                    </div>
                  </CardHeader>
                  <div className="space-y-4">
                    {goals.map((goal) => {
                      const current = goal.currentScore ?? goal.startScore ?? 0;
                      const pct = Math.min(100, Math.round((current / goal.targetScore) * 100));
                      const reached = goal.reachedAt || current >= goal.targetScore;
                      return (
                        <div key={goal.id}>
                          <div className="flex items-center justify-between mb-1.5">
                            <div className="flex items-center gap-2">
                              <Target className="w-3.5 h-3.5 text-soft-gold" />
                              <span className="text-sm font-medium text-matte-black">
                                {CALC_TYPE_SHORT[goal.calculatorType] ?? goal.calculatorType}
                              </span>
                              {reached && (
                                <span className="text-[10px] bg-green-100 text-green-700 font-semibold px-2 py-0.5 rounded-full">
                                  Reached ✓
                                </span>
                              )}
                            </div>
                            <span className="text-xs text-stone-400">
                              {Math.round(current)} → {goal.targetScore}
                            </span>
                          </div>
                          <div className="h-1.5 bg-stone-100 rounded-full overflow-hidden">
                            <motion.div
                              className={`h-full rounded-full ${reached ? "bg-green-400" : "bg-soft-gold"}`}
                              initial={{ width: 0 }}
                              animate={{ width: `${pct}%` }}
                              transition={{ duration: 0.8, ease: "easeOut" }}
                            />
                          </div>
                          <p className="text-right text-[10px] text-stone-400 mt-0.5">{pct}%</p>
                        </div>
                      );
                    })}
                  </div>
                </Card>
              </motion.div>
            )}

            {/* Achievements panel */}
            {achievements.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
              >
                <AchievementGallery achievements={achievements} />
              </motion.div>
            )}

            {/* Profile Completeness */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.72 }}
            >
              <ProfileCompleteMeter flags={profileFlags} />
            </motion.div>

            {/* Memento Mori + Virtue Compass — always shown when assessment exists */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.75 }}
              className="grid md:grid-cols-2 gap-6"
            >
              <MementoMori birthYear={null} />

              <Card padding="lg">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Virtue Compass</CardTitle>
                      <CardDescription>
                        {virtueRating ? "This week's self-assessment" : "Rate your four Stoic virtues this week"}
                      </CardDescription>
                    </div>
                    <Link href="/virtues" className="text-xs text-soft-gold hover:underline font-medium flex items-center gap-1">
                      {virtueRating ? "Update" : "Rate now"} <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>
                </CardHeader>
                {virtueRating ? (
                  <VirtueCompass current={virtueRating} size="sm" />
                ) : (
                  <div className="text-center py-8">
                    <p className="text-sm text-slate-calm mb-1">Wisdom · Courage · Justice · Temperance</p>
                    <p className="text-xs text-stone-400 mb-4">The four Stoic virtues — rate yourself weekly to track your character arc</p>
                    <Link href="/virtues">
                      <Button variant="secondary" size="sm">Open Virtue Compass</Button>
                    </Link>
                  </div>
                )}
              </Card>
            </motion.div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}

"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { DashboardLayout } from "@/components/layout/Sidebar";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { MetricBar } from "@/components/ui/ScoreVisuals";
import { ActivityHeatmap } from "@/components/ui/ActivityHeatmap";
import { PulseHeatmap } from "@/components/ui/PulseHeatmap";
import { VirtueCompass } from "@/components/ui/VirtueCompass";
import {
  Lock, TrendingUp, BarChart3, Calendar, Filter, Flame, Target,
  DollarSign, Brain, Heart, Lightbulb, Clock, Sparkles, Activity,
  Zap, Waves, Focus, Star, Users,
} from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
  BarChart, Bar,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
} from "recharts";
import { useAuth } from "@/components/providers/AuthProvider";
import Link from "next/link";
import { computeCompositeScore } from "@/lib/pulse";

// ─── Types ────────────────────────────────────────────────────────────────────

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

type PulsePoint = {
  date: string;
  composite: number;
  energy: number;
  calm: number;
  clarity: number;
  gratitude: number;
  connection: number;
};

type SynthesisData = {
  momentum: number;
  momentumBreakdown: { calculators: number; pulse: number; consistency: number; virtues: number };
  pulseHistory: PulsePoint[];
  pulseAvgs: { energy: number; calm: number; clarity: number; gratitude: number; connection: number; composite: number } | null;
  latestCalcScores: Record<string, number>;
  latestVirtues: { wisdom: number; courage: number; justice: number; temperance: number } | null;
  virtueHistory: Array<{ weekKey: string; wisdom: number; courage: number; justice: number; temperance: number; avg: number }>;
  dailyStreak: number;
  weeklyStreak: number;
  achievementCount: number;
  intentionStats: { total: number; completed: number; rate: number };
};

type CheckinMoodKey = "financialMood" | "burnoutMood" | "relationshipMood" | "decisionMood" | "timeMood";

// ─── Constants ────────────────────────────────────────────────────────────────

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

const CALC_DIMS = [
  { moodKey: "financialMood" as CheckinMoodKey, calcType: "FINANCIAL_PEACE", calcHref: "/calculators/financial-peace", label: "Financial", Icon: DollarSign, scoreColor: "#C9A84C", moodFill: "#3B82F6" },
  { moodKey: "burnoutMood" as CheckinMoodKey, calcType: "BURNOUT_RISK", calcHref: "/calculators/burnout-risk", label: "Energy", Icon: Brain, scoreColor: "#4F61A8", moodFill: "#F97316" },
  { moodKey: "relationshipMood" as CheckinMoodKey, calcType: "RELATIONSHIP_SUSTAINABILITY", calcHref: "/calculators/relationship-sustainability", label: "Relationship", Icon: Heart, scoreColor: "#22C55E", moodFill: "#F43F5E" },
  { moodKey: "decisionMood" as CheckinMoodKey, calcType: "DECISION_REGRET", calcHref: "/calculators/decision-regret", label: "Decision", Icon: Lightbulb, scoreColor: "#EC4899", moodFill: "#F59E0B" },
  { moodKey: "timeMood" as CheckinMoodKey, calcType: "TIME_VALUE", calcHref: "/calculators/time-value", label: "Time", Icon: Clock, scoreColor: "#F97316", moodFill: "#8B5CF6" },
];

const CALC_LABEL: Record<string, string> = {
  FINANCIAL_PEACE: "Financial Peace",
  BURNOUT_RISK: "Burnout Risk",
  RELATIONSHIP_SUSTAINABILITY: "Relationship Health",
  DECISION_REGRET: "Decision Quality",
  TIME_VALUE: "Time Value",
};

const CHART_COLORS: Record<string, string> = {
  financial: "#C9A84C", burnout: "#4F61A8", relationship: "#22C55E",
  decision: "#EC4899", timeValue: "#F97316", overall: "#1C1917",
};

const PULSE_COLORS = {
  energy: "#F59E0B", calm: "#0EA5E9", clarity: "#8B5CF6",
  gratitude: "#10B981", connection: "#F43F5E", composite: "#C9A84C",
};

const PULSE_DIMS = [
  { key: "energy", label: "Energy", icon: Zap, color: "#F59E0B" },
  { key: "calm", label: "Calm", icon: Waves, color: "#0EA5E9" },
  { key: "clarity", label: "Clarity", icon: Focus, color: "#8B5CF6" },
  { key: "gratitude", label: "Gratitude", icon: Star, color: "#10B981" },
  { key: "connection", label: "Connection", icon: Users, color: "#F43F5E" },
];

type FilterRange = "30d" | "90d" | "6mo" | "1yr" | "all";

const RANGES: { value: FilterRange; label: string }[] = [
  { value: "30d", label: "30 days" }, { value: "90d", label: "90 days" },
  { value: "6mo", label: "6 months" }, { value: "1yr", label: "1 year" },
  { value: "all", label: "All time" },
];

// ─── Momentum Card ────────────────────────────────────────────────────────────

function MomentumCard({ data, loading }: { data: SynthesisData | null; loading: boolean }) {
  if (loading) return <div className="h-44 bg-stone-100 rounded-3xl animate-pulse" />;

  const score = data?.momentum ?? 0;
  const bd = data?.momentumBreakdown;
  const hasAnyData = score > 0;

  const color = score >= 80 ? "#10B981" : score >= 60 ? "#C9A84C" : score >= 40 ? "#F97316" : "#F43F5E";
  const label = score >= 80 ? "Thriving" : score >= 60 ? "Balanced" : score >= 40 ? "Building" : "Rebuilding";

  const breakdown = [
    { label: "Calculators", value: bd?.calculators ?? 0, max: 40, color: "#C9A84C" },
    { label: "Daily Pulse", value: bd?.pulse ?? 0, max: 30, color: "#0EA5E9" },
    { label: "Consistency", value: bd?.consistency ?? 0, max: 20, color: "#10B981" },
    { label: "Virtues", value: bd?.virtues ?? 0, max: 10, color: "#8B5CF6" },
  ];

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
      <div className="relative bg-gradient-to-br from-stone-900 to-stone-800 rounded-3xl p-6 overflow-hidden">
        <div className="absolute -top-16 -right-16 w-64 h-64 bg-soft-gold/8 rounded-full" />
        <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-white/3 rounded-full" />
        <div className="relative flex flex-col sm:flex-row items-start sm:items-center gap-6">
          {/* Score */}
          <div className="flex-shrink-0 text-center">
            <div className="relative w-28 h-28">
              <svg width="112" height="112" viewBox="0 0 112 112" className="-rotate-90">
                <circle cx="56" cy="56" r="44" fill="none" stroke="#374151" strokeWidth="8" />
                {hasAnyData && (
                  <motion.circle
                    cx="56" cy="56" r="44" fill="none"
                    stroke={color} strokeWidth="8" strokeLinecap="round"
                    strokeDasharray={2 * Math.PI * 44}
                    initial={{ strokeDashoffset: 2 * Math.PI * 44 }}
                    animate={{ strokeDashoffset: 2 * Math.PI * 44 * (1 - score / 100) }}
                    transition={{ duration: 1.4, ease: "easeOut" }}
                  />
                )}
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-bold text-white leading-none">{score}</span>
                <span className="text-[10px] text-stone-400 mt-0.5">/ 100</span>
              </div>
            </div>
            <p className="text-xs font-semibold mt-2" style={{ color }}>{label}</p>
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-bold text-amber-400 uppercase tracking-[0.15em] mb-1">
              Life Momentum Score
            </p>
            <p className="text-stone-300 text-sm leading-relaxed mb-4">
              {hasAnyData
                ? "Computed from your calculator scores, daily pulse, consistency streak, and Stoic virtue practice."
                : "Run the calculators, complete your daily pulse, and track your virtues to build your momentum score."}
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {breakdown.map((b) => (
                <div key={b.label} className="bg-white/5 rounded-xl p-2.5">
                  <div className="flex justify-between items-center mb-1.5">
                    <span className="text-[10px] text-stone-400">{b.label}</span>
                    <span className="text-xs font-bold" style={{ color: b.color }}>{b.value}</span>
                  </div>
                  <div className="h-1 bg-stone-700 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full rounded-full"
                      style={{ backgroundColor: b.color }}
                      initial={{ width: 0 }}
                      animate={{ width: `${(b.value / b.max) * 100}%` }}
                      transition={{ duration: 1, ease: "easeOut" }}
                    />
                  </div>
                  <span className="text-[9px] text-stone-600 mt-0.5 block">of {b.max} pts</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Vitality Radar ───────────────────────────────────────────────────────────

function VitalityRadar({ synthesis }: { synthesis: SynthesisData }) {
  const { pulseAvgs, latestCalcScores } = synthesis;

  const radarData = [
    { axis: "Energy", value: pulseAvgs ? Math.round(pulseAvgs.energy * 10) : 0, source: "pulse" },
    { axis: "Calm", value: pulseAvgs ? Math.round(pulseAvgs.calm * 10) : 0, source: "pulse" },
    { axis: "Clarity", value: pulseAvgs ? Math.round(pulseAvgs.clarity * 10) : 0, source: "pulse" },
    { axis: "Gratitude", value: pulseAvgs ? Math.round(pulseAvgs.gratitude * 10) : 0, source: "pulse" },
    { axis: "Connection", value: pulseAvgs ? Math.round(pulseAvgs.connection * 10) : 0, source: "pulse" },
    { axis: "Financial", value: Math.round(latestCalcScores["FINANCIAL_PEACE"] ?? 0), source: "calc" },
    { axis: "Resilience", value: Math.round(latestCalcScores["BURNOUT_RISK"] ?? 0), source: "calc" },
    { axis: "Relationship", value: Math.round(latestCalcScores["RELATIONSHIP_SUSTAINABILITY"] ?? 0), source: "calc" },
    { axis: "Decision", value: Math.round(latestCalcScores["DECISION_REGRET"] ?? 0), source: "calc" },
    { axis: "Time Value", value: Math.round(latestCalcScores["TIME_VALUE"] ?? 0), source: "calc" },
  ];

  const hasData = radarData.some((d) => d.value > 0);

  if (!hasData) {
    return (
      <div className="text-center py-10 text-sm text-slate-calm">
        Complete your daily pulse and run at least one calculator to see your vitality map.
      </div>
    );
  }

  return (
    <>
      <ResponsiveContainer width="100%" height={340}>
        <RadarChart data={radarData} margin={{ top: 16, right: 24, bottom: 16, left: 24 }}>
          <PolarGrid stroke="#E7E5E4" />
          <PolarAngleAxis
            dataKey="axis"
            tick={{ fontSize: 10.5, fill: "#44403C", fontWeight: 600 }}
          />
          <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fontSize: 9, fill: "#A8A29E" }} tickCount={5} />
          <Radar
            name="Life Vitality"
            dataKey="value"
            stroke="#C9A84C"
            fill="#C9A84C"
            fillOpacity={0.22}
            strokeWidth={2.5}
            dot={{ fill: "#C9A84C", r: 3.5, strokeWidth: 0 }}
          />
          <Tooltip
            contentStyle={{ background: "#1C1C1E", border: "none", borderRadius: "10px", color: "#FAF9F6", fontSize: "12px" }}
            formatter={(v: number, _: string, entry: { payload?: { source?: string } }) => [
              `${v}/100`,
              entry.payload?.source === "pulse" ? "Daily Pulse (7-day avg)" : "Calculator Score",
            ]}
          />
        </RadarChart>
      </ResponsiveContainer>
      <div className="flex justify-center gap-6 -mt-2">
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-amber-400" />
          <span className="text-[10px] text-stone-400">Inner 5 = Daily Pulse (7-day avg ×10)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-amber-400 opacity-50" />
          <span className="text-[10px] text-stone-400">Outer 5 = Calculator scores</span>
        </div>
      </div>
    </>
  );
}

// ─── Stats row ────────────────────────────────────────────────────────────────

function StatsRow({ synthesis, loading }: { synthesis: SynthesisData | null; loading: boolean }) {
  const stats = [
    { label: "Daily Streak", value: synthesis?.dailyStreak ?? 0, suffix: "days", icon: "🔥" },
    { label: "Weekly Streak", value: synthesis?.weeklyStreak ?? 0, suffix: "weeks", icon: "📅" },
    { label: "Achievements", value: synthesis?.achievementCount ?? 0, suffix: "earned", icon: "🏆" },
    { label: "Intention Rate", value: synthesis?.intentionStats.rate ?? 0, suffix: "%", icon: "🌅" },
  ];

  if (loading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {stats.map((_, i) => <div key={i} className="h-20 bg-stone-100 rounded-2xl animate-pulse" />)}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {stats.map((s) => (
        <div key={s.label} className="bg-white border border-stone-100 rounded-2xl p-4 shadow-sm text-center">
          <span className="text-2xl">{s.icon}</span>
          <p className="text-xl font-bold text-matte-black mt-1">{s.value}<span className="text-xs font-normal text-stone-400 ml-1">{s.suffix}</span></p>
          <p className="text-xs text-slate-calm mt-0.5">{s.label}</p>
        </div>
      ))}
    </div>
  );
}

// ─── Pulse Trend Chart ────────────────────────────────────────────────────────

function PulseTrendChart({ pulses, loading }: { pulses: PulsePoint[]; loading: boolean }) {
  if (loading) return <div className="h-64 bg-stone-100 rounded-2xl animate-pulse" />;

  const data = pulses.map((p) => ({
    date: new Date(p.date + "T12:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    Composite: p.composite,
    Energy: p.energy * 10,
    Calm: p.calm * 10,
    Clarity: p.clarity * 10,
    Gratitude: p.gratitude * 10,
    Connection: p.connection * 10,
  }));

  const [active, setActive] = useState<string[]>(["Composite"]);
  const allKeys = ["Composite", "Energy", "Calm", "Clarity", "Gratitude", "Connection"];
  const colorMap: Record<string, string> = {
    Composite: PULSE_COLORS.composite,
    Energy: PULSE_COLORS.energy,
    Calm: PULSE_COLORS.calm,
    Clarity: PULSE_COLORS.clarity,
    Gratitude: PULSE_COLORS.gratitude,
    Connection: PULSE_COLORS.connection,
  };

  if (data.length < 2) {
    return (
      <div className="text-center py-10">
        <Activity className="w-8 h-8 text-stone-300 mx-auto mb-2" />
        <p className="text-sm text-slate-calm">Record your daily pulse for 2+ days to see your trend.</p>
        <Link href="/pulse" className="mt-3 inline-block">
          <Button variant="secondary" size="sm">Start Daily Pulse</Button>
        </Link>
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-wrap gap-1.5 mb-4">
        {allKeys.map((k) => (
          <button
            key={k}
            onClick={() => setActive((a) => a.includes(k) ? a.filter((x) => x !== k) : [...a, k])}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium border transition-all"
            style={{
              borderColor: active.includes(k) ? colorMap[k] : "#e7e5e4",
              backgroundColor: active.includes(k) ? colorMap[k] + "18" : "white",
              color: active.includes(k) ? colorMap[k] : "#78716c",
            }}
          >
            <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: colorMap[k] }} />
            {k}
          </button>
        ))}
      </div>
      <ResponsiveContainer width="100%" height={240}>
        <AreaChart data={data}>
          <defs>
            {allKeys.map((k) => (
              <linearGradient key={k} id={`pg-${k}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={colorMap[k]} stopOpacity={0.2} />
                <stop offset="95%" stopColor={colorMap[k]} stopOpacity={0} />
              </linearGradient>
            ))}
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#F1F0EF" />
          <XAxis dataKey="date" tick={{ fontSize: 10, fill: "#94A3B8" }} axisLine={false} tickLine={false} interval="preserveStartEnd" />
          <YAxis domain={[0, 100]} tick={{ fontSize: 10, fill: "#94A3B8" }} axisLine={false} tickLine={false} />
          <Tooltip
            contentStyle={{ background: "#FAFAF7", border: "1px solid #E7E5E4", borderRadius: "8px", fontSize: "11px" }}
            formatter={(v: number) => [v, ""]}
          />
          {allKeys.filter((k) => active.includes(k)).map((k) => (
            <Area
              key={k}
              type="monotone"
              dataKey={k}
              stroke={colorMap[k]}
              fill={`url(#pg-${k})`}
              strokeWidth={k === "Composite" ? 2.5 : 1.5}
              dot={false}
            />
          ))}
        </AreaChart>
      </ResponsiveContainer>
    </>
  );
}

// ─── Insights ─────────────────────────────────────────────────────────────────

function generateInsights(
  thisWeek: CheckinRecord | null,
  latestByType: Record<string, number>,
  streak: number,
  synthesis: SynthesisData | null,
): string[] {
  const insights: string[] = [];

  if (synthesis && synthesis.momentum > 0) {
    const { momentum, momentumBreakdown } = synthesis;
    if (momentum >= 75) insights.push(`Your Life Momentum Score of ${momentum}/100 places you in the top tier — a genuine reflection of consistent practice.`);
    else if (momentum >= 50) insights.push(`Your Life Momentum Score is ${momentum}/100. ${momentumBreakdown.consistency < 10 ? "Consistency is your biggest lever — daily check-ins compound quickly." : "Keep building across all dimensions."}`);
    else insights.push(`Your Life Momentum Score of ${momentum}/100 is your baseline. Every calculator run, pulse check-in, and virtue rating will move this up.`);
  }

  const scores = Object.entries(latestByType);
  if (scores.length > 0) {
    const sorted = [...scores].sort((a, b) => b[1] - a[1]);
    insights.push(`Your strongest calculator dimension is ${CALC_LABEL[sorted[0][0]] ?? sorted[0][0]} at ${Math.round(sorted[0][1])}/100.`);
    if (sorted.length > 1) {
      const worst = sorted[sorted.length - 1];
      if (worst[1] < 60) insights.push(`${CALC_LABEL[worst[0]] ?? worst[0]} (${Math.round(worst[1])}) is your clearest growth opportunity.`);
    }
  }

  if (synthesis?.pulseAvgs) {
    const avgs = synthesis.pulseAvgs;
    const dims = [
      { key: "energy", label: "Energy", v: avgs.energy },
      { key: "calm", label: "Calm", v: avgs.calm },
      { key: "clarity", label: "Clarity", v: avgs.clarity },
      { key: "gratitude", label: "Gratitude", v: avgs.gratitude },
      { key: "connection", label: "Connection", v: avgs.connection },
    ].sort((a, b) => a.v - b.v);
    if (dims[0].v < 6) insights.push(`Your 7-day ${dims[0].label} average is ${dims[0].v}/10 — this dimension is asking for intentional attention.`);
  }

  if (streak >= 4) insights.push(`${streak}-week check-in streak — consistency like this is the foundation everything else is built on.`);

  return insights.slice(0, 4);
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function AnalyticsPage() {
  const { user } = useAuth();
  const isPremium = user?.subscription?.tier !== "FREE";

  const [trendData, setTrendData] = useState<TrendPoint[]>([]);
  const [calculatorData, setCalculatorData] = useState<Array<{ name: string; score: number; count: number }>>([]);
  const [latestByType, setLatestByType] = useState<Record<string, number>>({});
  const [range, setRange] = useState<FilterRange>("90d");
  const [loading, setLoading] = useState(true);
  const [checkins, setCheckins] = useState<CheckinRecord[]>([]);
  const [thisWeek, setThisWeek] = useState<CheckinRecord | null>(null);
  const [goals, setGoals] = useState<GoalRecord[]>([]);
  const [streak, setStreak] = useState(0);
  const [synthesis, setSynthesis] = useState<SynthesisData | null>(null);

  useEffect(() => {
    async function fetchAll() {
      setLoading(true);
      try {
        const [ciRes, goalsRes, calcRes, synthRes] = await Promise.all([
          fetch("/api/checkin"),
          fetch("/api/goals"),
          fetch(`/api/calculators?limit=50&range=${range}`),
          fetch("/api/analytics/synthesis"),
        ]);
        const [ci, gl, calc, synth] = await Promise.all([
          ciRes.json(), goalsRes.json(), calcRes.json(), synthRes.json(),
        ]);

        if (ci.success) { setCheckins(ci.history ?? []); setStreak(ci.streak ?? 0); setThisWeek(ci.thisWeek ?? null); }
        if (gl.success) setGoals(gl.goals ?? []);
        if (synth.success) setSynthesis(synth);

        if (calc.success) {
          const results: Array<{ type: string; score: number; createdAt: string }> = calc.results || [];
          const byType: Record<string, number> = {};
          const typeCounts: Record<string, number> = {};
          results.forEach((r) => {
            typeCounts[r.type] = (typeCounts[r.type] || 0) + 1;
            if (byType[r.type] === undefined) byType[r.type] = r.score;
          });
          setLatestByType(byType);
          setCalculatorData(Object.entries(byType).map(([type, score]) => ({ name: CALC_LABEL[type] || type, score, count: typeCounts[type] })));

          if (isPremium) {
            const byWeek: Record<string, Record<string, number[]>> = {};
            results.forEach((r) => {
              const wk = getISOWeek(new Date(r.createdAt));
              if (!byWeek[wk]) byWeek[wk] = {};
              const key = r.type.toLowerCase().replace(/_/g, "");
              if (!byWeek[wk][key]) byWeek[wk][key] = [];
              byWeek[wk][key].push(r.score);
            });
            const avg = (arr: number[]) => arr.reduce((a, b) => a + b, 0) / arr.length;
            setTrendData(Object.entries(byWeek).sort(([a], [b]) => a.localeCompare(b)).map(([wk, types]) => {
              const point: TrendPoint = { date: wk, label: wk };
              if (types["financialpeace"]) point.financial = avg(types["financialpeace"]);
              if (types["burnoutrisk"]) point.burnout = avg(types["burnoutrisk"]);
              if (types["relationshipsustainability"]) point.relationship = avg(types["relationshipsustainability"]);
              if (types["decisionregret"]) point.decision = avg(types["decisionregret"]);
              if (types["timevalue"]) point.timeValue = avg(types["timevalue"]);
              const allScores = Object.values(types).map(avg);
              point.overall = allScores.reduce((a, b) => a + b, 0) / allScores.length;
              return point;
            }));
          }
        }
      } catch { /* silently fail */ }
      setLoading(false);
    }
    fetchAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPremium, range]);

  const insights = generateInsights(thisWeek, latestByType, streak, synthesis);

  const radarData = CALC_DIMS.map((d) => ({
    dimension: d.label,
    Calculator: latestByType[d.calcType] !== undefined ? Math.round(latestByType[d.calcType]) : null,
    Mood: thisWeek ? thisWeek[d.moodKey] * 10 : null,
  }));
  const hasRadarData = radarData.some((d) => d.Calculator !== null || d.Mood !== null);

  const virtueHistory = (synthesis?.virtueHistory ?? []).slice(0, 8).reverse();
  const virtueChartData = virtueHistory.map((v) => ({
    week: v.weekKey.replace(/^\d{4}-/, ""),
    Wisdom: v.wisdom * 10,
    Courage: v.courage * 10,
    Justice: v.justice * 10,
    Temperance: v.temperance * 10,
    Avg: Math.round(v.avg * 10),
  }));

  const pulseHeatmapData = (synthesis?.pulseHistory ?? []).map((p) => ({
    date: p.date,
    composite: computeCompositeScore(p),
  }));

  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto space-y-8">
        <PageHeader
          title="Life Intelligence"
          description="All your data — pulse, calculators, virtues — linked into one living picture."
          badge={isPremium ? { label: "Premium", color: "gold" } : undefined}
        />

        {/* ── 1. Life Momentum Score ──────────────────────────────────────── */}
        <MomentumCard data={synthesis} loading={loading} />

        {/* ── 2. Stats Row ────────────────────────────────────────────────── */}
        <StatsRow synthesis={synthesis} loading={loading} />

        {/* ── 3. Dimension Overview ───────────────────────────────────────── */}
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {CALC_DIMS.map((d) => <div key={d.calcType} className="bg-stone-100 rounded-2xl h-36 animate-pulse" />)}
          </div>
        ) : (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
            <div className="mb-3 flex items-center justify-between">
              <h2 className="font-serif text-base font-bold text-matte-black">Dimension Overview</h2>
              <p className="text-xs text-stone-400">Calculator score vs. self-reported mood</p>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
              {CALC_DIMS.map((d) => {
                const calcScore = latestByType[d.calcType];
                const mood = thisWeek ? thisWeek[d.moodKey] : undefined;
                const moodScaled = mood !== undefined ? mood * 10 : undefined;
                const hasCalc = calcScore !== undefined;
                const hasMood = mood !== undefined;
                const aligned = hasCalc && hasMood && Math.abs(moodScaled! - calcScore) <= 20;
                const Icon = d.Icon;
                return (
                  <div key={d.calcType} className="bg-white border border-stone-200 rounded-2xl p-4 flex flex-col gap-2.5 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-1.5">
                      <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: d.scoreColor + "1a" }}>
                        <Icon className="w-3.5 h-3.5" style={{ color: d.scoreColor }} />
                      </div>
                      <span className="text-xs font-semibold text-matte-black">{d.label}</span>
                      {hasCalc && hasMood && (
                        <span className={`ml-auto text-[8px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded-full ${aligned ? "bg-green-50 text-green-600" : "bg-amber-50 text-amber-600"}`}>
                          {aligned ? "aligned" : "gap"}
                        </span>
                      )}
                    </div>
                    <div className="grid grid-cols-2 gap-1.5">
                      <div className="bg-stone-50 rounded-xl p-2 text-center">
                        <p className="text-[8px] text-stone-400 uppercase tracking-wide mb-0.5">Score</p>
                        {hasCalc ? <p className="text-lg font-bold leading-none" style={{ color: d.scoreColor }}>{Math.round(calcScore)}</p>
                          : <Link href={d.calcHref}><span className="text-[9px] text-soft-gold font-medium hover:underline">Run →</span></Link>}
                      </div>
                      <div className="bg-stone-50 rounded-xl p-2 text-center">
                        <p className="text-[8px] text-stone-400 uppercase tracking-wide mb-0.5">Mood</p>
                        {hasMood ? <><span className="text-base leading-none">{MOOD_EMOJI[mood!]}</span><p className="text-[8px] text-stone-400">{mood}/10</p></>
                          : <Link href="/checkin"><span className="text-[9px] text-soft-gold font-medium hover:underline">Check in →</span></Link>}
                      </div>
                    </div>
                    {hasCalc && hasMood && (
                      <div className="space-y-1 pt-0.5">
                        <div className="h-1 bg-stone-100 rounded-full overflow-hidden">
                          <div className="h-full rounded-full transition-all duration-700" style={{ width: `${calcScore}%`, backgroundColor: d.scoreColor }} />
                        </div>
                        <div className="h-1 bg-stone-100 rounded-full overflow-hidden">
                          <div className="h-full rounded-full transition-all duration-700" style={{ width: `${moodScaled}%`, backgroundColor: d.moodFill }} />
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* ── 4. Insights Panel ───────────────────────────────────────────── */}
        {!loading && insights.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
            <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-100 rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="w-4 h-4 text-soft-gold" />
                <h2 className="font-serif text-sm font-bold text-matte-black">Personalised Insights</h2>
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
                  <Link href="/checkin"><span className="text-xs text-soft-gold font-semibold hover:underline">Complete this week&apos;s check-in for richer insights →</span></Link>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* ── 5. Daily Pulse 30-day Trend ─────────────────────────────────── */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
          <Card padding="lg" variant="elevated">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-soft-gold" />
                <CardTitle>Daily Pulse Trend</CardTitle>
              </div>
              <CardDescription>30-day composite wellness score — toggle individual dimensions</CardDescription>
            </CardHeader>
            <PulseTrendChart pulses={synthesis?.pulseHistory ?? []} loading={loading} />
          </Card>
        </motion.div>

        {/* ── 6. Pulse Dimension Averages ─────────────────────────────────── */}
        {!loading && synthesis?.pulseAvgs && (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
            <div className="mb-3">
              <h2 className="font-serif text-base font-bold text-matte-black">Pulse Averages <span className="font-normal text-slate-calm text-sm">(last 7 days)</span></h2>
            </div>
            <div className="grid grid-cols-5 gap-3">
              {PULSE_DIMS.map((d) => {
                const val = synthesis.pulseAvgs![d.key as keyof typeof synthesis.pulseAvgs] as number;
                const Icon = d.icon;
                return (
                  <div key={d.key} className="bg-white rounded-2xl p-4 border border-stone-100 shadow-sm text-center">
                    <div className="w-8 h-8 rounded-xl flex items-center justify-center mx-auto mb-2" style={{ backgroundColor: d.color + "18" }}>
                      <Icon className="w-4 h-4" style={{ color: d.color }} />
                    </div>
                    <p className="text-xl font-bold leading-none" style={{ color: d.color }}>{val}</p>
                    <p className="text-[10px] text-stone-400 mt-1">{d.label}</p>
                    <div className="h-1 bg-stone-100 rounded-full mt-2 overflow-hidden">
                      <div className="h-full rounded-full" style={{ width: `${val * 10}%`, backgroundColor: d.color }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* ── 7. Daily Pulse Heatmap ──────────────────────────────────────── */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
          <Card padding="lg">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4 text-soft-gold" />
                  <CardTitle>Daily Pulse Activity</CardTitle>
                </div>
                {(synthesis?.dailyStreak ?? 0) > 0 && (
                  <span className="flex items-center gap-1.5 text-xs font-semibold text-amber-600 bg-amber-50 border border-amber-200 px-3 py-1 rounded-full">
                    🔥 {synthesis!.dailyStreak}-day streak
                  </span>
                )}
              </div>
              <CardDescription>91-day pulse history — coloured by composite wellness score</CardDescription>
            </CardHeader>
            {pulseHeatmapData.length > 0
              ? <PulseHeatmap pulses={pulseHeatmapData} daysBack={91} />
              : <div className="text-center py-8"><p className="text-sm text-slate-calm mb-3">No pulse data yet. Your consistency map starts with your first check-in.</p><Link href="/pulse"><Button variant="secondary" size="sm">Start Daily Pulse</Button></Link></div>
            }
          </Card>
        </motion.div>

        {/* ── 8. Weekly Check-in Heatmap ──────────────────────────────────── */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
          <Card padding="lg">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Flame className="w-4 h-4 text-orange-500" />
                  <CardTitle>Weekly Check-in Activity</CardTitle>
                </div>
                {streak > 0 && (
                  <span className="flex items-center gap-1.5 text-xs font-semibold text-orange-600 bg-orange-50 border border-orange-200 px-3 py-1 rounded-full">
                    <Flame className="w-3 h-3" />{streak}-week streak
                  </span>
                )}
              </div>
              <CardDescription>26-week mood history — coloured by average wellbeing score</CardDescription>
            </CardHeader>
            {checkins.length > 0
              ? <ActivityHeatmap checkins={checkins} weeksBack={26} />
              : <div className="text-center py-8"><p className="text-sm text-slate-calm mb-3">No check-ins yet.</p><Link href="/checkin"><Button variant="secondary" size="sm">Start Check-in</Button></Link></div>
            }
          </Card>
        </motion.div>

        {/* ── 9. Goals ────────────────────────────────────────────────────── */}
        {goals.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
            <Card padding="lg">
              <CardHeader>
                <div className="flex items-center gap-2"><Target className="w-4 h-4 text-soft-gold" /><CardTitle>Goal Progress</CardTitle></div>
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
                        <span className="text-sm font-semibold text-matte-black">{CALC_LABEL[goal.calculatorType] ?? goal.calculatorType}</span>
                        <div className="flex items-center gap-2">
                          {reached && <span className="text-[10px] bg-green-100 text-green-700 font-semibold px-2 py-0.5 rounded-full">Reached ✓</span>}
                          <span className="text-xs text-stone-400">{Math.round(current)} → {goal.targetScore}</span>
                        </div>
                      </div>
                      <div className="h-2 bg-stone-100 rounded-full overflow-hidden">
                        <div className={`h-full rounded-full transition-all duration-700 ${reached ? "bg-green-400" : "bg-soft-gold"}`} style={{ width: `${pct}%` }} />
                      </div>
                      <p className="text-right text-[10px] text-stone-400 mt-0.5">{reached ? "Goal achieved!" : `${pct}% · ${goal.targetScore - Math.round(current)} pts to go`}</p>
                    </div>
                  );
                })}
              </div>
            </Card>
          </motion.div>
        )}

        {/* ── FREE paywall ─────────────────────────────────────────────────── */}
        {!isPremium && (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
            <div className="relative rounded-3xl overflow-hidden border border-stone-200">
              <div className="pointer-events-none select-none blur-sm opacity-40 p-6 bg-white space-y-4">
                <div className="h-6 w-40 bg-stone-200 rounded-lg" />
                <div className="h-[220px] bg-gradient-to-br from-amber-50 via-stone-50 to-blue-50 rounded-2xl flex items-end gap-2 p-4">
                  {[60, 75, 55, 80, 70, 65, 85, 72, 68, 90, 78, 82].map((h, i) => (
                    <div key={i} className="flex-1 rounded-t-lg bg-gradient-to-t from-soft-gold to-amber-300" style={{ height: `${h}%` }} />
                  ))}
                </div>
              </div>
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/80 backdrop-blur-[2px] p-8 text-center">
                <div className="w-14 h-14 bg-amber-50 rounded-2xl flex items-center justify-center mb-4 shadow-sm">
                  <Lock className="w-6 h-6 text-soft-gold" />
                </div>
                <h2 className="font-serif text-2xl font-bold text-matte-black mb-2">Unlock Full Analytics</h2>
                <p className="text-slate-calm text-sm max-w-sm mb-6">Life Vitality Radar, Virtue trend chart, historical calculator trends, and the full 10-dimension unified view.</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-6 text-left max-w-xs w-full">
                  {["10-dimension Life Vitality Radar", "Stoic Virtue trend chart", "Full calculator trend history", "Advanced date range filtering"].map((f) => (
                    <div key={f} className="flex items-center gap-2 text-xs text-matte-black">
                      <span className="w-4 h-4 rounded-full bg-amber-100 text-soft-gold flex items-center justify-center text-[10px] font-bold flex-shrink-0">✓</span>
                      {f}
                    </div>
                  ))}
                </div>
                <Link href="/pricing"><Button variant="gold" size="md" icon={<TrendingUp className="w-4 h-4" />}>Upgrade to Premium — $19/mo</Button></Link>
                <p className="text-xs text-stone-400 mt-3">Cancel any time. No hidden fees.</p>
              </div>
            </div>
          </motion.div>
        )}

        {/* ── PREMIUM sections ─────────────────────────────────────────────── */}
        {isPremium && (
          <>
            {/* Life Vitality Radar (10 axes) */}
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
              <Card padding="lg" variant="elevated">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-soft-gold" />
                    <CardTitle>Life Vitality Radar</CardTitle>
                  </div>
                  <CardDescription>10 dimensions unified — inner 5 from Daily Pulse (7-day avg), outer 5 from Calculator scores</CardDescription>
                </CardHeader>
                {synthesis ? <VitalityRadar synthesis={synthesis} /> : <div className="h-64 bg-stone-50 rounded-2xl animate-pulse" />}
              </Card>
            </motion.div>

            {/* Mood vs Score Correlation Radar */}
            {hasRadarData && (
              <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
                <Card padding="lg" variant="elevated">
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-soft-gold" />
                      <CardTitle>Mood vs. Score Correlation</CardTitle>
                    </div>
                    <CardDescription>Where your self-reported mood and calculator scores align — and where they diverge</CardDescription>
                  </CardHeader>
                  <ResponsiveContainer width="100%" height={300}>
                    <RadarChart data={radarData}>
                      <PolarGrid stroke="#F1F0EF" />
                      <PolarAngleAxis dataKey="dimension" tick={{ fontSize: 11, fill: "#44403C", fontWeight: 600 }} />
                      <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fontSize: 9, fill: "#94A3B8" }} tickCount={5} />
                      <Radar name="Calculator Score" dataKey="Calculator" stroke="#C9A84C" fill="#C9A84C" fillOpacity={0.25} strokeWidth={2} />
                      <Radar name="Mood (×10)" dataKey="Mood" stroke="#4F61A8" fill="#4F61A8" fillOpacity={0.12} strokeWidth={2} strokeDasharray="4 2" />
                      <Legend iconType="circle" iconSize={6} wrapperStyle={{ fontSize: "11px" }} />
                      <Tooltip contentStyle={{ backgroundColor: "#FAFAF7", border: "1px solid #E7E5E4", borderRadius: "8px", fontSize: "11px" }} formatter={(v: number) => [`${v}/100`, ""]} />
                    </RadarChart>
                  </ResponsiveContainer>
                </Card>
              </motion.div>
            )}

            {/* Virtue Compass */}
            {synthesis?.latestVirtues && (
              <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
                <Card padding="lg" variant="elevated">
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <Target className="w-4 h-4 text-soft-gold" />
                      <CardTitle>Stoic Virtue Compass</CardTitle>
                    </div>
                    <CardDescription>Wisdom · Courage · Justice · Temperance — this week vs. last week</CardDescription>
                  </CardHeader>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-center">
                    <VirtueCompass
                      current={synthesis.latestVirtues}
                      previous={synthesis.virtueHistory[1] ?? null}
                      size="md"
                    />
                    {virtueChartData.length > 1 && (
                      <div>
                        <p className="text-xs text-stone-400 mb-3 uppercase tracking-widest font-medium">Virtue trend (×10 scale)</p>
                        <ResponsiveContainer width="100%" height={200}>
                          <AreaChart data={virtueChartData}>
                            <defs>
                              {["Wisdom", "Courage", "Justice", "Temperance"].map((k, i) => {
                                const colors = ["#C9A84C", "#4F61A8", "#22C55E", "#EC4899"];
                                return (
                                  <linearGradient key={k} id={`vg-${k}`} x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor={colors[i]} stopOpacity={0.2} />
                                    <stop offset="95%" stopColor={colors[i]} stopOpacity={0} />
                                  </linearGradient>
                                );
                              })}
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#F1F0EF" />
                            <XAxis dataKey="week" tick={{ fontSize: 10, fill: "#94A3B8" }} axisLine={false} tickLine={false} />
                            <YAxis domain={[0, 100]} tick={{ fontSize: 9, fill: "#94A3B8" }} axisLine={false} tickLine={false} />
                            <Tooltip contentStyle={{ background: "#FAFAF7", border: "1px solid #E7E5E4", borderRadius: "8px", fontSize: "11px" }} formatter={(v: number) => [v, ""]} />
                            {["Wisdom", "Courage", "Justice", "Temperance"].map((k, i) => {
                              const colors = ["#C9A84C", "#4F61A8", "#22C55E", "#EC4899"];
                              return <Area key={k} type="monotone" dataKey={k} stroke={colors[i]} fill={`url(#vg-${k})`} strokeWidth={1.5} dot={false} />;
                            })}
                          </AreaChart>
                        </ResponsiveContainer>
                      </div>
                    )}
                  </div>
                </Card>
              </motion.div>
            )}

            {/* Range filter */}
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-slate-calm" />
              <span className="text-xs text-slate-calm mr-1">Show:</span>
              {RANGES.map((r) => (
                <button key={r.value} onClick={() => setRange(r.value)}
                  className={`px-3 py-1 text-xs font-medium rounded-lg border transition-all ${range === r.value ? "bg-matte-black text-warm-white border-matte-black" : "bg-white text-slate-calm border-stone-200 hover:border-stone-300"}`}>
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
                {/* Well-Being Trend */}
                {trendData.length > 1 ? (
                  <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
                    <Card padding="lg" variant="elevated">
                      <CardHeader>
                        <div className="flex items-center gap-2"><TrendingUp className="w-4 h-4 text-soft-gold" /><CardTitle>Well-Being Trend</CardTitle></div>
                        <CardDescription>All calculator scores over time, grouped by week</CardDescription>
                      </CardHeader>
                      <ResponsiveContainer width="100%" height={280}>
                        <AreaChart data={trendData}>
                          <defs>
                            {Object.entries(CHART_COLORS).map(([key, color]) => (
                              <linearGradient key={key} id={`grad-${key}`} x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor={color} stopOpacity={0.18} />
                                <stop offset="95%" stopColor={color} stopOpacity={0} />
                              </linearGradient>
                            ))}
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="#F1F0EF" />
                          <XAxis dataKey="label" tick={{ fontSize: 10, fill: "#94A3B8" }} axisLine={false} tickLine={false} />
                          <YAxis domain={[0, 100]} tick={{ fontSize: 10, fill: "#94A3B8" }} axisLine={false} tickLine={false} />
                          <Tooltip contentStyle={{ backgroundColor: "#FAFAF7", border: "1px solid #E7E5E4", borderRadius: "8px", fontSize: "11px" }} formatter={(v: number) => [v.toFixed(1), ""]} />
                          <Legend iconType="circle" iconSize={6} wrapperStyle={{ fontSize: "11px" }} />
                          {[
                            { key: "overall", name: "Overall" }, { key: "financial", name: "Financial" },
                            { key: "burnout", name: "Burnout" }, { key: "relationship", name: "Relationship" },
                            { key: "decision", name: "Decision" }, { key: "timeValue", name: "Time" },
                          ].map(({ key, name }) => (
                            <Area key={key} type="monotone" dataKey={key} name={name}
                              stroke={CHART_COLORS[key]} fill={`url(#grad-${key})`}
                              strokeWidth={key === "overall" ? 2.5 : 1.5} dot={false} />
                          ))}
                        </AreaChart>
                      </ResponsiveContainer>
                    </Card>
                  </motion.div>
                ) : (
                  <Card padding="lg" className="text-center">
                    <BarChart3 className="w-8 h-8 text-stone-300 mx-auto mb-2" />
                    <p className="text-sm text-slate-calm">Not enough data yet. Run calculators regularly to build your trend.</p>
                    <Link href="/calculators" className="mt-3 inline-block"><Button variant="secondary" size="sm">Go to Calculators</Button></Link>
                  </Card>
                )}

                {/* Calculator Bar Chart */}
                {calculatorData.length > 0 && (
                  <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
                    <Card padding="lg">
                      <CardHeader>
                        <div className="flex items-center gap-2"><BarChart3 className="w-4 h-4 text-soft-gold" /><CardTitle>Latest Scores by Calculator</CardTitle></div>
                        <CardDescription>Most recent score per calculator in the selected period</CardDescription>
                      </CardHeader>
                      <ResponsiveContainer width="100%" height={220}>
                        <BarChart data={calculatorData} layout="vertical">
                          <CartesianGrid strokeDasharray="3 3" stroke="#F1F0EF" horizontal={false} />
                          <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 10, fill: "#94A3B8" }} axisLine={false} tickLine={false} />
                          <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: "#44403C" }} axisLine={false} tickLine={false} width={110} />
                          <Tooltip contentStyle={{ backgroundColor: "#FAFAF7", border: "1px solid #E7E5E4", borderRadius: "8px", fontSize: "11px" }} formatter={(v: number, _, entry) => [`${v.toFixed(1)} (${entry.payload.count} runs)`, ""]} />
                          <Bar dataKey="score" fill="#C9A84C" radius={[0, 4, 4, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </Card>
                  </motion.div>
                )}

                {/* Score Comparison */}
                {calculatorData.length > 0 && (
                  <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
                    <Card padding="lg">
                      <CardHeader>
                        <CardTitle>Score Comparison</CardTitle>
                        <CardDescription>Visual comparison of your latest scores across all calculators</CardDescription>
                      </CardHeader>
                      <div className="space-y-3">
                        {calculatorData.map((d) => <MetricBar key={d.name} label={`${d.name} (${d.count} runs)`} score={d.score} animate />)}
                      </div>
                    </Card>
                  </motion.div>
                )}

                {calculatorData.length === 0 && (
                  <Card padding="lg" className="text-center">
                    <Calendar className="w-8 h-8 text-stone-300 mx-auto mb-2" />
                    <p className="text-sm text-slate-calm mb-3">No calculator data found for this period.</p>
                    <Link href="/calculators"><Button variant="secondary" size="sm">Start a Calculator</Button></Link>
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

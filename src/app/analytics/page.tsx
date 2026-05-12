"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { DashboardLayout } from "@/components/layout/Sidebar";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { MetricBar } from "@/components/ui/ScoreVisuals";
import { ActivityHeatmap } from "@/components/ui/ActivityHeatmap";
import { Lock, TrendingUp, BarChart3, Calendar, Filter, Flame, Target } from "lucide-react";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { useAuth } from "@/components/providers/AuthProvider";
import Link from "next/link";
import { Button as UIButton } from "@/components/ui/Button";

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

const CALC_LABEL: Record<string, string> = {
  FINANCIAL_PEACE: "Financial Peace",
  BURNOUT_RISK: "Burnout Risk",
  RELATIONSHIP_SUSTAINABILITY: "Relationship Health",
  DECISION_REGRET: "Decision Quality",
  TIME_VALUE: "Time Value",
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


const CALCULATOR_LABELS: Record<string, string> = {
  FINANCIAL_PEACE: "Financial Peace",
  BURNOUT_RISK: "Burnout Risk",
  RELATIONSHIP_SUSTAINABILITY: "Relationship",
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

export default function AnalyticsPage() {
  const { user } = useAuth();
  const isPremium = user?.subscription?.tier !== "FREE";

  const [trendData, setTrendData] = useState<TrendPoint[]>([]);
  const [calculatorData, setCalculatorData] = useState<Array<{ name: string; score: number; count: number }>>([]);
  const [range, setRange] = useState<FilterRange>("90d");
  const [loading, setLoading] = useState(true);
  const [checkins, setCheckins] = useState<CheckinRecord[]>([]);
  const [goals, setGoals] = useState<GoalRecord[]>([]);
  const [streak, setStreak] = useState(0);

  useEffect(() => {
    // Checkins + goals are available to all users
    Promise.all([
      fetch("/api/checkin").then((r) => r.json()),
      fetch("/api/goals").then((r) => r.json()),
    ]).then(([ci, gl]) => {
      if (ci.success) { setCheckins(ci.history); setStreak(ci.streak); }
      if (gl.success) setGoals(gl.goals);
    });

    if (!isPremium) { setLoading(false); return; }
    fetchAnalytics();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPremium, range]);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const [calcRes] = await Promise.all([
        fetch(`/api/calculators?limit=100&range=${range}`),
      ]);
      const calcJson = await calcRes.json();
      if (calcJson.success) {
        // Build trend from calculator history
        const results: Array<{ type: string; score: number; createdAt: string }> = calcJson.results || [];

        // Group by type → latest scores
        const typeScores: Record<string, number> = {};
        const typeCounts: Record<string, number> = {};
        results.forEach((r) => {
          typeCounts[r.type] = (typeCounts[r.type] || 0) + 1;
          typeScores[r.type] = r.score; // overwrite to get latest
        });

        setCalculatorData(
          Object.entries(typeScores).map(([type, score]) => ({
            name: CALCULATOR_LABELS[type] || type,
            score,
            count: typeCounts[type],
          }))
        );

        // Build timeline: group by week
        const byWeek: Record<string, Record<string, number[]>> = {};
        results.forEach((r) => {
          const d = new Date(r.createdAt);
          const weekKey = `${d.getFullYear()}-W${String(Math.ceil(d.getDate() / 7)).padStart(2, "0")}`;
          if (!byWeek[weekKey]) byWeek[weekKey] = {};
          const key = r.type.toLowerCase().replace("_", "");
          if (!byWeek[weekKey][key]) byWeek[weekKey][key] = [];
          byWeek[weekKey][key].push(r.score);
        });

        const timeline: TrendPoint[] = Object.entries(byWeek)
          .sort(([a], [b]) => a.localeCompare(b))
          .map(([weekKey, types]) => {
            const avg = (arr: number[]) => arr.reduce((a, b) => a + b, 0) / arr.length;
            const point: TrendPoint = { date: weekKey, label: weekKey };
            if (types["financialpeace"]) point.financial = avg(types["financialpeace"]);
            if (types["burnoutrisk"]) point.burnout = avg(types["burnoutrisk"]);
            if (types["relationshipsustainability"]) point.relationship = avg(types["relationshipsustainability"]);
            if (types["decisionregret"]) point.decision = avg(types["decisionregret"]);
            if (types["timevalue"]) point.timeValue = avg(types["timevalue"]);
            const scores = Object.values(types).map(avg);
            point.overall = scores.reduce((a, b) => a + b, 0) / scores.length;
            return point;
          });
        setTrendData(timeline);
      }
    } catch {
      // silently fail — show empty state
    }
    setLoading(false);
  };

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
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="font-serif text-2xl font-bold text-matte-black mb-1">Analytics</h1>
          <p className="text-slate-calm text-sm">Track how your well-being indices evolve over time.</p>
        </motion.div>

        {/* Check-in heatmap — available to all users */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
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
              <CardDescription>26-week mood history — coloured by average wellbeing score</CardDescription>
            </CardHeader>
            {checkins.length > 0 ? (
              <ActivityHeatmap checkins={checkins} weeksBack={26} />
            ) : (
              <div className="text-center py-8">
                <p className="text-sm text-slate-calm mb-3">No check-ins yet. Start your weekly habit to see your activity here.</p>
                <Link href="/checkin">
                  <Button variant="secondary" size="sm">Start Check-in</Button>
                </Link>
              </div>
            )}
          </Card>
        </motion.div>

        {/* Goals progress — available to all users */}
        {goals.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
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
                  const reached = goal.reachedAt || current >= goal.targetScore;
                  return (
                    <div key={goal.id}>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-sm font-semibold text-matte-black">
                          {CALC_LABEL[goal.calculatorType] ?? goal.calculatorType}
                        </span>
                        <div className="flex items-center gap-2">
                          {reached && (
                            <span className="text-[10px] bg-green-100 text-green-700 font-semibold px-2 py-0.5 rounded-full">Reached ✓</span>
                          )}
                          <span className="text-xs text-stone-400">
                            {Math.round(current)} → {goal.targetScore}
                          </span>
                        </div>
                      </div>
                      <div className="h-2 bg-stone-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-700 ${reached ? "bg-green-400" : "bg-soft-gold"}`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <p className="text-right text-[10px] text-stone-400 mt-0.5">
                        {reached ? "Goal achieved!" : `${pct}% · ${goal.targetScore - Math.round(current)} pts to go`}
                      </p>
                    </div>
                  );
                })}
              </div>
            </Card>
          </motion.div>
        )}

        {/* Premium gate */}
        {!isPremium && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <Card variant="dark" padding="lg" className="text-center">
              <Lock className="w-8 h-8 text-soft-gold mx-auto mb-3" />
              <h2 className="font-serif text-lg font-bold text-warm-white mb-2">Premium Feature</h2>
              <p className="text-stone-400 text-sm mb-4 max-w-md mx-auto">
                Longitudinal analytics and trend tracking require a Premium or Enterprise plan.
                See your progress unfold over weeks and months.
              </p>
              <Link href="/pricing">
                <UIButton variant="gold" size="md" icon={<TrendingUp className="w-4 h-4" />}>Unlock Analytics</UIButton>
              </Link>
            </Card>
          </motion.div>
        )}

        {isPremium && (
          <>
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
                          <Tooltip
                            contentStyle={{ backgroundColor: "#FAFAF7", border: "1px solid #E7E5E4", borderRadius: "8px", fontSize: "11px" }}
                            formatter={(v: number) => [v.toFixed(1), ""]}
                          />
                          <Legend iconType="circle" iconSize={6} wrapperStyle={{ fontSize: "11px" }} />
                          <Area type="monotone" dataKey="overall" name="Overall" stroke={CHART_COLORS.overall} fill={`url(#grad-overall)`} strokeWidth={2.5} dot={false} />
                          <Area type="monotone" dataKey="financial" name="Financial" stroke={CHART_COLORS.financial} fill={`url(#grad-financial)`} strokeWidth={1.5} dot={false} />
                          <Area type="monotone" dataKey="burnout" name="Burnout" stroke={CHART_COLORS.burnout} fill={`url(#grad-burnout)`} strokeWidth={1.5} dot={false} />
                          <Area type="monotone" dataKey="relationship" name="Relationship" stroke={CHART_COLORS.relationship} fill={`url(#grad-relationship)`} strokeWidth={1.5} dot={false} />
                          <Area type="monotone" dataKey="decision" name="Decision" stroke={CHART_COLORS.decision} fill={`url(#grad-decision)`} strokeWidth={1.5} dot={false} />
                          <Area type="monotone" dataKey="timeValue" name="Time" stroke={CHART_COLORS.timeValue} fill={`url(#grad-timeValue)`} strokeWidth={1.5} dot={false} />
                        </AreaChart>
                      </ResponsiveContainer>
                    </Card>
                  </motion.div>
                ) : (
                  <Card padding="lg" className="text-center">
                    <BarChart3 className="w-8 h-8 text-stone-300 mx-auto mb-2" />
                    <p className="text-sm text-slate-calm">Not enough data yet. Run calculators regularly to build your trend chart.</p>
                    <Link href="/calculators" className="mt-3 inline-block">
                      <Button variant="secondary" size="sm">Go to Calculators</Button>
                    </Link>
                  </Card>
                )}

                {/* Calculator Scores Bar Chart */}
                {calculatorData.length > 0 && (
                  <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                    <Card padding="lg">
                      <CardHeader>
                        <div className="flex items-center gap-2">
                          <BarChart3 className="w-4 h-4 text-soft-gold" />
                          <CardTitle>Latest Scores by Calculator</CardTitle>
                        </div>
                        <CardDescription>Most recent score per calculator in the selected period</CardDescription>
                      </CardHeader>
                      <ResponsiveContainer width="100%" height={220}>
                        <BarChart data={calculatorData} layout="vertical">
                          <CartesianGrid strokeDasharray="3 3" stroke="#F1F0EF" horizontal={false} />
                          <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 10, fill: "#94A3B8" }} axisLine={false} tickLine={false} />
                          <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: "#44403C" }} axisLine={false} tickLine={false} width={110} />
                          <Tooltip
                            contentStyle={{ backgroundColor: "#FAFAF7", border: "1px solid #E7E5E4", borderRadius: "8px", fontSize: "11px" }}
                            formatter={(v: number, _, entry) => [`${v.toFixed(1)} (${entry.payload.count} runs)`, ""]}
                          />
                          <Bar dataKey="score" fill="#C9A84C" radius={[0, 4, 4, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </Card>
                  </motion.div>
                )}

                {/* Score Summary Bars */}
                {calculatorData.length > 0 && (
                  <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                    <Card padding="lg">
                      <CardHeader>
                        <CardTitle>Score Comparison</CardTitle>
                        <CardDescription>Visual comparison of your latest scores across all calculators</CardDescription>
                      </CardHeader>
                      <div className="space-y-3">
                        {calculatorData.map((d) => (
                          <MetricBar key={d.name} label={`${d.name} (${d.count} runs)`} score={d.score} animate />
                        ))}
                      </div>
                    </Card>
                  </motion.div>
                )}

                {calculatorData.length === 0 && !loading && (
                  <Card padding="lg" className="text-center">
                    <Calendar className="w-8 h-8 text-stone-300 mx-auto mb-2" />
                    <p className="text-sm text-slate-calm mb-3">No calculator data found for this period.</p>
                    <Link href="/calculators">
                      <Button variant="secondary" size="sm">Start a Calculator</Button>
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

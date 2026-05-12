"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { DashboardLayout } from "@/components/layout/Sidebar";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { SliderField } from "@/components/ui/FormFields";
import { Zap, TrendingUp, ArrowRight, Crown } from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import toast from "react-hot-toast";
import { useAuth } from "@/components/providers/AuthProvider";
import Link from "next/link";

type ScenarioType = "FINANCIAL_IMPROVEMENT" | "STRESS_REDUCTION" | "RELATIONSHIP_INVESTMENT" | "WORK_LIFE_BALANCE" | "HEALTH_OPTIMIZATION";

const SCENARIOS: { type: ScenarioType; label: string; description: string; icon: string }[] = [
  { type: "FINANCIAL_IMPROVEMENT", label: "Financial Improvement", description: "Model the impact of increasing savings rate, reducing debt, or building an emergency fund.", icon: "💰" },
  { type: "STRESS_REDUCTION", label: "Stress Reduction", description: "Simulate the effect of reducing workload, improving sleep quality, and adding recovery practices.", icon: "🧘" },
  { type: "RELATIONSHIP_INVESTMENT", label: "Relationship Investment", description: "Project outcomes of increasing quality time, improving communication habits, and rebuilding trust.", icon: "🤝" },
  { type: "WORK_LIFE_BALANCE", label: "Work-Life Rebalance", description: "Explore how shifting your work hours and autonomy level affects overall well-being over 12 months.", icon: "⚖️" },
  { type: "HEALTH_OPTIMIZATION", label: "Health Optimization", description: "Model gains from consistent exercise, improved sleep, and reduced stress on burnout resilience.", icon: "🏃" },
];

type SimulationResult = {
  projections: Array<{ month: string; baseline: number; scenario: number }>;
  netImpact: number;
  timeToGoal: number | null;
  insights: string[];
  aiAnalysis?: string;
};

const DEMO_RESULT: SimulationResult = {
  projections: [
    { month: "Now", baseline: 55, scenario: 55 },
    { month: "M1", baseline: 54, scenario: 58 },
    { month: "M2", baseline: 53, scenario: 61 },
    { month: "M3", baseline: 53, scenario: 64 },
    { month: "M4", baseline: 52, scenario: 66 },
    { month: "M5", baseline: 52, scenario: 68 },
    { month: "M6", baseline: 51, scenario: 70 },
    { month: "M7", baseline: 51, scenario: 71 },
    { month: "M8", baseline: 50, scenario: 73 },
    { month: "M9", baseline: 50, scenario: 74 },
    { month: "M10", baseline: 49, scenario: 75 },
    { month: "M11", baseline: 49, scenario: 76 },
    { month: "M12", baseline: 48, scenario: 77 },
  ],
  netImpact: 22,
  timeToGoal: 10,
  insights: [
    "Consistent behavioral change compounds significantly over 12 months.",
    "Without intervention, passive drift tends to erode your baseline score.",
    "The first 3 months show the steepest gains as new habits take root.",
    "Reaching the 'Thriving' threshold (75+) is achievable within 10 months at this consistency level.",
  ],
  aiAnalysis: "Your scenario parameters suggest a high likelihood of meaningful improvement. The Stoic principle of premeditatio malorum — anticipating obstacles — will be crucial in months 4–6, where motivation typically dips.",
};

export default function SimulatePage() {
  const { user } = useAuth();
  const isPremium = user?.subscription?.tier !== "FREE";

  const [selectedScenario, setSelectedScenario] = useState<ScenarioType | null>(null);
  const [baselineScore, setBaselineScore] = useState(55);
  const [intensity, setIntensity] = useState(5);
  const [consistency, setConsistency] = useState(7);
  const [result, setResult] = useState<SimulationResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [isDemo, setIsDemo] = useState(false);

  const handleSimulate = async () => {
    if (!selectedScenario) return toast.error("Select a scenario first.");

    if (!isPremium) {
      setIsDemo(true);
      setResult(DEMO_RESULT);
      return;
    }

    setIsDemo(false);
    setLoading(true);
    try {
      const res = await fetch("/api/simulate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          scenarioType: selectedScenario,
          baselineScore,
          parameters: { intensity, consistency },
        }),
      });
      const json = await res.json();
      if (json.success) {
        setResult(json.result);
      } else {
        toast.error(json.error || "Simulation failed.");
      }
    } catch {
      toast.error("Something went wrong.");
    }
    setLoading(false);
  };

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="font-serif text-2xl font-bold text-matte-black mb-1">Scenario Simulator</h1>
          <p className="text-slate-calm text-sm">
            Model how behavioral changes compound over 12 months. Explore what&apos;s possible before committing.
          </p>
        </motion.div>

        {/* Free user teaser banner */}
        {!isPremium && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-gradient-to-r from-amber-50 to-brand-50 border border-amber-200 rounded-2xl px-5 py-4">
              <div className="flex items-start gap-3">
                <Crown className="w-5 h-5 text-soft-gold flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-amber-900">Preview mode — run a free demo simulation</p>
                  <p className="text-xs text-amber-700 mt-0.5">Select any scenario below and click Run to see sample projections. Upgrade to model your actual data.</p>
                </div>
              </div>
              <Link href="/pricing" className="flex-shrink-0">
                <Button variant="gold" size="sm" icon={<Zap className="w-3.5 h-3.5" />}>
                  Upgrade — $19/mo
                </Button>
              </Link>
            </div>
          </motion.div>
        )}

        {/* Scenario Selection */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <h2 className="font-semibold text-matte-black mb-3 text-sm">1. Choose a Scenario</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
            {SCENARIOS.map((s) => (
              <button
                key={s.type}
                onClick={() => setSelectedScenario(s.type)}
                className={`text-left p-4 rounded-xl border-2 transition-all ${
                  selectedScenario === s.type
                    ? "border-soft-gold bg-amber-50"
                    : "border-stone-200 bg-white hover:border-stone-300"
                }`}
              >
                <span className="text-2xl mb-2 block">{s.icon}</span>
                <p className="font-semibold text-sm text-matte-black mb-1">{s.label}</p>
                <p className="text-xs text-slate-calm leading-relaxed">{s.description}</p>
              </button>
            ))}
          </div>
        </motion.div>

        {/* Parameters */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card padding="lg">
            <CardHeader>
              <CardTitle className="text-sm">2. Set Parameters</CardTitle>
              <CardDescription>{isPremium ? "Adjust these to match your real situation." : "In preview mode these are illustrative — upgrade to use your real scores."}</CardDescription>
            </CardHeader>
            <div className="space-y-5">
              <SliderField
                label="Your Current Baseline Score"
                value={baselineScore}
                onChange={setBaselineScore}
                min={10}
                max={100}
                step={1}
                minLabel="10"
                maxLabel="100"
                description="What is your approximate overall well-being score right now? (from your dashboard)"
              />
              <SliderField
                label="Change Intensity"
                value={intensity}
                onChange={setIntensity}
                minLabel="Minimal effort"
                maxLabel="Full commitment"
                description="How dramatically are you planning to change your behavior? (1 = slight tweaks, 10 = complete overhaul)"
              />
              <SliderField
                label="Consistency Level"
                value={consistency}
                onChange={setConsistency}
                minLabel="Occasional"
                maxLabel="Every day"
                description="How consistently will you apply these changes over 12 months? (1 = rarely, 10 = daily discipline)"
              />
            </div>
          </Card>
        </motion.div>

        {/* Run button */}
        <Button
          variant="gold"
          size="lg"
          fullWidth
          onClick={handleSimulate}
          loading={loading}
          disabled={!selectedScenario}
          icon={<Zap className="w-4 h-4" />}
        >
          {isPremium ? "Run 12-Month Simulation" : "Preview Demo Simulation"}
        </Button>

        {/* Results */}
        <AnimatePresence>
          {result && (
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="space-y-6"
            >
              {/* Demo mode overlay wrapper */}
              <div className="relative">
                {isDemo && (
                  <div className="absolute inset-0 z-10 flex flex-col items-center justify-center rounded-2xl backdrop-blur-[2px] bg-white/60">
                    <div className="bg-white border border-soft-gold/40 rounded-2xl px-8 py-6 text-center shadow-premium max-w-sm mx-4">
                      <Crown className="w-8 h-8 text-soft-gold mx-auto mb-3" />
                      <h3 className="font-serif font-bold text-matte-black mb-2">Demo Preview</h3>
                      <p className="text-sm text-slate-calm mb-4 leading-relaxed">
                        This is sample data. Upgrade to run simulations using your actual assessment scores and see personalized 12-month projections.
                      </p>
                      <Link href="/pricing">
                        <Button variant="gold" size="sm" icon={<ArrowRight className="w-4 h-4" />} iconPosition="right">
                          Unlock Full Simulator
                        </Button>
                      </Link>
                    </div>
                  </div>
                )}

                <div className={isDemo ? "blur-[1px] pointer-events-none" : ""}>
                  {/* Projection Chart */}
                  <Card padding="lg" variant="elevated">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="font-serif font-bold text-matte-black">12-Month Projection</h3>
                        <p className="text-xs text-slate-calm">Scenario vs. no-change baseline</p>
                      </div>
                      <div className={`flex items-center gap-1 text-sm font-semibold px-3 py-1 rounded-full ${
                        result.netImpact >= 0
                          ? "bg-green-50 text-green-700"
                          : "bg-amber-50 text-amber-800"
                      }`}>
                        <TrendingUp className="w-4 h-4" />
                        {result.netImpact >= 0 ? "+" : ""}{result.netImpact.toFixed(1)} pts
                      </div>
                    </div>
                    <ResponsiveContainer width="100%" height={260}>
                      <AreaChart data={result.projections}>
                        <defs>
                          <linearGradient id="scenarioGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#C9A84C" stopOpacity={0.2} />
                            <stop offset="95%" stopColor="#C9A84C" stopOpacity={0} />
                          </linearGradient>
                          <linearGradient id="baselineGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#94A3B8" stopOpacity={0.15} />
                            <stop offset="95%" stopColor="#94A3B8" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#F1F0EF" />
                        <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#94A3B8" }} axisLine={false} tickLine={false} />
                        <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: "#94A3B8" }} axisLine={false} tickLine={false} />
                        <Tooltip
                          contentStyle={{ backgroundColor: "#FAFAF7", border: "1px solid #E7E5E4", borderRadius: "8px", fontSize: "12px" }}
                          formatter={(value: number) => [`${value.toFixed(1)}`, ""]}
                        />
                        <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: "12px" }} />
                        <Area type="monotone" dataKey="baseline" name="No Change" stroke="#94A3B8" fill="url(#baselineGrad)" strokeWidth={2} dot={false} />
                        <Area type="monotone" dataKey="scenario" name="With Changes" stroke="#C9A84C" fill="url(#scenarioGrad)" strokeWidth={2.5} dot={false} />
                      </AreaChart>
                    </ResponsiveContainer>
                    {result.timeToGoal && (
                      <p className="text-xs text-slate-calm mt-3 text-center">
                        At this consistency level, the model estimates reaching 75+ within approximately{" "}
                        <span className="font-semibold text-matte-black">{result.timeToGoal} months</span> — though real outcomes depend on many factors beyond the model.
                      </p>
                    )}
                  </Card>

                  {/* Insights */}
                  <Card padding="lg" className="mt-6">
                    <h3 className="font-semibold text-matte-black mb-3 text-sm">Simulation Insights</h3>
                    <ul className="space-y-2">
                      {result.insights.map((insight, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-slate-calm">
                          <ArrowRight className="w-3.5 h-3.5 text-soft-gold mt-0.5 flex-shrink-0" />
                          {insight}
                        </li>
                      ))}
                    </ul>
                  </Card>

                  {/* AI Analysis */}
                  {result.aiAnalysis && (
                    <Card padding="lg" variant="elevated" className="mt-6">
                      <div className="flex items-center gap-2 mb-2">
                        <Zap className="w-4 h-4 text-soft-gold" />
                        <span className="text-xs font-semibold text-soft-gold uppercase tracking-widest">Logos — Scenario Analysis</span>
                      </div>
                      <p className="text-sm text-slate-calm italic font-serif leading-relaxed">{result.aiAnalysis}</p>
                      <p className="text-xs text-stone-400 mt-3 italic">Projections are illustrative estimates based on population-level behavioral patterns. They are not personalized predictions or guarantees of any outcome.</p>
                    </Card>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </DashboardLayout>
  );
}

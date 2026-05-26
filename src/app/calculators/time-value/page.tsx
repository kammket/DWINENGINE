"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { DashboardLayout } from "@/components/layout/Sidebar";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { ScoreRing, MetricBar, ScoreDelta, ScoreLegend } from "@/components/ui/ScoreVisuals";
import { SliderField, NumberInput } from "@/components/ui/FormFields";
import { getScoreLabel } from "@/types";
import { getReflectionByCategory } from "@/lib/stoic";
import { GoalSetter } from "@/components/ui/GoalSetter";
import { LockedFeaturePanel, SimulatorLockedPanel } from "@/components/ui/LockedFeaturePanel";
import { useAuth } from "@/components/providers/AuthProvider";
import { Sparkles, ArrowRight, ChevronDown, ChevronUp, Zap, BookOpen, Crown } from "lucide-react";
import toast from "react-hot-toast";

type TimeValueInputs = {
  workHoursPerWeek: number;
  sleepHoursPerNight: number;
  personalGrowthHoursPerWeek: number;
  socialConnectionHoursPerWeek: number;
  leisureHoursPerWeek: number;
  purposefulActivityPercent: number;
  timeAutonomy: number;
};

const DEFAULT_INPUTS: TimeValueInputs = {
  workHoursPerWeek: 45,
  sleepHoursPerNight: 7,
  personalGrowthHoursPerWeek: 3,
  socialConnectionHoursPerWeek: 5,
  leisureHoursPerWeek: 8,
  purposefulActivityPercent: 40,
  timeAutonomy: 5,
};

export default function TimeValuePage() {
  const [inputs, setInputs] = useState<TimeValueInputs>(DEFAULT_INPUTS);
  const [result, setResult] = useState<{ score: number; outputs: Record<string, number>; interpretation: string; suggestions: string[] } | null>(null);
  const [loading, setLoading] = useState(false);
  const [aiReflection, setAiReflection] = useState<string | null>(null);
  const [loadingAi, setLoadingAi] = useState(false);
  const [previousScore, setPreviousScore] = useState<number | null>(null);
  const [showForm, setShowForm] = useState(true);
  const { user } = useAuth();
  const userTier = user?.subscription?.tier;
  const isPremium = userTier === "PREMIUM" || userTier === "ENTERPRISE";
  const isGuest = !user;

  useEffect(() => {
    fetch("/api/calculators?type=TIME_VALUE&limit=1")
      .then((r) => r.json())
      .then((json) => {
        if (json.results?.[0]) setPreviousScore(json.results[0].score);
      })
      .catch(() => {});
  }, []);

  const handleCalculate = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/calculators", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "TIME_VALUE", inputs }),
      });
      const json = await res.json();
      if (json.success) {
        setResult({
          score: json.result.score,
          outputs: json.result.outputs,
          interpretation: json.result.interpretation,
          suggestions: json.result.suggestions,
        });
        setShowForm(false);
        window.scrollTo({ top: 0, behavior: "smooth" });
      } else {
        toast.error(json.error || "Calculation failed.");
      }
    } catch {
      toast.error("Something went wrong.");
    }
    setLoading(false);
  };

  const requestAiReflection = async () => {
    if (!result) return;
    setLoadingAi(true);
    try {
      const res = await fetch("/api/ai/reflect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          scores: { "Time Allocation Score": result.score },
          calculatorType: "Time Value Optimizer",
        }),
      });
      const json = await res.json();
      if (json.success) setAiReflection(json.reflection);
      else toast.error(json.upgradeRequired ? "Upgrade to Premium for AI reflections." : "Reflection unavailable.");
    } catch {
      toast.error("Reflection failed.");
    }
    setLoadingAi(false);
  };

  const totalWakingHours = 7 * (24 - inputs.sleepHoursPerNight);
  const allocatedHours = inputs.workHoursPerWeek + inputs.personalGrowthHoursPerWeek + inputs.socialConnectionHoursPerWeek + inputs.leisureHoursPerWeek;
  const unaccountedHours = Math.max(0, totalWakingHours - allocatedHours);

  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center gap-2 text-xs text-slate-calm mb-2">
            <span>Calculators</span>
            <span>/</span>
            <span className="text-matte-black font-medium">Time Value</span>
          </div>
          <h1 className="font-serif text-2xl font-bold text-matte-black mb-1">Time Value Optimizer</h1>
          <p className="text-slate-calm text-sm">
            Analyze how you allocate your most finite resource — time — and discover where your hours align with what matters most.
          </p>
        </motion.div>

        {/* Results */}
        <AnimatePresence>
          {result && (
            <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <Card padding="lg" variant="elevated" className="border-t-4 border-t-soft-gold">
                <div className="flex flex-col md:flex-row items-center gap-8">
                  <div className="flex-shrink-0 flex flex-col items-center">
                    <ScoreRing score={result.score} size="xl" animate />
                    <p className="text-center text-xs text-slate-calm mt-2">Time Alignment Score</p>
                    <div className="mt-2">
                      <ScoreDelta current={result.score} previous={previousScore} />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h2 className="font-serif text-xl font-bold text-matte-black mb-3">
                      Your Score: {getScoreLabel(result.score)}
                    </h2>
                    <p className="text-sm text-slate-calm leading-relaxed mb-4">{result.interpretation}</p>
                    <div className="space-y-2 mb-4">
                      {[
                        { key: "workBalance", label: "Work-Life Balance" },
                        { key: "recoveryScore", label: "Rest & Recovery" },
                        { key: "growthScore", label: "Personal Growth" },
                        { key: "connectionScore", label: "Social Connection" },
                      ].map(({ key, label }) => (
                        <MetricBar key={key} label={label} score={result.outputs[key] || 0} animate />
                      ))}
                    </div>
                    <div className="mb-4">
                      <ScoreLegend currentScore={result.score} />
                    </div>
                    {isPremium ? (
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={requestAiReflection}
                        loading={loadingAi}
                        icon={<Sparkles className="w-3.5 h-3.5" />}
                      >
                        Get AI Reflection
                      </Button>
                    ) : (
                      <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-700 font-medium cursor-default">
                        <Crown className="w-3.5 h-3.5" /> AI Reflection — Premium
                      </div>
                    )}
                  </div>
                </div>

                {result.suggestions.length > 0 && (
                  <div className="mt-6 pt-6 border-t border-stone-100">
                    <h3 className="text-sm font-semibold text-matte-black mb-3">Time Reallocation Opportunities</h3>
                    <ul className="space-y-2">
                      {result.suggestions.map((s, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-slate-calm">
                          <span className="w-1 h-1 rounded-full bg-soft-gold mt-2 flex-shrink-0" />
                          {s}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="mt-6 pt-6 border-t border-stone-100">
                  <p className="stoic-quote text-xs">{getReflectionByCategory("time").text}</p>
                  {getReflectionByCategory("time").author && (
                    <p className="text-xs text-stone-400 mt-2 pl-4">— {getReflectionByCategory("time").author}</p>
                  )}
                </div>

                {aiReflection ? (
                  <div className="mt-6 pt-6 border-t border-stone-100">
                    <div className="flex items-center gap-2 mb-2">
                      <Sparkles className="w-4 h-4 text-soft-gold" />
                      <span className="text-xs font-semibold text-soft-gold uppercase tracking-widest">Logos — AI Reflection</span>
                    </div>
                    <p className="text-sm text-slate-calm italic font-serif leading-relaxed">{aiReflection}</p>
                    <p className="text-xs text-stone-400 mt-3 italic">Educational self-awareness purposes only.</p>
                  </div>
                ) : (
                  <LockedFeaturePanel
                    userTier={userTier}
                    isGuest={isGuest}
                    feature="Logos AI Reflection"
                    description="Get a personalised Stoic-inspired AI coaching insight on your Time Value score — understanding how intentionally you use your most finite resource and where reclamation is possible."
                    requiredTier="PREMIUM"
                  >
                    <div className="mt-4">
                      <Button variant="primary" size="sm" onClick={requestAiReflection} loading={loadingAi} icon={<Sparkles className="w-3.5 h-3.5" />}>
                        Get AI Reflection
                      </Button>
                    </div>
                  </LockedFeaturePanel>
                )}

                {/* Scenario simulator lock */}
                <SimulatorLockedPanel userTier={userTier} isGuest={isGuest} />

                {/* Goal setter */}
                <GoalSetter calculatorType="TIME_VALUE" currentScore={result.score} />

                {/* Next action strip */}
                <div className="mt-6 pt-6 border-t border-stone-100">
                  <p className="text-xs text-slate-calm mb-3">Continue your peace assessment</p>
                  <div className="flex flex-wrap gap-3">
                    <Link href="/calculators/financial-peace">
                      <div className="flex items-center gap-2 px-4 py-2 bg-stone-50 hover:bg-amber-50 border border-stone-200 hover:border-soft-gold rounded-xl transition-all text-sm font-medium text-matte-black cursor-pointer">
                        Next: Financial Peace <ArrowRight className="w-4 h-4 text-soft-gold" />
                      </div>
                    </Link>
                    <Link href="/journal">
                      <div className="flex items-center gap-2 px-4 py-2 bg-stone-50 hover:bg-amber-50 border border-stone-200 hover:border-soft-gold rounded-xl transition-all text-sm font-medium text-matte-black cursor-pointer">
                        Log a Decision <BookOpen className="w-4 h-4 text-soft-gold" />
                      </div>
                    </Link>
                    <Link href="/simulate">
                      <div className="flex items-center gap-2 px-4 py-2 bg-stone-50 hover:bg-amber-50 border border-stone-200 hover:border-soft-gold rounded-xl transition-all text-sm font-medium text-matte-black cursor-pointer">
                        Simulate Scenarios <Zap className="w-4 h-4 text-soft-gold" />
                      </div>
                    </Link>
                  </div>
                </div>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Form toggle */}
        {result && (
          <div className="flex justify-center">
            <button
              onClick={() => setShowForm(!showForm)}
              className="flex items-center gap-1.5 text-sm text-slate-calm hover:text-matte-black transition-colors py-2"
            >
              {showForm ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              {showForm ? "Hide inputs" : "Adjust inputs"}
            </button>
          </div>
        )}

        {/* Input form */}
        <AnimatePresence>
          {(!result || showForm) && (
            <motion.div
              key="form"
              initial={result ? { opacity: 0, height: 0 } : { opacity: 0, y: 16 }}
              animate={result ? { opacity: 1, height: "auto" } : { opacity: 1, y: 0 }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden"
            >
              <Card padding="lg">
                <CardHeader>
                  <CardTitle>Weekly Time Allocation</CardTitle>
                  <CardDescription>Enter your typical weekly hours. The optimizer compares your allocation against evidence-based well-being targets.</CardDescription>
                </CardHeader>
                <div className="space-y-6">
                  {/* Live time budget display */}
                  <div className="bg-stone-50 rounded-xl p-4 border border-stone-100">
                    <p className="text-xs font-semibold text-matte-black mb-1">Your Weekly Time Budget</p>
                    <div className="grid grid-cols-3 gap-3 text-center">
                      <div>
                        <p className="text-lg font-bold text-matte-black">{totalWakingHours.toFixed(0)}</p>
                        <p className="text-xs text-slate-calm">Waking hours/week</p>
                      </div>
                      <div>
                        <p className="text-lg font-bold text-soft-gold">{allocatedHours.toFixed(0)}</p>
                        <p className="text-xs text-slate-calm">Hours allocated</p>
                      </div>
                      <div>
                        <p className="text-lg font-bold text-matte-black">{unaccountedHours.toFixed(0)}</p>
                        <p className="text-xs text-slate-calm">Unaccounted hours</p>
                      </div>
                    </div>
                  </div>

                  <SliderField label="Sleep Hours Per Night" value={inputs.sleepHoursPerNight} onChange={(v) => setInputs({ ...inputs, sleepHoursPerNight: v })} min={4} max={10} step={0.5} minLabel="4 hrs" maxLabel="10 hrs" description="Your average nightly sleep duration" />
                  <NumberInput label="Work Hours Per Week" value={inputs.workHoursPerWeek} onChange={(v) => setInputs({ ...inputs, workHoursPerWeek: v })} suffix="hrs" min={0} max={120} description="Hours spent on primary professional work (including commute)" />
                  <NumberInput label="Personal Growth Hours" value={inputs.personalGrowthHoursPerWeek} onChange={(v) => setInputs({ ...inputs, personalGrowthHoursPerWeek: v })} suffix="hrs/wk" min={0} description="Learning, reading, skill development, meditation, journaling" />
                  <NumberInput label="Social Connection Hours" value={inputs.socialConnectionHoursPerWeek} onChange={(v) => setInputs({ ...inputs, socialConnectionHoursPerWeek: v })} suffix="hrs/wk" min={0} description="Quality time with family, friends, community" />
                  <NumberInput label="Leisure & Recreation Hours" value={inputs.leisureHoursPerWeek} onChange={(v) => setInputs({ ...inputs, leisureHoursPerWeek: v })} suffix="hrs/wk" min={0} description="Hobbies, entertainment, rest activities (excluding passive screen time)" />
                  <SliderField label="Purposeful Activity %" value={inputs.purposefulActivityPercent} onChange={(v) => setInputs({ ...inputs, purposefulActivityPercent: v })} min={0} max={100} step={5} minLabel="0%" maxLabel="100%" description="What % of your waking hours feel purposeful and intentional rather than reactive?" />
                  <SliderField label="Time Autonomy" value={inputs.timeAutonomy} onChange={(v) => setInputs({ ...inputs, timeAutonomy: v })} minLabel="No control" maxLabel="Full control" description="How much control do you have over how you spend your daily time? (1–10)" />

                  <Button
                    variant="gold"
                    fullWidth
                    size="lg"
                    loading={loading}
                    onClick={handleCalculate}
                    icon={<ArrowRight className="w-4 h-4" />}
                    iconPosition="right"
                  >
                    {result ? "Recalculate Score" : "Optimize My Time Allocation Score"}
                  </Button>
                  <p className="text-xs text-slate-calm text-center">
                    "It is not that we have so little time, but that we waste so much of it." — Seneca
                  </p>
                </div>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </DashboardLayout>
  );
}

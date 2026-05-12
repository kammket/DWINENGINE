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
import { Sparkles, ArrowRight, ChevronDown, ChevronUp, Zap } from "lucide-react";
import toast from "react-hot-toast";

type BurnoutRiskInputs = {
  workHoursPerWeek: number;
  vacationDaysPerYear: number;
  sleepHoursPerNight: number;
  exerciseDaysPerWeek: number;
  stressLevel: number;
  autonomyLevel: number;
  purposeAlignment: number;
  socialSupport: number;
  worklifeBalance: number;
};

const DEFAULT_INPUTS: BurnoutRiskInputs = {
  workHoursPerWeek: 45,
  vacationDaysPerYear: 10,
  sleepHoursPerNight: 7,
  exerciseDaysPerWeek: 2,
  stressLevel: 6,
  autonomyLevel: 5,
  purposeAlignment: 5,
  socialSupport: 5,
  worklifeBalance: 4,
};

export default function BurnoutRiskPage() {
  const [inputs, setInputs] = useState<BurnoutRiskInputs>(DEFAULT_INPUTS);
  const [result, setResult] = useState<{ score: number; outputs: Record<string, number>; interpretation: string; suggestions: string[] } | null>(null);
  const [loading, setLoading] = useState(false);
  const [aiReflection, setAiReflection] = useState<string | null>(null);
  const [loadingAi, setLoadingAi] = useState(false);
  const [previousScore, setPreviousScore] = useState<number | null>(null);
  const [showForm, setShowForm] = useState(true);

  useEffect(() => {
    fetch("/api/calculators?type=BURNOUT_RISK&limit=1")
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
        body: JSON.stringify({ type: "BURNOUT_RISK", inputs }),
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
          scores: { "Burnout Risk Index": result.score },
          calculatorType: "Burnout Risk Calculator",
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

  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center gap-2 text-xs text-slate-calm mb-2">
            <span>Calculators</span>
            <span>/</span>
            <span className="text-matte-black font-medium">Burnout Risk</span>
          </div>
          <h1 className="font-serif text-2xl font-bold text-matte-black mb-1">Burnout Risk Index</h1>
          <p className="text-slate-calm text-sm">
            Understand your current recovery capacity and what patterns are sustaining or depleting your energy.
          </p>
        </motion.div>

        {/* Results */}
        <AnimatePresence>
          {result && (
            <motion.div
              initial={{ opacity: 0, y: -16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
            >
              <Card padding="lg" variant="elevated" className="border-t-4 border-t-soft-gold">
                <div className="flex flex-col md:flex-row items-center gap-8">
                  <div className="flex-shrink-0 flex flex-col items-center">
                    <ScoreRing score={result.score} size="xl" animate />
                    <p className="text-center text-xs text-slate-calm mt-2">Burnout Resilience Score</p>
                    <div className="mt-2">
                      <ScoreDelta current={result.score} previous={previousScore} />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h2 className="font-serif text-xl font-bold text-matte-black mb-3">
                      Your Score: {getScoreLabel(result.score)}
                    </h2>
                    <p className="text-sm text-slate-calm leading-relaxed mb-4">
                      {result.interpretation}
                    </p>

                    <div className="space-y-2 mb-4">
                      {[
                        { key: "workloadScore", label: "Workload Balance" },
                        { key: "recoveryScore", label: "Recovery Quality" },
                        { key: "sleepScore", label: "Sleep Health" },
                        { key: "autonomyScore", label: "Autonomy & Purpose" },
                      ].map(({ key, label }) => (
                        <MetricBar key={key} label={label} score={result.outputs[key] || 0} animate />
                      ))}
                    </div>

                    <div className="mb-4">
                      <ScoreLegend currentScore={result.score} />
                    </div>

                    <Button
                      variant="primary"
                      size="sm"
                      onClick={requestAiReflection}
                      loading={loadingAi}
                      icon={<Sparkles className="w-3.5 h-3.5" />}
                    >
                      Get AI Reflection
                    </Button>
                  </div>
                </div>

                {result.suggestions.length > 0 && (
                  <div className="mt-6 pt-6 border-t border-stone-100">
                    <h3 className="text-sm font-semibold text-matte-black mb-3">Restoration Strategies</h3>
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
                  <p className="stoic-quote text-xs">{getReflectionByCategory("recovery").text}</p>
                  {getReflectionByCategory("recovery").author && (
                    <p className="text-xs text-stone-400 mt-2 pl-4">— {getReflectionByCategory("recovery").author}</p>
                  )}
                </div>

                {aiReflection && (
                  <div className="mt-6 pt-6 border-t border-stone-100">
                    <div className="flex items-center gap-2 mb-2">
                      <Sparkles className="w-4 h-4 text-soft-gold" />
                      <span className="text-xs font-semibold text-soft-gold uppercase tracking-widest">Logos — AI Reflection</span>
                    </div>
                    <p className="text-sm text-slate-calm italic font-serif leading-relaxed">{aiReflection}</p>
                    <p className="text-xs text-stone-400 mt-3 italic">
                      Educational self-awareness purposes only. Not medical advice.
                    </p>
                  </div>
                )}

                {/* Goal setter */}
                <GoalSetter calculatorType="BURNOUT_RISK" currentScore={result.score} />

                {/* Next action strip */}
                <div className="mt-6 pt-6 border-t border-stone-100">
                  <p className="text-xs text-slate-calm mb-3">Continue your peace assessment</p>
                  <div className="flex flex-wrap gap-3">
                    <Link href="/calculators/relationship-sustainability">
                      <div className="flex items-center gap-2 px-4 py-2 bg-stone-50 hover:bg-amber-50 border border-stone-200 hover:border-soft-gold rounded-xl transition-all text-sm font-medium text-matte-black cursor-pointer">
                        Next: Relationship Health <ArrowRight className="w-4 h-4 text-soft-gold" />
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
                  <CardTitle>Work & Lifestyle Inputs</CardTitle>
                  <CardDescription>Your responses measure resilience factors — not a clinical diagnosis.</CardDescription>
                </CardHeader>

                <div className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-4">
                    <NumberInput
                      label="Work Hours Per Week"
                      value={inputs.workHoursPerWeek}
                      onChange={(v) => setInputs({ ...inputs, workHoursPerWeek: v })}
                      suffix="hrs"
                      min={0}
                      max={100}
                      description="Average total weekly work hours"
                    />
                    <NumberInput
                      label="Vacation Days Per Year"
                      value={inputs.vacationDaysPerYear}
                      onChange={(v) => setInputs({ ...inputs, vacationDaysPerYear: v })}
                      suffix="days"
                      min={0}
                      max={365}
                      description="Planned or taken time off annually"
                    />
                  </div>

                  <SliderField
                    label="Sleep Hours Per Night"
                    value={inputs.sleepHoursPerNight}
                    onChange={(v) => setInputs({ ...inputs, sleepHoursPerNight: v })}
                    min={4}
                    max={10}
                    step={0.5}
                    minLabel="4 hrs"
                    maxLabel="10 hrs"
                    description="Your typical nightly sleep duration"
                  />

                  <SliderField
                    label="Exercise Days Per Week"
                    value={inputs.exerciseDaysPerWeek}
                    onChange={(v) => setInputs({ ...inputs, exerciseDaysPerWeek: v })}
                    min={0}
                    max={7}
                    step={1}
                    minLabel="None"
                    maxLabel="Daily"
                    description="Days per week you engage in intentional physical activity"
                  />

                  <SliderField
                    label="Overall Stress Level"
                    value={inputs.stressLevel}
                    onChange={(v) => setInputs({ ...inputs, stressLevel: v })}
                    minLabel="Minimal"
                    maxLabel="Overwhelming"
                    description="Your perceived overall stress from work and life (1 = minimal, 10 = overwhelming)"
                  />

                  <SliderField
                    label="Autonomy & Control"
                    value={inputs.autonomyLevel}
                    onChange={(v) => setInputs({ ...inputs, autonomyLevel: v })}
                    minLabel="No control"
                    maxLabel="Full control"
                    description="How much control do you have over your work and schedule? (1 = very little, 10 = complete)"
                  />

                  <SliderField
                    label="Purpose Alignment"
                    value={inputs.purposeAlignment}
                    onChange={(v) => setInputs({ ...inputs, purposeAlignment: v })}
                    minLabel="Disconnected"
                    maxLabel="Deeply aligned"
                    description="How meaningful and aligned with your values is your daily work? (1 = not at all, 10 = deeply)"
                  />

                  <SliderField
                    label="Social Support"
                    value={inputs.socialSupport}
                    onChange={(v) => setInputs({ ...inputs, socialSupport: v })}
                    minLabel="Isolated"
                    maxLabel="Strong network"
                    description="Quality of your support network (friends, colleagues, mentors) (1 = poor, 10 = excellent)"
                  />

                  <SliderField
                    label="Work-Life Balance"
                    value={inputs.worklifeBalance}
                    onChange={(v) => setInputs({ ...inputs, worklifeBalance: v })}
                    minLabel="Poor balance"
                    maxLabel="Excellent balance"
                    description="How well do you maintain boundaries between work and personal life? (1 = poor, 10 = excellent)"
                  />

                  <Button
                    variant="gold"
                    fullWidth
                    size="lg"
                    loading={loading}
                    onClick={handleCalculate}
                    icon={<ArrowRight className="w-4 h-4" />}
                    iconPosition="right"
                  >
                    {result ? "Recalculate Score" : "Calculate My Burnout Risk Index"}
                  </Button>

                  <p className="text-xs text-slate-calm text-center">
                    This is an educational index, not a medical assessment. If you are concerned about burnout, consult a healthcare professional.
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

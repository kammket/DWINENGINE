"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { motion, AnimatePresence, useSpring, useTransform, useMotionValue, animate } from "framer-motion";
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
import { Sparkles, ArrowRight, ChevronDown, ChevronUp, Zap, BookOpen, Crown, BarChart3, MessageCircle, RefreshCw, Printer } from "lucide-react";
import toast from "react-hot-toast";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { HowItWorks } from "@/components/ui/HowItWorks";
import { WhatNextCard } from "@/components/ui/WhatNextCard";
import { CompletionCelebration } from "@/components/ui/CompletionCelebration";

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
  const [showCelebration, setShowCelebration] = useState(false);
  const scoreMotion = useMotionValue(0);
  const [displayScore, setDisplayScore] = useState(0);
  const { user } = useAuth();

  // Count-up animation whenever result.score changes
  useEffect(() => {
    if (!result) return;
    const controls = animate(scoreMotion, result.score, {
      duration: 1.2,
      ease: "easeOut",
      onUpdate: (v) => setDisplayScore(Math.round(v)),
    });
    return controls.stop;
  }, [result?.score]);

  /** Client-side rough preview (directional, not exact) */
  const liveEstimate = useMemo(() => {
    const workOk = Math.max(0, Math.min(100, 100 - Math.max(0, inputs.workHoursPerWeek - 40) * 2));
    const sleepOk = inputs.sleepHoursPerNight >= 7 ? 100 : (inputs.sleepHoursPerNight / 7) * 100;
    const exercOk = (inputs.exerciseDaysPerWeek / 5) * 100;
    const stressOk = ((10 - inputs.stressLevel) / 9) * 100;
    const autoOk = ((inputs.autonomyLevel - 1) / 9) * 100;
    const purpOk = ((inputs.purposeAlignment - 1) / 9) * 100;
    const socOk = ((inputs.socialSupport - 1) / 9) * 100;
    const balOk = ((inputs.worklifeBalance - 1) / 9) * 100;
    const vacOk = Math.min(100, (inputs.vacationDaysPerYear / 25) * 100);
    return Math.round(
      workOk * 0.15 + sleepOk * 0.15 + exercOk * 0.1 +
      stressOk * 0.15 + autoOk * 0.1 + purpOk * 0.1 +
      socOk * 0.1 + balOk * 0.1 + vacOk * 0.05
    );
  }, [inputs]);
  const userTier = user?.subscription?.tier;
  const isPremium = userTier === "PREMIUM" || userTier === "ENTERPRISE";
  const isGuest = !user;

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
        const newScore = json.result.score;
        setResult({
          score: newScore,
          outputs: json.result.outputs,
          interpretation: json.result.interpretation,
          suggestions: json.result.suggestions,
        });
        setShowForm(false);
        window.scrollTo({ top: 0, behavior: "smooth" });
        toast.success(
          <span className="flex items-center gap-2">
            Score saved!
            <button
              onClick={() => { window.scrollTo({ top: 0, behavior: "smooth" }); }}
              className="text-soft-gold font-semibold hover:underline"
            >
              View ↑
            </button>
          </span>,
          { duration: 4000 }
        );
        // Check if this completes all 5 calculators
        try {
          const allRes = await fetch("/api/calculators?limit=20");
          const allJson = await allRes.json();
          if (allJson.success) {
            const types = new Set(allJson.results.map((r: { type: string }) => r.type));
            types.add("BURNOUT_RISK");
            if (types.size >= 5) setShowCelebration(true);
          }
        } catch { /* non-critical */ }
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
      <CompletionCelebration
        show={showCelebration}
        onDone={() => setShowCelebration(false)}
      />
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
          <Breadcrumb
            className="mb-2"
            items={[
              { label: "Calculators", href: "/calculators" },
              { label: "Burnout Risk" },
            ]}
          />
          <h1 className="font-serif text-2xl font-bold mb-1" style={{ color: "var(--page-text)" }}>Burnout Risk Index</h1>
          <p className="text-slate-calm text-sm">
            Understand your current recovery capacity and what patterns are sustaining or depleting your energy.
          </p>
        </motion.div>

        {/* How it works accordion */}
        <HowItWorks
          summary="This index converts nine evidence-based lifestyle dimensions into a single Burnout Resilience score (0–100). Higher is better — a score of 75+ indicates a sustainable work rhythm."
          steps={[
            { title: "Workload", body: "Work hours and vacation days are weighted against evidence-based thresholds. Beyond 50 hrs/week productivity and recovery both degrade measurably." },
            { title: "Recovery quality", body: "Sleep duration, exercise frequency, and work-life balance are combined into a Recovery Score. Sleep under 6 hrs is the single strongest burnout predictor." },
            { title: "Psychological factors", body: "Autonomy, purpose alignment, and social support are scored independently. Low autonomy combined with high stress is the classic burnout precondition." },
            { title: "Composite index", body: "All four sub-scores are weighted and combined. Workload and recovery carry slightly higher weight as they are most structurally changeable." },
          ]}
          disclaimer="This is an educational index, not a clinical assessment. It does not diagnose burnout or any medical condition."
        />

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
                    <ScoreRing score={displayScore} size="xl" animate />
                    <p className="text-center text-xs text-slate-calm mt-2">Burnout Resilience Score</p>
                    <div className="mt-2">
                      <ScoreDelta current={result.score} previous={previousScore} />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <h2 className="font-serif text-xl font-bold text-matte-black">
                        Your Score: {getScoreLabel(result.score)}
                      </h2>
                      <button
                        onClick={() => window.print()}
                        title="Print / Save as PDF"
                        className="print:hidden flex items-center gap-1 text-xs text-stone-400 hover:text-matte-black transition-colors px-2 py-1 rounded-lg hover:bg-stone-100 flex-shrink-0"
                      >
                        <Printer className="w-3.5 h-3.5" /> PDF
                      </button>
                    </div>
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

                {aiReflection ? (
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
                ) : (
                  <LockedFeaturePanel
                    userTier={userTier}
                    isGuest={isGuest}
                    feature="Logos AI Reflection"
                    description="Get a personalised Stoic-inspired AI coaching insight on your Burnout Risk score — understanding recovery patterns, workload signals, and your highest-leverage resilience action."
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
                <GoalSetter calculatorType="BURNOUT_RISK" currentScore={result.score} />

                {/* What's next card */}
                <div className="mt-6">
                  <WhatNextCard
                    score={result.score}
                    calculatorType="BURNOUT_RISK"
                    nextSteps={[
                      { href: "/calculators/relationship-sustainability", icon: ArrowRight, label: "Relationship Health", description: "Your social support score links directly to relationship sustainability.", highlight: true },
                      { href: "/simulate", icon: Zap, label: "Simulate a Change", description: "See how adjusting work hours or sleep would shift your score." },
                      { href: "/journal", icon: BookOpen, label: "Log a Reflection", description: "Journal the insight that surprised you most from this result." },
                      { href: "/calculators/time-value", icon: BarChart3, label: "Time Value Calculator", description: "Low energy and low time scores often share the same root cause." },
                    ]}
                  />
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

                <div className="flex items-start gap-2.5 bg-amber-50 border border-amber-100 rounded-xl px-4 py-3 mb-2">
                  <span className="text-base flex-shrink-0 mt-0.5">🪞</span>
                  <p className="text-xs text-amber-800/80 leading-relaxed">
                    <span className="font-semibold">Honest answers give accurate results.</span> Your inputs are private — only you see them. Reflect your actual situation, not the one you wish you had. The mirror only works if you look into it directly.
                  </p>
                </div>

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
                    benchmark={7.5}
                    hints={[
                      { upTo: 5, text: "Under 6 hrs significantly impairs decision-making and elevates cortisol — the single strongest burnout predictor." },
                      { upTo: 6.5, text: "Borderline range. Most adults need 7–9 hrs for full emotional and cognitive recovery." },
                      { upTo: 8, text: "Healthy range — sufficient sleep supports emotional regulation and immune resilience." },
                      { upTo: Infinity, text: "Excellent sleep duration — strong recovery foundation." },
                    ]}
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
                    benchmark={3}
                    hints={[
                      { upTo: 0, text: "No regular movement — exercise is one of the fastest burnout recovery levers available." },
                      { upTo: 2, text: "Below recommended levels. Even 2 × 30-min walks per week measurably reduces stress hormones." },
                      { upTo: 5, text: "Healthy range — consistent movement supports cortisol regulation and sleep quality." },
                      { upTo: Infinity, text: "Daily exercise — excellent recovery signal, ensure adequate rest days to avoid overtraining." },
                    ]}
                  />

                  <SliderField
                    label="Overall Stress Level"
                    value={inputs.stressLevel}
                    onChange={(v) => setInputs({ ...inputs, stressLevel: v })}
                    minLabel="Minimal"
                    maxLabel="Overwhelming"
                    description="Your perceived overall stress from work and life (1 = minimal, 10 = overwhelming)"
                    benchmark={5}
                    hints={[
                      { upTo: 3, text: "Low stress — protective against burnout. Ensure this reflects reality and not suppression." },
                      { upTo: 6, text: "Moderate stress — sustainable short-term, but needs active management if chronic." },
                      { upTo: 8, text: "Elevated stress — this range is where burnout risk accelerates significantly." },
                      { upTo: Infinity, text: "Extreme stress — immediate structural change is recommended, not coping strategies alone." },
                    ]}
                  />

                  <SliderField
                    label="Autonomy & Control"
                    value={inputs.autonomyLevel}
                    onChange={(v) => setInputs({ ...inputs, autonomyLevel: v })}
                    minLabel="No control"
                    maxLabel="Full control"
                    description="How much control do you have over your work and schedule? (1 = very little, 10 = complete)"
                    benchmark={6}
                    hints={[
                      { upTo: 3, text: "Very low autonomy is the classic burnout precondition — high effort with low control depletes faster than any other pattern." },
                      { upTo: 6, text: "Partial control — find one area where you can reclaim decision-making authority." },
                      { upTo: Infinity, text: "High autonomy — strong protective factor. Use it to actively protect recovery time." },
                    ]}
                  />

                  <SliderField
                    label="Purpose Alignment"
                    value={inputs.purposeAlignment}
                    onChange={(v) => setInputs({ ...inputs, purposeAlignment: v })}
                    minLabel="Disconnected"
                    maxLabel="Deeply aligned"
                    description="How meaningful and aligned with your values is your daily work? (1 = not at all, 10 = deeply)"
                    benchmark={5}
                    hints={[
                      { upTo: 3, text: "Low purpose alignment — you may be working hard toward goals that don't feel yours. This erodes intrinsic motivation faster than workload alone." },
                      { upTo: 6, text: "Moderate alignment — identify one task per day that feels genuinely meaningful to anchor focus." },
                      { upTo: Infinity, text: "Strong purpose alignment — a significant burnout buffer. Protect activities that reinforce this." },
                    ]}
                  />

                  <SliderField
                    label="Social Support"
                    value={inputs.socialSupport}
                    onChange={(v) => setInputs({ ...inputs, socialSupport: v })}
                    minLabel="Isolated"
                    maxLabel="Strong network"
                    description="Quality of your support network (friends, colleagues, mentors) (1 = poor, 10 = excellent)"
                    benchmark={6}
                    hints={[
                      { upTo: 3, text: "Low social support is strongly correlated with burnout severity and slower recovery. Even one trusted person to talk to changes outcomes." },
                      { upTo: 6, text: "Moderate support — consider one proactive outreach per week to strengthen this." },
                      { upTo: Infinity, text: "Strong support network — a significant resilience asset. Lean on it deliberately when workload spikes." },
                    ]}
                  />

                  <SliderField
                    label="Work-Life Balance"
                    value={inputs.worklifeBalance}
                    onChange={(v) => setInputs({ ...inputs, worklifeBalance: v })}
                    minLabel="Poor balance"
                    maxLabel="Excellent balance"
                    description="How well do you maintain boundaries between work and personal life? (1 = poor, 10 = excellent)"
                    benchmark={5}
                    hints={[
                      { upTo: 3, text: "Poor boundaries — work is bleeding into recovery time. Without structural separation, recovery cannot occur even on days off." },
                      { upTo: 6, text: "Moderate balance — identify your one most-violated boundary and protect it for 30 days." },
                      { upTo: Infinity, text: "Strong boundaries — excellent structural protection. Maintain this actively as workload increases." },
                    ]}
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

        {/* SEO: What this calculator measures */}
        <section className="bg-white rounded-3xl p-6 shadow-sm border border-stone-100">
          <h2 className="font-serif text-lg font-bold text-matte-black mb-3">What the Burnout Risk Calculator Measures</h2>
          <p className="text-sm text-slate-calm mb-4">The Burnout Risk Calculator measures your resilience across nine evidence-based dimensions tied to occupational burnout research. It converts work hours, recovery quality, sleep, and autonomy into a single Burnout Resilience Index (0–100).</p>
          <ul className="grid sm:grid-cols-2 gap-2">
            {[
              "Weekly work hours vs recovery",
              "Vacation & disconnection frequency",
              "Sleep duration & quality",
              "Exercise frequency",
              "Perceived stress",
              "Autonomy & control",
              "Purpose alignment",
              "Social support",
              "Work-life balance perception",
            ].map((f) => (
              <li key={f} className="flex items-center gap-2 text-sm text-slate-calm">
                <span className="w-1.5 h-1.5 rounded-full bg-soft-gold shrink-0" />
                {f}
              </li>
            ))}
          </ul>
        </section>

        {/* SEO: FAQ */}
        <section className="bg-white rounded-3xl p-6 shadow-sm border border-stone-100">
          <h2 className="font-serif text-lg font-bold text-matte-black mb-4">Frequently Asked Questions</h2>
          <div className="space-y-4">
            {[
              { q: "What is a burnout risk calculator?", a: "A burnout risk calculator measures your resilience across nine evidence-based dimensions: workload intensity, recovery quality, sleep adequacy, exercise frequency, perceived stress, autonomy and control, purpose alignment, social support, and work-life boundary strength. Each dimension is scored and weighted to produce a composite Burnout Resilience Index from 0–100. Higher scores mean greater resilience, not greater risk." },
              { q: "What is a good burnout resilience score?", a: "A score of 75–100 indicates a genuinely sustainable work rhythm with strong recovery habits. 55–74 is functional but shows clear areas to improve before depletion accumulates. Below 55 signals elevated burnout risk — one or more dimensions are structurally unsustainable. Below 40 represents high risk requiring immediate attention to workload, sleep, or autonomy." },
              { q: "How many hours of work per week causes burnout?", a: "Stanford research shows productivity per hour drops sharply after 50 hours per week and becomes negligible beyond 55 hours. Chronically working 60+ hours per week is a strong burnout predictor, particularly when combined with low autonomy or poor sleep. The burnout calculator weights hours in the context of recovery quality — someone working 55 hours with excellent sleep and autonomy may score significantly better than someone working 45 hours with chronic poor sleep and high perceived stress." },
              { q: "Can you recover from burnout?", a: "Yes, burnout is recoverable, but recovery follows a logarithmic curve — not a linear one. Initial improvement after reducing workload or improving sleep can be rapid, but full restoration of cognitive and emotional capacity from severe burnout typically takes 6–18 months of sustained low stress. This is why prevention — measured through a regular burnout risk score — is far more effective than recovery as a strategy." },
              { q: "Is the burnout risk calculator free?", a: "Yes, the Burnout Risk Calculator is completely free with no credit card required. You can run the assessment as many times as needed and save your score history with a free account to track your resilience trend over time." },
            ].map(({ q, a }) => (
              <details key={q} className="group border-b border-stone-100 last:border-0 pb-4 last:pb-0">
                <summary className="text-sm font-semibold text-matte-black cursor-pointer list-none flex items-center justify-between gap-2 py-1">
                  {q}
                  <span className="text-stone-400 text-lg leading-none group-open:rotate-45 transition-transform">+</span>
                </summary>
                <p className="text-sm text-slate-calm leading-relaxed mt-2">{a}</p>
              </details>
            ))}
          </div>
        </section>

        {/* SEO: Related blog posts */}
        <section className="bg-white rounded-3xl p-6 shadow-sm border border-stone-100">
          <h2 className="font-serif text-lg font-bold text-matte-black mb-3">Further Reading</h2>
          <div className="space-y-3">
            {[
              { href: "/blog/how-to-calculate-burnout-risk", title: "How to Calculate Your Burnout Risk Before It's Too Late", excerpt: "A quantitative burnout risk score turns a vague sense of dread into a number you can act on." },
            ].map((post) => (
              <Link key={post.href} href={post.href} className="flex items-start gap-3 group">
                <span className="w-1.5 h-1.5 rounded-full bg-soft-gold mt-2 shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-matte-black group-hover:text-soft-gold transition-colors">{post.title}</p>
                  <p className="text-xs text-slate-calm mt-0.5">{post.excerpt}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      </div>
      {/* Sticky live-estimate bar — visible while form is open */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ y: 80 }}
            animate={{ y: 0 }}
            exit={{ y: 80 }}
            transition={{ type: "spring", stiffness: 320, damping: 28 }}
            className="fixed bottom-0 left-0 right-0 z-40 print:hidden"
          >
            <div className="md:ml-64">
              <div className="mx-auto max-w-3xl px-4 pb-4">
                <div className="flex items-center justify-between bg-matte-black text-warm-white rounded-2xl px-5 py-3 shadow-xl">
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-stone-400">Live estimate</span>
                    <span className="text-lg font-bold text-soft-gold">{liveEstimate}</span>
                    <span className="text-xs text-stone-400">/ 100</span>
                    {/* Mini bar */}
                    <div className="w-24 h-1.5 bg-stone-700 rounded-full overflow-hidden">
                      <motion.div
                        className="h-full rounded-full bg-gradient-to-r from-brand-400 to-soft-gold"
                        animate={{ width: `${liveEstimate}%` }}
                        transition={{ duration: 0.3 }}
                      />
                    </div>
                  </div>
                  <Button
                    variant="gold"
                    size="sm"
                    onClick={handleCalculate}
                    loading={loading}
                  >
                    Calculate
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </DashboardLayout>
  );
}

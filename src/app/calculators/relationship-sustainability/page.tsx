"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { DashboardLayout } from "@/components/layout/Sidebar";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { ScoreRing, MetricBar, ScoreDelta, ScoreLegend } from "@/components/ui/ScoreVisuals";
import { SliderField } from "@/components/ui/FormFields";
import { getScoreLabel } from "@/types";
import { getReflectionByCategory } from "@/lib/stoic";
import { GoalSetter } from "@/components/ui/GoalSetter";
import { Sparkles, ArrowRight, ChevronDown, ChevronUp, Zap } from "lucide-react";
import toast from "react-hot-toast";

type RelationshipSustainabilityInputs = {
  communicationQuality: number;
  conflictResolution: number;
  sharedValues: number;
  emotionalIntimacy: number;
  mutualRespect: number;
  personalGrowthSupport: number;
  qualityTimeInvestment: number;
  trustLevel: number;
};

const DEFAULT_INPUTS: RelationshipSustainabilityInputs = {
  communicationQuality: 5,
  conflictResolution: 5,
  sharedValues: 6,
  emotionalIntimacy: 5,
  mutualRespect: 7,
  personalGrowthSupport: 5,
  qualityTimeInvestment: 5,
  trustLevel: 6,
};

export default function RelationshipSustainabilityPage() {
  const [inputs, setInputs] = useState<RelationshipSustainabilityInputs>(DEFAULT_INPUTS);
  const [result, setResult] = useState<{ score: number; outputs: Record<string, number>; interpretation: string; suggestions: string[] } | null>(null);
  const [loading, setLoading] = useState(false);
  const [aiReflection, setAiReflection] = useState<string | null>(null);
  const [loadingAi, setLoadingAi] = useState(false);
  const [previousScore, setPreviousScore] = useState<number | null>(null);
  const [showForm, setShowForm] = useState(true);

  useEffect(() => {
    fetch("/api/calculators?type=RELATIONSHIP_SUSTAINABILITY&limit=1")
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
        body: JSON.stringify({ type: "RELATIONSHIP_SUSTAINABILITY", inputs }),
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
          scores: { "Relationship Sustainability Index": result.score },
          calculatorType: "Relationship Sustainability Calculator",
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
            <span className="text-matte-black font-medium">Relationship Sustainability</span>
          </div>
          <h1 className="font-serif text-2xl font-bold text-matte-black mb-1">Relationship Sustainability Index</h1>
          <p className="text-slate-calm text-sm">
            Evaluate the long-term health of your closest relationship using evidence-based relational psychology indicators.
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
                    <p className="text-center text-xs text-slate-calm mt-2">Sustainability Index</p>
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
                        { key: "communicationScore", label: "Communication" },
                        { key: "conflictScore", label: "Conflict Resolution" },
                        { key: "intimacyScore", label: "Emotional Intimacy" },
                        { key: "trustScore", label: "Trust & Respect" },
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
                    <h3 className="text-sm font-semibold text-matte-black mb-3">Areas to Nurture</h3>
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
                  <p className="stoic-quote text-xs">{getReflectionByCategory("relationships").text}</p>
                  {getReflectionByCategory("relationships").author && (
                    <p className="text-xs text-stone-400 mt-2 pl-4">— {getReflectionByCategory("relationships").author}</p>
                  )}
                </div>

                {aiReflection && (
                  <div className="mt-6 pt-6 border-t border-stone-100">
                    <div className="flex items-center gap-2 mb-2">
                      <Sparkles className="w-4 h-4 text-soft-gold" />
                      <span className="text-xs font-semibold text-soft-gold uppercase tracking-widest">Logos — AI Reflection</span>
                    </div>
                    <p className="text-sm text-slate-calm italic font-serif leading-relaxed">{aiReflection}</p>
                    <p className="text-xs text-stone-400 mt-3 italic">Educational self-awareness purposes only. Not relationship therapy or counseling.</p>
                  </div>
                )}

                {/* Goal setter */}
                <GoalSetter calculatorType="RELATIONSHIP_SUSTAINABILITY" currentScore={result.score} />

                {/* Next action strip */}
                <div className="mt-6 pt-6 border-t border-stone-100">
                  <p className="text-xs text-slate-calm mb-3">Continue your peace assessment</p>
                  <div className="flex flex-wrap gap-3">
                    <Link href="/calculators/decision-regret">
                      <div className="flex items-center gap-2 px-4 py-2 bg-stone-50 hover:bg-amber-50 border border-stone-200 hover:border-soft-gold rounded-xl transition-all text-sm font-medium text-matte-black cursor-pointer">
                        Next: Decision Quality <ArrowRight className="w-4 h-4 text-soft-gold" />
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
                  <CardTitle>Relationship Quality Inputs</CardTitle>
                  <CardDescription>Reflect honestly on your primary relationship. All responses are private and used only to compute your index.</CardDescription>
                </CardHeader>
                <div className="space-y-6">
                  <SliderField label="Communication Quality" value={inputs.communicationQuality} onChange={(v) => setInputs({ ...inputs, communicationQuality: v })} minLabel="Poor" maxLabel="Excellent" description="How openly and effectively do you communicate needs, feelings, and boundaries? (1–10)" />
                  <SliderField label="Conflict Resolution" value={inputs.conflictResolution} onChange={(v) => setInputs({ ...inputs, conflictResolution: v })} minLabel="Destructive" maxLabel="Constructive" description="How well do you navigate and resolve disagreements without lasting damage? (1–10)" />
                  <SliderField label="Shared Values" value={inputs.sharedValues} onChange={(v) => setInputs({ ...inputs, sharedValues: v })} minLabel="Misaligned" maxLabel="Deeply aligned" description="How aligned are your core values, life goals, and priorities? (1–10)" />
                  <SliderField label="Emotional Intimacy" value={inputs.emotionalIntimacy} onChange={(v) => setInputs({ ...inputs, emotionalIntimacy: v })} minLabel="Distant" maxLabel="Deeply connected" description="How emotionally close and understood do you feel in this relationship? (1–10)" />
                  <SliderField label="Mutual Respect" value={inputs.mutualRespect} onChange={(v) => setInputs({ ...inputs, mutualRespect: v })} minLabel="Disrespectful" maxLabel="Highly respectful" description="How consistently do you both treat each other with dignity and respect? (1–10)" />
                  <SliderField label="Personal Growth Support" value={inputs.personalGrowthSupport} onChange={(v) => setInputs({ ...inputs, personalGrowthSupport: v })} minLabel="Stifling" maxLabel="Encouraging" description="Does this relationship encourage your individual growth and aspirations? (1–10)" />
                  <SliderField label="Quality Time Investment" value={inputs.qualityTimeInvestment} onChange={(v) => setInputs({ ...inputs, qualityTimeInvestment: v })} minLabel="Neglected" maxLabel="Consistently invested" description="How intentionally and meaningfully do you invest time together? (1–10)" />
                  <SliderField label="Trust Level" value={inputs.trustLevel} onChange={(v) => setInputs({ ...inputs, trustLevel: v })} minLabel="Broken trust" maxLabel="Absolute trust" description="How much do you trust your partner's reliability, honesty, and intentions? (1–10)" />

                  <Button
                    variant="gold"
                    fullWidth
                    size="lg"
                    loading={loading}
                    onClick={handleCalculate}
                    icon={<ArrowRight className="w-4 h-4" />}
                    iconPosition="right"
                  >
                    {result ? "Recalculate Score" : "Calculate Relationship Sustainability Index"}
                  </Button>
                  <p className="text-xs text-slate-calm text-center">
                    This is an educational index only. It is not couples therapy or a substitute for professional counseling.
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

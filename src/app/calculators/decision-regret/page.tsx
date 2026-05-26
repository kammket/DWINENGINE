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
import { LockedFeaturePanel, SimulatorLockedPanel } from "@/components/ui/LockedFeaturePanel";
import { useAuth } from "@/components/providers/AuthProvider";
import { Sparkles, ArrowRight, ChevronDown, ChevronUp, Zap, BookOpen, Crown } from "lucide-react";
import toast from "react-hot-toast";

type DecisionRegretInputs = {
  decisionClarity: number;
  alternativesConsidered: number;
  emotionalNeutrality: number;
  valueAlignment: number;
  informationAdequacy: number;
  reversibility: number;
  futureRegretAnticipation: number;
};

const DEFAULT_INPUTS: DecisionRegretInputs = {
  decisionClarity: 5,
  alternativesConsidered: 5,
  emotionalNeutrality: 5,
  valueAlignment: 6,
  informationAdequacy: 5,
  reversibility: 5,
  futureRegretAnticipation: 5,
};

export default function DecisionRegretPage() {
  const [inputs, setInputs] = useState<DecisionRegretInputs>(DEFAULT_INPUTS);
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
    fetch("/api/calculators?type=DECISION_REGRET&limit=1")
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
        body: JSON.stringify({ type: "DECISION_REGRET", inputs }),
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
          scores: { "Decision Quality Index": result.score },
          calculatorType: "Decision Regret Minimizer",
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
            <span className="text-matte-black font-medium">Decision Regret</span>
          </div>
          <h1 className="font-serif text-2xl font-bold text-matte-black mb-1">Decision Regret Minimizer</h1>
          <p className="text-slate-calm text-sm">
            Evaluate the quality of a pending decision before you make it, minimizing future regret using Stoic decision frameworks.
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
                    <p className="text-center text-xs text-slate-calm mt-2">Decision Quality Index</p>
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
                        { key: "clarityScore", label: "Decision Clarity" },
                        { key: "emotionScore", label: "Emotional Neutrality" },
                        { key: "alignmentScore", label: "Values Alignment" },
                        { key: "informationScore", label: "Information Quality" },
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
                    <h3 className="text-sm font-semibold text-matte-black mb-3">Clarity Pathways</h3>
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
                  <p className="stoic-quote text-xs">{getReflectionByCategory("decisions").text}</p>
                  {getReflectionByCategory("decisions").author && (
                    <p className="text-xs text-stone-400 mt-2 pl-4">— {getReflectionByCategory("decisions").author}</p>
                  )}
                </div>

                {aiReflection ? (
                  <div className="mt-6 pt-6 border-t border-stone-100">
                    <div className="flex items-center gap-2 mb-2">
                      <Sparkles className="w-4 h-4 text-soft-gold" />
                      <span className="text-xs font-semibold text-soft-gold uppercase tracking-widest">Logos — AI Reflection</span>
                    </div>
                    <p className="text-sm text-slate-calm italic font-serif leading-relaxed">{aiReflection}</p>
                    <p className="text-xs text-stone-400 mt-3 italic">Educational purposes only. Not a substitute for professional guidance.</p>
                  </div>
                ) : (
                  <LockedFeaturePanel
                    userTier={userTier}
                    isGuest={isGuest}
                    feature="Logos AI Reflection"
                    description="Get a personalised Stoic-inspired AI coaching insight on your Decision Quality score — exploring clarity gaps, value alignment, and how to approach this decision with greater confidence."
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
                <GoalSetter calculatorType="DECISION_REGRET" currentScore={result.score} />

                {/* Next action strip */}
                <div className="mt-6 pt-6 border-t border-stone-100">
                  <p className="text-xs text-slate-calm mb-3">Continue your peace assessment</p>
                  <div className="flex flex-wrap gap-3">
                    <Link href="/calculators/time-value">
                      <div className="flex items-center gap-2 px-4 py-2 bg-stone-50 hover:bg-amber-50 border border-stone-200 hover:border-soft-gold rounded-xl transition-all text-sm font-medium text-matte-black cursor-pointer">
                        Next: Time Value <ArrowRight className="w-4 h-4 text-soft-gold" />
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
                  <CardTitle>Decision Quality Assessment</CardTitle>
                  <CardDescription>Think of a specific decision you are currently facing and rate each factor honestly.</CardDescription>
                </CardHeader>
                <div className="space-y-6">
                  <SliderField label="Decision Clarity" value={inputs.decisionClarity} onChange={(v) => setInputs({ ...inputs, decisionClarity: v })} minLabel="Very unclear" maxLabel="Crystal clear" description="How clearly can you articulate the decision and what success looks like? (1–10)" />
                  <SliderField label="Alternatives Considered" value={inputs.alternativesConsidered} onChange={(v) => setInputs({ ...inputs, alternativesConsidered: v })} minLabel="Only one path" maxLabel="Many options explored" description="How thoroughly have you identified and evaluated alternative options? (1–10)" />
                  <SliderField label="Emotional Neutrality" value={inputs.emotionalNeutrality} onChange={(v) => setInputs({ ...inputs, emotionalNeutrality: v })} minLabel="Emotionally driven" maxLabel="Calm and rational" description="How free from emotional bias, fear, or pressure is your decision process? (1–10)" />
                  <SliderField label="Value Alignment" value={inputs.valueAlignment} onChange={(v) => setInputs({ ...inputs, valueAlignment: v })} minLabel="Against my values" maxLabel="Fully aligned" description="How well does this decision align with your long-term values and goals? (1–10)" />
                  <SliderField label="Information Adequacy" value={inputs.informationAdequacy} onChange={(v) => setInputs({ ...inputs, informationAdequacy: v })} minLabel="Insufficient" maxLabel="Well-informed" description="How informed are you about the key facts, risks, and trade-offs? (1–10)" />
                  <SliderField label="Reversibility" value={inputs.reversibility} onChange={(v) => setInputs({ ...inputs, reversibility: v })} minLabel="Irreversible" maxLabel="Easily reversed" description="How easily could you course-correct if this decision turns out badly? (1–10)" />
                  <SliderField label="Future Regret Anticipation" value={inputs.futureRegretAnticipation} onChange={(v) => setInputs({ ...inputs, futureRegretAnticipation: v })} minLabel="Expect regret" maxLabel="Confident no regret" description="Imagining yourself 10 years from now, how confident are you that you won't regret this? (1–10)" />

                  <Button
                    variant="gold"
                    fullWidth
                    size="lg"
                    loading={loading}
                    onClick={handleCalculate}
                    icon={<ArrowRight className="w-4 h-4" />}
                    iconPosition="right"
                  >
                    {result ? "Recalculate Score" : "Calculate Decision Quality Index"}
                  </Button>
                  <p className="text-xs text-slate-calm text-center">
                    This index helps surface blind spots in your decision process. It is not a directive — you retain full autonomy.
                  </p>
                </div>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* SEO: What this calculator measures */}
        <section className="bg-white rounded-3xl p-6 shadow-sm border border-stone-100">
          <h2 className="font-serif text-lg font-bold text-matte-black mb-3">What the Decision Regret Calculator Measures</h2>
          <p className="text-sm text-slate-calm mb-4">The Decision Regret Calculator scores the quality of your decision-making process — not the outcome — across seven critical dimensions. It helps you identify blind spots before you commit, reducing future regret and decision fatigue.</p>
          <ul className="grid sm:grid-cols-2 gap-2">
            {[
              "Decision clarity",
              "Value alignment",
              "Risk & reversibility",
              "Information completeness",
              "Alternatives considered",
              "Emotional neutrality",
              "Regret anticipation",
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
              { q: "What is a decision regret calculator?", a: "A decision regret calculator measures the quality of your decision-making process — not the outcome. It scores factors like information completeness, reversibility, values alignment, and emotional clarity. A high score means you made the decision well, even if the result was imperfect. A low score identifies where your process broke down." },
              { q: "How do I reduce decision regret?", a: "Regret is reduced by improving process, not outcomes. Use the regret minimisation framework: ask yourself 'Will I regret NOT doing this at 80?' Ensure you have gathered sufficient information, considered reversibility, checked alignment with your values, and separated emotion from analysis before deciding." },
              { q: "What is decision fatigue and how does this calculator help?", a: "Decision fatigue is the deterioration of decision quality after a prolonged session of choices. This calculator helps by giving you a structured framework — reducing the mental load of evaluating any single decision from scratch. By scoring the key dimensions, you can make higher-quality decisions even when cognitively depleted." },
              { q: "What is a good decision quality score?", a: "A score of 75–100 indicates a high-quality decision process with good information, clear values alignment, and manageable reversibility. 50–74 is solid with room for improvement. Below 50 suggests significant gaps in your decision process that increase regret risk." },
              { q: "Is the decision regret calculator free?", a: "Yes, it is completely free with no sign-up required to use. Creating a free account lets you save results and track your decision quality over time." },
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
              { href: "/blog/stoic-framework-for-better-decisions", title: "The Stoic Framework for Making Decisions You Won't Regret", excerpt: "How Marcus Aurelius, Epictetus, and Seneca approached the decisions that matter most." },
              { href: "/blog/what-is-decision-fatigue-and-how-to-measure-it", title: "What Is Decision Fatigue? How to Measure It and Recover Fast", excerpt: "Decision fatigue depletes your cognitive reserves — here is how to measure and reverse it." },
              { href: "/blog/how-to-overcome-decision-fatigue-permanently", title: "How to Overcome Decision Fatigue Permanently", excerpt: "Structural changes that reduce your daily decision load and restore cognitive bandwidth." },
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
    </DashboardLayout>
  );
}

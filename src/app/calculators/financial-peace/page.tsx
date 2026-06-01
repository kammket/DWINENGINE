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

type FinancialPeaceInputs = {
  monthlyIncome: number;
  monthlyExpenses: number;
  emergencyFundMonths: number;
  debtToIncomeRatio: number;
  savingsRate: number;
  financialStressLevel: number;
  investmentDiversification: number;
};

const DEFAULT_INPUTS: FinancialPeaceInputs = {
  monthlyIncome: 4000,
  monthlyExpenses: 3000,
  emergencyFundMonths: 2,
  debtToIncomeRatio: 30,
  savingsRate: 10,
  financialStressLevel: 6,
  investmentDiversification: 4,
};

export default function FinancialPeacePage() {
  const [inputs, setInputs] = useState<FinancialPeaceInputs>(DEFAULT_INPUTS);
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
    fetch("/api/calculators?type=FINANCIAL_PEACE&limit=1")
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
        body: JSON.stringify({ type: "FINANCIAL_PEACE", inputs }),
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
      toast.error("Something went wrong. Please try again.");
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
          scores: { "Financial Peace Score": result.score },
          calculatorType: "Financial Peace Calculator",
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
            <span className="text-matte-black font-medium">Financial Peace</span>
          </div>
          <h1 className="font-serif text-2xl font-bold text-matte-black mb-1">Financial Peace Calculator</h1>
          <p className="text-slate-calm text-sm">
            Understand the sustainability and peace embedded in your current financial patterns — without judgment.
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
                    <p className="text-center text-xs text-slate-calm mt-2">Financial Peace Index</p>
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
                        { key: "expenseScore", label: "Expense Ratio" },
                        { key: "emergencyScore", label: "Emergency Fund" },
                        { key: "debtScore", label: "Debt Health" },
                        { key: "savingsScore", label: "Savings Rate" },
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

                {/* Suggestions */}
                {result.suggestions.length > 0 && (
                  <div className="mt-6 pt-6 border-t border-stone-100">
                    <h3 className="text-sm font-semibold text-matte-black mb-3">Sustainable Next Steps</h3>
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

                {/* Stoic reflection */}
                <div className="mt-6 pt-6 border-t border-stone-100">
                  <p className="stoic-quote text-xs">{getReflectionByCategory("money").text}</p>
                  {getReflectionByCategory("money").author && (
                    <p className="text-xs text-stone-400 mt-2 pl-4">— {getReflectionByCategory("money").author}</p>
                  )}
                </div>

                {/* AI Reflection */}
                {aiReflection ? (
                  <div className="mt-6 pt-6 border-t border-stone-100">
                    <div className="flex items-center gap-2 mb-2">
                      <Sparkles className="w-4 h-4 text-soft-gold" />
                      <span className="text-xs font-semibold text-soft-gold uppercase tracking-widest">Logos — AI Reflection</span>
                    </div>
                    <p className="text-sm text-slate-calm italic font-serif leading-relaxed">{aiReflection}</p>
                    <p className="text-xs text-stone-400 mt-3 italic">
                      Educational self-awareness purposes only. Not financial advice.
                    </p>
                  </div>
                ) : (
                  <LockedFeaturePanel
                    userTier={userTier}
                    isGuest={isGuest}
                    feature="Logos AI Financial Reflection"
                    description="Get a personalised Stoic-inspired AI coaching insight on your Financial Peace score — understanding patterns, tradeoffs, and your highest-leverage next step."
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
                <GoalSetter calculatorType="FINANCIAL_PEACE" currentScore={result.score} />

                {/* Next action strip */}
                <div className="mt-6 pt-6 border-t border-stone-100">
                  <p className="text-xs text-slate-calm mb-3">Continue your peace assessment</p>
                  <div className="flex flex-wrap gap-3">
                    <Link href="/calculators/burnout-risk">
                      <div className="flex items-center gap-2 px-4 py-2 bg-stone-50 hover:bg-amber-50 border border-stone-200 hover:border-soft-gold rounded-xl transition-all text-sm font-medium text-matte-black cursor-pointer">
                        Next: Burnout Risk <ArrowRight className="w-4 h-4 text-soft-gold" />
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
                  <CardTitle>Financial Inputs</CardTitle>
                  <CardDescription>All values are used only to calculate your educational index. Nothing is stored externally.</CardDescription>
                </CardHeader>

                <div className="flex items-start gap-2.5 bg-amber-50 border border-amber-100 rounded-xl px-4 py-3 mb-2">
                  <span className="text-base flex-shrink-0 mt-0.5">🪞</span>
                  <p className="text-xs text-amber-800/80 leading-relaxed">
                    <span className="font-semibold">Honest answers give accurate results.</span> Use your real numbers — not what you aim for. An inflated input produces a flattering but useless score. The only person this serves is you.
                  </p>
                </div>

                <div className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-4">
                    <NumberInput
                      label="Monthly Income"
                      value={inputs.monthlyIncome}
                      onChange={(v) => setInputs({ ...inputs, monthlyIncome: v })}
                      prefix="$"
                      min={0}
                      description="Your average monthly take-home income"
                    />
                    <NumberInput
                      label="Monthly Expenses"
                      value={inputs.monthlyExpenses}
                      onChange={(v) => setInputs({ ...inputs, monthlyExpenses: v })}
                      prefix="$"
                      min={0}
                      description="Total monthly expenses (rent, food, transport, etc.)"
                    />
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <NumberInput
                      label="Emergency Fund"
                      value={inputs.emergencyFundMonths}
                      onChange={(v) => setInputs({ ...inputs, emergencyFundMonths: v })}
                      suffix="months"
                      min={0}
                      max={24}
                      description="How many months of expenses are in your emergency fund?"
                    />
                    <NumberInput
                      label="Debt-to-Income Ratio"
                      value={inputs.debtToIncomeRatio}
                      onChange={(v) => setInputs({ ...inputs, debtToIncomeRatio: v })}
                      suffix="%"
                      min={0}
                      max={100}
                      description="% of monthly income going toward debt payments"
                    />
                  </div>

                  <NumberInput
                    label="Savings Rate"
                    value={inputs.savingsRate}
                    onChange={(v) => setInputs({ ...inputs, savingsRate: v })}
                    suffix="%"
                    min={0}
                    max={100}
                    description="% of monthly income you save or invest"
                  />

                  <SliderField
                    label="Financial Stress Level"
                    value={inputs.financialStressLevel}
                    onChange={(v) => setInputs({ ...inputs, financialStressLevel: v })}
                    minLabel="No stress"
                    maxLabel="Extreme stress"
                    description="How stressed do you feel about your financial situation? (1 = not at all, 10 = extremely)"
                  />

                  <SliderField
                    label="Investment Diversification"
                    value={inputs.investmentDiversification}
                    onChange={(v) => setInputs({ ...inputs, investmentDiversification: v })}
                    minLabel="No investments"
                    maxLabel="Well diversified"
                    description="How diversified are your investable assets? (1 = none, 10 = highly diversified)"
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
                    {result ? "Recalculate Score" : "Calculate My Financial Peace Score"}
                  </Button>

                  <p className="text-xs text-slate-calm text-center">
                    This is an educational index, not financial advice. Results are private and stored securely.
                  </p>
                </div>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* SEO: What this calculator measures */}
        <section className="bg-white rounded-3xl p-6 shadow-sm border border-stone-100">
          <h2 className="font-serif text-lg font-bold text-matte-black mb-3">What the Financial Peace Calculator Measures</h2>
          <p className="text-sm text-slate-calm mb-4">The Financial Peace Calculator scores your financial sustainability across six weighted dimensions. It transforms income ratios, emergency fund coverage, debt load, and savings behavior into a single 0–100 financial wellness index.</p>
          <ul className="grid sm:grid-cols-2 gap-2">
            {[
              "Income-to-expenses ratio",
              "Emergency fund coverage",
              "Debt-to-income ratio",
              "Savings rate",
              "Financial stress perception",
              "Investment diversification",
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
              { q: "What is a good financial peace score?", a: "A score of 70–100 indicates strong financial sustainability — your income covers expenses with room to save, your emergency fund is healthy, and your debt load is manageable. A score of 40–69 suggests areas to improve. Below 40 signals significant financial stress that warrants immediate attention." },
              { q: "How is the financial peace score calculated?", a: "The score is a weighted composite of five factors: income-to-expense ratio (30%), emergency fund coverage in months (25%), debt-to-income ratio (20%), savings rate (15%), and self-rated financial stress (10%). Each factor is normalised to 0–100 and combined for your final index." },
              { q: "How many months of emergency fund should I have?", a: "Most financial planners recommend 3–6 months of essential expenses for employees and 6–12 months for self-employed individuals or those with variable income. The calculator scores you maximally at 6 or more months." },
              { q: "What debt-to-income ratio is considered healthy?", a: "A debt-to-income ratio below 20% is considered excellent. 20–35% is manageable. Above 43% is the threshold most lenders consider high risk, and the calculator will reflect elevated stress in your score." },
              { q: "Is the financial peace calculator free?", a: "Yes, the Financial Peace Calculator is completely free with no credit card required. You can run the assessment as many times as you like and save your history with a free account." },
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
              { href: "/blog/financial-peace-score-vs-net-worth", title: "Financial Peace Score: The Metric That Matters More Than Net Worth", excerpt: "Why your financial peace score matters more than your net worth — and how to improve it." },
              { href: "/blog/how-to-calculate-financial-independence-score", title: "How to Calculate Your Financial Independence Score", excerpt: "Beyond the FI number: how to measure real financial independence using sustainability metrics." },
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

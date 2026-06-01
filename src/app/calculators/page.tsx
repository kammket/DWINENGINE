"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { DashboardLayout } from "@/components/layout/Sidebar";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/components/providers/AuthProvider";
import { useEffect, useState } from "react";
import { ScoreRing } from "@/components/ui/ScoreVisuals";
import { getScoreColor, getScoreLabel } from "@/types";
import { CompletionCelebration } from "@/components/ui/CompletionCelebration";
import {
  ArrowRight, DollarSign, Battery, Heart, Brain, Clock,
  Crown, Zap, Building2, CheckCircle2, Lock, Sparkles,
} from "lucide-react";

const CALCULATORS = [
  {
    type: "FINANCIAL_PEACE",
    href: "/calculators/financial-peace",
    title: "Financial Peace",
    description: "Measure your financial sustainability index across expense ratios, savings, debt, and comfort levels.",
    icon: DollarSign,
    color: "text-green-600 bg-green-50",
    time: "3 min",
    inputs: "7 factors",
    premiumFeatures: ["AI financial reflection", "12-month scenario simulation", "Trend analytics"],
    enterpriseFeatures: ["Team financial benchmarks", "Bulk API runs"],
  },
  {
    type: "BURNOUT_RISK",
    href: "/calculators/burnout-risk",
    title: "Burnout Risk",
    description: "Evaluate your work-life resiliency patterns including sleep, purpose, autonomy, and recovery capacity.",
    icon: Battery,
    color: "text-orange-600 bg-orange-50",
    time: "4 min",
    inputs: "9 factors",
    premiumFeatures: ["AI burnout coaching reflection", "Recovery projection simulator", "Longitudinal risk trends"],
    enterpriseFeatures: ["Team burnout radar", "Department-level insights"],
  },
  {
    type: "RELATIONSHIP_SUSTAINABILITY",
    href: "/calculators/relationship-sustainability",
    title: "Relationship Sustainability",
    description: "Assess relationship health through communication, trust, value alignment, and growth compatibility.",
    icon: Heart,
    color: "text-rose-600 bg-rose-50",
    time: "3 min",
    inputs: "8 factors",
    premiumFeatures: ["AI relationship insight", "Pattern change simulation", "Historical trend chart"],
    enterpriseFeatures: ["Anonymised team cohesion data"],
  },
  {
    type: "DECISION_REGRET",
    href: "/calculators/decision-regret",
    title: "Decision Quality",
    description: "Evaluate decision conditions — clarity, reversibility, value alignment — to reduce long-term regret risk.",
    icon: Brain,
    color: "text-purple-600 bg-purple-50",
    time: "2 min",
    inputs: "7 factors",
    premiumFeatures: ["AI Stoic decision coaching", "Outcome scenario modelling", "Decision history analytics"],
    enterpriseFeatures: ["Team decision quality benchmarks"],
  },
  {
    type: "TIME_VALUE",
    href: "/calculators/time-value",
    title: "Time Value",
    description: "Understand how you allocate your most finite resource. Measure purposefulness, autonomy, and recovery.",
    icon: Clock,
    color: "text-blue-600 bg-blue-50",
    time: "2 min",
    inputs: "7 factors",
    premiumFeatures: ["AI time-use reflection", "Reallocation scenario sim", "Weekly time trend charts"],
    enterpriseFeatures: ["Organisation-wide time analytics"],
  },
];

/** Minimal inline sparkline — no external charting dependency */
function Sparkline({ values, color = "#C9A84C" }: { values: number[]; color?: string }) {
  if (values.length < 2) return null;
  const W = 52, H = 18;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const pts = values.map((v, i) => {
    const x = (i / (values.length - 1)) * W;
    const y = H - ((v - min) / range) * (H - 2) - 1;
    return `${x},${y}`;
  }).join(" ");
  const lastX = W;
  const lastY = H - ((values[values.length - 1] - min) / range) * (H - 2) - 1;
  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} aria-hidden="true">
      <polyline
        points={pts}
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.7"
      />
      <circle cx={lastX} cy={lastY} r="2" fill={color} />
    </svg>
  );
}

function TierBadge({ tier }: { tier: "free" | "premium" | "enterprise" }) {
  if (tier === "premium") {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-50 border border-amber-200 text-amber-700 text-[10px] font-bold uppercase tracking-wide">
        <Crown className="w-2.5 h-2.5" /> Premium
      </span>
    );
  }
  if (tier === "enterprise") {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-100 border border-slate-200 text-slate-600 text-[10px] font-bold uppercase tracking-wide">
        <Building2 className="w-2.5 h-2.5" /> Enterprise
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-[10px] font-bold uppercase tracking-wide">
      <CheckCircle2 className="w-2.5 h-2.5" /> Free
    </span>
  );
}

export default function CalculatorsIndexPage() {
  const [recentScores, setRecentScores] = useState<Record<string, number>>({});
  const [scoreHistory, setScoreHistory] = useState<Record<string, number[]>>({});
  const [lastRunDates, setLastRunDates] = useState<Record<string, string>>({});
  const [showCelebration, setShowCelebration] = useState(false);
  const [prevCompleted, setPrevCompleted] = useState(0);
  const { user, loading } = useAuth();

  const isGuest = !loading && !user;
  const isFree = !loading && user?.subscription?.tier === "FREE";
  const isPremium = !loading && (user?.subscription?.tier === "PREMIUM" || user?.subscription?.tier === "ENTERPRISE");
  const isEnterprise = !loading && user?.subscription?.tier === "ENTERPRISE";

  useEffect(() => {
    if (!user) return;
    fetch("/api/calculators?limit=20")
      .then((r) => r.json())
      .then((json) => {
        if (json.success) {
          const scores: Record<string, number> = {};
          const history: Record<string, number[]> = {};
          const dates: Record<string, string> = {};
          for (const result of json.results) {
            if (!scores[result.type]) scores[result.type] = result.score;
            if (!history[result.type]) history[result.type] = [];
            if (history[result.type].length < 6) history[result.type].push(result.score);
            if (!dates[result.type]) dates[result.type] = result.createdAt;
          }
          // Reverse so chronological order for sparkline (oldest → newest)
          for (const type of Object.keys(history)) {
            history[type] = history[type].reverse();
          }
          setRecentScores(scores);
          setScoreHistory(history);
          setLastRunDates(dates);
          const completed = Object.keys(scores).length;
          if (prevCompleted < 5 && completed >= 5) setShowCelebration(true);
          setPrevCompleted(completed);
        }
      });
  }, [user]);

  const completedCount = Object.keys(recentScores).length;
  const totalCalcs = CALCULATORS.length;

  const ctaHref = isGuest ? "/onboarding" : isPremium ? "/pricing" : "/pricing";
  const ctaLabel = isGuest
    ? "Start for Free"
    : isFree
    ? "Upgrade to Premium"
    : isEnterprise
    ? "You have full access"
    : "Upgrade to Premium";

  return (
    <DashboardLayout>
      <CompletionCelebration
        show={showCelebration}
        onDone={() => setShowCelebration(false)}
      />
      <div className="space-y-8">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-1">
            <h1 className="font-serif text-2xl font-bold" style={{ color: "var(--page-text)" }}>Decision Calculators</h1>
            {user && (
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-calm">
                  {completedCount}/{totalCalcs} complete
                </span>
                <div className="w-24 h-2 rounded-full overflow-hidden" style={{ backgroundColor: "var(--subtle-bg)" }}>
                  <motion.div
                    className="h-full rounded-full bg-gradient-to-r from-brand-400 to-soft-gold"
                    initial={{ width: 0 }}
                    animate={{ width: `${(completedCount / totalCalcs) * 100}%` }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                  />
                </div>
              </div>
            )}
          </div>
          <p className="text-slate-calm text-sm">
            Five analytical dimensions to understand your life sustainability patterns — and visualize the tradeoffs within them.
          </p>
        </motion.div>

        {/* Guest banner */}
        {isGuest && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-r from-amber-50 to-white border border-amber-200 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
          >
            <div>
              <p className="text-sm font-semibold text-matte-black mb-0.5">You&apos;re browsing as a guest</p>
              <p className="text-xs text-slate-calm">Create a free account to run assessments and save your results across all 5 calculators.</p>
            </div>
            <Link href="/onboarding" className="shrink-0">
              <Button variant="gold" size="sm" icon={<ArrowRight className="w-3.5 h-3.5" />} iconPosition="right">
                Start Free Assessment
              </Button>
            </Link>
          </motion.div>
        )}

        {/* Free-tier upgrade nudge */}
        {isFree && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-r from-amber-50 to-white border border-amber-200 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
          >
            <div className="flex items-center gap-3">
              <Crown className="w-5 h-5 text-soft-gold shrink-0" />
              <div>
                <p className="text-sm font-semibold text-matte-black mb-0.5">Unlock AI reflections &amp; scenario simulations</p>
                <p className="text-xs text-slate-calm">Upgrade to Premium to get Logos AI coaching after every assessment.</p>
              </div>
            </div>
            <Link href="/pricing" className="shrink-0">
              <Button variant="gold" size="sm" icon={<Crown className="w-3.5 h-3.5" />}>
                Upgrade — $19/mo
              </Button>
            </Link>
          </motion.div>
        )}

        {/* Calculator cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {CALCULATORS.map((calc, i) => {
            const score = recentScores[calc.type];
            const history = scoreHistory[calc.type] ?? [];
            const hasScore = score !== undefined;
            const scoreColor = hasScore ? getScoreColor(score) : null;
            return (
              <motion.div
                key={calc.type}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
              >
                <Link href={isGuest ? "/onboarding" : calc.href}>
                  <Card hover padding="none" className="cursor-pointer h-full flex flex-col overflow-hidden group">
                    {hasScore && (
                      <div
                        className="h-1 w-full rounded-t-3xl flex-shrink-0"
                        style={{ backgroundColor: scoreColor! }}
                      />
                    )}

                    <div className="flex flex-col flex-1 p-6">
                      {/* Header row */}
                      <div className="flex items-start justify-between mb-4">
                        <div className={`w-11 h-11 rounded-2xl flex items-center justify-center ${calc.color}`}>
                          <calc.icon className="w-5 h-5" />
                        </div>
                        <div className="flex flex-col items-end gap-1">
                          {hasScore ? (
                            <>
                              <ScoreRing score={score} size="sm" animate={false} showLabel={false} />
                              <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-green-600">
                                <CheckCircle2 className="w-3 h-3" /> Done
                              </span>
                            </>
                          ) : (
                            <div className="w-8 h-8 rounded-full border-2 border-dashed border-stone-200 flex items-center justify-center group-hover:border-soft-gold transition-colors">
                              <ArrowRight className="w-3.5 h-3.5 text-stone-300 group-hover:text-soft-gold transition-colors" />
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Title + FREE badge */}
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold" style={{ color: "var(--page-text)" }}>{calc.title}</h3>
                        <TierBadge tier="free" />
                      </div>

                      <p className="text-sm text-slate-calm leading-relaxed flex-1 mb-4">
                        {calc.description}
                      </p>

                      {/* Meta */}
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3 text-xs text-stone-400">
                          <span>⏱ {calc.time}</span>
                          <span>📊 {calc.inputs}</span>
                        </div>
                        {hasScore && (
                          <span
                            className="text-xs font-semibold px-2.5 py-1 rounded-full"
                            style={{ color: scoreColor!, backgroundColor: `${scoreColor}18` }}
                          >
                            {getScoreLabel(score)}
                          </span>
                        )}
                        {history.length >= 2 && (
                          <Sparkline values={history} color={scoreColor ?? "#C9A84C"} />
                        )}
                      </div>

                      {/* Score freshness / decay bar */}
                      {hasScore && lastRunDates[calc.type] && (() => {
                        const days = Math.floor((Date.now() - new Date(lastRunDates[calc.type]).getTime()) / 86400000);
                        const freshPct = Math.max(0, Math.min(100, 100 - (days / 30) * 100));
                        const isExpired = days >= 30;
                        const isStale = days > 14;
                        const barColor = freshPct >= 70 ? "#34D399" : freshPct >= 40 ? "#E8B84B" : freshPct >= 15 ? "#F97316" : "#EF4444";
                        return (
                          <div className="mb-3">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-[10px] text-stone-400">Score freshness</span>
                              <span className={`text-[10px] font-semibold ${isExpired ? "text-red-500" : isStale ? "text-amber-600" : "text-emerald-600"}`}>
                                {isExpired ? "Expired — recalculate" : isStale ? `${days}d ago — drifting` : `${days}d ago`}
                              </span>
                            </div>
                            <div className="w-full h-1.5 bg-stone-200 rounded-full overflow-hidden">
                              <div
                                className="h-full rounded-full transition-all duration-500"
                                style={{ width: `${freshPct}%`, backgroundColor: barColor }}
                              />
                            </div>
                          </div>
                        );
                      })()}

                      {/* Premium locked features */}
                      <div className="space-y-1.5 mb-4 pt-3 border-t border-stone-100">
                        {calc.premiumFeatures.map((f) => (
                          <div key={f} className="flex items-center gap-1.5">
                            {isPremium ? (
                              <Sparkles className="w-3 h-3 text-soft-gold shrink-0" />
                            ) : (
                              <Lock className="w-3 h-3 text-stone-300 shrink-0" />
                            )}
                            <span className={`text-xs leading-tight ${isPremium ? "text-slate-calm" : "text-stone-400"}`}>
                              {f}
                            </span>
                            {!isPremium && <TierBadge tier="premium" />}
                          </div>
                        ))}
                        {calc.enterpriseFeatures.map((f) => (
                          <div key={f} className="flex items-center gap-1.5">
                            {isEnterprise ? (
                              <Zap className="w-3 h-3 text-slate-400 shrink-0" />
                            ) : (
                              <Lock className="w-3 h-3 text-stone-200 shrink-0" />
                            )}
                            <span className="text-xs text-stone-300 leading-tight">{f}</span>
                            {!isEnterprise && <TierBadge tier="enterprise" />}
                          </div>
                        ))}
                      </div>

                      {/* CTA footer */}
                      <div className="flex items-center justify-between pt-3 border-t border-stone-100">
                        <span className="text-xs font-semibold text-soft-gold">
                          {isGuest ? "Sign up to run →" : hasScore ? "Run again" : "Begin assessment"}
                        </span>
                        <ArrowRight className="w-4 h-4 text-soft-gold" />
                      </div>
                    </div>
                  </Card>
                </Link>
              </motion.div>
            );
          })}
        </div>

        {/* Tier comparison table */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
          <h2 className="font-serif text-lg font-bold text-matte-black mb-4">What&apos;s included at each plan</h2>
          <div className="grid md:grid-cols-3 gap-4">
            {/* FREE */}
            <Card padding="md" className={`border-2 ${isFree || isGuest ? "border-soft-gold bg-amber-50/30" : "border-stone-100"}`}>
              <div className="flex items-center gap-2 mb-3">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span className="font-bold text-sm text-matte-black">Free</span>
                {(isGuest || isFree) && (
                  <span className="ml-auto text-[10px] font-bold text-soft-gold uppercase tracking-wide">
                    {isGuest ? "No account" : "Your plan"}
                  </span>
                )}
              </div>
              <div className="text-2xl font-bold text-matte-black mb-3">$0<span className="text-xs font-normal text-slate-calm">/mo</span></div>
              <ul className="space-y-2">
                {[
                  "All 5 life calculators",
                  "Score + interpretation",
                  "Suggestions per result",
                  "Decision Journal",
                  "Morning Intention ritual",
                  "Burnout risk tracking",
                  "30-day history",
                  "Weekly virtues compass",
                ].map((f) => (
                  <li key={f} className="flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 mt-0.5 shrink-0" />
                    <span className="text-xs text-slate-calm">{f}</span>
                  </li>
                ))}
              </ul>
              {isGuest && (
                <Link href="/onboarding" className="mt-4 block">
                  <Button variant="gold" fullWidth size="sm">Get Started Free</Button>
                </Link>
              )}
            </Card>

            {/* PREMIUM */}
            <Card padding="md" className={`border-2 ${isPremium && !isEnterprise ? "border-soft-gold bg-amber-50/30" : "border-amber-200"} relative`}>
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <span className="bg-soft-gold text-white text-[10px] font-bold px-3 py-0.5 rounded-full uppercase tracking-wide">
                  Most Popular
                </span>
              </div>
              <div className="flex items-center gap-2 mb-3">
                <Crown className="w-4 h-4 text-soft-gold" />
                <span className="font-bold text-sm text-matte-black">Premium</span>
                {isPremium && !isEnterprise && (
                  <span className="ml-auto text-[10px] font-bold text-soft-gold uppercase tracking-wide">Your plan</span>
                )}
              </div>
              <div className="text-2xl font-bold text-matte-black mb-3">$19<span className="text-xs font-normal text-slate-calm">/mo</span></div>
              <ul className="space-y-2">
                {[
                  "Everything in Free",
                  "AI reflections (Logos)",
                  "Scenario simulator",
                  "Advanced trend analytics",
                  "1-year result history",
                  "PDF & CSV data export",
                  "Priority email support",
                ].map((f) => (
                  <li key={f} className="flex items-start gap-2">
                    <Sparkles className="w-3.5 h-3.5 text-soft-gold mt-0.5 shrink-0" />
                    <span className="text-xs text-slate-calm">{f}</span>
                  </li>
                ))}
              </ul>
              {(isGuest || isFree) && (
                <Link href="/pricing" className="mt-4 block">
                  <Button variant="gold" fullWidth size="sm">Upgrade — $19/mo</Button>
                </Link>
              )}
            </Card>

            {/* ENTERPRISE */}
            <Card padding="md" className={`border-2 ${isEnterprise ? "border-soft-gold bg-amber-50/30" : "border-stone-100"}`}>
              <div className="flex items-center gap-2 mb-3">
                <Building2 className="w-4 h-4 text-slate-400" />
                <span className="font-bold text-sm text-matte-black">Enterprise</span>
                {isEnterprise && (
                  <span className="ml-auto text-[10px] font-bold text-soft-gold uppercase tracking-wide">Your plan</span>
                )}
              </div>
              <div className="text-2xl font-bold text-matte-black mb-3">$99<span className="text-xs font-normal text-slate-calm">/mo</span></div>
              <ul className="space-y-2">
                {[
                  "Everything in Premium",
                  "Team dashboards",
                  "API access (bulk runs)",
                  "Custom AI configuration",
                  "SSO & Security",
                  "Unlimited history",
                  "Dedicated success manager",
                  "SLA guarantee",
                ].map((f) => (
                  <li key={f} className="flex items-start gap-2">
                    <Zap className="w-3.5 h-3.5 text-slate-400 mt-0.5 shrink-0" />
                    <span className="text-xs text-slate-calm">{f}</span>
                  </li>
                ))}
              </ul>
              {(isGuest || isFree || (isPremium && !isEnterprise)) && (
                <Link href="/pricing" className="mt-4 block">
                  <Button variant="secondary" fullWidth size="sm">View Enterprise</Button>
                </Link>
              )}
            </Card>
          </div>
        </motion.div>

        {/* Philosophy context */}
        <div className="grid md:grid-cols-3 gap-4">
          <Card padding="md" className="bg-stone-50 border-stone-200">
            <p className="text-xs font-semibold text-matte-black mb-1">🏛️ Stoic Foundation</p>
            <p className="text-xs text-slate-calm leading-relaxed">
              Inspired by Marcus Aurelius, Epictetus, and Seneca — each calculator helps you distinguish what is within your control from what is not, and act with clarity on what matters.
            </p>
          </Card>
          <Card padding="md" className="bg-stone-50 border-stone-200">
            <p className="text-xs font-semibold text-matte-black mb-1">📊 Behavioral Science</p>
            <p className="text-xs text-slate-calm leading-relaxed">
              Grounded in decision theory, cognitive psychology, behavioral economics, and systems thinking — these are educational indices, not diagnoses or verdicts.
            </p>
          </Card>
          <Card padding="md" className="bg-stone-50 border-stone-200">
            <p className="text-xs font-semibold text-matte-black mb-1">🔒 Your Autonomy, Always</p>
            <p className="text-xs text-slate-calm leading-relaxed">
              Scores surface patterns and tradeoffs. They never prescribe, predict, or judge. The insights are yours to use — or not. You retain full agency over every interpretation.
            </p>
          </Card>
        </div>

        {/* Legal disclaimer */}
        <Card padding="md" className="bg-stone-50 border-stone-200">
          <p className="text-xs text-slate-calm leading-relaxed">
            <strong className="text-deep-charcoal">About these calculators:</strong> All scores are educational indices designed to foster self-awareness and informed reflection. They do not constitute medical, financial, psychological, or legal advice, and should not be used to diagnose any condition. Results are based on your self-reported inputs and weighted models drawn from behavioral science literature.
          </p>
        </Card>

        {/* Guest bottom CTA */}
        {isGuest && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="bg-matte-black rounded-3xl p-8 text-center"
          >
            <div className="w-10 h-10 bg-amber-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <span className="text-xl">🏛️</span>
            </div>
            <h3 className="font-serif text-xl font-bold text-warm-white mb-2">
              Run your first assessment — free
            </h3>
            <p className="text-stone-400 text-sm mb-6 max-w-sm mx-auto">
              Takes 5 minutes. No credit card. See where you stand across all 5 life dimensions and get a personalised baseline profile.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/onboarding">
                <Button variant="gold" size="lg" icon={<ArrowRight className="w-4 h-4" />} iconPosition="right">
                  Start Free Assessment
                </Button>
              </Link>
              <Link href="/pricing">
                <Button variant="secondary" size="lg">
                  View All Plans
                </Button>
              </Link>
            </div>
          </motion.div>
        )}
      </div>
    </DashboardLayout>
  );
}

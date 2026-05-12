"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { DashboardLayout } from "@/components/layout/Sidebar";
import { Card } from "@/components/ui/Card";
import { useEffect, useState } from "react";
import { ScoreRing } from "@/components/ui/ScoreVisuals";
import { getScoreColor, getScoreLabel } from "@/types";
import { ArrowRight, DollarSign, Battery, Heart, Brain, Clock } from "lucide-react";

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
  },
];

export default function CalculatorsIndexPage() {
  const [recentScores, setRecentScores] = useState<Record<string, number>>({});

  useEffect(() => {
    fetch("/api/calculators?limit=20")
      .then((r) => r.json())
      .then((json) => {
        if (json.success) {
          const scores: Record<string, number> = {};
          for (const result of json.results) {
            if (!scores[result.type]) scores[result.type] = result.score;
          }
          setRecentScores(scores);
        }
      });
  }, []);

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="font-serif text-2xl font-bold text-matte-black mb-1">Decision Calculators</h1>
          <p className="text-slate-calm text-sm">
            Five analytical dimensions to understand your life sustainability patterns — and visualize the tradeoffs within them.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {CALCULATORS.map((calc, i) => {
            const score = recentScores[calc.type];
            const hasScore = score !== undefined;
            const scoreColor = hasScore ? getScoreColor(score) : null;
            return (
              <motion.div
                key={calc.type}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
              >
                <Link href={calc.href}>
                  <Card
                    hover
                    padding="none"
                    className="cursor-pointer h-full flex flex-col overflow-hidden"
                  >
                    {/* Colored top accent when scored */}
                    {hasScore && (
                      <div
                        className="h-1 w-full rounded-t-3xl flex-shrink-0"
                        style={{ backgroundColor: scoreColor! }}
                      />
                    )}

                    <div className="flex flex-col flex-1 p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className={`w-11 h-11 rounded-2xl flex items-center justify-center ${calc.color}`}>
                          <calc.icon className="w-5 h-5" />
                        </div>
                        {hasScore ? (
                          <ScoreRing score={score} size="sm" animate={false} showLabel={false} />
                        ) : (
                          <div className="flex flex-col items-center gap-0.5">
                            <div className="w-8 h-8 rounded-full border-2 border-dashed border-stone-200 flex items-center justify-center">
                              <ArrowRight className="w-3.5 h-3.5 text-stone-300" />
                            </div>
                          </div>
                        )}
                      </div>

                      <h3 className="font-semibold text-matte-black mb-2">{calc.title}</h3>
                      <p className="text-sm text-slate-calm leading-relaxed flex-1 mb-4">
                        {calc.description}
                      </p>

                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3 text-xs text-stone-400">
                          <span>⏱ {calc.time}</span>
                          <span>📊 {calc.inputs}</span>
                        </div>
                        {hasScore && (
                          <span
                            className="text-xs font-semibold px-2.5 py-1 rounded-full"
                            style={{
                              color: scoreColor!,
                              backgroundColor: `${scoreColor}18`,
                            }}
                          >
                            {getScoreLabel(score)}
                          </span>
                        )}
                      </div>

                      {/* CTA footer */}
                      <div className="flex items-center justify-between pt-3 border-t border-stone-100">
                        <span className="text-xs font-semibold text-soft-gold">
                          {hasScore ? "Run again" : "Begin assessment"}
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
      </div>
    </DashboardLayout>
  );
}

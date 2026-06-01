"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface NextStep {
  href: string;
  icon: LucideIcon;
  label: string;
  description: string;
  highlight?: boolean;
}

interface WhatNextCardProps {
  score: number;
  calculatorType: string;
  nextSteps: NextStep[];
}

export function WhatNextCard({ score, calculatorType, nextSteps }: WhatNextCardProps) {
  const scoreLevel =
    score >= 80 ? "thriving" : score >= 60 ? "stable" : score >= 40 ? "building" : "needs-attention";

  const headlineMap: Record<string, string> = {
    "thriving": "Great results — here's how to build on them",
    "stable": "Solid foundation — a few actions to strengthen it",
    "building": "You've identified growth areas — take the next step",
    "needs-attention": "Your data reveals real opportunities — act on them",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3, duration: 0.5 }}
      className="rounded-2xl p-5"
      style={{ backgroundColor: "var(--subtle-bg)", border: "1px solid var(--card-border)" }}
    >
      <p className="text-[10px] font-bold text-soft-gold uppercase tracking-[0.15em] mb-1">
        What to do next
      </p>
      <p className="text-sm font-semibold mb-4" style={{ color: "var(--page-text)" }}>
        {headlineMap[scoreLevel]}
      </p>

      <div className="grid sm:grid-cols-2 gap-3">
        {nextSteps.map((step) => (
          <Link key={step.href} href={step.href}>
            <div
              className="flex items-start gap-3 p-3 rounded-xl border transition-all cursor-pointer group"
              style={{
                backgroundColor: step.highlight ? "rgba(201,168,76,0.06)" : "var(--card-bg)",
                borderColor: step.highlight ? "rgba(201,168,76,0.35)" : "var(--card-border)",
              }}
            >
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
                style={{ backgroundColor: "var(--subtle-bg)" }}
              >
                <step.icon className="w-4 h-4 text-soft-gold" aria-hidden="true" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold mb-0.5 flex items-center gap-1.5 group-hover:text-soft-gold transition-colors" style={{ color: "var(--page-text)" }}>
                  {step.label}
                  <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                </p>
                <p className="text-[11px] text-slate-calm leading-relaxed">{step.description}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </motion.div>
  );
}

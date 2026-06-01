"use client";

import { motion } from "framer-motion";
import { TrendingDown, TrendingUp, AlertTriangle, Lightbulb } from "lucide-react";

interface ScoreMap {
  FINANCIAL_PEACE?: number;
  BURNOUT_RISK?: number;
  RELATIONSHIP_SUSTAINABILITY?: number;
  DECISION_REGRET?: number;
  TIME_VALUE?: number;
}

interface CrossScoreSummaryProps {
  scores: ScoreMap;
}

type Insight = {
  type: "warning" | "positive" | "pattern" | "suggestion";
  text: string;
};

const LABELS: Record<string, string> = {
  FINANCIAL_PEACE: "financial peace",
  BURNOUT_RISK: "burnout resilience",
  RELATIONSHIP_SUSTAINABILITY: "relationship health",
  DECISION_REGRET: "decision quality",
  TIME_VALUE: "time value",
};

function generateInsights(scores: ScoreMap): Insight[] {
  const insights: Insight[] = [];
  const entries = Object.entries(scores).filter(([, v]) => v !== undefined) as [string, number][];
  if (entries.length < 2) return [];

  const avg = Math.round(entries.reduce((sum, [, v]) => sum + v, 0) / entries.length);
  const lowest = entries.sort((a, b) => a[1] - b[1])[0];
  const highest = [...entries].sort((a, b) => b[1] - a[1])[0];

  // Cross-pattern rules
  const burnout = scores.BURNOUT_RISK;
  const time = scores.TIME_VALUE;
  const financial = scores.FINANCIAL_PEACE;
  const decision = scores.DECISION_REGRET;
  const relationship = scores.RELATIONSHIP_SUSTAINABILITY;

  if (burnout !== undefined && time !== undefined && burnout < 55 && time < 55) {
    insights.push({
      type: "pattern",
      text: "Both your energy and time scores are low — this often signals structural overcommitment rather than a motivation issue. Reducing commitments, not pushing harder, is the typical lever here.",
    });
  }

  if (financial !== undefined && decision !== undefined && financial < 50 && decision < 55) {
    insights.push({
      type: "warning",
      text: "Low financial peace alongside impaired decision quality is a known stress spiral — financial pressure degrades the quality of the decisions needed to improve it. Short-term stability actions first.",
    });
  }

  if (relationship !== undefined && burnout !== undefined && relationship > 70 && burnout < 50) {
    insights.push({
      type: "suggestion",
      text: "You have strong relationship support but low burnout resilience — your network is a real asset here. Consider explicitly naming one person you can delegate pressure to.",
    });
  }

  if (entries.length >= 3 && avg >= 70) {
    insights.push({
      type: "positive",
      text: `Your average across ${entries.length} dimensions is ${avg} — indicating broad life sustainability. The Stoic principle of eudaimonia (flourishing through virtue) appears reflected in your patterns.`,
    });
  }

  // Always add: lowest leverage + highest strength
  if (lowest[1] < 65) {
    insights.push({
      type: "suggestion",
      text: `Your lowest dimension is ${LABELS[lowest[0]]} (${lowest[1]}). One targeted action here will have the greatest cross-score leverage — small input changes in your weakest area compound fastest.`,
    });
  }

  if (highest[1] >= 70 && entries.length >= 3) {
    insights.push({
      type: "positive",
      text: `Your strongest area is ${LABELS[highest[0]]} (${highest[1]}). Build from this — decisions and behaviours that reinforce your strongest dimension tend to pull adjacent scores upward over time.`,
    });
  }

  return insights.slice(0, 3); // cap at 3 insights
}

const ICON_MAP = {
  warning:    { Icon: AlertTriangle, color: "text-amber-500",  bg: "bg-amber-50"  },
  positive:   { Icon: TrendingUp,    color: "text-green-600", bg: "bg-green-50"  },
  pattern:    { Icon: TrendingDown,  color: "text-blue-500",  bg: "bg-blue-50"   },
  suggestion: { Icon: Lightbulb,     color: "text-soft-gold", bg: "bg-amber-50"  },
};

export function CrossScoreSummary({ scores }: CrossScoreSummaryProps) {
  const insights = generateInsights(scores);
  if (insights.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="rounded-2xl p-5 space-y-4"
      style={{ backgroundColor: "var(--card-bg)", border: "1px solid var(--card-border)" }}
    >
      <div>
        <p className="text-[10px] font-bold text-soft-gold uppercase tracking-[0.15em] mb-0.5">
          Cross-Score Intelligence
        </p>
        <p className="text-sm font-semibold" style={{ color: "var(--page-text)" }}>
          Patterns across your dimensions
        </p>
      </div>

      <div className="space-y-3">
        {insights.map((insight, i) => {
          const { Icon, color, bg } = ICON_MAP[insight.type];
          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
              className={`flex gap-3 rounded-xl p-3 ${bg}`}
            >
              <Icon className={`w-4 h-4 flex-shrink-0 mt-0.5 ${color}`} aria-hidden="true" />
              <p className="text-xs text-slate-calm leading-relaxed">{insight.text}</p>
            </motion.div>
          );
        })}
      </div>

      <p className="text-[10px] text-stone-400 leading-relaxed">
        Patterns are educational observations derived from your inputs — not diagnoses or predictions. Consult qualified professionals for major life decisions.
      </p>
    </motion.div>
  );
}

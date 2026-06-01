"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Brain, RefreshCw } from "lucide-react";
import { useState } from "react";
import { getStoicQuoteForContext } from "@/lib/stoic";

type TrendData = {
  month: number;
  peaceScore: number;
};

type Props = {
  peaceScore: number | null;
  burnoutRisk: number | null;
  streak: number;
  hasCheckinThisWeek: boolean;
  pulseDaysThisWeek: number;
  goals: { reachedAt: string | null }[];
  trendHistory: TrendData[];
};

function generateInsight(props: Props): { text: string; emphasis: string | null } {
  const { peaceScore, burnoutRisk, streak, hasCheckinThisWeek, pulseDaysThisWeek, goals, trendHistory } = props;

  const reachedGoals = goals.filter((g) => g.reachedAt).length;
  const histLen = trendHistory.length;
  const latest = histLen > 0 ? trendHistory[histLen - 1].peaceScore : null;
  const prev = histLen > 1 ? trendHistory[histLen - 2].peaceScore : null;
  const delta = latest != null && prev != null ? latest - prev : null;

  // Priority-ordered observations

  if (burnoutRisk != null && burnoutRisk > 72) {
    return {
      text: `Your burnout risk is at ${burnoutRisk} — that's in the high-risk zone. ${
        streak > 3
          ? `You've maintained a ${streak}-week check-in streak, which shows discipline. But the data is asking you to slow down, not speed up.`
          : "Tracking consistently is the first step. The numbers are early warning signs, not verdicts."
      }`,
      emphasis: "High burnout risk detected.",
    };
  }

  if (delta != null && delta >= 10) {
    return {
      text: `Your Peace Score has risen ${delta} points since last month — that's a meaningful shift, not just noise. ${
        streak > 2
          ? `Combined with a ${streak}-week streak, you're building real momentum.`
          : "Keep the consistency up and this trend compounds."
      }`,
      emphasis: "Strong upward momentum.",
    };
  }

  if (delta != null && delta <= -8) {
    return {
      text: `Your Peace Score dropped ${Math.abs(delta)} points last month. Before you interpret that as failure, consider what changed in your life — scores follow circumstances. ${
        hasCheckinThisWeek
          ? "You checked in this week, which means you're still paying attention."
          : "This week's check-in would give you a clearer picture."
      }`,
      emphasis: "Scores have dipped recently.",
    };
  }

  if (peaceScore != null && peaceScore >= 80) {
    return {
      text: `A Peace Score of ${peaceScore} is genuinely strong. The risk here isn't the score — it's complacency. ${
        pulseDaysThisWeek >= 3
          ? "Your daily pulse habit is keeping that number honest."
          : "Daily pulse tracking keeps the score honest and catches drift early."
      }`,
      emphasis: null,
    };
  }

  if (!hasCheckinThisWeek && streak > 1) {
    return {
      text: `You're ${streak} weeks into a check-in streak. ${
        streak >= 8
          ? `That's exceptional — most people quit well before week 8.`
          : streak >= 4
          ? `Four weeks of consistency is where habits begin to self-sustain.`
          : `The hardest check-in is always the one that breaks a streak.`
      } This week's is still waiting.`,
      emphasis: `${streak}-week streak on the line.`,
    };
  }

  if (reachedGoals > 0) {
    return {
      text: `You've hit ${reachedGoals} score ${reachedGoals === 1 ? "goal" : "goals"}. Setting a new, slightly harder target is how the score keeps meaning something — otherwise it becomes a number you've already won.`,
      emphasis: null,
    };
  }

  if (peaceScore != null && peaceScore < 50) {
    return {
      text: `A Peace Score below 50 is the platform showing you something real. The question isn't how to feel better immediately — it's which of your five scores is the floor, and what's underneath it.`,
      emphasis: "Your lowest score is worth examining.",
    };
  }

  // Default: neutral encouragement
  return {
    text: `Clarity compounds. The users who see the biggest score improvements aren't those with the most dramatic actions — they're the ones who show up consistently over 60–90 days. You're building that.`,
    emphasis: null,
  };
}

export function DailyInsightCard(props: Props) {
  const [insightIndex, setInsightIndex] = useState(0);
  const [refreshed, setRefreshed] = useState(false);

  const insight = generateInsight(props);

  // Pick a contextual Stoic quote based on the insight type
  const { burnoutRisk, trendHistory } = props;
  const histLen = trendHistory.length;
  const delta = histLen > 1
    ? trendHistory[histLen - 1].peaceScore - trendHistory[histLen - 2].peaceScore
    : null;
  const quoteContext =
    burnoutRisk != null && burnoutRisk > 72
      ? "pulse"
      : delta != null && delta >= 10
      ? "progress_up"
      : delta != null && delta <= -8
      ? "progress_down"
      : "checkin";
  const stoicQuote = getStoicQuoteForContext(quoteContext);

  const handleRefresh = () => {
    setInsightIndex((i) => i + 1);
    setRefreshed(true);
    setTimeout(() => setRefreshed(false), 1200);
  };

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={insightIndex}
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -4 }}
        transition={{ duration: 0.3 }}
        className="rounded-2xl border border-slate-100 bg-gradient-to-br from-slate-50/80 via-blue-50/20 to-stone-50 p-5 shadow-sm"
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center">
              <Brain className="w-3.5 h-3.5 text-slate-500" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-700 leading-none">Personal Insight</p>
              <p className="text-[10px] text-stone-400 mt-0.5">Based on your actual data</p>
            </div>
          </div>
          <button
            onClick={handleRefresh}
            className="shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-stone-300 hover:text-slate-500 hover:bg-slate-100 transition-all"
            title="Different angle"
          >
            <RefreshCw className={`w-3 h-3 ${refreshed ? "animate-spin" : ""}`} />
          </button>
        </div>

        {/* Emphasis pill */}
        {insight.emphasis && (
          <div className="mb-2">
            <span className="inline-block text-[10px] font-bold text-slate-600 bg-slate-100 rounded-full px-2.5 py-0.5 uppercase tracking-wide">
              {insight.emphasis}
            </span>
          </div>
        )}

        {/* Insight text */}
        <p className="text-sm text-slate-700 leading-relaxed">{insight.text}</p>

        {/* Stoic quote divider */}
        <div className="mt-4 pt-3 border-t border-slate-100/80">
          <p className="text-[11px] text-stone-400 italic leading-relaxed">
            &ldquo;{stoicQuote.text}&rdquo;
            {stoicQuote.author && (
              <span className="not-italic font-medium text-stone-400"> — {stoicQuote.author}</span>
            )}
          </p>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

"use client";

import type { TrendData } from "@/types";

function getTrendSentence(history: TrendData[]): {
  text: string;
  icon: string;
  color: string;
} {
  if (!history || history.length < 2) {
    return {
      text: "Your baseline is established. Complete more check-ins to reveal your trend.",
      icon: "📊",
      color: "text-slate-calm",
    };
  }

  const recent = history.slice(-3);
  const first = recent[0].peaceScore;
  const last = recent[recent.length - 1].peaceScore;
  const delta = last - first;
  const absDelta = Math.abs(Math.round(delta));
  const months = recent.length;

  if (delta >= 10) {
    return {
      text: `Your Peace Score has risen ${absDelta} points over the last ${months} months — real momentum is building.`,
      icon: "📈",
      color: "text-green-700",
    };
  }
  if (delta >= 4) {
    return {
      text: `A steady ${absDelta}-point rise over ${months} months — you're trending in the right direction.`,
      icon: "↗️",
      color: "text-green-600",
    };
  }
  if (delta <= -10) {
    return {
      text: `Your Peace Score has dropped ${absDelta} points recently — this pattern is worth examining calmly.`,
      icon: "⚠️",
      color: "text-amber-700",
    };
  }
  if (delta <= -4) {
    return {
      text: `A gentle decline of ${absDelta} points over ${months} months — consider which area needs attention.`,
      icon: "↘️",
      color: "text-amber-600",
    };
  }

  return {
    text: `Your Peace Score has held steady at ~${Math.round(last)} — consistency is a foundation in itself.`,
    icon: "⚖️",
    color: "text-blue-700",
  };
}

export function ScoreTrendNarrative({ history }: { history: TrendData[] }) {
  const { text, icon, color } = getTrendSentence(history);
  return (
    <p className={`text-xs mt-2 font-medium leading-relaxed ${color}`}>
      {icon} {text}
    </p>
  );
}

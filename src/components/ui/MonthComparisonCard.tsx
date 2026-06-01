"use client";

import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, Minus, BarChart2 } from "lucide-react";
import { getStoicQuoteForContext } from "@/lib/stoic";

type TrendData = {
  month: string;
  peaceScore: number;
};

type Props = {
  trendHistory: TrendData[];
};

export function MonthComparisonCard({ trendHistory }: Props) {
  if (!trendHistory || trendHistory.length < 2) return null;

  const current = trendHistory[trendHistory.length - 1];
  const previous = trendHistory[trendHistory.length - 2];
  const delta = Math.round(current.peaceScore - previous.peaceScore);
  const absDelta = Math.abs(delta);

  const isUp = delta > 0;
  const isFlat = delta === 0;

  const TrendIcon = isUp ? TrendingUp : isFlat ? Minus : TrendingDown;

  const bgColor = isUp
    ? "from-emerald-50/60 via-teal-50/20 to-stone-50 border-emerald-100/80"
    : isFlat
    ? "from-stone-50 to-stone-50 border-stone-100"
    : "from-rose-50/40 via-orange-50/20 to-stone-50 border-rose-100/60";

  const deltaTextColor = isUp ? "text-emerald-600" : isFlat ? "text-stone-400" : "text-rose-500";
  const deltaIconColor = isUp ? "text-emerald-400" : isFlat ? "text-stone-300" : "text-rose-400";

  const message = isUp
    ? absDelta >= 15
      ? `A ${absDelta}-point gain — that's a meaningful shift. Something is working.`
      : absDelta >= 8
      ? `A solid ${absDelta}-point rise. Keep the habits that drove this.`
      : `A small but real improvement. Consistency compounds.`
    : isFlat
    ? "Your score held steady. Stability is its own form of progress."
    : absDelta >= 15
    ? `A ${absDelta}-point drop. Worth understanding what changed.`
    : "A slight dip — normal fluctuation unless the pattern continues.";

  const quoteContext = isUp ? "progress_up" : "progress_down";
  const stoicQuote = getStoicQuoteForContext(quoteContext);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 260, damping: 26 }}
      className={`rounded-2xl border bg-gradient-to-br ${bgColor} p-4`}
    >
      {/* Header */}
      <div className="flex items-center gap-2 mb-3">
        <BarChart2 className="w-4 h-4 text-stone-400" />
        <span className="text-xs font-semibold text-matte-black">Month over Month</span>
      </div>

      {/* Score comparison row */}
      <div className="flex items-center gap-2 mb-3">
        {/* Previous score */}
        <div className="text-center px-3 py-2 rounded-xl bg-white/60">
          <p className="text-2xl font-bold text-stone-400 tabular-nums leading-none">{Math.round(previous.peaceScore)}</p>
          <p className="text-[10px] text-stone-400 mt-1">{previous.month}</p>
        </div>

        {/* Delta arrow */}
        <div className="flex flex-col items-center px-2">
          <TrendIcon className={`w-5 h-5 ${deltaIconColor}`} />
          <span className={`text-xs font-bold tabular-nums mt-0.5 ${deltaTextColor}`}>
            {isUp ? "+" : isFlat ? "" : ""}{delta}
          </span>
        </div>

        {/* Current score */}
        <div className="text-center px-3 py-2 rounded-xl bg-white/80 shadow-sm">
          <p className="text-2xl font-bold text-matte-black tabular-nums leading-none">{Math.round(current.peaceScore)}</p>
          <p className="text-[10px] text-slate-calm mt-1">{current.month}</p>
        </div>

        {/* Message */}
        <div className="flex-1 pl-2">
          <p className="text-xs text-slate-calm leading-relaxed">{message}</p>
        </div>
      </div>

      {/* Stoic quote */}
      <div className="pt-2.5 border-t border-white/60">
        <p className="text-[11px] text-stone-400 italic leading-relaxed">
          &ldquo;{stoicQuote.text}&rdquo;
          {stoicQuote.author && (
            <span className="not-italic font-medium"> — {stoicQuote.author}</span>
          )}
        </p>
      </div>
    </motion.div>
  );
}

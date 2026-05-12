"use client";

import { useState, useEffect, useRef } from "react";
import { getScoreColor, getScoreLabel, getScoreLevel } from "@/types";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

// ── ScoreLegend ────────────────────────────────────────────────────────────────

const LEGEND_BANDS = [
  { min: 0,  max: 39,  label: "Needs Attention", color: "#EF4444" },
  { min: 40, max: 59,  label: "Building",        color: "#F97316" },
  { min: 60, max: 74,  label: "Stable",          color: "#EAB308" },
  { min: 75, max: 89,  label: "Thriving",        color: "#84CC16" },
  { min: 90, max: 100, label: "Flourishing",     color: "#22C55E" },
];

export function ScoreLegend({ currentScore }: { currentScore?: number }) {
  return (
    <div className="flex flex-wrap gap-x-4 gap-y-1.5">
      {LEGEND_BANDS.map((band) => {
        const active = currentScore !== undefined && currentScore >= band.min && currentScore <= band.max;
        return (
          <div key={band.label} className={cn("flex items-center gap-1.5 transition-opacity", active ? "opacity-100" : "opacity-40")}>
            <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: band.color }} />
            <span className={cn("text-xs", active ? "font-semibold text-matte-black" : "text-slate-calm")}>
              {band.min}–{band.max === 100 ? "100" : band.max} · {band.label}
            </span>
          </div>
        );
      })}
    </div>
  );
}

// ── ScoreDelta ─────────────────────────────────────────────────────────────────

export function ScoreDelta({ current, previous }: { current: number; previous: number | null }) {
  if (previous === null) return null;
  const delta = Math.round(current - previous);
  if (delta === 0) return <span className="text-xs text-slate-calm">No change since last time</span>;
  const up = delta > 0;
  return (
    <span className={cn("inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full",
      up ? "bg-green-50 text-green-700" : "bg-red-50 text-red-600"
    )}>
      {up ? "↑" : "↓"} {up ? "+" : ""}{delta} pts since last time
    </span>
  );
}

interface ScoreRingProps {
  score: number;
  size?: "sm" | "md" | "lg" | "xl";
  showLabel?: boolean;
  showScore?: boolean;
  label?: string;
  animate?: boolean;
  className?: string;
}

const sizes = {
  sm: { svg: 72, stroke: 6, radius: 28, fontSize: "text-lg", labelSize: "text-xs" },
  md: { svg: 100, stroke: 7, radius: 40, fontSize: "text-2xl", labelSize: "text-xs" },
  lg: { svg: 140, stroke: 8, radius: 56, fontSize: "text-4xl", labelSize: "text-sm" },
  xl: { svg: 180, stroke: 10, radius: 72, fontSize: "text-5xl", labelSize: "text-base" },
};

export function ScoreRing({
  score,
  size = "md",
  showLabel = true,
  showScore = true,
  label,
  animate = true,
  className,
}: ScoreRingProps) {
  const { svg, stroke, radius, fontSize, labelSize } = sizes[size];
  const circumference = 2 * Math.PI * radius;
  const progress = (score / 100) * circumference;
  const color = getScoreColor(score);
  const scoreLabel = label || getScoreLabel(score);
  const center = svg / 2;
  const filterId = `glow-${size}-${Math.round(score)}`;

  // Animated counter
  const [displayScore, setDisplayScore] = useState(animate ? 0 : score);
  const frameRef = useRef<number | null>(null);
  useEffect(() => {
    if (!animate) { setDisplayScore(score); return; }
    const start = performance.now();
    const duration = 1400;
    const tick = (now: number) => {
      const t = Math.min((now - start) / duration, 1);
      const ease = 1 - Math.pow(1 - t, 3); // cubic ease-out
      setDisplayScore(Math.round(ease * score));
      if (t < 1) frameRef.current = requestAnimationFrame(tick);
    };
    frameRef.current = requestAnimationFrame(tick);
    return () => { if (frameRef.current) cancelAnimationFrame(frameRef.current); };
  }, [score, animate]);

  return (
    <div className={cn("flex flex-col items-center gap-2", className)}>
      <div className="relative" style={{ width: svg, height: svg }}>
        <svg
          width={svg}
          height={svg}
          viewBox={`0 0 ${svg} ${svg}`}
          className="-rotate-90"
        >
          <defs>
            <filter id={filterId} x="-30%" y="-30%" width="160%" height="160%">
              <feGaussianBlur in="SourceGraphic" stdDeviation="3" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
          {/* Track */}
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke="#F0EFE8"
            strokeWidth={stroke}
          />
          {/* Progress with glow */}
          <motion.circle
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={circumference}
            filter={`url(#${filterId})`}
            initial={animate ? { strokeDashoffset: circumference } : { strokeDashoffset: circumference - progress }}
            animate={{ strokeDashoffset: circumference - progress }}
            transition={{ duration: 1.5, ease: "easeOut", delay: 0.2 }}
          />
        </svg>

        {/* Center content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          {showScore && (
            <span
              className={cn("font-bold font-sans leading-none", fontSize)}
              style={{ color }}
            >
              {displayScore}
            </span>
          )}
        </div>
      </div>

      {showLabel && (
        <motion.span
          initial={animate ? { opacity: 0 } : { opacity: 1 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className={cn("font-medium text-center", labelSize)}
          style={{ color }}
        >
          {scoreLabel}
        </motion.span>
      )}
    </div>
  );
}

interface MetricBarProps {
  label: string;
  score: number;
  maxScore?: number;
  animate?: boolean;
  tooltip?: string;
  className?: string;
}

export function MetricBar({
  label,
  score,
  maxScore = 100,
  animate = true,
  tooltip,
  className,
}: MetricBarProps) {
  const [showTip, setShowTip] = useState(false);
  const percentage = (score / maxScore) * 100;
  const color = getScoreColor(score);

  return (
    <div className={cn("space-y-1.5 group", className)}>
      <div className="flex items-center justify-between">
        <div className="relative flex items-center gap-1">
          <span className="text-sm font-medium text-deep-charcoal group-hover:text-matte-black transition-colors">{label}</span>
          {tooltip && (
            <button
              type="button"
              className="w-4 h-4 rounded-full bg-stone-200 text-stone-500 text-[10px] font-bold flex items-center justify-center hover:bg-stone-300 transition-colors focus:outline-none"
              onMouseEnter={() => setShowTip(true)}
              onMouseLeave={() => setShowTip(false)}
              onFocus={() => setShowTip(true)}
              onBlur={() => setShowTip(false)}
              aria-label={`Info: ${tooltip}`}
            >
              ?
            </button>
          )}
          {tooltip && showTip && (
            <div className="absolute left-0 bottom-full mb-2 z-20 w-56 bg-matte-black text-warm-white text-xs rounded-xl px-3 py-2 shadow-lg leading-relaxed pointer-events-none">
              {tooltip}
              <div className="absolute top-full left-4 -mt-px border-4 border-transparent border-t-matte-black" />
            </div>
          )}
        </div>
        <span className="text-sm font-semibold tabular-nums" style={{ color }}>
          {Math.round(score)}
        </span>
      </div>
      <div className="h-2.5 bg-stone-100 rounded-full overflow-hidden">
        <motion.div
          className="h-full rounded-full"
          style={{
            background: `linear-gradient(90deg, ${color}99, ${color})`,
          }}
          initial={animate ? { width: 0 } : { width: `${percentage}%` }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 1.2, ease: "easeOut", delay: 0.1 }}
        />
      </div>
    </div>
  );
}

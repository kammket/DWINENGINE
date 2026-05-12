"use client";

import { motion } from "framer-motion";
import { getDailyReflection, type StoicReflection } from "@/lib/stoic";
import { cn } from "@/lib/utils";

interface DailyReflectionProps {
  reflection?: StoicReflection;
  variant?: "banner" | "card" | "inline" | "hero";
  className?: string;
  showLabel?: boolean;
}

export function DailyReflection({
  reflection,
  variant = "card",
  className,
  showLabel = true,
}: DailyReflectionProps) {
  const r = reflection ?? getDailyReflection();

  if (variant === "hero") {
    return (
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className={cn("text-center py-16 px-6", className)}
      >
        {showLabel && (
          <p className="text-xs font-semibold text-soft-gold uppercase tracking-[0.2em] mb-6">
            Today&apos;s Reflection
          </p>
        )}
        <blockquote className="font-serif italic text-2xl md:text-3xl text-matte-black leading-relaxed max-w-2xl mx-auto mb-6">
          &ldquo;{r.text}&rdquo;
        </blockquote>
        {r.author && (
          <cite className="text-sm text-soft-gold not-italic font-medium">
            — {r.author}
          </cite>
        )}
      </motion.div>
    );
  }

  if (variant === "banner") {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, ease: "easeOut" }}
        className={cn(
          "bg-gradient-to-r from-matte-black to-deep-charcoal px-6 py-5 text-center",
          className
        )}
      >
        <blockquote className="font-serif italic text-base text-stone-300 leading-relaxed">
          &ldquo;{r.text}&rdquo;
          {r.author && (
            <cite className="not-italic text-soft-gold ml-2 text-sm">— {r.author}</cite>
          )}
        </blockquote>
      </motion.div>
    );
  }

  if (variant === "inline") {
    return (
      <div className={cn("border-l-2 border-soft-gold pl-4 py-1", className)}>
        <p className="font-serif italic text-sm text-slate-calm leading-relaxed">
          &ldquo;{r.text}&rdquo;
        </p>
        {r.author && (
          <span className="text-xs text-soft-gold font-medium mt-1 block">— {r.author}</span>
        )}
      </div>
    );
  }

  // Default: card
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.2 }}
      className={cn(
        "bg-white rounded-2xl p-5 shadow-sm border border-stone-100 border-l-[3px] border-l-soft-gold",
        className
      )}
    >
      {showLabel && (
        <p className="text-[10px] font-semibold text-soft-gold uppercase tracking-[0.2em] mb-3">
          Today&apos;s Reflection
        </p>
      )}
      <blockquote className="font-serif italic text-sm text-slate-calm leading-relaxed mb-2">
        &ldquo;{r.text}&rdquo;
      </blockquote>
      {r.author && (
        <cite className="text-xs text-soft-gold font-medium not-italic">
          — {r.author}
        </cite>
      )}
    </motion.div>
  );
}

"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, BookOpen } from "lucide-react";
import { cn } from "@/lib/utils";

interface HowItWorksStep {
  title: string;
  body: string;
}

interface HowItWorksProps {
  title?: string;
  summary: string;
  steps: HowItWorksStep[];
  disclaimer?: string;
  className?: string;
}

export function HowItWorks({
  title = "How this score is calculated",
  summary,
  steps,
  disclaimer,
  className,
}: HowItWorksProps) {
  const [open, setOpen] = useState(false);

  return (
    <div
      className={cn(
        "rounded-2xl border overflow-hidden transition-colors",
        className
      )}
      style={{
        borderColor: open ? "rgba(201,168,76,0.4)" : "var(--card-border)",
        backgroundColor: "var(--subtle-bg)",
      }}
    >
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="w-full flex items-center justify-between gap-3 px-5 py-4 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-soft-gold focus-visible:ring-inset"
      >
        <div className="flex items-center gap-2.5">
          <BookOpen className="w-4 h-4 text-soft-gold flex-shrink-0" aria-hidden="true" />
          <span className="text-sm font-semibold" style={{ color: "var(--page-text)" }}>
            {title}
          </span>
        </div>
        <ChevronDown
          className={cn(
            "w-4 h-4 text-slate-calm flex-shrink-0 transition-transform duration-200",
            open && "rotate-180"
          )}
          aria-hidden="true"
        />
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="content"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-5 space-y-4 border-t" style={{ borderColor: "var(--card-border)" }}>
              <p className="text-sm text-slate-calm leading-relaxed mt-4">{summary}</p>

              {steps.length > 0 && (
                <ol className="space-y-3">
                  {steps.map((step, i) => (
                    <li key={i} className="flex gap-3">
                      <span className="flex-shrink-0 w-5 h-5 rounded-full bg-brand-100 text-soft-gold text-[10px] font-bold flex items-center justify-center mt-0.5">
                        {i + 1}
                      </span>
                      <div>
                        <p className="text-xs font-semibold mb-0.5" style={{ color: "var(--page-text)" }}>
                          {step.title}
                        </p>
                        <p className="text-xs text-slate-calm leading-relaxed">{step.body}</p>
                      </div>
                    </li>
                  ))}
                </ol>
              )}

              {disclaimer && (
                <p className="text-[11px] text-stone-400 leading-relaxed border-t pt-3" style={{ borderColor: "var(--card-border)" }}>
                  {disclaimer}
                </p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

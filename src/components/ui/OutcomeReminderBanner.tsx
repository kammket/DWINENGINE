"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { BookOpen, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

type JournalEntry = {
  id: string;
  title: string;
  outcome: string | null;
  outcomeDate: string | null;
  createdAt: string;
};

export function OutcomeReminderBanner() {
  const [staleCount, setStaleCount] = useState(0);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    fetch("/api/journal?limit=30")
      .then((r) => r.json())
      .then((json) => {
        if (json.success) {
          const cutoff = new Date();
          cutoff.setDate(cutoff.getDate() - 21);
          const stale = (json.entries as JournalEntry[]).filter(
            (e) => !e.outcome && new Date(e.createdAt) < cutoff
          );
          setStaleCount(stale.length);
        }
      });
  }, []);

  if (!staleCount || dismissed) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, height: 0 }}
        animate={{ opacity: 1, height: "auto" }}
        exit={{ opacity: 0, height: 0 }}
        className="overflow-hidden"
      >
        <div className="flex items-center gap-3 px-4 py-3 rounded-2xl border bg-violet-50 border-violet-200">
          <BookOpen className="w-4 h-4 text-violet-600 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-violet-700">
              {staleCount} decision{staleCount > 1 ? "s" : ""} awaiting an
              outcome
            </p>
            <p className="text-xs text-violet-600 leading-relaxed">
              Entries older than 3 weeks without recorded outcomes — what
              actually happened?
            </p>
          </div>
          <Link
            href="/journal"
            className="text-xs font-semibold text-violet-700 whitespace-nowrap hover:underline flex-shrink-0"
          >
            Review →
          </Link>
          <button
            onClick={() => setDismissed(true)}
            className="flex-shrink-0 text-violet-400 hover:text-violet-600 transition-colors"
            aria-label="Dismiss"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

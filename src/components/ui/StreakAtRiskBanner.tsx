"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Flame, X } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { getReflectionByCategory } from "@/lib/stoic";

type Props = {
  streak: number;
  hasCheckinThisWeek: boolean;
};

export function StreakAtRiskBanner({ streak, hasCheckinThisWeek }: Props) {
  const [dismissed, setDismissed] = useState(false);

  const { hoursUntilSunday, isAtRisk } = useMemo(() => {
    const now = new Date();
    const day = now.getDay(); // 0=Sun, 1=Mon, ..., 6=Sat
    const isAtRisk = streak > 0 && !hasCheckinThisWeek && day >= 3;

    const sunday = new Date(now);
    const daysUntilSun = day === 0 ? 0 : 7 - day;
    sunday.setDate(now.getDate() + daysUntilSun);
    sunday.setHours(23, 59, 59, 999);
    const hoursUntilSunday = Math.ceil(
      (sunday.getTime() - now.getTime()) / (1000 * 60 * 60)
    );

    return { hoursUntilSunday, isAtRisk };
  }, [streak, hasCheckinThisWeek]);

  const urgency = hoursUntilSunday <= 12 ? "critical" : hoursUntilSunday <= 36 ? "high" : "medium";
  const persistenceQuote = getReflectionByCategory("persistence");

  const styles = {
    critical: {
      bg: "from-rose-50/90 to-orange-50/60 border-rose-200/70",
      text: "text-rose-700",
      subtext: "text-rose-500/80",
      icon: "text-rose-400",
      btn: "bg-rose-500 hover:bg-rose-600 text-white",
    },
    high: {
      bg: "from-orange-50/90 to-amber-50/50 border-orange-200/60",
      text: "text-orange-700",
      subtext: "text-orange-500/70",
      icon: "text-orange-400",
      btn: "bg-orange-500 hover:bg-orange-600 text-white",
    },
    medium: {
      bg: "from-amber-50/80 to-yellow-50/40 border-amber-200/50",
      text: "text-amber-700",
      subtext: "text-amber-500/70",
      icon: "text-amber-400",
      btn: "bg-amber-500 hover:bg-amber-600 text-white",
    },
  }[urgency];

  if (!isAtRisk || dismissed) return null;

  const message =
    urgency === "critical"
      ? `Your ${streak}-week streak expires in ${hoursUntilSunday}h. Check in now.`
      : urgency === "high"
      ? `Your ${streak}-week streak expires Sunday. Don't let it slip.`
      : `Your ${streak}-week check-in streak needs one more action this week.`;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -10, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -8, scale: 0.97 }}
        transition={{ type: "spring", stiffness: 300, damping: 28 }}
        className={`rounded-2xl border bg-gradient-to-r ${styles.bg} px-4 py-3.5`}
      >
        {/* Main row */}
        <div className="flex items-center gap-3">
          <Flame className={`w-5 h-5 shrink-0 ${styles.icon} ${urgency === "critical" ? "animate-pulse" : ""}`} />

          <div className="flex-1 min-w-0">
            <p className={`text-sm font-semibold ${styles.text}`}>{message}</p>
            <p className={`text-[11px] mt-0.5 ${styles.subtext} italic`}>
              &ldquo;{persistenceQuote.text}&rdquo;
              {persistenceQuote.author && ` — ${persistenceQuote.author}`}
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Link
              href="/checkin"
              className={`text-xs font-bold px-3 py-1.5 rounded-full transition-all shadow-sm ${styles.btn}`}
            >
              Check in →
            </Link>
            <button
              onClick={() => setDismissed(true)}
              className="text-stone-300 hover:text-stone-500 transition-colors w-5 h-5 flex items-center justify-center rounded-full hover:bg-stone-100"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

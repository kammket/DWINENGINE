"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  AlertCircle,
  Clock,
  BookOpen,
  Target,
  Zap,
  CheckCircle2,
  ArrowRight,
} from "lucide-react";

type Props = {
  streak: number;
  hasCheckinThisWeek: boolean;
  stalestCalcDays: number | null;
  staleJournalCount: number;
  hasGoals: boolean;
  pulseToday: boolean;
};

type Priority = {
  icon: React.ReactNode;
  label: string;
  desc: string;
  href: string;
  color: string;
  bg: string;
  urgent?: boolean;
};

function getPriority({
  streak,
  hasCheckinThisWeek,
  stalestCalcDays,
  staleJournalCount,
  hasGoals,
  pulseToday,
}: Props): Priority {
  // 1. Streak at risk
  if (streak > 0 && !hasCheckinThisWeek) {
    return {
      icon: <AlertCircle className="w-4 h-4" />,
      label: "Protect your streak",
      desc: `Your ${streak}-week streak is at risk — check in before this week ends.`,
      href: "/checkin",
      color: "text-orange-700",
      bg: "bg-orange-50 border-orange-200",
      urgent: true,
    };
  }

  // 2. Stale calculator score
  if (stalestCalcDays !== null && stalestCalcDays > 14) {
    return {
      icon: <Clock className="w-4 h-4" />,
      label: "Refresh a calculator",
      desc: `One of your scores is ${stalestCalcDays} days old — life changes, scores should too.`,
      href: "/calculators",
      color: "text-amber-700",
      bg: "bg-amber-50 border-amber-200",
    };
  }

  // 3. Journal outcomes overdue
  if (staleJournalCount > 0) {
    return {
      icon: <BookOpen className="w-4 h-4" />,
      label: "Record a decision outcome",
      desc: `${staleJournalCount} journal ${staleJournalCount === 1 ? "entry has" : "entries have"} been waiting 3+ weeks for an outcome.`,
      href: "/journal",
      color: "text-violet-700",
      bg: "bg-violet-50 border-violet-200",
    };
  }

  // 4. No goals yet
  if (!hasGoals) {
    return {
      icon: <Target className="w-4 h-4" />,
      label: "Set your first goal",
      desc: "Goals give your scores direction — run a calculator and set a target.",
      href: "/calculators",
      color: "text-blue-700",
      bg: "bg-blue-50 border-blue-200",
    };
  }

  // 5. No pulse today
  if (!pulseToday) {
    return {
      icon: <Zap className="w-4 h-4" />,
      label: "Log today's pulse",
      desc: "A 30-second daily check builds your wellbeing timeline.",
      href: "/pulse",
      color: "text-teal-700",
      bg: "bg-teal-50 border-teal-200",
    };
  }

  // 6. All good
  return {
    icon: <CheckCircle2 className="w-4 h-4" />,
    label: "You're on track",
    desc: "All key habits checked for now. Consistency is the practice.",
    href: "/dashboard",
    color: "text-soft-gold",
    bg: "bg-amber-50 border-amber-100",
  };
}

export function DailyOneThingCard(props: Props) {
  const priority = getPriority(props);

  return (
    <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}>
      <Link href={priority.href}>
        <div
          className={`flex items-center gap-3 px-4 py-3 rounded-2xl border cursor-pointer transition-all hover:shadow-sm ${priority.bg}`}
        >
          <div className={`flex-shrink-0 ${priority.color}`}>
            {priority.icon}
          </div>
          <div className="flex-1 min-w-0">
            <p className={`text-xs font-bold ${priority.color}`}>
              {priority.urgent && "⚡ "}One thing today —{" "}
              <span className="font-semibold">{priority.label}</span>
            </p>
            <p className="text-xs text-slate-calm leading-relaxed">
              {priority.desc}
            </p>
          </div>
          <ArrowRight
            className={`w-4 h-4 flex-shrink-0 ${priority.color} opacity-60`}
          />
        </div>
      </Link>
    </motion.div>
  );
}

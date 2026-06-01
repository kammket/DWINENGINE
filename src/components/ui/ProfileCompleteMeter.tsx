"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Card, CardHeader, CardTitle, CardDescription } from "./Card";
import { CheckCircle2, Circle, ArrowRight } from "lucide-react";

export type ProfileFlags = {
  hasOnboarding: boolean;
  hasCalculator: boolean;
  hasAllCalculators: boolean;
  hasCheckin: boolean;
  hasGoal: boolean;
  hasJournal: boolean;
  hasReflection: boolean;
  hasSimulation: boolean;
};

const STEPS: Array<{
  key: keyof ProfileFlags;
  label: string;
  href: string;
}> = [
  { key: "hasOnboarding", label: "Complete onboarding", href: "/onboarding" },
  { key: "hasCalculator", label: "Run any calculator", href: "/calculators" },
  {
    key: "hasAllCalculators",
    label: "Run all 5 calculators",
    href: "/calculators",
  },
  { key: "hasCheckin", label: "First weekly check-in", href: "/checkin" },
  { key: "hasGoal", label: "Set a score goal", href: "/calculators" },
  { key: "hasJournal", label: "Write a journal entry", href: "/journal" },
  {
    key: "hasReflection",
    label: "Request an AI reflection",
    href: "/dashboard",
  },
  { key: "hasSimulation", label: "Run a scenario simulation", href: "/simulate" },
];

export function ProfileCompleteMeter({ flags }: { flags: ProfileFlags }) {
  const done = STEPS.filter((s) => flags[s.key]).length;
  const pct = Math.round((done / STEPS.length) * 100);
  const nextStep = STEPS.find((s) => !flags[s.key]);

  return (
    <Card padding="lg">
      <CardHeader>
        <CardTitle>Profile Completeness</CardTitle>
        <CardDescription>
          {pct}% complete · {done} of {STEPS.length} milestones reached
        </CardDescription>
      </CardHeader>

      <div className="h-2 bg-stone-100 rounded-full overflow-hidden mb-4">
        <motion.div
          className="h-full rounded-full bg-gradient-to-r from-soft-gold to-green-400"
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-1">
        {STEPS.map((step) => {
          const completed = flags[step.key];
          return (
            <Link key={step.key} href={completed ? "#" : step.href}>
              <div
                className={`flex items-center gap-2.5 px-2 py-1.5 rounded-xl transition-colors ${
                  !completed
                    ? "hover:bg-stone-50 cursor-pointer"
                    : "opacity-55 cursor-default"
                }`}
              >
                {completed ? (
                  <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
                ) : (
                  <Circle className="w-4 h-4 text-stone-300 flex-shrink-0" />
                )}
                <p
                  className={`text-xs flex-1 leading-tight ${
                    completed
                      ? "line-through text-stone-400"
                      : "text-matte-black font-medium"
                  }`}
                >
                  {step.label}
                </p>
                {!completed && (
                  <ArrowRight className="w-3 h-3 text-stone-300 flex-shrink-0" />
                )}
              </div>
            </Link>
          );
        })}
      </div>

      {nextStep && (
        <div className="mt-3 pt-3 border-t border-stone-100">
          <p className="text-[11px] text-slate-calm">
            Next up:{" "}
            <Link
              href={nextStep.href}
              className="text-soft-gold font-semibold hover:underline"
            >
              {nextStep.label}
            </Link>
          </p>
        </div>
      )}

      {done === STEPS.length && (
        <div className="mt-3 pt-3 border-t border-stone-100 text-center">
          <p className="text-xs font-semibold text-green-600">
            ✨ Profile complete — you&apos;re getting the full Constavita experience
          </p>
        </div>
      )}
    </Card>
  );
}

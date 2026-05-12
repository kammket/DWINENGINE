"use client";

import { useMemo } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

type Props = {
  birthYear?: number | null;
  compact?: boolean;
};

const QUOTES = [
  { text: "Memento mori — remember you will die.", author: "Stoic maxim" },
  { text: "It is not that we have a short time to live, but that we waste a great deal of it.", author: "Seneca" },
  { text: "Think of yourself as dead. You have lived your life. Now take what's left and live it properly.", author: "Marcus Aurelius" },
  { text: "Perfecting our lives is the work of a lifetime.", author: "Epictetus" },
];

export function MementoMori({ birthYear, compact = false }: Props) {
  const stats = useMemo(() => {
    const now = new Date();
    const currentYear = now.getFullYear();
    const weekOfYear = Math.ceil(
      (now.getTime() - new Date(currentYear, 0, 0).getTime()) / (7 * 86400000)
    );

    const ageInYears = birthYear ? currentYear - birthYear : null;
    const weeksLived = ageInYears ? ageInYears * 52 + weekOfYear : null;
    const LIFESPAN_WEEKS = 80 * 52;
    const weeksLeft = weeksLived ? LIFESPAN_WEEKS - weeksLived : null;
    const pctUsed = weeksLived ? Math.min(100, (weeksLived / LIFESPAN_WEEKS) * 100) : null;

    const dayOfYear = Math.ceil(
      (now.getTime() - new Date(currentYear, 0, 0).getTime()) / 86400000
    );
    const daysLeftInYear = 365 - dayOfYear;

    return { weekOfYear, weeksLived, weeksLeft, pctUsed, daysLeftInYear };
  }, [birthYear]);

  // Rotate quote by week number
  const quote = QUOTES[stats.weekOfYear % QUOTES.length];

  if (compact) {
    return (
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="text-2xl">⏳</span>
          <div>
            <p className="text-xs font-semibold text-stone-500 uppercase tracking-wider">
              Week {stats.weekOfYear} of the year
            </p>
            <p className="text-xs text-stone-400">
              {stats.daysLeftInYear} days remaining in {new Date().getFullYear()}
            </p>
          </div>
        </div>
        <p className="text-xs text-stone-400 italic hidden sm:block max-w-[200px] text-right leading-tight">
          &ldquo;{quote.text}&rdquo;
        </p>
      </div>
    );
  }

  return (
    <div className="bg-matte-black rounded-2xl p-6 space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold text-soft-gold uppercase tracking-[0.18em]">Memento Mori</p>
          <p className="text-warm-white font-serif text-lg font-bold mt-0.5">Remember you will die.</p>
        </div>
        <span className="text-3xl">⏳</span>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-white/5 rounded-xl p-3 text-center">
          <p className="text-2xl font-bold text-soft-gold">{stats.weekOfYear}</p>
          <p className="text-[10px] text-stone-400 mt-0.5 leading-tight">Week of<br />the year</p>
        </div>
        <div className="bg-white/5 rounded-xl p-3 text-center">
          <p className="text-2xl font-bold text-warm-white">{stats.daysLeftInYear}</p>
          <p className="text-[10px] text-stone-400 mt-0.5 leading-tight">Days left<br />this year</p>
        </div>
        {stats.weeksLeft !== null ? (
          <div className="bg-white/5 rounded-xl p-3 text-center">
            <p className="text-2xl font-bold text-warm-white">{stats.weeksLeft.toLocaleString()}</p>
            <p className="text-[10px] text-stone-400 mt-0.5 leading-tight">Weeks left<br />(est. 80yr life)</p>
          </div>
        ) : (
          <div className="bg-white/5 rounded-xl p-3 text-center flex items-center justify-center">
            <Link href="/settings" className="text-[10px] text-stone-400 hover:text-soft-gold transition-colors text-center leading-tight">
              Add birth year<br />in settings →
            </Link>
          </div>
        )}
      </div>

      {/* Life progress bar */}
      {stats.pctUsed !== null && (
        <div>
          <div className="flex justify-between text-[10px] text-stone-500 mb-1.5">
            <span>Life used</span>
            <span>{stats.pctUsed.toFixed(1)}%</span>
          </div>
          <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-soft-gold rounded-full transition-all"
              style={{ width: `${stats.pctUsed}%` }}
            />
          </div>
        </div>
      )}

      {/* Quote */}
      <div className="border-t border-white/10 pt-4">
        <p className="text-xs text-stone-400 italic leading-relaxed">
          &ldquo;{quote.text}&rdquo;
        </p>
        <p className="text-[10px] text-stone-500 mt-1.5">— {quote.author}</p>
      </div>

      {/* CTA */}
      <Link
        href="/intention"
        className="flex items-center justify-between text-xs font-semibold text-soft-gold hover:text-brand-300 transition-colors"
      >
        <span>Set today's intention</span>
        <ArrowRight className="w-3.5 h-3.5" />
      </Link>
    </div>
  );
}

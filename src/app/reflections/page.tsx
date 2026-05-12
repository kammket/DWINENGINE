"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { DashboardLayout } from "@/components/layout/Sidebar";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import {
  BookOpen, ChevronLeft, ChevronRight, Sparkles, Clock, Search, Calculator, ArrowRight,
} from "lucide-react";
import { formatRelativeTime } from "@/lib/utils";

type Reflection = {
  id: string;
  prompt: string;
  reflection: string;
  context: Record<string, unknown> | null;
  createdAt: string;
};

type Pagination = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

export default function ReflectionsPage() {
  const [reflections, setReflections] = useState<Reflection[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    setLoading(true);
    fetch(`/api/reflections?page=${currentPage}&limit=8`)
      .then((r) => r.json())
      .then((data) => {
        setReflections(data.reflections ?? []);
        setPagination(data.pagination ?? null);
      })
      .finally(() => setLoading(false));
  }, [currentPage]);

  const filtered = search.trim()
    ? reflections.filter(
        (r) =>
          r.prompt.toLowerCase().includes(search.toLowerCase()) ||
          r.reflection.toLowerCase().includes(search.toLowerCase())
      )
    : reflections;

  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <div className="flex items-center gap-2 mb-1">
            <BookOpen className="w-5 h-5 text-soft-gold" />
            <h1 className="font-serif text-2xl font-bold text-matte-black">
              Reflections Journal
            </h1>
          </div>
          <p className="text-slate-calm text-sm">
            Your saved insights from Logos — revisit them to track how your thinking evolves.
          </p>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search reflections…"
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-stone-200 bg-warm-white text-sm text-matte-black placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-soft-gold/30 focus:border-soft-gold transition-colors"
          />
        </div>

        {/* Loading skeleton */}
        {loading && (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="rounded-2xl bg-stone-100 animate-pulse h-32" />
            ))}
          </div>
        )}

        {/* Empty state */}
        {!loading && filtered.length === 0 && (
          search ? (
            <Card padding="lg" className="text-center">
              <Search className="w-8 h-8 text-stone-300 mx-auto mb-3" />
              <h3 className="font-semibold text-matte-black mb-1">No reflections match</h3>
              <p className="text-slate-calm text-sm">Try a different search term or clear the filter.</p>
            </Card>
          ) : (
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
              {/* Hero empty card */}
              <Card padding="lg" variant="elevated" className="border-t-4 border-t-soft-gold text-center">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-50 to-brand-50 flex items-center justify-center mx-auto mb-4">
                  <Sparkles className="w-8 h-8 text-soft-gold" />
                </div>
                <h3 className="font-serif text-lg font-bold text-matte-black mb-2">
                  Your journal awaits
                </h3>
                <p className="text-slate-calm text-sm leading-relaxed max-w-sm mx-auto mb-2">
                  Logos — your AI reflection companion — will save insights here after each calculator session. Over time, this becomes your personal library of self-knowledge.
                </p>
                <p className="stoic-quote text-xs max-w-xs mx-auto mb-6">
                  "He who does not know himself cannot know others." — Epictetus
                </p>

                {/* Steps */}
                <div className="text-left max-w-sm mx-auto space-y-3 mb-6">
                  {[
                    { step: "1", text: "Run any calculator to measure your peace score", href: "/calculators" },
                    { step: "2", text: "Click 'Get AI Reflection' in your results" },
                    { step: "3", text: "Your insights are saved here automatically" },
                  ].map(({ step, text, href }) => (
                    <div key={step} className="flex items-start gap-3">
                      <span className="w-6 h-6 rounded-full bg-amber-50 border border-soft-gold/30 text-soft-gold text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                        {step}
                      </span>
                      {href ? (
                        <Link href={href} className="text-sm text-matte-black hover:text-soft-gold transition-colors font-medium">
                          {text} <ArrowRight className="w-3 h-3 inline ml-0.5" />
                        </Link>
                      ) : (
                        <p className="text-sm text-slate-calm">{text}</p>
                      )}
                    </div>
                  ))}
                </div>

                <Link href="/calculators">
                  <Button variant="gold" size="sm" icon={<Calculator className="w-4 h-4" />}>
                    Start a Calculator
                  </Button>
                </Link>
              </Card>
            </motion.div>
          )
        )}

        {/* Reflection cards */}
        {!loading && (
          <AnimatePresence mode="popLayout">
            <div className="space-y-4">
              {filtered.map((r, i) => (
                <motion.div
                  key={r.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ delay: i * 0.04 }}
                >
                  <Card
                    padding="lg"
                    hover
                    className="cursor-pointer"
                    onClick={() =>
                      setExpandedId((prev) => (prev === r.id ? null : r.id))
                    }
                  >
                    {/* Prompt row */}
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-xl bg-amber-50 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Sparkles className="w-4 h-4 text-soft-gold" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-soft-gold uppercase tracking-wide mb-1">
                          Your prompt
                        </p>
                        <p className="text-sm text-matte-black font-medium leading-relaxed line-clamp-2">
                          {r.prompt}
                        </p>
                        <div className="flex items-center gap-1 mt-1">
                          <Clock className="w-3 h-3 text-stone-400" />
                          <span className="text-xs text-stone-400">
                            {formatRelativeTime(r.createdAt)}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Reflection body — collapsible */}
                    <AnimatePresence>
                      {expandedId === r.id && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="overflow-hidden"
                        >
                          <div className="mt-4 pt-4 border-t border-stone-100">
                            <p className="text-xs font-medium text-slate-calm uppercase tracking-wide mb-2">
                              Logos reflection
                            </p>
                            <p className="text-sm text-matte-black leading-relaxed whitespace-pre-wrap">
                              {r.reflection}
                            </p>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Expand hint when collapsed */}
                    {expandedId !== r.id && (
                      <p className="text-xs text-stone-400 mt-3 truncate italic pl-11">
                        {r.reflection.slice(0, 100)}…
                      </p>
                    )}
                  </Card>
                </motion.div>
              ))}
            </div>
          </AnimatePresence>
        )}

        {/* Pagination */}
        {pagination && pagination.totalPages > 1 && !search && (
          <div className="flex items-center justify-between">
            <Button
              variant="secondary"
              size="sm"
              icon={<ChevronLeft className="w-4 h-4" />}
              disabled={currentPage <= 1}
              onClick={() => setCurrentPage((p) => p - 1)}
            >
              Previous
            </Button>
            <span className="text-sm text-slate-calm">
              Page {pagination.page} of {pagination.totalPages}
            </span>
            <Button
              variant="secondary"
              size="sm"
              icon={<ChevronRight className="w-4 h-4" />}
              iconPosition="right"
              disabled={currentPage >= pagination.totalPages}
              onClick={() => setCurrentPage((p) => p + 1)}
            >
              Next
            </Button>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

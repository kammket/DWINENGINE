"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { PublicHeader, Footer } from "@/components/layout/PublicLayout";
import { ScoreRing } from "@/components/ui/ScoreVisuals";
import { DailyReflection } from "@/components/ui/DailyReflection";
import { getDailyReflection } from "@/lib/stoic";
import {
  Brain,
  TrendingUp,
  Shield,
  Zap,
  BarChart3,
  Heart,
  ArrowRight,
} from "lucide-react";

const PILLARS = [
  {
    icon: Brain,
    title: "Peace Score Engine",
    description:
      "A multi-dimensional sustainability index measuring your life across financial, emotional, cognitive, and temporal dimensions — without judgment.",
  },
  {
    icon: TrendingUp,
    title: "Future Scenario Explorer",
    description:
      "Visualise the tradeoffs of a new job, reduced debt, or a change of city before committing. Explore outcomes in a safe, consequence-free environment.",
  },
  {
    icon: BarChart3,
    title: "Longitudinal Clarity",
    description:
      "Track your evolution month-over-month. Patterns become visible when you stop looking at isolated moments and start seeing the arc.",
  },
  {
    icon: Zap,
    title: "Logos — AI Reflection",
    description:
      "Your Stoic AI companion analyses your patterns and offers calm, wise, personalised reflections grounded in philosophy and behavioural science.",
  },
  {
    icon: Shield,
    title: "Transparent Calculations",
    description:
      "Every score is fully explainable. You see what drives your results — no black boxes, no deterministic verdicts, no hidden algorithms.",
  },
  {
    icon: Heart,
    title: "Psychologically Safe Design",
    description:
      "Designed to preserve peace of mind. Never fear-inducing, never diagnostic. Always supportive, rational, and empowering. You retain full autonomy.",
  },
];

const CALCULATORS = [
  { name: "Financial Peace", score: 72, href: "/calculators/financial-peace" },
  { name: "Burnout Resilience", score: 58, href: "/calculators/burnout-risk" },
  { name: "Relationship Health", score: 81, href: "/calculators/relationship-sustainability" },
  { name: "Decision Quality", score: 65, href: "/calculators/decision-regret" },
  { name: "Time Value", score: 44, href: "/calculators/time-value" },
];

const PHILOSOPHY = [
  {
    emoji: "🏛️",
    title: "Stoic Foundation",
    description:
      "Inspired by Marcus Aurelius, Epictetus, and Seneca — we help you distinguish what is within your control from what is not, and act with reason rather than reaction.",
  },
  {
    emoji: "📊",
    title: "Behavioural Science",
    description:
      "Rooted in decision theory, behavioural economics, cognitive psychology, financial reasoning, and systems thinking — not intuition, not prediction.",
  },
  {
    emoji: "🔒",
    title: "Ethical by Design",
    description:
      "Explainable models, no diagnoses, no fear tactics, full GDPR compliance. The platform improves your decision quality — it never makes decisions for you.",
  },
];

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.65, ease: "easeOut" } },
};

export default function HomeClient({ dailyReflection }: { dailyReflection: ReturnType<typeof getDailyReflection> }) {

  return (
    <div className="min-h-screen bg-warm-white">
      <PublicHeader />

      {/* ── HERO ─────────────────────────────────── */}
      <section className="pt-36 pb-28 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
          >
            <span className="inline-flex items-center gap-2 bg-amber-50 text-soft-gold text-xs font-medium px-4 py-2 rounded-full mb-8 border border-amber-100">
              Stoic Decision Intelligence
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.75, delay: 0.1 }}
            className="font-serif text-5xl md:text-6xl lg:text-7xl font-bold text-matte-black leading-[1.1] mb-8 tracking-tight"
          >
            Measure the sustainability
            <br />
            <span className="gradient-text">of your life decisions.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.75, delay: 0.2 }}
            className="text-xl text-slate-calm max-w-2xl mx-auto mb-12 leading-relaxed font-light"
          >
            Clarity for the choices that shape your peace, energy, time, and future.
            <br className="hidden md:block" />
            Not therapy. Not prediction. A rational mirror.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.75, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8"
          >
            <Link href="/register">
              <Button variant="gold" size="lg" icon={<ArrowRight className="w-5 h-5" />} iconPosition="right">
                Begin Your Assessment — Free
              </Button>
            </Link>
            <Link href="/calculators">
              <Button variant="secondary" size="lg">
                Explore the Calculators
              </Button>
            </Link>
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="text-xs text-stone-400"
          >
            Free tier available · No credit card required · No diagnosis · Just clarity
          </motion.p>
        </div>

        {/* Score rings preview */}
        <motion.div
          initial={{ opacity: 0, y: 48 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.5 }}
          className="max-w-3xl mx-auto mt-20"
        >
          <div className="card-premium p-10 bg-gradient-to-br from-white via-stone-50 to-amber-50/30">
            <p className="text-center text-xs font-semibold text-soft-gold uppercase tracking-[0.2em] mb-8">
              Your Peace Intelligence Overview
            </p>
            <div className="grid grid-cols-3 md:grid-cols-5 gap-8 justify-items-center">
              {CALCULATORS.map((calc, i) => (
                <motion.div
                  key={calc.name}
                  initial={{ opacity: 0, scale: 0.85 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.6 + i * 0.1, duration: 0.5 }}
                  className="flex flex-col items-center gap-3"
                >
                  <ScoreRing score={calc.score} size="sm" animate />
                  <span className="text-xs text-slate-calm text-center leading-tight font-medium">
                    {calc.name}
                  </span>
                </motion.div>
              ))}
            </div>
            <p className="text-center text-xs text-stone-300 mt-8">
              Illustrative preview — your profile will reflect your actual inputs
            </p>
          </div>
        </motion.div>
      </section>

      {/* ── DAILY REFLECTION BANNER ───────────────────── */}
      <DailyReflection reflection={dailyReflection} variant="banner" />

      {/* ── EMOTIONAL PROMISE ────────────────────────── */}
      <section className="py-24 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            <p className="text-xs font-semibold text-soft-gold uppercase tracking-[0.2em] mb-4">
              The Experience
            </p>
            <h2 className="font-serif text-4xl md:text-5xl font-bold text-matte-black mb-6 leading-tight">
              When you leave, you should feel lighter.
            </h2>
            <p className="text-lg text-slate-calm max-w-2xl mx-auto leading-relaxed font-light">
              Not motivated. Not pressured. Not anxious about what you have not done.
              Calmer — because you understand your situation more clearly.
            </p>
          </motion.div>

          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="grid md:grid-cols-3 gap-5 mt-16 text-left"
          >
            {[
              { phrase: "My life is manageable.", icon: "◎" },
              { phrase: "I understand myself more clearly.", icon: "◈" },
              { phrase: "I can improve this sustainably.", icon: "◇" },
              { phrase: "I feel calmer than before.", icon: "○" },
              { phrase: "I feel more in control.", icon: "◆" },
              { phrase: "I feel mentally lighter.", icon: "◉" },
            ].map((item) => (
              <motion.div
                key={item.phrase}
                variants={fadeUp}
                className="flex items-center gap-4 p-5 rounded-2xl bg-white border border-stone-100 shadow-sm"
              >
                <span className="text-soft-gold text-lg flex-shrink-0">{item.icon}</span>
                <p className="font-serif italic text-matte-black text-sm leading-relaxed">
                  &ldquo;{item.phrase}&rdquo;
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── PILLARS ───────────────────────────────── */}
      <section className="py-24 px-6 bg-stone-light">
        <div className="max-w-6xl mx-auto">
          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <motion.div variants={fadeUp}>
              <p className="text-xs font-semibold text-soft-gold uppercase tracking-[0.2em] mb-4">
                Platform Intelligence
              </p>
              <h2 className="font-serif text-4xl font-bold text-matte-black mb-4">
                Built for human complexity
              </h2>
              <p className="text-slate-calm max-w-xl mx-auto font-light">
                Six analytical dimensions, designed with behavioural science and Stoic principles to give you clarity without judgment.
              </p>
            </motion.div>
          </motion.div>

          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {PILLARS.map((pillar) => (
              <motion.div key={pillar.title} variants={fadeUp}>
                <Card hover padding="lg" className="h-full group transition-all duration-500">
                  <div className="w-11 h-11 bg-amber-50 rounded-2xl flex items-center justify-center mb-5 group-hover:bg-amber-100 transition-colors duration-300">
                    <pillar.icon className="w-5 h-5 text-soft-gold" />
                  </div>
                  <h3 className="font-semibold text-matte-black mb-3 text-base">{pillar.title}</h3>
                  <p className="text-sm text-slate-calm leading-relaxed">{pillar.description}</p>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── CALCULATOR PREVIEW ────────────────────────── */}
      <section className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-xs font-semibold text-soft-gold uppercase tracking-[0.2em] mb-4">
              Decision Calculators
            </p>
            <h2 className="font-serif text-4xl font-bold text-matte-black mb-4">
              Five dimensions of sustainable living
            </h2>
            <p className="text-slate-calm max-w-xl mx-auto font-light">
              Each calculator measures a different aspect of life sustainability. Use one, or combine them for a complete picture.
            </p>
          </div>

          <div className="grid md:grid-cols-5 gap-4">
            {CALCULATORS.map((calc, i) => (
              <motion.div
                key={calc.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.55 }}
              >
                <Link href={calc.href}>
                  <Card hover padding="md" className="text-center h-full cursor-pointer group">
                    <div className="flex justify-center mb-4">
                      <ScoreRing score={calc.score} size="sm" animate={false} showLabel={false} />
                    </div>
                    <h3 className="text-sm font-semibold text-matte-black mb-1 group-hover:text-soft-gold transition-colors">
                      {calc.name}
                    </h3>
                    <p className="text-xs text-stone-400 mt-1">Explore →</p>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PHILOSOPHY ─────────────────────────────── */}
      <section className="py-24 px-6 bg-stone-light">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            <p className="text-xs font-semibold text-soft-gold uppercase tracking-[0.2em] mb-4">
              Our Philosophy
            </p>
            <h2 className="font-serif text-4xl font-bold text-matte-black mb-4">
              Not prediction. Not prescription. Clarity.
            </h2>
            <p className="text-slate-calm mb-16 max-w-xl mx-auto font-light">
              The platform exists to help you see your situation more clearly — not to evaluate you, judge you, or tell you what to do.
            </p>
          </motion.div>

          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="grid md:grid-cols-3 gap-6 text-left"
          >
            {PHILOSOPHY.map((p) => (
              <motion.div key={p.title} variants={fadeUp}>
                <Card padding="lg" className="h-full">
                  <div className="text-2xl mb-4">{p.emoji}</div>
                  <h3 className="font-semibold text-matte-black mb-3">{p.title}</h3>
                  <p className="text-sm text-slate-calm leading-relaxed">{p.description}</p>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── DAILY REFLECTION HERO ────────────────────── */}
      <section className="py-16 px-6">
        <div className="max-w-2xl mx-auto">
          <DailyReflection variant="hero" showLabel />
        </div>
      </section>

      {/* ── FINAL CTA ───────────────────────────────── */}
      <section className="py-28 px-6 bg-gradient-to-br from-deep-charcoal to-matte-black">
        <div className="max-w-2xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            <p className="text-xs font-semibold text-soft-gold uppercase tracking-[0.2em] mb-6">
              A rational mirror for life
            </p>
            <h2 className="font-serif text-4xl md:text-5xl font-bold text-warm-white mb-6 leading-tight">
              Clarity → Calm → Confidence
            </h2>
            <p className="text-stone-400 mb-10 leading-relaxed text-lg font-light">
              Your first assessment is free. Understand your current life sustainability in under five minutes.
            </p>
            <Link href="/register">
              <Button variant="gold" size="lg" icon={<ArrowRight className="w-5 h-5" />} iconPosition="right">
                Begin with Clarity — Free
              </Button>
            </Link>
            <p className="text-xs text-stone-600 mt-5">
              No credit card · No diagnosis · No pressure · Just clarity
            </p>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

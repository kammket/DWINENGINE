import type { Metadata } from "next";
import Link from "next/link";
import { PublicHeader, Footer } from "@/components/layout/PublicLayout";
import { ArrowRight, Brain, Shield, BarChart3, Heart, Zap, BookOpen } from "lucide-react";

export const metadata: Metadata = {
  title: "About Limitum — AI Decision Intelligence Built on Stoic Philosophy",
  description:
    "Limitum is an AI-powered decision intelligence platform that helps you measure the sustainability of your life decisions using behavioural science and Stoic philosophy. Not therapy. Not prediction. Clarity.",
  alternates: { canonical: "https://limitum.ai/about" },
  openGraph: {
    title: "About Limitum — AI Decision Intelligence Built on Stoic Philosophy",
    description:
      "We help you measure the sustainability of your life decisions. Not therapy. Not prediction. A rational mirror.",
    url: "https://limitum.ai/about",
    type: "website",
  },
};

const CALCULATORS = [
  {
    icon: Brain,
    name: "Financial Peace",
    description: "Income, expenses, emergency fund, debt load, and savings rate — scored into a single sustainability index.",
  },
  {
    icon: Zap,
    name: "Burnout Risk",
    description: "Work hours, autonomy, recognition, and emotional exhaustion measured against your recovery capacity.",
  },
  {
    icon: Heart,
    name: "Relationship Sustainability",
    description: "Communication, shared values, conflict resolution, and personal growth alignment.",
  },
  {
    icon: BarChart3,
    name: "Decision Quality",
    description: "Process quality, reversibility, information available, and values alignment — scored before you commit.",
  },
  {
    icon: BookOpen,
    name: "Time Value",
    description: "How you actually allocate your hours across sleep, deep work, relationships, and recovery.",
  },
];

const PHILOSOPHERS = [
  {
    name: "Marcus Aurelius",
    role: "Roman Emperor · 161–180 AD",
    quote: "You have power over your mind, not outside events. Realise this, and you will find strength.",
    emoji: "👑",
  },
  {
    name: "Epictetus",
    role: "Former slave · Teacher",
    quote: "It's not what happens to you, but how you react to it that matters.",
    emoji: "⚡",
  },
  {
    name: "Seneca",
    role: "Statesman · Writer",
    quote: "It is not that I'm so brave, but that the danger is not so great as you think.",
    emoji: "✍️",
  },
];

const STEPS = [
  {
    number: "01",
    title: "Answer honestly",
    description:
      "Use one or more of our five calculators. Each takes 2–4 minutes. There are no trick questions — the inputs are factual: numbers, sliders, and multiple choice.",
  },
  {
    number: "02",
    title: "Receive your score",
    description:
      "Every dimension produces a 0–100 index with a full breakdown of what drives the result. No black boxes. Every contributing factor is visible and explained.",
  },
  {
    number: "03",
    title: "Read your reflection",
    description:
      "Your Stoic AI guide — Marcus, Epictetus, or Seneca — offers a calm, philosophical reflection on your results. Not advice. Not prediction. A rational mirror.",
  },
  {
    number: "04",
    title: "Track your evolution",
    description:
      "Return weekly. Log your mood, set goals, complete your Morning Intention, and use the Virtue Compass to build clarity over time — not just in a single session.",
  },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-warm-white">
      <PublicHeader />

      {/* ── HERO ─────────────────────────── */}
      <section className="pt-36 pb-24 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <span className="inline-flex items-center gap-2 bg-amber-50 text-soft-gold text-xs font-medium px-4 py-2 rounded-full mb-8 border border-amber-100">
            Our Mission
          </span>
          <h1 className="font-serif text-5xl md:text-6xl font-bold text-matte-black leading-[1.1] mb-8 tracking-tight">
            A rational mirror
            <br />
            <span className="text-soft-gold">for life decisions.</span>
          </h1>
          <p className="text-xl text-slate-calm max-w-2xl mx-auto leading-relaxed font-light">
            Limitum exists to help you see your situation more clearly — not to evaluate you, diagnose you, or tell you what to do.
            When you leave, you should feel lighter.
          </p>
        </div>
      </section>

      {/* ── WHAT IT IS / WHAT IT'S NOT ─── */}
      <section className="py-20 px-6 bg-stone-50">
        <div className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12">
            <div>
              <p className="text-xs font-semibold text-soft-gold uppercase tracking-[0.2em] mb-4">What Limitum is</p>
              <h2 className="font-serif text-3xl font-bold text-matte-black mb-6">Clarity through measurement</h2>
              <ul className="space-y-4">
                {[
                  "An AI-powered index of life sustainability across five dimensions",
                  "A Stoic reflection tool grounded in philosophy and behavioural science",
                  "A longitudinal tracker so you can see your evolution over months",
                  "A decision journal and scenario simulator for major life choices",
                  "A daily ritual: Morning Intention, Virtue Compass, and weekly check-in",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3 text-sm text-matte-black leading-relaxed">
                    <span className="text-soft-gold mt-0.5 flex-shrink-0">◆</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="text-xs font-semibold text-rose-400 uppercase tracking-[0.2em] mb-4">What it is not</p>
              <h2 className="font-serif text-3xl font-bold text-matte-black mb-6">Not a substitute for professionals</h2>
              <ul className="space-y-4">
                {[
                  "Not financial advice — speak to a qualified financial adviser for investment decisions",
                  "Not medical or psychological advice — our tools are not clinical assessments",
                  "Not predictive — scores describe your situation today, not your future",
                  "Not diagnostic — we do not label, classify, or grade you as a person",
                  "Not fear-inducing — we are designed to reduce anxiety, never amplify it",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3 text-sm text-matte-black leading-relaxed">
                    <span className="text-rose-400 mt-0.5 flex-shrink-0">◇</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ── PHILOSOPHY ─────────────────── */}
      <section className="py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-xs font-semibold text-soft-gold uppercase tracking-[0.2em] mb-4">Our Foundation</p>
            <h2 className="font-serif text-4xl font-bold text-matte-black mb-4">
              Stoic philosophy meets behavioural science
            </h2>
            <p className="text-slate-calm max-w-2xl mx-auto font-light leading-relaxed">
              Stoicism is not pessimism. It is one of the most practical frameworks for navigating uncertainty,
              distinguishing what we control from what we do not, and acting with reason rather than reaction.
              Combined with the rigour of behavioural economics and decision theory, it becomes a powerful
              lens for understanding modern life.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {PHILOSOPHERS.map((p) => (
              <div key={p.name} className="bg-white border border-stone-100 rounded-2xl p-6 shadow-sm">
                <div className="text-3xl mb-4">{p.emoji}</div>
                <h3 className="font-serif font-bold text-matte-black mb-0.5">{p.name}</h3>
                <p className="text-xs text-stone-400 mb-4">{p.role}</p>
                <blockquote className="text-sm text-slate-calm italic leading-relaxed border-l-2 border-amber-200 pl-3">
                  &ldquo;{p.quote}&rdquo;
                </blockquote>
              </div>
            ))}
          </div>

          <div className="mt-12 grid md:grid-cols-3 gap-6">
            {[
              {
                title: "Dichotomy of Control",
                body: "Epictetus taught us to separate what is within our power from what is not. Every decision we analyse is tagged: in your control, partially, or outside it. This alone changes how you relate to your results.",
              },
              {
                title: "Memento Mori",
                body: "The Stoic practice of remembering our mortality sharpens priorities. Our dashboard includes a gentle time reminder — not morbid, but clarifying. Time is the resource you cannot earn back.",
              },
              {
                title: "Premeditatio Malorum",
                body: "Negative visualisation: imagining what could go wrong so you act with clearer eyes. Our Decision Journal includes space for this practice before you commit to any major choice.",
              },
            ].map((item) => (
              <div key={item.title} className="bg-amber-50 border border-amber-100 rounded-2xl p-6">
                <h3 className="font-serif font-semibold text-matte-black mb-2">{item.title}</h3>
                <p className="text-sm text-slate-calm leading-relaxed">{item.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── THE CALCULATORS ─────────────── */}
      <section className="py-24 px-6 bg-stone-50">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-xs font-semibold text-soft-gold uppercase tracking-[0.2em] mb-4">The Tools</p>
            <h2 className="font-serif text-4xl font-bold text-matte-black mb-4">Five dimensions of sustainable living</h2>
            <p className="text-slate-calm max-w-xl mx-auto font-light">
              Each calculator is independent but complementary. Use one, or use all five for a complete picture of where you stand.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {CALCULATORS.map((calc) => (
              <div key={calc.name} className="bg-white border border-stone-100 rounded-2xl p-6 shadow-sm">
                <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center mb-4">
                  <calc.icon className="w-5 h-5 text-soft-gold" />
                </div>
                <h3 className="font-semibold text-matte-black mb-2">{calc.name}</h3>
                <p className="text-sm text-slate-calm leading-relaxed">{calc.description}</p>
              </div>
            ))}
            <div className="bg-gradient-to-br from-deep-charcoal to-matte-black rounded-2xl p-6 flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center mb-4">
                  <Shield className="w-5 h-5 text-soft-gold" />
                </div>
                <h3 className="font-semibold text-warm-white mb-2">AI Stoic Reflection</h3>
                <p className="text-sm text-stone-400 leading-relaxed">
                  After each session your chosen Stoic guide — Marcus, Epictetus, or Seneca — offers a calm philosophical perspective on your scores.
                </p>
              </div>
              <Link href="/calculators" className="mt-6 inline-flex items-center gap-1.5 text-soft-gold text-sm font-medium hover:gap-2.5 transition-all">
                Try the calculators <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ────────────────── */}
      <section className="py-24 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-xs font-semibold text-soft-gold uppercase tracking-[0.2em] mb-4">How It Works</p>
            <h2 className="font-serif text-4xl font-bold text-matte-black mb-4">From input to insight in minutes</h2>
          </div>
          <div className="space-y-6">
            {STEPS.map((step, i) => (
              <div key={step.number} className="flex gap-6 items-start">
                <div className="flex-shrink-0 w-12 h-12 bg-amber-50 rounded-2xl flex items-center justify-center border border-amber-100">
                  <span className="font-mono text-soft-gold font-bold text-sm">{step.number}</span>
                </div>
                <div className={`flex-1 pb-6 ${i < STEPS.length - 1 ? "border-b border-stone-100" : ""}`}>
                  <h3 className="font-semibold text-matte-black mb-1">{step.title}</h3>
                  <p className="text-sm text-slate-calm leading-relaxed">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PRIVACY COMMITMENT ──────────── */}
      <section className="py-20 px-6 bg-stone-50">
        <div className="max-w-3xl mx-auto text-center">
          <div className="w-14 h-14 bg-amber-50 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-amber-100">
            <Shield className="w-7 h-7 text-soft-gold" />
          </div>
          <h2 className="font-serif text-3xl font-bold text-matte-black mb-4">Your data belongs to you</h2>
          <p className="text-slate-calm leading-relaxed mb-8 font-light">
            Your calculator inputs, scores, journal entries, and reflections are stored securely and are visible only to you.
            We do not sell data to third parties. We do not use your data to train AI models.
            We are GDPR and CCPA compliant. You can delete your account and all associated data at any time from the Settings page.
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Link href="/legal/privacy" className="text-sm text-slate-calm hover:text-matte-black border border-stone-200 rounded-xl px-4 py-2 hover:border-stone-300 transition-colors">
              Privacy Policy
            </Link>
            <Link href="/legal/terms" className="text-sm text-slate-calm hover:text-matte-black border border-stone-200 rounded-xl px-4 py-2 hover:border-stone-300 transition-colors">
              Terms of Service
            </Link>
            <Link href="/legal/gdpr" className="text-sm text-slate-calm hover:text-matte-black border border-stone-200 rounded-xl px-4 py-2 hover:border-stone-300 transition-colors">
              GDPR Rights
            </Link>
            <Link href="/legal/disclaimer" className="text-sm text-slate-calm hover:text-matte-black border border-stone-200 rounded-xl px-4 py-2 hover:border-stone-300 transition-colors">
              AI Disclaimer
            </Link>
          </div>
        </div>
      </section>

      {/* ── CTA ─────────────────────────── */}
      <section className="py-28 px-6 bg-gradient-to-br from-deep-charcoal to-matte-black">
        <div className="max-w-2xl mx-auto text-center">
          <p className="text-xs font-semibold text-soft-gold uppercase tracking-[0.2em] mb-6">Begin your assessment</p>
          <h2 className="font-serif text-4xl md:text-5xl font-bold text-warm-white mb-6 leading-tight">
            Clarity → Calm → Confidence
          </h2>
          <p className="text-stone-400 mb-10 leading-relaxed text-lg font-light">
            Your first assessment is free. No credit card. No pressure. Just clarity.
          </p>
          <Link
            href="/register"
            className="inline-flex items-center gap-2 bg-soft-gold text-white px-8 py-4 rounded-2xl font-semibold hover:bg-amber-500 transition-colors text-sm"
          >
            Get Started Free <ArrowRight className="w-4 h-4" />
          </Link>
          <p className="text-xs text-stone-600 mt-5">No credit card · No diagnosis · Just clarity</p>
        </div>
      </section>

      <Footer />
    </div>
  );
}

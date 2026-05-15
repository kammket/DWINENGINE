"use client";

import type { Metadata } from "next";
import { useState } from "react";
import Link from "next/link";
import { PublicHeader, Footer } from "@/components/layout/PublicLayout";
import { ChevronDown, ArrowRight } from "lucide-react";

const FAQS: { category: string; items: { q: string; a: string }[] }[] = [
  {
    category: "About Constavita",
    items: [
      {
        q: "What is Constavita?",
        a: "Constavita is an AI-powered decision intelligence platform. It gives you a structured, data-driven way to measure the sustainability of your life decisions across five dimensions: financial peace, burnout risk, relationship health, decision quality, and time value. It is grounded in Stoic philosophy and behavioural science.",
      },
      {
        q: "Is Constavita therapy or mental health support?",
        a: "No. Constavita is not therapy, counselling, or any form of clinical support. Our tools produce educational indices to help you reflect on your situation with greater clarity. If you are experiencing a mental health crisis, please contact a qualified mental health professional or your country's emergency services.",
      },
      {
        q: "Is Constavita financial or legal advice?",
        a: "No. Nothing on Constavita constitutes financial, investment, legal, or tax advice. The Financial Peace Calculator and other tools produce educational scores only. For financial decisions, please consult a qualified financial adviser.",
      },
      {
        q: "Who built Constavita and why?",
        a: "Constavita was built on the conviction that most people make major life decisions — career changes, financial commitments, relationship choices — with very little structured data about their own patterns. We combined Stoic philosophy (which has 2,000 years of evidence as a framework for navigating uncertainty) with modern behavioural science to create a practical, psychologically safe tool for everyday decision-making.",
      },
    ],
  },
  {
    category: "The Calculators",
    items: [
      {
        q: "How are the scores calculated?",
        a: "Each calculator uses a weighted multi-factor model. For example, the Financial Peace Calculator weighs your income-to-expense ratio, emergency fund coverage, debt-to-income ratio, savings rate, and financial stress level — each contributing a defined percentage to the final 0–100 score. Every factor is visible in the results breakdown so you can see exactly what drives your score.",
      },
      {
        q: "Can I trust the scores?",
        a: "The scores are useful reflections of the data you provide — no more, no less. They are not clinical assessments, actuarial predictions, or authoritative evaluations. They are best understood as structured self-awareness tools. The score is only as accurate as your inputs, and it describes today's snapshot, not a permanent state.",
      },
      {
        q: "How often should I use the calculators?",
        a: "We recommend a full assessment when facing a significant decision, and a quick check-in (via the Weekly Check-in feature) every week to track your mood across all five dimensions. Most users find monthly full re-assessments sufficient for tracking trends over time.",
      },
      {
        q: "Can I use just one calculator, or do I need all five?",
        a: "Each calculator is completely independent. You can use just the Burnout Risk Calculator if that is your current focus, or all five for a complete picture of your life sustainability. There is no required order.",
      },
      {
        q: "What is the Scenario Simulator?",
        a: "The Scenario Simulator (Premium) lets you model hypothetical changes — for example, 'What if I took a 20% pay cut but worked 15 fewer hours per week?' — and see how those changes would affect your peace scores across all five dimensions. It is a safe, consequence-free way to explore the tradeoffs of major decisions before committing.",
      },
    ],
  },
  {
    category: "AI & Stoic Reflections",
    items: [
      {
        q: "What is the AI Stoic reflection?",
        a: "After completing a calculator, you can request an AI-generated reflection styled in the voice of your chosen Stoic philosopher — Marcus Aurelius, Epictetus, or Seneca. The reflection responds to your specific scores and draws on Stoic principles to offer a calm, philosophical perspective. It is not advice — it is a mirror.",
      },
      {
        q: "Which Stoic philosopher should I choose?",
        a: "Marcus Aurelius speaks in a kingly, self-critical, duty-focused tone — ideal if you resonate with themes of leadership and responsibility. Epictetus is sharp, direct, and focused on freedom from external circumstances — suited to those who want blunt clarity. Seneca is warm, literary, and focused on time and mortality — suited to those who enjoy reflective, essay-style wisdom. You can change your guide at any time in Settings.",
      },
      {
        q: "Does the AI make decisions for me?",
        a: "No. The AI does not recommend, prescribe, or judge. It reflects. The decision always remains yours. We designed this intentionally — Stoicism teaches that reasoning through a decision yourself builds the kind of clarity that passive recommendation never can.",
      },
      {
        q: "How many AI reflections can I get?",
        a: "AI reflections (Logos) are a Premium feature. Upgrade to Premium for unlimited Stoic AI insights on your calculator results. Free accounts have full access to all 5 calculators, the Decision Journal, and Morning Intention.",
      },
    ],
  },
  {
    category: "Privacy & Data",
    items: [
      {
        q: "Is my data private?",
        a: "Yes. All your data — calculator inputs, scores, journal entries, AI reflections, and check-ins — is stored securely on our servers and is visible only to you. We do not sell data to third parties, share it with advertisers, or use it to train AI models.",
      },
      {
        q: "Do you use my data to train AI models?",
        a: "No. Your personal data is never used to train AI models. AI reflections are generated using the inputs you provide in that specific session only.",
      },
      {
        q: "Are you GDPR compliant?",
        a: "Yes. We comply with GDPR and CCPA. You have the right to access, export, and delete all your data at any time. To delete your account and all associated data, go to Settings → Data & Privacy → Delete Account.",
      },
      {
        q: "What data do you store?",
        a: "We store: your account information (name, email, hashed password), calculator inputs and scores, AI reflection history, journal entries, weekly check-in mood logs, morning intentions, virtue ratings, and goals. We do not store payment card details — all payments are processed by Stripe.",
      },
    ],
  },
  {
    category: "Pricing & Account",
    items: [
      {
        q: "Is Constavita free?",
        a: "Yes — there is a free tier with no credit card required. Free users can access all five calculators, log unlimited journal entries, use the Morning Intention and Virtue Compass features, and receive 3 AI Stoic reflections per month.",
      },
      {
        q: "What does Premium include?",
        a: "Premium includes unlimited AI Stoic reflections, the Scenario Simulator, longitudinal analytics with heatmaps and goal tracking, and priority support. It is billed monthly and can be cancelled at any time from Settings.",
      },
      {
        q: "Can I cancel my subscription?",
        a: "Yes. Go to Settings → Subscription → Manage Billing & Cancel. Your Premium access continues until the end of the current billing period. There are no cancellation fees.",
      },
      {
        q: "How do I delete my account?",
        a: "Go to Settings → Data & Privacy → Delete Account. Type your email to confirm. Deletion is immediate and permanent — all your data is removed from our servers. This action cannot be undone.",
      },
    ],
  },
];

function AccordionItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-stone-100 last:border-0">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-start justify-between gap-4 py-5 text-left group"
      >
        <span className="font-medium text-matte-black text-sm leading-relaxed group-hover:text-soft-gold transition-colors">
          {q}
        </span>
        <ChevronDown
          className={`w-4 h-4 text-slate-calm flex-shrink-0 mt-0.5 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        />
      </button>
      {open && (
        <p className="text-sm text-slate-calm leading-relaxed pb-5 pr-8">{a}</p>
      )}
    </div>
  );
}

export default function FAQPage() {
  return (
    <div className="min-h-screen bg-warm-white">
      <PublicHeader />

      {/* Hero */}
      <section className="pt-36 pb-16 px-6">
        <div className="max-w-2xl mx-auto text-center">
          <span className="inline-flex items-center gap-2 bg-amber-50 text-soft-gold text-xs font-medium px-4 py-2 rounded-full mb-8 border border-amber-100">
            Frequently Asked Questions
          </span>
          <h1 className="font-serif text-4xl md:text-5xl font-bold text-matte-black mb-6 leading-tight">
            Everything you need to know
          </h1>
          <p className="text-slate-calm font-light leading-relaxed">
            Can&apos;t find your answer? Reach us at{" "}
            <a href="mailto:hello@constavita.com" className="text-soft-gold hover:underline">
              hello@constavita.com
            </a>
          </p>
        </div>
      </section>

      {/* FAQ sections */}
      <section className="pb-24 px-6">
        <div className="max-w-3xl mx-auto space-y-10">
          {FAQS.map((section) => (
            <div key={section.category}>
              <h2 className="font-serif text-xl font-bold text-matte-black mb-2 pb-3 border-b border-stone-200">
                {section.category}
              </h2>
              <div>
                {section.items.map((item) => (
                  <AccordionItem key={item.q} q={item.q} a={item.a} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6 bg-stone-50 border-t border-stone-100">
        <div className="max-w-xl mx-auto text-center">
          <h2 className="font-serif text-2xl font-bold text-matte-black mb-3">Still have questions?</h2>
          <p className="text-slate-calm text-sm mb-6">We typically respond within one business day.</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/contact"
              className="inline-flex items-center justify-center gap-2 border border-stone-200 text-matte-black px-6 py-3 rounded-2xl text-sm font-medium hover:border-stone-300 transition-colors"
            >
              Contact us
            </Link>
            <Link
              href="/register"
              className="inline-flex items-center justify-center gap-2 bg-soft-gold text-white px-6 py-3 rounded-2xl text-sm font-semibold hover:bg-amber-500 transition-colors"
            >
              Start free <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

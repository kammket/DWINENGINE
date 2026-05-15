import type { Metadata } from "next";
import Link from "next/link";
import { PublicHeader, Footer } from "@/components/layout/PublicLayout";
import { Mail, MessageSquare, Shield, BookOpen } from "lucide-react";

export const metadata: Metadata = {
  title: "Contact — Constavita",
  description:
    "Get in touch with the Constavita team. We respond to all enquiries within one business day.",
  alternates: { canonical: "https://constavita.com/contact" },
  openGraph: {
    title: "Contact — Constavita",
    description: "Reach the Constavita team. Support, feedback, press, and partnerships.",
    url: "https://constavita.com/contact",
    type: "website",
  },
};

const TOPICS = [
  {
    icon: MessageSquare,
    title: "General support",
    description: "Questions about how the calculators work, your scores, or using the platform.",
    email: "hello@constavita.com",
  },
  {
    icon: Shield,
    title: "Privacy & data",
    description: "GDPR requests, data deletion, account access, or security concerns.",
    email: "privacy@constavita.com",
  },
  {
    icon: BookOpen,
    title: "Press & partnerships",
    description: "Media enquiries, research collaborations, or partnership opportunities.",
    email: "press@constavita.com",
  },
];

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-warm-white">
      <PublicHeader />

      {/* Hero */}
      <section className="pt-36 pb-16 px-6">
        <div className="max-w-2xl mx-auto text-center">
          <span className="inline-flex items-center gap-2 bg-amber-50 text-soft-gold text-xs font-medium px-4 py-2 rounded-full mb-8 border border-amber-100">
            Get in touch
          </span>
          <h1 className="font-serif text-4xl md:text-5xl font-bold text-matte-black mb-6 leading-tight">
            We&apos;d love to hear from you
          </h1>
          <p className="text-slate-calm font-light leading-relaxed">
            We&apos;re a small team and we read every message. We typically respond within one business day.
          </p>
        </div>
      </section>

      {/* Contact cards */}
      <section className="pb-24 px-6">
        <div className="max-w-3xl mx-auto space-y-4">
          {TOPICS.map((topic) => (
            <a
              key={topic.title}
              href={`mailto:${topic.email}?subject=${encodeURIComponent(topic.title)}`}
              className="flex items-start gap-5 bg-white border border-stone-100 rounded-2xl p-6 shadow-sm hover:border-soft-gold hover:shadow-md transition-all group"
            >
              <div className="w-11 h-11 bg-amber-50 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:bg-amber-100 transition-colors">
                <topic.icon className="w-5 h-5 text-soft-gold" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-matte-black mb-1">{topic.title}</h3>
                <p className="text-sm text-slate-calm leading-relaxed mb-2">{topic.description}</p>
                <span className="text-sm text-soft-gold font-medium flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5" />
                  {topic.email}
                </span>
              </div>
            </a>
          ))}
        </div>

        {/* Response time notice */}
        <div className="max-w-3xl mx-auto mt-10">
          <div className="bg-stone-50 border border-stone-100 rounded-2xl p-6 text-center">
            <p className="text-sm text-slate-calm leading-relaxed">
              <strong className="text-matte-black">Response time:</strong> We aim to respond to all enquiries within{" "}
              <strong className="text-matte-black">1 business day</strong>, Monday to Friday.
              For urgent account issues, include your registered email address in your message.
            </p>
          </div>
        </div>

        {/* FAQ nudge */}
        <div className="max-w-3xl mx-auto mt-6">
          <div className="bg-amber-50 border border-amber-100 rounded-2xl p-6 flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="flex-1">
              <h3 className="font-semibold text-matte-black mb-1">Looking for quick answers?</h3>
              <p className="text-sm text-slate-calm">Our FAQ covers calculators, AI reflections, pricing, privacy, and account management.</p>
            </div>
            <Link
              href="/faq"
              className="flex-shrink-0 inline-flex items-center gap-1.5 text-soft-gold text-sm font-semibold hover:gap-2.5 transition-all"
            >
              View FAQ →
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

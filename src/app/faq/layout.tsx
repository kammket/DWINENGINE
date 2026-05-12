import type { Metadata } from "next";

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "What is Limitum?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Limitum is an AI-powered decision intelligence platform. It gives you a structured, data-driven way to measure the sustainability of your life decisions across five dimensions: financial peace, burnout risk, relationship health, decision quality, and time value. It is grounded in Stoic philosophy and behavioural science.",
      },
    },
    {
      "@type": "Question",
      name: "Is Limitum therapy or mental health support?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "No. Limitum is not therapy, counselling, or any form of clinical support. Our tools produce educational indices to help you reflect on your situation with greater clarity.",
      },
    },
    {
      "@type": "Question",
      name: "Is Limitum free?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes — there is a free tier with no credit card required. Free users can access all five calculators, log unlimited journal entries, use Morning Intention and Virtue Compass features, and receive 3 AI Stoic reflections per month.",
      },
    },
    {
      "@type": "Question",
      name: "Is my data private?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes. All your data is stored securely and visible only to you. We do not sell data to third parties, share it with advertisers, or use it to train AI models. We comply with GDPR and CCPA.",
      },
    },
    {
      "@type": "Question",
      name: "How are the scores calculated?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Each calculator uses a weighted multi-factor model. Every factor is visible in the results breakdown so you can see exactly what drives your score. Scores range from 0–100 and describe your situation today — they are not predictions or diagnoses.",
      },
    },
  ],
};

export const metadata: Metadata = {
  title: "FAQ — Limitum",
  description:
    "Answers to common questions about Limitum — how the calculators work, AI reflections, Stoic philosophy, privacy, pricing, and account management.",
  alternates: { canonical: "https://limitum.ai/faq" },
  openGraph: {
    title: "FAQ — Limitum",
    description: "Everything you need to know about Limitum's decision intelligence tools, privacy, and pricing.",
    url: "https://limitum.ai/faq",
    type: "website",
  },
};

export default function FAQLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      {children}
    </>
  );
}

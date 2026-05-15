import type { Metadata } from "next";

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "What is Constavita?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Constavita is an AI-powered decision intelligence platform. It gives you a structured, data-driven way to measure the sustainability of your life decisions across five dimensions: financial peace, burnout risk, relationship health, decision quality, and time value. It is grounded in Stoic philosophy and behavioural science.",
      },
    },
    {
      "@type": "Question",
      name: "Is Constavita therapy or mental health support?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "No. Constavita is not therapy, counselling, or any form of clinical support. Our tools produce educational indices to help you reflect on your situation with greater clarity.",
      },
    },
    {
      "@type": "Question",
      name: "Is Constavita free?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes — there is a free tier with no credit card required. Free users can access all five calculators, log unlimited journal entries, and use the Morning Intention and Virtue Compass features. AI reflections (Logos) require a Premium subscription.",
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
  title: "FAQ — Constavita",
  description:
    "Answers to common questions about Constavita — how the calculators work, AI reflections, Stoic philosophy, privacy, pricing, and account management.",
  alternates: { canonical: "https://constavita.com/faq" },
  openGraph: {
    title: "FAQ — Constavita",
    description: "Everything you need to know about Constavita's decision intelligence tools, privacy, and pricing.",
    url: "https://constavita.com/faq",
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

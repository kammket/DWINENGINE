import type { Metadata } from "next";
import { getDailyReflection } from "@/lib/stoic";
import HomeClient from "./HomeClient";

export const metadata: Metadata = {
  title: "Limitum — AI-Powered Decision Intelligence & Stoic Life Calculator",
  description:
    "Measure the sustainability of your life decisions with AI-powered calculators. Assess financial peace, burnout risk, relationship health, and time value — grounded in Stoic philosophy and behavioural science.",
  keywords: [
    "decision intelligence",
    "life sustainability calculator",
    "burnout risk calculator",
    "financial peace calculator",
    "stoic decision making",
    "AI life assessment",
    "relationship health calculator",
    "time value calculator",
    "decision quality score",
  ],
  alternates: {
    canonical: "https://limitum.ai",
  },
  openGraph: {
    title: "Limitum — Measure the Sustainability of Your Life Decisions",
    description:
      "AI-powered calculators for financial peace, burnout, relationships, and time value. Backed by Stoic philosophy and behavioural science.",
    url: "https://limitum.ai",
    siteName: "Limitum",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Limitum — AI Decision Intelligence",
    description:
      "Measure life sustainability across 5 dimensions. Free AI-powered assessment grounded in Stoic philosophy.",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      "@id": "https://limitum.ai/#website",
      url: "https://limitum.ai",
      name: "Limitum",
      description: "AI-Powered Decision Intelligence Platform",
      potentialAction: {
        "@type": "SearchAction",
        target: "https://limitum.ai/blog?q={search_term_string}",
        "query-input": "required name=search_term_string",
      },
    },
    {
      "@type": "SoftwareApplication",
      "@id": "https://limitum.ai/#app",
      name: "Limitum",
      applicationCategory: "HealthApplication",
      operatingSystem: "Web",
      url: "https://limitum.ai",
      description:
        "AI-powered life decision calculators grounded in Stoic philosophy and behavioural science. Assess financial peace, burnout risk, relationship sustainability, decision quality, and time value.",
      offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "USD",
        description: "Free tier available — no credit card required",
      },
      featureList: [
        "Financial Peace Calculator",
        "Burnout Risk Assessment",
        "Relationship Sustainability Score",
        "Decision Regret Calculator",
        "Time Value Calculator",
        "AI Stoic Reflections",
        "Decision Journal",
        "Virtue Compass",
      ],
    },
    {
      "@type": "Organization",
      "@id": "https://limitum.ai/#org",
      name: "Limitum",
      url: "https://limitum.ai",
      sameAs: [],
    },
  ],
};

export default function HomePage() {
  const dailyReflection = getDailyReflection();
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <HomeClient dailyReflection={dailyReflection} />
    </>
  );
}

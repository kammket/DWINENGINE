import type { Metadata } from "next";
import { getDailyReflection } from "@/lib/stoic";
import HomeClient from "./HomeClient";

export const metadata: Metadata = {
  title: "Constavita — AI-Powered Decision Intelligence & Stoic Life Calculator",
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
    canonical: "https://constavita.com",
  },
  openGraph: {
    title: "Constavita — Measure the Sustainability of Your Life Decisions",
    description:
      "AI-powered calculators for financial peace, burnout, relationships, and time value. Backed by Stoic philosophy and behavioural science.",
    url: "https://constavita.com",
    siteName: "Constavita",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Constavita — AI Decision Intelligence",
    description:
      "Measure life sustainability across 5 dimensions. Free AI-powered assessment grounded in Stoic philosophy.",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      "@id": "https://constavita.com/#website",
      url: "https://constavita.com",
      name: "Constavita",
      description: "AI-Powered Decision Intelligence Platform",
      potentialAction: {
        "@type": "SearchAction",
        target: "https://constavita.com/blog?q={search_term_string}",
        "query-input": "required name=search_term_string",
      },
    },
    {
      "@type": "SoftwareApplication",
      "@id": "https://constavita.com/#app",
      name: "Constavita",
      applicationCategory: "HealthApplication",
      operatingSystem: "Web",
      url: "https://constavita.com",
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
      "@id": "https://constavita.com/#org",
      name: "Constavita",
      url: "https://constavita.com",
      logo: {
        "@type": "ImageObject",
        url: "https://constavita.com/logo.png",
        width: 512,
        height: 512,
      },
      contactPoint: {
        "@type": "ContactPoint",
        email: "hello@constavita.com",
        contactType: "customer support",
      },
      sameAs: [
        "https://twitter.com/constavita_ai",
      ],
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

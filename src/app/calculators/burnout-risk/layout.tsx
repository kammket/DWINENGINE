import type { Metadata } from "next";

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "Burnout Risk Calculator",
  url: "https://limitum.ai/calculators/burnout-risk",
  applicationCategory: "HealthApplication",
  description:
    "Free burnout risk calculator. Assess work hours, autonomy, recognition, and emotional exhaustion to get your burnout resilience score.",
  featureList: ["Work hours analysis", "Emotional exhaustion scoring", "Autonomy assessment", "Recovery index", "AI Stoic reflection"],
  offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
  breadcrumb: {
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: "https://limitum.ai" },
      { "@type": "ListItem", position: 2, name: "Calculators", item: "https://limitum.ai/calculators" },
      { "@type": "ListItem", position: 3, name: "Burnout Risk", item: "https://limitum.ai/calculators/burnout-risk" },
    ],
  },
};

export const metadata: Metadata = {
  title: "Burnout Risk Calculator — Free Assessment | Limitum",
  description:
    "Take the free burnout risk calculator. Measure work hours, autonomy, emotional exhaustion, recognition, and recovery to get your burnout resilience score and personalised Stoic reflection.",
  keywords: [
    "burnout risk calculator",
    "burnout test",
    "am I burned out quiz",
    "burnout assessment",
    "work stress calculator",
    "emotional exhaustion test",
    "burnout prevention",
    "occupational burnout score",
  ],
  alternates: { canonical: "https://limitum.ai/calculators/burnout-risk" },
  openGraph: {
    title: "Burnout Risk Calculator — Free | Limitum",
    description: "Measure your burnout risk across 7 dimensions. Get your resilience score and a personalised AI reflection.",
    url: "https://limitum.ai/calculators/burnout-risk",
    type: "website",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      {children}
    </>
  );
}

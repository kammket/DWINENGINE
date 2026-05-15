import type { Metadata } from "next";

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebApplication",
      name: "Burnout Risk Calculator",
      url: "https://constavita.com/calculators/burnout-risk",
      applicationCategory: "HealthApplication",
      description:
        "Free burnout risk calculator. Assess work hours, autonomy, recognition, and emotional exhaustion to get your burnout resilience score.",
      featureList: ["Work hours analysis", "Emotional exhaustion scoring", "Autonomy assessment", "Recovery index", "AI Stoic reflection"],
      offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
      breadcrumb: {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: "https://constavita.com" },
          { "@type": "ListItem", position: 2, name: "Calculators", item: "https://constavita.com/calculators" },
          { "@type": "ListItem", position: 3, name: "Burnout Risk", item: "https://constavita.com/calculators/burnout-risk" },
        ],
      },
    },
    {
      "@type": "HowTo",
      name: "How to Calculate Your Burnout Risk Score",
      description: "Use the free Constavita Burnout Risk Calculator to measure your resilience across 9 dimensions — workload, sleep, autonomy, purpose, and more — in under 3 minutes.",
      totalTime: "PT3M",
      tool: { "@type": "HowToTool", name: "Constavita Burnout Risk Calculator", url: "https://constavita.com/calculators/burnout-risk" },
      step: [
        { "@type": "HowToStep", position: 1, name: "Rate your workload", text: "Enter your average weekly work hours and how many days per week you work." },
        { "@type": "HowToStep", position: 2, name: "Assess your recovery", text: "Rate your sleep quality, vacation frequency, and ability to mentally disconnect outside work hours." },
        { "@type": "HowToStep", position: 3, name: "Evaluate autonomy and purpose", text: "Rate how much control you have over your schedule and how meaningful your work feels day-to-day." },
        { "@type": "HowToStep", position: 4, name: "Score social support and exercise", text: "Indicate your access to collegial support and how regularly you exercise as a stress buffer." },
        { "@type": "HowToStep", position: 5, name: "Review your Burnout Resilience Index", text: "Receive a 0–100 score with a per-dimension breakdown and a personalised AI Stoic reflection on your results." },
      ],
    },
  ],
};

export const metadata: Metadata = {
  title: "Burnout Risk Calculator — Free Assessment | Constavita",
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
  alternates: { canonical: "https://constavita.com/calculators/burnout-risk" },
  openGraph: {
    title: "Burnout Risk Calculator — Free | Constavita",
    description: "Measure your burnout risk across 7 dimensions. Get your resilience score and a personalised AI reflection.",
    url: "https://constavita.com/calculators/burnout-risk",
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

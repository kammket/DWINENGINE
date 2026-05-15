import type { Metadata } from "next";

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebApplication",
      name: "Time Value Calculator",
      url: "https://constavita.com/calculators/time-value",
      applicationCategory: "ProductivityApplication",
      description:
        "Free time value calculator. Assess how you spend your time, measure time autonomy, and get your time sustainability score.",
      offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
      breadcrumb: {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: "https://constavita.com" },
          { "@type": "ListItem", position: 2, name: "Calculators", item: "https://constavita.com/calculators" },
          { "@type": "ListItem", position: 3, name: "Time Value", item: "https://constavita.com/calculators/time-value" },
        ],
      },
    },
    {
      "@type": "HowTo",
      name: "How to Calculate Your Time Value Score",
      description: "Use the free Constavita Time Value Calculator to audit how you actually spend your hours across sleep, deep work, exercise, relationships, and personal growth.",
      totalTime: "PT3M",
      tool: { "@type": "HowToTool", name: "Constavita Time Value Calculator", url: "https://constavita.com/calculators/time-value" },
      step: [
        { "@type": "HowToStep", position: 1, name: "Enter your daily sleep hours", text: "Record your average nightly sleep duration — the foundation of your time sustainability." },
        { "@type": "HowToStep", position: 2, name: "Log your deep work hours", text: "Enter how many hours per day you spend in focused, high-value work without distraction." },
        { "@type": "HowToStep", position: 3, name: "Record exercise and movement time", text: "Input how many hours per week you spend on deliberate physical exercise or movement." },
        { "@type": "HowToStep", position: 4, name: "Assess relationship and recovery time", text: "Rate the time you invest in meaningful relationships and genuine leisure that restores energy." },
        { "@type": "HowToStep", position: 5, name: "Review your Time Sustainability Index", text: "Receive a 0–100 score showing where your time is well-invested and where reallocation could improve your life quality." },
      ],
    },
  ],
};

export const metadata: Metadata = {
  title: "Time Value Calculator — How You Really Spend Your Time | Constavita",
  description:
    "Free time value calculator. Assess sleep, deep work, exercise, relationships, and personal growth time. Calculate your time sustainability score and get a Stoic reflection on how you spend your hours.",
  keywords: [
    "time value calculator",
    "how do I spend my time",
    "time management assessment",
    "time audit calculator",
    "work life balance calculator",
    "time sustainability score",
    "stoic time management",
    "productivity calculator",
  ],
  alternates: { canonical: "https://constavita.com/calculators/time-value" },
  openGraph: {
    title: "Time Value Calculator — Free | Constavita",
    description: "Discover how you really spend your time. Score sleep, deep work, exercise, and relationships. Get your time sustainability index.",
    url: "https://constavita.com/calculators/time-value",
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

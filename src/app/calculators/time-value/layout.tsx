import type { Metadata } from "next";

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "FAQPage",
      mainEntity: [
        {
          "@type": "Question",
          name: "What is a time value calculator for personal decisions?",
          acceptedAnswer: { "@type": "Answer", text: "A personal time value calculator measures how effectively you allocate your waking hours across categories that matter most: sleep quality, deep focused work, physical exercise, meaningful relationships, and personal recovery. Unlike a financial time-value-of-money calculator, this tool produces a Time Sustainability Index — a 0–100 score reflecting whether your current time allocation supports long-term wellbeing and productivity." },
        },
        {
          "@type": "Question",
          name: "How do I calculate the value of my time?",
          acceptedAnswer: { "@type": "Answer", text: "To calculate the value of your time: (1) Audit how you actually spend your hours across a typical week — track sleep, deep work, shallow work, exercise, social time, and leisure. (2) Compare this to evidence-based benchmarks (7–9 hours sleep, 4+ hours deep work, 3+ exercise hours per week). (3) Score each category and combine for an overall time sustainability index. The Constavita Time Value Calculator does this automatically." },
        },
        {
          "@type": "Question",
          name: "How many hours of deep work should I do per day?",
          acceptedAnswer: { "@type": "Answer", text: "Research by Cal Newport and cognitive scientists suggests 4 hours of genuine deep work per day is near the upper limit for most people. Elite performers average 4–6 hours of focused work, with the rest devoted to planning, administration, and recovery. The Time Value Calculator rewards 3–5 deep work hours per day as optimal." },
        },
        {
          "@type": "Question",
          name: "What is a good time sustainability score?",
          acceptedAnswer: { "@type": "Answer", text: "A score of 70–100 means your time is well-allocated across the key dimensions — you are sleeping enough, working with focus, exercising regularly, and investing in relationships. 50–69 is average with clear improvement areas. Below 50 suggests your time allocation is misaligned with long-term sustainability and wellbeing." },
        },
        {
          "@type": "Question",
          name: "Is the time value calculator free?",
          acceptedAnswer: { "@type": "Answer", text: "Yes. The Time Value Calculator is free with no credit card required. Save your results and track progress over time with a free account." },
        },
      ],
    },
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

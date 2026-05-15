import type { Metadata } from "next";

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "ItemList",
      name: "Constavita Life Sustainability Calculators",
      description: "Five free AI-powered calculators for assessing financial peace, burnout risk, relationship health, decision quality, and time value.",
      url: "https://constavita.com/calculators",
      numberOfItems: 5,
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: "Financial Peace Calculator",
          url: "https://constavita.com/calculators/financial-peace",
          description: "Score your financial sustainability across income-to-expenses ratio, emergency fund, debt load, and savings rate.",
        },
        {
          "@type": "ListItem",
          position: 2,
          name: "Burnout Risk Calculator",
          url: "https://constavita.com/calculators/burnout-risk",
          description: "Measure your burnout risk across workload, autonomy, recognition, community, fairness, and values alignment.",
        },
        {
          "@type": "ListItem",
          position: 3,
          name: "Relationship Sustainability Calculator",
          url: "https://constavita.com/calculators/relationship-sustainability",
          description: "Assess relationship health across communication quality, shared values, conflict resolution, and emotional support.",
        },
        {
          "@type": "ListItem",
          position: 4,
          name: "Decision Regret Calculator",
          url: "https://constavita.com/calculators/decision-regret",
          description: "Score your decision quality across reversibility, information completeness, values alignment, and emotional clarity.",
        },
        {
          "@type": "ListItem",
          position: 5,
          name: "Time Value Calculator",
          url: "https://constavita.com/calculators/time-value",
          description: "Measure how effectively you allocate your hours across sleep, deep work, exercise, relationships, and recovery.",
        },
      ],
    },
    {
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: "https://constavita.com" },
        { "@type": "ListItem", position: 2, name: "Calculators", item: "https://constavita.com/calculators" },
      ],
    },
    {
      "@type": "CollectionPage",
      name: "Life Sustainability Calculators",
      url: "https://constavita.com/calculators",
      description: "Free Stoic-grounded calculators for financial peace, burnout risk, relationship health, decision quality, and time value.",
      publisher: {
        "@type": "Organization",
        name: "Constavita",
        url: "https://constavita.com",
      },
    },
  ],
};

export const metadata: Metadata = {
  title: "Free Life Calculators — Burnout, Financial Peace & Decision Tools | Constavita",
  description:
    "Five free AI-powered life calculators: financial peace score, burnout risk assessment, relationship sustainability, decision quality, and time value index. Stoic-grounded self-assessments.",
  keywords: [
    "life calculators",
    "burnout risk calculator",
    "financial peace calculator",
    "relationship sustainability calculator",
    "decision quality calculator",
    "time value calculator",
    "free self-assessment tools",
    "stoic decision tools",
    "work life balance calculator",
    "personal sustainability score",
  ],
  alternates: { canonical: "https://constavita.com/calculators" },
  openGraph: {
    title: "Free Life Sustainability Calculators | Constavita",
    description:
      "Assess your financial peace, burnout risk, relationship health, decision quality, and time value with free AI-powered calculators.",
    url: "https://constavita.com/calculators",
    type: "website",
  },
};

export default function CalculatorsLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      {children}
    </>
  );
}

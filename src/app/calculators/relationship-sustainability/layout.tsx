import type { Metadata } from "next";

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebApplication",
      name: "Relationship Sustainability Calculator",
      url: "https://constavita.com/calculators/relationship-sustainability",
      applicationCategory: "LifestyleApplication",
      description:
        "Free relationship sustainability calculator. Score communication quality, shared values, conflict resolution, emotional support, and growth alignment.",
      offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
      breadcrumb: {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: "https://constavita.com" },
          { "@type": "ListItem", position: 2, name: "Calculators", item: "https://constavita.com/calculators" },
          { "@type": "ListItem", position: 3, name: "Relationship Sustainability", item: "https://constavita.com/calculators/relationship-sustainability" },
        ],
      },
    },
    {
      "@type": "HowTo",
      name: "How to Calculate Your Relationship Sustainability Score",
      description: "Use the free Constavita Relationship Sustainability Calculator to measure communication, values alignment, conflict resolution, and emotional support in under 3 minutes.",
      totalTime: "PT3M",
      tool: { "@type": "HowToTool", name: "Constavita Relationship Sustainability Calculator", url: "https://constavita.com/calculators/relationship-sustainability" },
      step: [
        { "@type": "HowToStep", position: 1, name: "Rate communication quality", text: "Score how openly and constructively you and your partner communicate on a typical week." },
        { "@type": "HowToStep", position: 2, name: "Assess shared values alignment", text: "Rate how aligned your core values, life goals, and priorities are with your partner's." },
        { "@type": "HowToStep", position: 3, name: "Evaluate conflict resolution", text: "Rate how effectively you resolve disagreements — whether conflicts feel resolving or recurring." },
        { "@type": "HowToStep", position: 4, name: "Score emotional support and growth", text: "Assess the level of emotional support you give and receive, and whether the relationship supports personal growth." },
        { "@type": "HowToStep", position: 5, name: "Review your Relationship Health Score", text: "Receive a 0–100 sustainability score across all dimensions and a Stoic reflection on the result." },
      ],
    },
  ],
};

export const metadata: Metadata = {
  title: "Relationship Sustainability Calculator — Free Score | Constavita",
  description:
    "Calculate your relationship health score. Assess communication, shared values, conflict resolution, emotional support, and personal growth alignment. Get a Stoic AI perspective.",
  keywords: [
    "relationship calculator",
    "relationship health score",
    "relationship compatibility test",
    "relationship sustainability",
    "is my relationship healthy",
    "relationship assessment",
    "communication quality test",
    "stoic relationships",
  ],
  alternates: { canonical: "https://constavita.com/calculators/relationship-sustainability" },
  openGraph: {
    title: "Relationship Sustainability Calculator — Free | Constavita",
    description: "Score your relationship health across communication, values, conflict resolution, and growth. Free Stoic-grounded assessment.",
    url: "https://constavita.com/calculators/relationship-sustainability",
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

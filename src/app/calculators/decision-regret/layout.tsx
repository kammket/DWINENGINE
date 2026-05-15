import type { Metadata } from "next";

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebApplication",
      name: "Decision Regret Calculator",
      url: "https://constavita.com/calculators/decision-regret",
      applicationCategory: "LifestyleApplication",
      description:
        "Free decision quality calculator. Score your decision process quality, reversibility, information quality, and emotional alignment.",
      offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
      breadcrumb: {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: "https://constavita.com" },
          { "@type": "ListItem", position: 2, name: "Calculators", item: "https://constavita.com/calculators" },
          { "@type": "ListItem", position: 3, name: "Decision Quality", item: "https://constavita.com/calculators/decision-regret" },
        ],
      },
    },
    {
      "@type": "HowTo",
      name: "How to Calculate Your Decision Quality Score",
      description: "Use the free Constavita Decision Regret Calculator to score your decision-making process across reversibility, information quality, values alignment, and emotional impact.",
      totalTime: "PT3M",
      tool: { "@type": "HowToTool", name: "Constavita Decision Regret Calculator", url: "https://constavita.com/calculators/decision-regret" },
      step: [
        { "@type": "HowToStep", position: 1, name: "Describe the decision type", text: "Indicate whether the decision is career, financial, relational, or personal, and its approximate stakes." },
        { "@type": "HowToStep", position: 2, name: "Rate reversibility", text: "Assess how easily the decision could be undone or corrected if it turns out to be wrong." },
        { "@type": "HowToStep", position: 3, name: "Evaluate information quality", text: "Rate the completeness and reliability of the information you based the decision on." },
        { "@type": "HowToStep", position: 4, name: "Assess values alignment", text: "Rate how well the decision aligns with your stated personal values and long-term goals." },
        { "@type": "HowToStep", position: 5, name: "Review your Decision Quality Index", text: "Receive a regret-minimisation score and a Stoic reflection to help you act with clarity and less second-guessing." },
      ],
    },
  ],
};

export const metadata: Metadata = {
  title: "Decision Regret Calculator — Measure Decision Quality | Constavita",
  description:
    "Free decision quality calculator. Score your decision-making process across reversibility, information quality, values alignment, and emotional impact. Reduce future regret with Stoic clarity.",
  keywords: [
    "decision regret calculator",
    "decision quality score",
    "how to make better decisions",
    "decision making assessment",
    "decision fatigue calculator",
    "regret minimisation",
    "stoic decision making",
    "life decision calculator",
  ],
  alternates: { canonical: "https://constavita.com/calculators/decision-regret" },
  openGraph: {
    title: "Decision Regret Calculator — Free | Constavita",
    description: "Score your decision quality and reduce future regret. Assess reversibility, information, values, and emotional alignment.",
    url: "https://constavita.com/calculators/decision-regret",
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

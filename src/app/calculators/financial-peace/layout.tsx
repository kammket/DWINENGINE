import type { Metadata } from "next";

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "Financial Peace Calculator",
  url: "https://limitum.ai/calculators/financial-peace",
  applicationCategory: "FinanceApplication",
  description:
    "Free financial peace calculator. Score your income-to-expenses ratio, emergency fund, debt load, savings rate, and financial stress into a single sustainability index.",
  featureList: ["Emergency fund assessment", "Debt-to-income ratio", "Savings rate scoring", "Financial stress index", "AI Stoic reflection"],
  offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
  breadcrumb: {
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: "https://limitum.ai" },
      { "@type": "ListItem", position: 2, name: "Calculators", item: "https://limitum.ai/calculators" },
      { "@type": "ListItem", position: 3, name: "Financial Peace", item: "https://limitum.ai/calculators/financial-peace" },
    ],
  },
};

export const metadata: Metadata = {
  title: "Financial Peace Calculator — Free Score | Limitum",
  description:
    "Calculate your financial peace score in 2 minutes. Assess income vs expenses, emergency fund, debt load, savings rate, and stress level. Get a Stoic AI reflection on your results.",
  keywords: [
    "financial peace calculator",
    "financial wellness score",
    "personal finance calculator",
    "debt to income ratio calculator",
    "emergency fund calculator",
    "financial stress assessment",
    "stoic financial planning",
  ],
  alternates: { canonical: "https://limitum.ai/calculators/financial-peace" },
  openGraph: {
    title: "Financial Peace Calculator — Free | Limitum",
    description: "Score your financial sustainability in 2 minutes. Emergency fund, debt ratio, savings rate, and more.",
    url: "https://limitum.ai/calculators/financial-peace",
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

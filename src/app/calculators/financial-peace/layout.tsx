import type { Metadata } from "next";

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebApplication",
      name: "Financial Peace Calculator",
      url: "https://constavita.com/calculators/financial-peace",
      applicationCategory: "FinanceApplication",
      description:
        "Free financial peace calculator. Score your income-to-expenses ratio, emergency fund, debt load, savings rate, and financial stress into a single sustainability index.",
      featureList: ["Emergency fund assessment", "Debt-to-income ratio", "Savings rate scoring", "Financial stress index", "AI Stoic reflection"],
      offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
      breadcrumb: {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: "https://constavita.com" },
          { "@type": "ListItem", position: 2, name: "Calculators", item: "https://constavita.com/calculators" },
          { "@type": "ListItem", position: 3, name: "Financial Peace", item: "https://constavita.com/calculators/financial-peace" },
        ],
      },
    },
    {
      "@type": "HowTo",
      name: "How to Calculate Your Financial Peace Score",
      description: "Use the free Constavita Financial Peace Calculator to score your income, expenses, emergency fund, debt, and savings rate into a single financial sustainability index.",
      totalTime: "PT2M",
      tool: { "@type": "HowToTool", name: "Constavita Financial Peace Calculator", url: "https://constavita.com/calculators/financial-peace" },
      step: [
        { "@type": "HowToStep", position: 1, name: "Enter your monthly income and expenses", text: "Input your take-home pay and total monthly outgoings to calculate your income-to-expense ratio." },
        { "@type": "HowToStep", position: 2, name: "Assess your emergency fund", text: "Enter how many months of expenses you currently have saved in an accessible emergency fund." },
        { "@type": "HowToStep", position: 3, name: "Enter your debt-to-income details", text: "Provide your total monthly debt repayments so the calculator can derive your debt-to-income ratio." },
        { "@type": "HowToStep", position: 4, name: "Rate your financial stress", text: "On a 1–10 scale, rate how stressed you feel about your current financial situation." },
        { "@type": "HowToStep", position: 5, name: "Review your Financial Peace Index", text: "Receive a 0–100 sustainability score with a breakdown of each factor and a Stoic reflection on your result." },
      ],
    },
  ],
};

export const metadata: Metadata = {
  title: "Financial Peace Calculator — Free Score | Constavita",
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
  alternates: { canonical: "https://constavita.com/calculators/financial-peace" },
  openGraph: {
    title: "Financial Peace Calculator — Free | Constavita",
    description: "Score your financial sustainability in 2 minutes. Emergency fund, debt ratio, savings rate, and more.",
    url: "https://constavita.com/calculators/financial-peace",
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

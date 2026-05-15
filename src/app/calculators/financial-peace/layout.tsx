import type { Metadata } from "next";

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "FAQPage",
      mainEntity: [
        {
          "@type": "Question",
          name: "What is a good financial peace score?",
          acceptedAnswer: { "@type": "Answer", text: "A score of 70–100 indicates strong financial sustainability — your income covers expenses with room to save, your emergency fund is healthy, and your debt load is manageable. A score of 40–69 suggests areas to improve. Below 40 signals significant financial stress that warrants immediate attention." },
        },
        {
          "@type": "Question",
          name: "How is the financial peace score calculated?",
          acceptedAnswer: { "@type": "Answer", text: "The score is a weighted composite of five factors: income-to-expense ratio (30%), emergency fund coverage in months (25%), debt-to-income ratio (20%), savings rate (15%), and self-rated financial stress (10%). Each factor is normalised to 0–100 and combined for your final index." },
        },
        {
          "@type": "Question",
          name: "How many months of emergency fund should I have?",
          acceptedAnswer: { "@type": "Answer", text: "Most financial planners recommend 3–6 months of essential expenses for employees and 6–12 months for self-employed individuals or those with variable income. The calculator scores you maximally at 6 or more months." },
        },
        {
          "@type": "Question",
          name: "What debt-to-income ratio is considered healthy?",
          acceptedAnswer: { "@type": "Answer", text: "A debt-to-income ratio below 20% is considered excellent. 20–35% is manageable. Above 43% is the threshold most lenders consider high risk, and the calculator will reflect elevated stress in your score." },
        },
        {
          "@type": "Question",
          name: "Is the financial peace calculator free?",
          acceptedAnswer: { "@type": "Answer", text: "Yes, the Financial Peace Calculator is completely free with no credit card required. You can run the assessment as many times as you like and save your history with a free account." },
        },
      ],
    },
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

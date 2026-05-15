import type { Metadata } from "next";

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "AboutPage",
      "@id": "https://constavita.com/about",
      name: "About Constavita",
      url: "https://constavita.com/about",
      description: "Constavita is an AI-powered decision intelligence platform grounded in Stoic philosophy and behavioural science. We help you measure the sustainability of life decisions across five dimensions.",
      breadcrumb: {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: "https://constavita.com" },
          { "@type": "ListItem", position: 2, name: "About", item: "https://constavita.com/about" },
        ],
      },
    },
    {
      "@type": "Organization",
      "@id": "https://constavita.com/#organization",
      name: "Constavita",
      url: "https://constavita.com",
      description: "An AI-powered decision intelligence platform grounded in Stoic philosophy and behavioural science. Five free life sustainability calculators covering burnout risk, financial peace, relationship health, decision quality, and time value.",
      foundingDate: "2025",
      logo: {
        "@type": "ImageObject",
        url: "https://constavita.com/opengraph-image.png",
        width: 1200,
        height: 630,
      },
      contactPoint: {
        "@type": "ContactPoint",
        email: "hello@constavita.com",
        contactType: "customer support",
        availableLanguage: "English",
      },
      sameAs: ["https://twitter.com/constavita_ai"],
      knowsAbout: [
        "Burnout Prevention",
        "Financial Wellness",
        "Stoic Philosophy",
        "Decision Intelligence",
        "Relationship Sustainability",
        "Work-Life Balance",
        "Behavioural Science",
        "Time Management",
      ],
      hasOfferCatalog: {
        "@type": "OfferCatalog",
        name: "Life Sustainability Calculators",
        itemListElement: [
          { "@type": "Offer", itemOffered: { "@type": "Service", name: "Burnout Risk Calculator", url: "https://constavita.com/calculators/burnout-risk" } },
          { "@type": "Offer", itemOffered: { "@type": "Service", name: "Financial Peace Calculator", url: "https://constavita.com/calculators/financial-peace" } },
          { "@type": "Offer", itemOffered: { "@type": "Service", name: "Relationship Sustainability Calculator", url: "https://constavita.com/calculators/relationship-sustainability" } },
          { "@type": "Offer", itemOffered: { "@type": "Service", name: "Decision Regret Calculator", url: "https://constavita.com/calculators/decision-regret" } },
          { "@type": "Offer", itemOffered: { "@type": "Service", name: "Time Value Calculator", url: "https://constavita.com/calculators/time-value" } },
        ],
      },
    },
  ],
};

export const metadata: Metadata = {
  title: "About Constavita — AI Decision Intelligence Built on Stoic Philosophy",
  description:
    "Constavita helps you measure the sustainability of your life decisions using AI-powered calculators grounded in Stoic philosophy and behavioural science. Not therapy. Not prediction. Clarity.",
  alternates: { canonical: "https://constavita.com/about" },
  openGraph: {
    title: "About Constavita — AI Decision Intelligence Built on Stoic Philosophy",
    description:
      "We help you measure the sustainability of your life decisions. Not therapy. Not prediction. A rational mirror.",
    url: "https://constavita.com/about",
    type: "website",
  },
};

export default function AboutLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      {children}
    </>
  );
}

import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/api/",
          "/admin/",
          "/dashboard/",
          "/settings/",
          "/onboarding/",
          "/pay/",
          "/checkin/",
          "/journal/",
          "/intention/",
          "/virtues/",
          "/analytics/",
          "/simulate/",
          "/reflections/",
        ],
      },
      // Opt AI training crawlers out — content is proprietary
      { userAgent: "GPTBot", disallow: "/" },
      { userAgent: "ChatGPT-User", disallow: "/" },
      { userAgent: "Google-Extended", disallow: "/" },
      { userAgent: "CCBot", disallow: "/" },
      { userAgent: "anthropic-ai", disallow: "/" },
      { userAgent: "Claude-Web", disallow: "/" },
    ],
    sitemap: "https://constavita.com/sitemap.xml",
  };
}

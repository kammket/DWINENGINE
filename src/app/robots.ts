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
    ],
    sitemap: "https://limitum.ai/sitemap.xml",
  };
}

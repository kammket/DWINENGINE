import type { MetadataRoute } from "next";
import { BLOG_POSTS } from "@/lib/blog";
import { getAllAuthorSlugs } from "@/lib/authors";

const BASE_URL = "https://constavita.com";

export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: BASE_URL, lastModified: new Date("2025-05-01"), changeFrequency: "weekly", priority: 1.0 },
    { url: `${BASE_URL}/calculators`, lastModified: new Date("2025-05-15"), changeFrequency: "monthly", priority: 0.9 },
    { url: `${BASE_URL}/calculators/financial-peace`, lastModified: new Date("2025-05-08"), changeFrequency: "monthly", priority: 0.85 },
    { url: `${BASE_URL}/calculators/burnout-risk`, lastModified: new Date("2025-05-01"), changeFrequency: "monthly", priority: 0.85 },
    { url: `${BASE_URL}/calculators/relationship-sustainability`, lastModified: new Date("2025-05-12"), changeFrequency: "monthly", priority: 0.85 },
    { url: `${BASE_URL}/calculators/decision-regret`, lastModified: new Date("2025-05-10"), changeFrequency: "monthly", priority: 0.85 },
    { url: `${BASE_URL}/calculators/time-value`, lastModified: new Date("2025-05-14"), changeFrequency: "monthly", priority: 0.85 },
    { url: `${BASE_URL}/blog`, lastModified: new Date("2025-07-17"), changeFrequency: "weekly", priority: 0.9 },
    { url: `${BASE_URL}/pricing`, lastModified: new Date("2025-05-01"), changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE_URL}/about`, lastModified: new Date("2025-05-01"), changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE_URL}/faq`, lastModified: new Date("2025-06-01"), changeFrequency: "monthly", priority: 0.8 },
    { url: `${BASE_URL}/contact`, lastModified: new Date("2025-05-01"), changeFrequency: "yearly", priority: 0.5 },
    { url: `${BASE_URL}/legal/privacy`, lastModified: new Date("2025-05-01"), changeFrequency: "yearly", priority: 0.4 },
    { url: `${BASE_URL}/legal/terms`, lastModified: new Date("2025-05-01"), changeFrequency: "yearly", priority: 0.4 },
    { url: `${BASE_URL}/legal/disclaimer`, lastModified: new Date("2025-05-01"), changeFrequency: "yearly", priority: 0.3 },
    { url: `${BASE_URL}/legal/gdpr`, lastModified: new Date("2025-05-01"), changeFrequency: "yearly", priority: 0.3 },
  ];

  const blogRoutes: MetadataRoute.Sitemap = BLOG_POSTS.map((post) => ({
    url: `${BASE_URL}/blog/${post.slug}`,
    lastModified: new Date(post.updatedAt ?? post.publishedAt),
    changeFrequency: "monthly" as const,
    priority: 0.8,
  }));

  const authorRoutes: MetadataRoute.Sitemap = getAllAuthorSlugs().map((slug) => ({
    url: `${BASE_URL}/blog/author/${slug}`,
    lastModified: new Date("2025-05-01"),
    changeFrequency: "monthly" as const,
    priority: 0.5,
  }));

  return [...staticRoutes, ...blogRoutes, ...authorRoutes];
}

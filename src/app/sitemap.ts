import type { MetadataRoute } from "next";
import { BLOG_POSTS } from "@/lib/blog";
import { getAllAuthorSlugs } from "@/lib/authors";

const BASE_URL = "https://constavita.com";
const LAUNCH_DATE = new Date("2025-05-01");

export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: BASE_URL, lastModified: LAUNCH_DATE, changeFrequency: "weekly", priority: 1.0 },
    { url: `${BASE_URL}/calculators`, lastModified: LAUNCH_DATE, changeFrequency: "monthly", priority: 0.9 },
    { url: `${BASE_URL}/calculators/financial-peace`, lastModified: LAUNCH_DATE, changeFrequency: "monthly", priority: 0.8 },
    { url: `${BASE_URL}/calculators/burnout-risk`, lastModified: LAUNCH_DATE, changeFrequency: "monthly", priority: 0.8 },
    { url: `${BASE_URL}/calculators/relationship-sustainability`, lastModified: LAUNCH_DATE, changeFrequency: "monthly", priority: 0.8 },
    { url: `${BASE_URL}/calculators/decision-regret`, lastModified: LAUNCH_DATE, changeFrequency: "monthly", priority: 0.8 },
    { url: `${BASE_URL}/calculators/time-value`, lastModified: LAUNCH_DATE, changeFrequency: "monthly", priority: 0.8 },
    { url: `${BASE_URL}/blog`, lastModified: LAUNCH_DATE, changeFrequency: "weekly", priority: 0.9 },
    { url: `${BASE_URL}/pricing`, lastModified: LAUNCH_DATE, changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE_URL}/about`, lastModified: LAUNCH_DATE, changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE_URL}/faq`, lastModified: LAUNCH_DATE, changeFrequency: "monthly", priority: 0.8 },
    { url: `${BASE_URL}/contact`, lastModified: LAUNCH_DATE, changeFrequency: "yearly", priority: 0.5 },
    { url: `${BASE_URL}/legal/privacy`, lastModified: LAUNCH_DATE, changeFrequency: "yearly", priority: 0.4 },
    { url: `${BASE_URL}/legal/terms`, lastModified: LAUNCH_DATE, changeFrequency: "yearly", priority: 0.4 },
    { url: `${BASE_URL}/legal/disclaimer`, lastModified: LAUNCH_DATE, changeFrequency: "yearly", priority: 0.3 },
    { url: `${BASE_URL}/legal/gdpr`, lastModified: LAUNCH_DATE, changeFrequency: "yearly", priority: 0.3 },
  ];

  const blogRoutes: MetadataRoute.Sitemap = BLOG_POSTS.map((post) => ({
    url: `${BASE_URL}/blog/${post.slug}`,
    lastModified: new Date(post.updatedAt ?? post.publishedAt),
    changeFrequency: "monthly" as const,
    priority: 0.8,
  }));

  const authorRoutes: MetadataRoute.Sitemap = getAllAuthorSlugs().map((slug) => ({
    url: `${BASE_URL}/blog/author/${slug}`,
    lastModified: LAUNCH_DATE,
    changeFrequency: "monthly" as const,
    priority: 0.5,
  }));

  return [...staticRoutes, ...blogRoutes, ...authorRoutes];
}

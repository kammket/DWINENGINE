import type { Metadata } from "next";
import Link from "next/link";
import { BLOG_POSTS } from "@/lib/blog";
import { PublicHeader, Footer } from "@/components/layout/PublicLayout";
import { ArrowRight, Clock, Tag } from "lucide-react";

export const metadata: Metadata = {
  title: "Blog — Decision Intelligence & Stoic Wellbeing",
  description:
    "Evidence-based articles on burnout prevention, Stoic decision making, financial peace, and sustainable work-life balance. Practical wisdom backed by modern research.",
  keywords: [
    "stoic decision making",
    "burnout risk calculator",
    "financial peace score",
    "work life balance calculator",
    "decision intelligence",
    "wellbeing articles",
  ],
  openGraph: {
    title: "Limitum Blog — Decision Intelligence & Stoic Wellbeing",
    description:
      "Evidence-based articles on burnout prevention, Stoic decision making, financial peace, and sustainable work-life balance.",
    type: "website",
    url: "https://limitum.ai/blog",
  },
  alternates: {
    canonical: "https://limitum.ai/blog",
  },
};

const CATEGORY_COLORS: Record<string, string> = {
  Wellbeing: "bg-green-50 text-green-700",
  "Decision Intelligence": "bg-amber-50 text-amber-700",
  "Financial Wellness": "bg-blue-50 text-blue-700",
  "Time & Productivity": "bg-purple-50 text-purple-700",
};

export default function BlogIndexPage() {
  const sortedPosts = [...BLOG_POSTS].sort(
    (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
  );

  const [featured, ...rest] = sortedPosts;

  return (
    <div className="min-h-screen bg-ivory">
      <PublicHeader />

      <main className="pt-24 pb-20">
        {/* Header */}
        <section className="max-w-5xl mx-auto px-6 mb-14">
          <div className="text-center">
            <span className="inline-block text-xs font-semibold uppercase tracking-widest text-soft-gold bg-amber-50 px-4 py-1.5 rounded-full mb-4">
              Limitum Journal
            </span>
            <h1 className="font-serif text-4xl md:text-5xl font-bold text-matte-black mb-4">
              Decision Intelligence &amp; Stoic Wellbeing
            </h1>
            <p className="text-slate-calm text-lg max-w-2xl mx-auto">
              Evidence-based articles on burnout prevention, financial peace, better decisions,
              and sustainable work-life balance — grounded in Stoic philosophy and modern research.
            </p>
          </div>
        </section>

        <div className="max-w-5xl mx-auto px-6">
          {/* Featured post */}
          <article className="mb-14">
            <Link href={`/blog/${featured.slug}`} className="group block">
              <div className="bg-white rounded-3xl border border-stone-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                {/* Gold accent bar */}
                <div className="h-1.5 bg-gradient-to-r from-soft-gold to-brand-400" />
                <div className="p-8 md:p-10">
                  <div className="flex flex-wrap items-center gap-3 mb-4">
                    <span
                      className={`text-xs font-semibold px-3 py-1 rounded-full ${
                        CATEGORY_COLORS[featured.category] || "bg-stone-100 text-slate-calm"
                      }`}
                    >
                      {featured.category}
                    </span>
                    <span className="inline-flex items-center gap-1 text-xs text-stone-400">
                      <Clock className="w-3.5 h-3.5" />
                      {featured.readingTime} min read
                    </span>
                    <span className="text-xs text-stone-400">
                      {new Date(featured.publishedAt).toLocaleDateString("en-GB", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                    </span>
                    <span className="text-xs font-semibold text-soft-gold bg-amber-50 px-2 py-0.5 rounded-full">
                      Latest
                    </span>
                  </div>
                  <h2 className="font-serif text-2xl md:text-3xl font-bold text-matte-black mb-3 group-hover:text-soft-gold transition-colors leading-snug">
                    {featured.title}
                  </h2>
                  <p className="text-slate-calm leading-relaxed mb-6 max-w-2xl">
                    {featured.excerpt}
                  </p>
                  <div className="flex items-center gap-2 text-sm font-semibold text-soft-gold">
                    Read article
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </div>
            </Link>
          </article>

          {/* Rest of posts */}
          <div className="grid md:grid-cols-3 gap-6">
            {rest.map((post) => (
              <article key={post.slug}>
                <Link href={`/blog/${post.slug}`} className="group block h-full">
                  <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-sm hover:shadow-md transition-shadow h-full flex flex-col">
                    <div className="flex flex-wrap items-center gap-2 mb-3">
                      <span
                        className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                          CATEGORY_COLORS[post.category] || "bg-stone-100 text-slate-calm"
                        }`}
                      >
                        {post.category}
                      </span>
                      <span className="inline-flex items-center gap-1 text-xs text-stone-400">
                        <Clock className="w-3 h-3" />
                        {post.readingTime} min
                      </span>
                    </div>
                    <h2 className="font-serif text-lg font-bold text-matte-black mb-2 group-hover:text-soft-gold transition-colors leading-snug flex-1">
                      {post.title}
                    </h2>
                    <p className="text-sm text-slate-calm leading-relaxed mb-4 line-clamp-3">
                      {post.excerpt}
                    </p>
                    <div className="mt-auto">
                      <div className="flex flex-wrap gap-1.5 mb-4">
                        {post.tags.slice(0, 2).map((tag) => (
                          <span
                            key={tag}
                            className="inline-flex items-center gap-1 text-xs text-stone-500 bg-stone-50 px-2 py-0.5 rounded-full"
                          >
                            <Tag className="w-2.5 h-2.5" />
                            {tag}
                          </span>
                        ))}
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-stone-400">
                          {new Date(post.publishedAt).toLocaleDateString("en-GB", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </span>
                        <span className="flex items-center gap-1 text-xs font-semibold text-soft-gold">
                          Read <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              </article>
            ))}
          </div>

          {/* Newsletter / CTA */}
          <div className="mt-16 bg-gradient-to-r from-amber-50 to-brand-50 border border-amber-100 rounded-3xl p-8 md:p-10 text-center">
            <h2 className="font-serif text-2xl font-bold text-matte-black mb-2">
              Put the ideas into practice
            </h2>
            <p className="text-slate-calm mb-6 max-w-md mx-auto">
              Limitum&apos;s calculators turn these concepts into measurable scores for your own life — burnout risk, financial peace, decision quality, and more.
            </p>
            <Link
              href="/register"
              className="inline-flex items-center gap-2 bg-soft-gold text-white px-6 py-3 rounded-xl font-semibold text-sm hover:bg-brand-600 transition-colors shadow-sm"
            >
              Start Free — No Credit Card Required
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

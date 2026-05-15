import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getPostBySlug, getAllSlugs, BLOG_POSTS } from "@/lib/blog";
import { getAuthor } from "@/lib/authors";
import { PublicHeader, Footer } from "@/components/layout/PublicLayout";
import { ArrowLeft, ArrowRight, Clock, Tag, Calendar, BookOpen, Twitter } from "lucide-react";

// ─── Static generation ────────────────────────────────────────────────────────

export function generateStaticParams() {
  return getAllSlugs().map((slug) => ({ slug }));
}

// ─── SEO Metadata ─────────────────────────────────────────────────────────────

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) return { title: "Post not found" };

  const url = `https://constavita.com/blog/${post.slug}`;

  return {
    title: post.metaTitle,
    description: post.metaDescription,
    keywords: post.keywords,
    authors: [{ name: post.author }],
    openGraph: {
      title: post.metaTitle,
      description: post.metaDescription,
      type: "article",
      url,
      publishedTime: post.publishedAt,
      modifiedTime: post.updatedAt ?? post.publishedAt,
      authors: [post.author],
      tags: post.tags,
      siteName: "Constavita",
    },
    twitter: {
      card: "summary_large_image",
      title: post.metaTitle,
      description: post.metaDescription,
    },
    alternates: {
      canonical: url,
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}

// ─── Category colours ─────────────────────────────────────────────────────────

const CATEGORY_COLORS: Record<string, string> = {
  Wellbeing: "bg-green-50 text-green-700",
  "Decision Intelligence": "bg-amber-50 text-amber-700",
  "Financial Wellness": "bg-blue-50 text-blue-700",
  "Time & Productivity": "bg-purple-50 text-purple-700",
};

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) notFound();

  const author = getAuthor(post.authorSlug);

  const relatedPosts = BLOG_POSTS.filter(
    (p) => p.slug !== post.slug && (p.category === post.category || p.tags.some((t) => post.tags.includes(t)))
  ).slice(0, 2);

  // JSON-LD — BlogPosting with Person author schema for E-E-A-T
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.metaTitle,
    description: post.metaDescription,
    author: {
      "@type": "Person",
      name: post.author,
      url: `https://constavita.com/blog/author/${post.authorSlug}`,
      jobTitle: author?.role,
      knowsAbout: author?.expertise,
      worksFor: {
        "@type": "Organization",
        name: "Constavita",
        url: "https://constavita.com",
      },
    },
    publisher: {
      "@type": "Organization",
      name: "Constavita",
      url: "https://constavita.com",
      logo: {
        "@type": "ImageObject",
        url: "https://constavita.com/logo.png",
      },
    },
    datePublished: post.publishedAt,
    dateModified: post.updatedAt ?? post.publishedAt,
    url: `https://constavita.com/blog/${post.slug}`,
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `https://constavita.com/blog/${post.slug}`,
    },
    keywords: post.keywords.join(", "),
    articleSection: post.category,
    wordCount: post.content.replace(/<[^>]+>/g, "").split(/\s+/).length,
    timeRequired: `PT${post.readingTime}M`,
  };

  return (
    <>
      {/* Inject JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="min-h-screen bg-ivory">
        <PublicHeader />

        <main className="pt-24 pb-20">
          <div className="max-w-3xl mx-auto px-6">
            {/* Breadcrumb */}
            <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs text-stone-400 mb-8">
              <Link href="/" className="hover:text-matte-black transition-colors">Home</Link>
              <span>/</span>
              <Link href="/blog" className="hover:text-matte-black transition-colors">Blog</Link>
              <span>/</span>
              <span className="text-matte-black truncate max-w-[200px]">{post.title}</span>
            </nav>

            {/* Post header */}
            <header className="mb-10">
              <div className="flex flex-wrap items-center gap-3 mb-4">
                <span
                  className={`text-xs font-semibold px-3 py-1 rounded-full ${
                    CATEGORY_COLORS[post.category] || "bg-stone-100 text-slate-calm"
                  }`}
                >
                  {post.category}
                </span>
                <span className="inline-flex items-center gap-1 text-xs text-stone-400">
                  <Clock className="w-3.5 h-3.5" />
                  {post.readingTime} min read
                </span>
              </div>

              <h1 className="font-serif text-3xl md:text-4xl font-bold text-matte-black leading-tight mb-4">
                {post.title}
              </h1>

              <p className="text-lg text-slate-calm leading-relaxed mb-6">
                {post.excerpt}
              </p>

              <div className="flex flex-wrap items-center gap-4 py-4 border-t border-b border-stone-100">
                <Link
                  href={`/blog/author/${post.authorSlug}`}
                  className="flex items-center gap-2 group"
                >
                  <div className="w-7 h-7 bg-gradient-to-br from-soft-gold to-brand-600 rounded-lg flex items-center justify-center flex-shrink-0">
                    <span className="text-white text-xs font-bold">{post.author.charAt(0)}</span>
                  </div>
                  <span className="text-xs font-medium text-stone-600 group-hover:text-soft-gold transition-colors">
                    {post.author}
                  </span>
                </Link>
                <div className="flex items-center gap-1.5 text-xs text-stone-500">
                  <Calendar className="w-3.5 h-3.5" />
                  <time dateTime={post.publishedAt}>
                    {new Date(post.publishedAt).toLocaleDateString("en-GB", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </time>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {post.tags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center gap-1 text-xs text-stone-500 bg-stone-50 border border-stone-100 px-2 py-0.5 rounded-full"
                    >
                      <Tag className="w-2.5 h-2.5" />
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </header>

            {/* Related calculator CTA — above content */}
            {post.relatedCalculator && (
              <div className="mb-10 bg-gradient-to-r from-amber-50 to-brand-50 border border-amber-200 rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold text-soft-gold uppercase tracking-wider mb-0.5">
                    Try it yourself
                  </p>
                  <p className="text-sm font-medium text-matte-black">
                    {post.relatedCalculator.label}
                  </p>
                </div>
                <Link
                  href={post.relatedCalculator.href}
                  className="inline-flex items-center gap-2 bg-soft-gold text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-brand-600 transition-colors shadow-sm flex-shrink-0"
                >
                  Open Calculator
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            )}

            {/* Article body */}
            <article
              className="prose prose-stone prose-lg max-w-none
                         prose-headings:font-serif prose-headings:text-matte-black
                         prose-h2:text-2xl prose-h2:font-bold prose-h2:mt-10 prose-h2:mb-4
                         prose-h3:text-lg prose-h3:font-semibold prose-h3:mt-6 prose-h3:mb-2
                         prose-p:text-slate-calm prose-p:leading-relaxed prose-p:mb-5
                         prose-li:text-slate-calm prose-li:leading-relaxed
                         prose-strong:text-matte-black prose-strong:font-semibold
                         prose-blockquote:border-l-4 prose-blockquote:border-soft-gold
                         prose-blockquote:bg-amber-50 prose-blockquote:rounded-r-xl
                         prose-blockquote:px-6 prose-blockquote:py-4 prose-blockquote:not-italic
                         prose-blockquote:text-matte-black prose-blockquote:font-serif
                         prose-ol:text-slate-calm prose-ul:text-slate-calm"
              dangerouslySetInnerHTML={{ __html: post.content }}
            />

            {/* Bottom CTA */}
            {post.relatedCalculator && (
              <div className="mt-12 bg-matte-black rounded-2xl p-8 text-center">
                <p className="text-xs font-semibold text-soft-gold uppercase tracking-widest mb-2">
                  Put this into practice
                </p>
                <h2 className="font-serif text-xl font-bold text-warm-white mb-2">
                  {post.relatedCalculator.label}
                </h2>
                <p className="text-stone-400 text-sm mb-5 max-w-sm mx-auto">
                  Measure where you actually stand today. Your score is private, takes under 3 minutes, and gives you a clear baseline to act from.
                </p>
                <Link
                  href={post.relatedCalculator.href}
                  className="inline-flex items-center gap-2 bg-soft-gold text-white px-6 py-3 rounded-xl font-semibold text-sm hover:bg-brand-600 transition-colors shadow-sm"
                >
                  Start Free — No Account Required
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            )}

            {/* Author bio card */}
            {author && (
              <div className="mt-12 bg-stone-50 border border-stone-200 rounded-2xl p-6 flex flex-col sm:flex-row gap-5 items-start">
                <div className="w-14 h-14 bg-gradient-to-br from-soft-gold to-brand-600 rounded-xl flex items-center justify-center flex-shrink-0">
                  <span className="text-white text-2xl font-bold font-serif">{author.name.charAt(0)}</span>
                </div>
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <Link
                      href={`/blog/author/${author.slug}`}
                      className="font-semibold text-sm text-matte-black hover:text-soft-gold transition-colors"
                    >
                      {author.name}
                    </Link>
                    <span className="text-xs text-stone-400">{author.role}</span>
                  </div>
                  <p className="text-xs text-slate-calm leading-relaxed mb-3">{author.bio}</p>
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {author.expertise.map((tag) => (
                      <span key={tag} className="inline-flex items-center gap-1 text-xs text-stone-500 bg-white border border-stone-200 px-2 py-0.5 rounded-full">
                        <BookOpen className="w-2.5 h-2.5" />
                        {tag}
                      </span>
                    ))}
                  </div>
                  <div className="flex gap-3">
                    {author.social.twitter && (
                      <a href={author.social.twitter} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs text-stone-400 hover:text-matte-black transition-colors">
                        <Twitter className="w-3 h-3" /> Twitter
                      </a>
                    )}
                    <Link href={`/blog/author/${author.slug}`} className="text-xs text-soft-gold hover:text-brand-600 transition-colors">
                      All articles →
                    </Link>
                  </div>
                </div>
              </div>
            )}

            {/* Back to blog */}
            <div className="mt-10">
              <Link
                href="/blog"
                className="inline-flex items-center gap-2 text-sm text-slate-calm hover:text-matte-black transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to all articles
              </Link>
            </div>

            {/* Related posts */}
            {relatedPosts.length > 0 && (
              <section className="mt-14">
                <h2 className="font-serif text-xl font-bold text-matte-black mb-6">Related Articles</h2>
                <div className="grid sm:grid-cols-2 gap-5">
                  {relatedPosts.map((related) => (
                    <Link key={related.slug} href={`/blog/${related.slug}`} className="group block">
                      <div className="bg-white rounded-2xl border border-stone-200 p-5 shadow-sm hover:shadow-md transition-shadow h-full">
                        <span
                          className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                            CATEGORY_COLORS[related.category] || "bg-stone-100 text-slate-calm"
                          }`}
                        >
                          {related.category}
                        </span>
                        <h3 className="font-serif text-base font-bold text-matte-black mt-3 mb-1 group-hover:text-soft-gold transition-colors leading-snug">
                          {related.title}
                        </h3>
                        <p className="text-xs text-slate-calm line-clamp-2 mb-3">{related.excerpt}</p>
                        <span className="flex items-center gap-1 text-xs font-semibold text-soft-gold">
                          Read <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            )}
          </div>
        </main>

        <Footer />
      </div>
    </>
  );
}

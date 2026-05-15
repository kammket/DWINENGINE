import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getAuthor, getAllAuthorSlugs } from "@/lib/authors";
import { BLOG_POSTS } from "@/lib/blog";
import { PublicHeader, Footer } from "@/components/layout/PublicLayout";
import { ArrowRight, Clock, Tag, BookOpen, Twitter, Linkedin } from "lucide-react";

export function generateStaticParams() {
  return getAllAuthorSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const author = getAuthor(slug);
  if (!author) return { title: "Author not found" };

  const url = `https://constavita.com/blog/author/${author.slug}`;
  return {
    title: `${author.name} — ${author.role}`,
    description: author.bio,
    alternates: { canonical: url },
    openGraph: {
      title: `${author.name} — ${author.role} | Constavita`,
      description: author.bio,
      url,
      type: "profile",
    },
  };
}

const CATEGORY_COLORS: Record<string, string> = {
  Wellbeing: "bg-green-50 text-green-700",
  "Decision Intelligence": "bg-amber-50 text-amber-700",
  "Financial Wellness": "bg-blue-50 text-blue-700",
  "Time & Productivity": "bg-purple-50 text-purple-700",
};

export default async function AuthorPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const author = getAuthor(slug);
  if (!author) notFound();

  const posts = BLOG_POSTS.filter((p) => p.authorSlug === slug).sort(
    (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
  );

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: author.name,
    url: `https://constavita.com/blog/author/${author.slug}`,
    jobTitle: author.role,
    description: author.bio,
    knowsAbout: author.expertise,
    worksFor: {
      "@type": "Organization",
      name: "Constavita",
      url: "https://constavita.com",
    },
    sameAs: [
      author.social.twitter,
      author.social.linkedin,
    ].filter(Boolean),
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div className="min-h-screen bg-ivory">
        <PublicHeader />
        <main className="pt-24 pb-20">
          <div className="max-w-4xl mx-auto px-6">
            {/* Breadcrumb */}
            <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs text-stone-400 mb-10">
              <Link href="/" className="hover:text-matte-black transition-colors">Home</Link>
              <span>/</span>
              <Link href="/blog" className="hover:text-matte-black transition-colors">Blog</Link>
              <span>/</span>
              <span className="text-matte-black">Authors</span>
              <span>/</span>
              <span className="text-matte-black">{author.name}</span>
            </nav>

            {/* Author profile card */}
            <div className="bg-white border border-stone-200 rounded-3xl p-8 md:p-10 mb-14 shadow-sm">
              <div className="flex flex-col md:flex-row gap-8 items-start">
                {/* Avatar */}
                <div className="w-20 h-20 bg-gradient-to-br from-soft-gold to-brand-600 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-md">
                  <span className="text-white text-3xl font-bold font-serif">
                    {author.name.charAt(0)}
                  </span>
                </div>

                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-3 mb-3">
                    <h1 className="font-serif text-2xl font-bold text-matte-black">{author.name}</h1>
                    <span className="text-xs font-semibold text-soft-gold bg-amber-50 px-3 py-1 rounded-full">
                      {author.role}
                    </span>
                  </div>

                  <p className="text-slate-calm leading-relaxed mb-5">{author.bio}</p>

                  {/* Expertise tags */}
                  <div className="flex flex-wrap gap-2 mb-5">
                    {author.expertise.map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center gap-1 text-xs text-stone-600 bg-stone-50 border border-stone-200 px-3 py-1 rounded-full"
                      >
                        <BookOpen className="w-3 h-3" />
                        {tag}
                      </span>
                    ))}
                  </div>

                  {/* Social links */}
                  {(author.social.twitter || author.social.linkedin) && (
                    <div className="flex gap-3">
                      {author.social.twitter && (
                        <a
                          href={author.social.twitter}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 text-xs text-stone-500 hover:text-matte-black transition-colors"
                        >
                          <Twitter className="w-3.5 h-3.5" />
                          Twitter
                        </a>
                      )}
                      {author.social.linkedin && (
                        <a
                          href={author.social.linkedin}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 text-xs text-stone-500 hover:text-matte-black transition-colors"
                        >
                          <Linkedin className="w-3.5 h-3.5" />
                          LinkedIn
                        </a>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Posts by this author */}
            <section>
              <h2 className="font-serif text-xl font-bold text-matte-black mb-6">
                Articles by {author.name} <span className="text-stone-400 font-sans text-base font-normal">({posts.length})</span>
              </h2>

              {posts.length === 0 ? (
                <p className="text-slate-calm">No articles yet.</p>
              ) : (
                <div className="grid md:grid-cols-2 gap-6">
                  {posts.map((post) => (
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

                          <h3 className="font-serif text-lg font-bold text-matte-black mb-2 group-hover:text-soft-gold transition-colors leading-snug flex-1">
                            {post.title}
                          </h3>
                          <p className="text-sm text-slate-calm leading-relaxed mb-4 line-clamp-2">{post.excerpt}</p>

                          <div className="mt-auto flex items-center justify-between">
                            <div className="flex flex-wrap gap-1.5">
                              {post.tags.slice(0, 2).map((tag) => (
                                <span key={tag} className="inline-flex items-center gap-1 text-xs text-stone-500 bg-stone-50 px-2 py-0.5 rounded-full">
                                  <Tag className="w-2.5 h-2.5" />
                                  {tag}
                                </span>
                              ))}
                            </div>
                            <span className="flex items-center gap-1 text-xs font-semibold text-soft-gold">
                              Read <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                            </span>
                          </div>
                        </div>
                      </Link>
                    </article>
                  ))}
                </div>
              )}
            </section>

            <div className="mt-10">
              <Link href="/blog" className="inline-flex items-center gap-2 text-sm text-slate-calm hover:text-matte-black transition-colors">
                <ArrowRight className="w-4 h-4 rotate-180" />
                All articles
              </Link>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    </>
  );
}

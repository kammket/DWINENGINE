export type Author = {
  slug: string;
  name: string;
  role: string;
  bio: string;
  expertise: string[];
  social: {
    twitter?: string;
    linkedin?: string;
  };
};

export const AUTHORS: Record<string, Author> = {
  "constavita-editorial": {
    slug: "constavita-editorial",
    name: "Constavita Editorial",
    role: "Research & Editorial Team",
    bio: "The Constavita Editorial team researches and writes about decision intelligence, behavioural science, and Stoic philosophy. Our articles are grounded in peer-reviewed research and designed to give you practical, measurable frameworks for better decisions — not motivational fluff.",
    expertise: [
      "Behavioural Science",
      "Decision Intelligence",
      "Stoic Philosophy",
      "Occupational Wellbeing",
      "Financial Psychology",
    ],
    social: {
      twitter: "https://twitter.com/constavita_ai",
    },
  },
};

export function getAuthor(slug: string): Author | undefined {
  return AUTHORS[slug];
}

export function getAllAuthorSlugs(): string[] {
  return Object.keys(AUTHORS);
}

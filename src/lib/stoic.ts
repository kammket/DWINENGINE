// Stoic Reflection Engine — Constavita Platform
// A curated library of philosophically grounded, emotionally restorative reflections.
// Drawn from Stoic philosophy, modern behavioral science, and contemplative wisdom.
// NEVER motivational hype. Always calm, wise, intellectually honest.

export type StoicReflection = {
  text: string;
  author?: string;
  category: "clarity" | "recovery" | "agency" | "patience" | "limits" | "time" | "money" | "relationships" | "decisions";
};

export const STOIC_REFLECTIONS: StoicReflection[] = [
  // CLARITY
  { text: "Clarity begins where reaction ends.", category: "clarity" },
  { text: "The obstacle is not in the situation. It is in the interpretation.", category: "clarity" },
  { text: "When you remove noise, signal becomes visible.", category: "clarity" },
  { text: "Confusion is often not the absence of knowledge — it is the presence of too much at once.", category: "clarity" },
  { text: "You have power over your mind — not outside events. Realize this, and you will find strength.", author: "Marcus Aurelius", category: "clarity" },
  { text: "If you are distressed by anything external, the pain is not due to the thing itself, but to your estimate of it.", author: "Marcus Aurelius", category: "clarity" },

  // RECOVERY
  { text: "Sustainable strength requires deliberate recovery.", category: "recovery" },
  { text: "Rest is not the absence of effort. It is the foundation of it.", category: "recovery" },
  { text: "Recovery is not weakness — it is the architecture of resilience.", category: "recovery" },
  { text: "What exhausts us is often imbalance, not insufficiency.", category: "recovery" },
  { text: "The body achieves what the mind conceives — if the mind knows when to rest.", category: "recovery" },

  // AGENCY
  { text: "Between stimulus and response, there is a space. In that space is your power.", category: "agency" },
  { text: "Make the best use of what is in your power, and take the rest as it happens.", author: "Epictetus", category: "agency" },
  { text: "You are not the prisoner of your history. You are the architect of your choices.", category: "agency" },
  { text: "Small, consistent changes compound into profound transformation.", category: "agency" },
  { text: "We suffer more in imagination than in reality.", author: "Seneca", category: "agency" },

  // PATIENCE
  { text: "The river does not rush to the sea. It arrives with certainty.", category: "patience" },
  { text: "Never let the future disturb you. You will meet it with the same reason that arms you against the present.", author: "Marcus Aurelius", category: "patience" },
  { text: "Good things require time. Wisdom most of all.", category: "patience" },
  { text: "Patience is not passive. It is active clarity about what is beyond your immediate control.", category: "patience" },

  // LIMITS
  { text: "Peace is sustained through limits, not through more.", category: "limits" },
  { text: "Not every opportunity deserves your energy.", category: "limits" },
  { text: "A life well-lived is defined not by how much was done, but by what was worth doing.", category: "limits" },
  { text: "Knowing what to refuse is as important as knowing what to pursue.", category: "limits" },
  { text: "Wealth consists not in having great possessions, but in having few wants.", author: "Epictetus", category: "limits" },

  // TIME
  { text: "Time is the currency that cannot be earned back. Spend it with precision.", category: "time" },
  { text: "It is not that we have so little time — it is that we waste so much of it.", author: "Seneca", category: "time" },
  { text: "What you do with today is what you do with your life.", category: "time" },
  { text: "The present moment always will have been.", category: "time" },

  // MONEY
  { text: "Financial freedom is not a number. It is the absence of financial fear.", category: "money" },
  { text: "Security comes not from having everything, but from needing less.", category: "money" },
  { text: "A calm relationship with money begins with clarity about what money is actually for.", category: "money" },

  // RELATIONSHIPS
  { text: "The quality of your relationships reflects the quality of your attention.", category: "relationships" },
  { text: "To be present with another person is one of the most generous acts available to us.", category: "relationships" },
  { text: "Growth does not require isolation. Often it requires connection.", category: "relationships" },

  // DECISIONS
  { text: "A decision made from fear is rarely a decision made clearly.", category: "decisions" },
  { text: "The purpose of decision-making is not certainty — it is wisdom under uncertainty.", category: "decisions" },
  { text: "Consider not what is most exciting, but what you can sustain.", category: "decisions" },
  { text: "Regret is backward-looking. Wisdom is forward-looking. Choose which guides you.", category: "decisions" },
  { text: "First say to yourself what you would be; and then do what you have to do.", author: "Epictetus", category: "decisions" },
];

// Returns a daily reflection seeded by the current date (changes once per day, consistent for all users)
export function getDailyReflection(): StoicReflection {
  const today = new Date();
  const seed = today.getFullYear() * 10000 + (today.getMonth() + 1) * 100 + today.getDate();
  return STOIC_REFLECTIONS[seed % STOIC_REFLECTIONS.length];
}

// Returns a reflection for a specific category
export function getReflectionByCategory(category: StoicReflection["category"]): StoicReflection {
  const filtered = STOIC_REFLECTIONS.filter((r) => r.category === category);
  const today = new Date();
  const seed = today.getDate() + today.getMonth();
  return filtered[seed % filtered.length];
}

// Returns n random reflections (for display variety)
export function getRandomReflections(n: number): StoicReflection[] {
  const shuffled = [...STOIC_REFLECTIONS].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, n);
}

"use client";

import { motion } from "framer-motion";

type PageHeaderProps = {
  title: string;
  description?: string;
  action?: React.ReactNode;
  badge?: { label: string; color?: "gold" | "green" | "red" | "blue" };
};

export function PageHeader({ title, description, action, badge }: PageHeaderProps) {
  const badgeColors = {
    gold: "bg-amber-50 text-amber-700 border-amber-200",
    green: "bg-green-50 text-green-700 border-green-200",
    red: "bg-red-50 text-red-700 border-red-200",
    blue: "bg-blue-50 text-blue-700 border-blue-200",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-start justify-between gap-4"
    >
      <div className="min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <h1 className="font-serif text-2xl font-bold text-matte-black">{title}</h1>
          {badge && (
            <span className={`text-[10px] font-semibold uppercase tracking-widest px-2.5 py-0.5 rounded-full border ${badgeColors[badge.color ?? "gold"]}`}>
              {badge.label}
            </span>
          )}
        </div>
        {description && (
          <p className="text-slate-calm text-sm mt-1 leading-relaxed">{description}</p>
        )}
      </div>
      {action && <div className="flex-shrink-0">{action}</div>}
    </motion.div>
  );
}

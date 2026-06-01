"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";

interface EmptyStateAction {
  label: string;
  onClick?: () => void;
  href?: string;
  variant?: "primary" | "secondary" | "gold";
}

interface EmptyStateProps {
  icon?: LucideIcon;
  emoji?: string;
  title: string;
  description?: string;
  action?: EmptyStateAction;
  secondaryAction?: EmptyStateAction;
  className?: string;
  compact?: boolean;
}

export function EmptyState({
  icon: Icon,
  emoji,
  title,
  description,
  action,
  secondaryAction,
  className,
  compact = false,
}: EmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className={cn(
        "flex flex-col items-center justify-center text-center",
        compact ? "py-10 px-6" : "py-20 px-6",
        className
      )}
    >
      {/* Icon / Emoji */}
      {(Icon || emoji) && (
        <div
          className={cn(
            "flex items-center justify-center rounded-2xl mb-5",
            compact ? "w-12 h-12" : "w-16 h-16"
          )}
          style={{ backgroundColor: "var(--subtle-bg)" }}
        >
          {emoji && (
            <span className={compact ? "text-2xl" : "text-3xl"} aria-hidden="true">
              {emoji}
            </span>
          )}
          {Icon && !emoji && (
            <Icon
              className={cn(
                "text-slate-calm",
                compact ? "w-5 h-5" : "w-7 h-7"
              )}
              aria-hidden="true"
            />
          )}
        </div>
      )}

      {/* Title */}
      <h3
        className={cn(
          "font-serif font-semibold mb-2",
          compact ? "text-base" : "text-xl"
        )}
        style={{ color: "var(--page-text)" }}
      >
        {title}
      </h3>

      {/* Description */}
      {description && (
        <p
          className={cn(
            "leading-relaxed max-w-sm",
            compact ? "text-xs" : "text-sm"
          )}
          style={{ color: "var(--muted-text)" }}
        >
          {description}
        </p>
      )}

      {/* Actions */}
      {(action || secondaryAction) && (
        <div className="flex flex-col sm:flex-row items-center gap-3 mt-6">
          {action && (
            <Button
              variant={action.variant ?? "gold"}
              size={compact ? "sm" : "md"}
              onClick={action.onClick}
            >
              {action.label}
            </Button>
          )}
          {secondaryAction && (
            <Button
              variant={secondaryAction.variant ?? "secondary"}
              size={compact ? "sm" : "md"}
              onClick={secondaryAction.onClick}
            >
              {secondaryAction.label}
            </Button>
          )}
        </div>
      )}
    </motion.div>
  );
}

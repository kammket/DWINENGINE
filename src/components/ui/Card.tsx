"use client";

import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import React from "react";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "glass" | "elevated" | "outlined" | "dark";
  animate?: boolean;
  hover?: boolean;
  padding?: "none" | "sm" | "md" | "lg";
}

const variantStyles: Record<string, string> = {
  default: "border shadow-premium" ,
  glass: "backdrop-blur-sm border shadow-premium",
  elevated: "border shadow-premium-lg",
  outlined: "bg-transparent border",
  dark: "bg-deep-charcoal border border-stone-700 text-warm-white",
};

// Inline style helpers for CSS-variable-based theming
const variantInlineStyles: Record<string, React.CSSProperties> = {
  default: { backgroundColor: "var(--card-bg)", borderColor: "var(--card-border)" },
  glass: {
    backgroundColor: "color-mix(in srgb, var(--card-bg) 85%, transparent)",
    borderColor: "color-mix(in srgb, var(--card-border) 60%, transparent)",
  },
  elevated: { backgroundColor: "var(--card-bg)", borderColor: "var(--card-border)" },
  outlined: { borderColor: "var(--card-border)" },
  dark: {},
};

const paddingStyles: Record<string, string> = {
  none: "",
  sm: "p-4",
  md: "p-6",
  lg: "p-8",
};

export function Card({
  variant = "default",
  animate = false,
  hover = false,
  padding = "md",
  children,
  className,
  ...props
}: CardProps) {
  const baseClasses = cn(
    "rounded-3xl transition-all duration-300",
    variantStyles[variant],
    paddingStyles[padding],
    hover && "hover:shadow-premium-lg hover:-translate-y-0.5 active:scale-[0.98] cursor-pointer",
    className
  );

  const inlineStyle = {
    ...variantInlineStyles[variant],
    ...props.style,
  };

  if (animate) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className={baseClasses}
        style={inlineStyle}
        onClick={props.onClick as React.MouseEventHandler<HTMLDivElement>}
        id={props.id}
        tabIndex={hover ? 0 : undefined}
        role={hover ? "button" : undefined}
      >
        {children}
      </motion.div>
    );
  }

  return (
    <div
      className={baseClasses}
      style={inlineStyle}
      tabIndex={hover ? 0 : undefined}
      role={hover && props.onClick ? "button" : undefined}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("mb-4", className)}>
      {children}
    </div>
  );
}

export function CardTitle({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <h3 className={cn("text-lg font-semibold text-matte-black font-sans", className)}>
      {children}
    </h3>
  );
}

export function CardDescription({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <p className={cn("text-sm text-slate-calm mt-1", className)}>
      {children}
    </p>
  );
}

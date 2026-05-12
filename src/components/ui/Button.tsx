"use client";

import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import React from "react";

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger" | "gold";
type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  icon?: React.ReactNode;
  iconPosition?: "left" | "right";
  fullWidth?: boolean;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "bg-soft-gold text-white hover:bg-brand-600 focus:ring-soft-gold shadow-sm",
  secondary:
    "bg-white text-matte-black border border-stone-200 hover:bg-stone-light hover:border-stone-300 focus:ring-stone-300",
  ghost:
    "text-muted-blue hover:bg-blue-50 focus:ring-muted-blue",
  danger:
    "bg-red-500 text-white hover:bg-red-600 focus:ring-red-400",
  gold:
    "bg-gradient-to-r from-brand-500 to-brand-600 text-white hover:from-brand-400 hover:to-brand-500 focus:ring-brand-400 shadow-gold hover:shadow-gold-lg",
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: "px-4 py-2 text-xs rounded-xl gap-1.5",
  md: "px-6 py-3 text-sm rounded-2xl gap-2",
  lg: "px-8 py-4 text-base rounded-2xl gap-2.5",
};

export function Button({
  variant = "primary",
  size = "md",
  loading = false,
  icon,
  iconPosition = "left",
  fullWidth = false,
  children,
  className,
  disabled,
  ...props
}: ButtonProps) {
  return (
    <motion.div
      whileTap={{ scale: 0.97 }}
      whileHover={{ scale: 1.02 }}
      transition={{ type: "spring", stiffness: 400, damping: 20 }}
      className={cn(fullWidth && "w-full", "inline-flex")}
      style={fullWidth ? { width: "100%" } : undefined}
    >
      <button
        className={cn(
          "inline-flex items-center justify-center font-medium transition-all duration-200",
          "focus:outline-none focus:ring-2 focus:ring-offset-2",
          "disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none",
          variantClasses[variant],
          sizeClasses[size],
          fullWidth && "w-full",
          className
        )}
        disabled={disabled || loading}
        {...props}
      >
        {loading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <>
            {icon && iconPosition === "left" && (
              <span className="flex-shrink-0">{icon}</span>
            )}
            {children}
            {icon && iconPosition === "right" && (
              <span className="flex-shrink-0">{icon}</span>
            )}
          </>
        )}
      </button>
    </motion.div>
  );
}

"use client";

import { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";
import { HelpCircle } from "lucide-react";

interface TooltipProps {
  content: string;
  children?: React.ReactNode;
  /** Show a default ? icon trigger when no children provided */
  iconOnly?: boolean;
  side?: "top" | "bottom" | "left" | "right";
  className?: string;
}

export function Tooltip({
  content,
  children,
  iconOnly = false,
  side = "top",
  className,
}: TooltipProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const positionClasses: Record<string, string> = {
    top: "bottom-full mb-2 left-1/2 -translate-x-1/2",
    bottom: "top-full mt-2 left-1/2 -translate-x-1/2",
    left: "right-full mr-2 top-1/2 -translate-y-1/2",
    right: "left-full ml-2 top-1/2 -translate-y-1/2",
  };

  return (
    <div
      ref={ref}
      className={cn("relative inline-flex items-center", className)}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      onFocus={() => setOpen(true)}
      onBlur={() => setOpen(false)}
    >
      {iconOnly || !children ? (
        <button
          type="button"
          aria-label="More information"
          className="w-4 h-4 rounded-full flex items-center justify-center text-slate-calm hover:text-soft-gold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-soft-gold"
          tabIndex={0}
        >
          <HelpCircle className="w-3.5 h-3.5" />
        </button>
      ) : (
        children
      )}

      {open && (
        <div
          role="tooltip"
          className={cn(
            "absolute z-50 w-56 px-3 py-2 rounded-xl text-xs leading-relaxed shadow-premium-lg pointer-events-none",
            "bg-matte-black text-warm-white",
            positionClasses[side]
          )}
        >
          {content}
        </div>
      )}
    </div>
  );
}

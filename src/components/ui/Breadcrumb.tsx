import Link from "next/link";
import { ChevronRight, Home } from "lucide-react";
import { cn } from "@/lib/utils";

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
  className?: string;
  showHome?: boolean;
}

export function Breadcrumb({ items, className, showHome = false }: BreadcrumbProps) {
  const all = showHome ? [{ label: "Home", href: "/" }, ...items] : items;

  return (
    <nav aria-label="Breadcrumb" className={cn("flex items-center gap-1", className)}>
      {all.map((item, i) => {
        const isLast = i === all.length - 1;
        return (
          <span key={i} className="flex items-center gap-1">
            {i === 0 && showHome ? (
              <Home className="w-3 h-3 text-slate-calm" aria-hidden="true" />
            ) : null}
            {item.href && !isLast ? (
              <Link
                href={item.href}
                className="text-xs text-slate-calm hover:text-soft-gold transition-colors"
              >
                {item.label}
              </Link>
            ) : (
              <span
                className={cn(
                  "text-xs",
                  isLast ? "font-medium" : "text-slate-calm"
                )}
                style={isLast ? { color: "var(--page-text)" } : undefined}
                aria-current={isLast ? "page" : undefined}
              >
                {item.label}
              </span>
            )}
            {!isLast && (
              <ChevronRight className="w-3 h-3 text-stone-300 flex-shrink-0" aria-hidden="true" />
            )}
          </span>
        );
      })}
    </nav>
  );
}

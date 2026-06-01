import { cn } from "@/lib/utils";

interface SkeletonProps {
  className?: string;
  rounded?: "sm" | "md" | "lg" | "full";
}

export function Skeleton({ className, rounded = "md" }: SkeletonProps) {
  const roundedStyles = {
    sm: "rounded",
    md: "rounded-xl",
    lg: "rounded-2xl",
    full: "rounded-full",
  };
  return (
    <div
      className={cn("skeleton", roundedStyles[rounded], className)}
      aria-hidden="true"
    />
  );
}

export function SkeletonCard({ className }: { className?: string }) {
  return (
    <div
      className={cn("rounded-3xl p-6 space-y-4", className)}
      style={{ backgroundColor: "var(--card-bg)", border: "1px solid var(--card-border)" }}
      aria-hidden="true"
    >
      <div className="flex items-center gap-3">
        <Skeleton className="w-10 h-10" rounded="lg" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-2/3" />
          <Skeleton className="h-3 w-1/3" />
        </div>
      </div>
      <Skeleton className="h-3 w-full" />
      <Skeleton className="h-3 w-5/6" />
      <Skeleton className="h-3 w-4/6" />
    </div>
  );
}

export function SkeletonScoreRing({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const sizes = { sm: "w-16 h-16", md: "w-24 h-24", lg: "w-32 h-32" };
  return (
    <div className="flex flex-col items-center gap-3" aria-hidden="true">
      <Skeleton className={cn(sizes[size])} rounded="full" />
      <Skeleton className="h-3 w-20" />
    </div>
  );
}

export function SkeletonText({
  lines = 3,
  className,
}: {
  lines?: number;
  className?: string;
}) {
  const widths = ["w-full", "w-5/6", "w-4/6", "w-3/4", "w-full", "w-2/3"];
  return (
    <div className={cn("space-y-2", className)} aria-hidden="true">
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton key={i} className={cn("h-3", widths[i % widths.length])} />
      ))}
    </div>
  );
}

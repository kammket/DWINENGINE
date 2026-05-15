"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/components/providers/AuthProvider";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  Calculator,
  Zap,
  BarChart3,
  Settings,
  LogOut,
  Sparkles,
  Crown,
  Menu,
  X,
  BookOpen,
  ShieldCheck,
  Flame,
  NotebookPen,
  Sun,
  Compass,
} from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

const navItems = [
  {
    href: "/dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
    description: "Your peace overview",
  },
  {
    href: "/calculators",
    label: "Calculators",
    icon: Calculator,
    description: "Analyze your patterns",
  },
  {
    href: "/reflections",
    label: "Reflections",
    icon: BookOpen,
    description: "Your saved insights",
  },
  {
    href: "/checkin",
    label: "Check-in",
    icon: Flame,
    description: "Weekly streak & pulse",
  },
  {
    href: "/intention",
    label: "Intention",
    icon: Sun,
    description: "Daily Stoic ritual",
  },
  {
    href: "/virtues",
    label: "Virtue Compass",
    icon: Compass,
    description: "Wisdom · Courage · Justice · Temperance",
  },
  {
    href: "/journal",
    label: "Journal",
    icon: NotebookPen,
    description: "Decision log",
  },
  {
    href: "/simulate",
    label: "Simulate",
    icon: Zap,
    description: "Future scenarios",
    premium: true,
  },
  {
    href: "/analytics",
    label: "Trends",
    icon: BarChart3,
    description: "Your evolution",
    premium: true,
  },
  {
    href: "/settings",
    label: "Settings",
    icon: Settings,
    description: "Account & preferences",
  },
];

function NavContent({
  collapsed,
  onClose,
}: {
  collapsed?: boolean;
  onClose?: () => void;
}) {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const isPremium = user?.subscription?.tier !== "FREE";

  const handleLogout = async () => {
    await logout();
    onClose?.();
    router.push("/");
    toast.success("Signed out successfully.");
  };

  return (
    <>
      {/* Logo */}
      <div className="flex items-center gap-3 px-6 py-6 border-b border-stone-100">
        <div className="w-8 h-8 bg-gradient-to-br from-soft-gold to-brand-600 rounded-xl flex items-center justify-center flex-shrink-0">
          <span className="text-white font-bold text-sm">L</span>
        </div>
        {!collapsed && (
          <span className="font-serif font-semibold text-lg text-matte-black">Constavita</span>
        )}
        {onClose && (
          <button
            onClick={onClose}
            className="ml-auto p-1.5 rounded-lg hover:bg-stone-100 text-slate-calm"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = pathname.startsWith(item.href);
          const isLocked = item.premium && !isPremium;

          return (
            <Link
              key={item.href}
              href={isLocked ? "/pricing" : item.href}
              onClick={onClose}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-2xl transition-all duration-200 group relative",
                isActive
                  ? "bg-amber-50 text-soft-gold shadow-sm"
                  : "text-slate-calm hover:bg-stone-50 hover:text-matte-black"
              )}
            >
              {/* Active left indicator */}
              {isActive && (
                <span className="absolute left-0 inset-y-2.5 w-[3px] bg-soft-gold rounded-r-full" />
              )}
              <item.icon
                className={cn(
                  "w-5 h-5 flex-shrink-0 transition-colors",
                  isActive ? "text-soft-gold" : "text-slate-calm group-hover:text-matte-black"
                )}
              />
              {!collapsed && (
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className={cn("text-sm truncate", isActive ? "font-semibold" : "font-medium")}>{item.label}</span>
                    {isLocked && (
                      <Crown className="w-3 h-3 text-soft-gold flex-shrink-0" />
                    )}
                  </div>
                  <p className="text-xs text-slate-calm truncate">{item.description}</p>
                </div>
              )}
            </Link>
          );
        })}

        {/* Admin link — only visible to ADMIN role */}
        {user?.role === "ADMIN" && (
          <Link
            href="/admin"
            onClick={onClose}
            className={cn(
              "flex items-center gap-3 px-3 py-2.5 rounded-2xl transition-all duration-200 group relative mt-1",
              pathname.startsWith("/admin")
                ? "bg-amber-50 text-soft-gold shadow-sm"
                : "text-slate-calm hover:bg-stone-50 hover:text-matte-black"
            )}
          >
            {pathname.startsWith("/admin") && (
              <span className="absolute left-0 inset-y-2.5 w-[3px] bg-soft-gold rounded-r-full" />
            )}
            <ShieldCheck
              className={cn(
                "w-5 h-5 flex-shrink-0 transition-colors",
                pathname.startsWith("/admin") ? "text-soft-gold" : "text-slate-calm group-hover:text-matte-black"
              )}
            />
            {!collapsed && (
              <div className="flex-1 min-w-0">
                <span className={cn("text-sm", pathname.startsWith("/admin") ? "font-semibold" : "font-medium")}>
                  Admin
                </span>
                <p className="text-xs text-slate-calm">Payments & platform</p>
              </div>
            )}
          </Link>
        )}
      </nav>

      {/* Upgrade CTA */}
      {!collapsed && !isPremium && (
        <div className="mx-3 mb-3">
          <Link href="/pricing">
            <div className="bg-gradient-to-r from-brand-50 to-amber-50 border border-brand-200 rounded-2xl p-3 cursor-pointer hover:border-soft-gold transition-colors">
              <div className="flex items-center gap-2 mb-1">
                <Sparkles className="w-3.5 h-3.5 text-soft-gold" />
                <span className="text-xs font-semibold text-soft-gold">Upgrade to Premium</span>
              </div>
              <p className="text-xs text-slate-calm">Unlock AI reflections, simulator &amp; analytics</p>
            </div>
          </Link>
        </div>
      )}

      {/* User profile */}
      <div className="border-t border-stone-100 p-3">
        <Link
          href="/settings"
          onClick={onClose}
          className={cn(
            "flex items-center gap-3 px-2 py-2 rounded-2xl hover:bg-stone-50 transition-colors",
            collapsed && "justify-center"
          )}
        >
          <div className="w-8 h-8 bg-gradient-to-br from-muted-blue to-deep-charcoal rounded-full flex items-center justify-center flex-shrink-0">
            <span className="text-white text-xs font-semibold">
              {user?.name?.[0]?.toUpperCase() || "U"}
            </span>
          </div>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-matte-black truncate">
                {user?.name || "User"}
              </p>
              <p className="text-xs text-slate-calm truncate">{user?.email}</p>
            </div>
          )}
          {!collapsed && (
            <button
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleLogout(); }}
              className="p-1.5 rounded-lg hover:bg-stone-100 text-slate-calm hover:text-matte-black transition-colors"
              title="Sign out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          )}
        </Link>
      </div>
    </>
  );
}

export function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <motion.aside
      initial={{ x: -20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.4 }}
      className={cn(
        "fixed left-0 top-0 h-full bg-white border-r border-stone-100 shadow-sm z-50",
        "hidden md:flex flex-col transition-all duration-300",
        isCollapsed ? "w-20" : "w-64"
      )}
    >
      <NavContent collapsed={isCollapsed} />
      {/* Collapse toggle */}
      <button
        onClick={() => setIsCollapsed((c) => !c)}
        className="absolute -right-3 top-20 w-6 h-6 bg-white border border-stone-200 rounded-full flex items-center justify-center shadow-sm hover:shadow-md transition-all"
        title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
      >
        <span className={cn("text-slate-calm transition-transform duration-300", isCollapsed ? "rotate-0" : "rotate-180")}>
          ›
        </span>
      </button>
    </motion.aside>
  );
}

export function MobileMenuButton() {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Hamburger button — visible on mobile only */}
      <button
        onClick={() => setOpen(true)}
        className="fixed top-4 left-4 z-40 md:hidden w-10 h-10 bg-white rounded-xl shadow-premium border border-stone-200 flex items-center justify-center"
        aria-label="Open navigation"
      >
        <Menu className="w-5 h-5 text-matte-black" />
      </button>

      {/* Mobile drawer */}
      <AnimatePresence>
        {open && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
              className="fixed inset-0 bg-black/40 z-50 md:hidden"
            />
            {/* Drawer */}
            <motion.div
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: "spring", damping: 28, stiffness: 300 }}
              className="fixed left-0 top-0 h-full w-72 bg-white shadow-xl z-50 md:hidden flex flex-col"
            >
              <NavContent onClose={() => setOpen(false)} />
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-warm-white">
      <Sidebar />
      <MobileMenuButton />
      <main className="md:pl-64 min-h-screen">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-8 pt-16 md:pt-8">
          {children}
        </div>
      </main>
    </div>
  );
}



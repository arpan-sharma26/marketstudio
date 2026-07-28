"use client";

import { useTheme } from "@/components/shared/theme-provider";
import { cn } from "@/lib/utils";

/** Compact light/dark slider for the app header. */
export function ThemeToggle({ className }: { className?: string }) {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  return (
    <button
      type="button"
      role="switch"
      aria-checked={isDark}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      title={isDark ? "Light mode" : "Dark mode"}
      onClick={toggleTheme}
      className={cn(
        "relative inline-flex h-7 w-12 shrink-0 items-center rounded-full border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-900",
        isDark
          ? "border-brand-700 bg-brand-900"
          : "border-slate-300 bg-slate-200",
        className,
      )}
    >
      <span
        aria-hidden
        className={cn(
          "pointer-events-none absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-transform duration-200 ease-out dark:bg-brand-100",
          isDark ? "translate-x-6" : "translate-x-0.5",
        )}
      />
    </button>
  );
}

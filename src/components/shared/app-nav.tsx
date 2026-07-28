"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { NavLinkPending } from "@/components/shared/nav-link-pending";
import { cn } from "@/lib/utils";

interface NavItem {
  href: string;
  label: string;
}

interface AppNavProps {
  items: NavItem[];
}

export function AppNav({ items }: AppNavProps) {
  const pathname = usePathname();

  return (
    <nav aria-label="Primary" className="flex-1 space-y-1 px-3 py-4">
      {items.map((item) => {
        const active =
          pathname === item.href || pathname.startsWith(`${item.href}/`);

        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
              active
                ? "bg-brand-50 text-brand-800 shadow-sm ring-1 ring-brand-100 dark:bg-brand-950 dark:text-brand-200 dark:ring-brand-800"
                : "text-ink-muted hover:bg-brand-50/70 hover:text-brand-900 dark:hover:bg-brand-950/80 dark:hover:text-brand-100",
            )}
          >
            <span className="flex-1">{item.label}</span>
            <NavLinkPending className="text-brand-600" />
          </Link>
        );
      })}
    </nav>
  );
}

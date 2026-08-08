import type { ReactNode } from "react";

import { AppNav } from "@/components/shared/app-nav";
import { BrandLogo } from "@/components/shared/brand-logo";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { SignOutButton } from "@/features/auth/components/sign-out-button";

interface NavItem {
  href: string;
  label: string;
}

const NAV_ITEMS: NavItem[] = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/clients", label: "Clients" },
  { href: "/audit", label: "AI Audit" },
];

interface AppShellProps {
  userName: string;
  userEmail: string;
  children: ReactNode;
}

/** Authenticated application layout: sidebar navigation, sticky header, and content. */
export function AppShell({ userName, userEmail, children }: AppShellProps) {
  return (
    <div className="flex min-h-screen bg-brand-mist">
      <aside className="hidden w-72 shrink-0 flex-col border-r border-slate-200/80 bg-paper-elevated/90 backdrop-blur md:flex">
        <div className="flex justify-center border-b border-slate-200/80 px-2 py-3">
          <BrandLogo size="hero" priority className="h-44 w-auto sm:h-44" />
        </div>
        <div className="brand-gradient-bar" aria-hidden />
        <AppNav items={NAV_ITEMS} />
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-40 flex items-center justify-between gap-4 border-b border-slate-200/80 bg-paper-elevated/95 px-4 py-3 backdrop-blur md:px-8">
          <div className="min-w-0 md:hidden">
            <BrandLogo size="sm" />
          </div>

          <div className="ml-auto flex shrink-0 items-center gap-3">
            <ThemeToggle />
            <div className="hidden text-right sm:block">
              <p className="truncate text-sm font-semibold text-ink">{userName}</p>
              <p className="truncate text-xs text-ink-muted">{userEmail}</p>
            </div>
            <SignOutButton />
          </div>
        </header>

        <main className="flex-1 p-6 md:p-8">{children}</main>
      </div>
    </div>
  );
}

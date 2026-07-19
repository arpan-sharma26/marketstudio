import Link from "next/link";
import type { ReactNode } from "react";

import { SignOutButton } from "@/features/auth/components/sign-out-button";

interface NavItem {
  href: string;
  label: string;
}

const NAV_ITEMS: NavItem[] = [{ href: "/dashboard", label: "Dashboard" }];

interface AppShellProps {
  userName: string;
  userEmail: string;
  children: ReactNode;
}

/** Authenticated application layout: sidebar navigation, header, and content region. */
export function AppShell({ userName, userEmail, children }: AppShellProps) {
  return (
    <div className="flex min-h-screen bg-slate-50">
      <aside className="hidden w-64 shrink-0 flex-col border-r border-slate-200 bg-white md:flex">
        <div className="border-b border-slate-200 px-6 py-5">
          <span className="text-lg font-semibold text-brand-700">Market Studio</span>
        </div>
        <nav aria-label="Primary" className="flex-1 space-y-1 px-3 py-4">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="block rounded-md px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="border-t border-slate-200 p-3">
          <div className="px-3 py-2">
            <p className="truncate text-sm font-medium text-slate-900">{userName}</p>
            <p className="truncate text-xs text-slate-500">{userEmail}</p>
          </div>
          <SignOutButton />
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center justify-between border-b border-slate-200 bg-white px-6 py-4 md:hidden">
          <span className="text-base font-semibold text-brand-700">Market Studio</span>
          <div className="w-32">
            <SignOutButton />
          </div>
        </header>
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}

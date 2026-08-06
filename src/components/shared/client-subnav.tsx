"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { NavLinkPending } from "@/components/shared/nav-link-pending";
import { cn } from "@/lib/utils";

interface ClientSubnavProps {
  clientId: string;
  /** @deprecated Derived from the URL; kept optional for call-site compatibility. */
  active?:
    | "overview"
    | "locations"
    | "onboarding"
    | "leads"
    | "members"
    | "brand"
    | "faqs"
    | "programs";
}

const LINKS = [
  { key: "overview", label: "Overview", href: (id: string) => `/clients/${id}` },
  {
    key: "locations",
    label: "Locations",
    href: (id: string) => `/clients/${id}/locations`,
  },
  {
    key: "onboarding",
    label: "Onboarding",
    href: (id: string) => `/clients/${id}/onboarding`,
  },
  {
    key: "leads",
    label: "Leads",
    href: (id: string) => `/clients/${id}/leads`,
  },
  {
    key: "brand",
    label: "Brand",
    href: (id: string) => `/clients/${id}/brand`,
  },
  {
    key: "faqs",
    label: "FAQs",
    href: (id: string) => `/clients/${id}/faqs`,
  },
  {
    key: "programs",
    label: "Programs",
    href: (id: string) => `/clients/${id}/programs`,
  },
  {
    key: "members",
    label: "Members",
    href: (id: string) => `/clients/${id}/members`,
  },
] as const;

function resolveActive(
  pathname: string,
  clientId: string,
): (typeof LINKS)[number]["key"] {
  const base = `/clients/${clientId}`;
  if (pathname.startsWith(`${base}/locations`)) return "locations";
  if (pathname.startsWith(`${base}/onboarding`)) return "onboarding";
  if (pathname.startsWith(`${base}/leads`)) return "leads";
  if (pathname.startsWith(`${base}/brand`)) return "brand";
  if (pathname.startsWith(`${base}/faqs`)) return "faqs";
  if (pathname.startsWith(`${base}/programs`)) return "programs";
  if (pathname.startsWith(`${base}/members`)) return "members";
  return "overview";
}

export function ClientSubnav({ clientId }: ClientSubnavProps) {
  const pathname = usePathname();
  const active = resolveActive(pathname, clientId);

  return (
    <nav aria-label="Client sections" className="mb-6 flex flex-wrap gap-1 border-b border-slate-200">
      {LINKS.map((link) => {
        const isActive = active === link.key;

        return (
          <Link
            key={link.key}
            href={link.href(clientId)}
            className={cn(
              "inline-flex items-center border-b-2 px-3 py-2 text-sm font-medium transition-colors",
              isActive
                ? "border-brand-600 text-brand-800 dark:border-brand-400 dark:text-brand-200"
                : "border-transparent text-ink-muted hover:text-ink",
            )}
            aria-current={isActive ? "page" : undefined}
          >
            {link.label}
            <NavLinkPending className="text-brand-600" />
          </Link>
        );
      })}
    </nav>
  );
}

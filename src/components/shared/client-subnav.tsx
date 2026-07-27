import Link from "next/link";

import { cn } from "@/lib/utils";

interface ClientSubnavProps {
  clientId: string;
  active: "overview" | "locations" | "members";
}

const LINKS = [
  { key: "overview", label: "Overview", href: (id: string) => `/clients/${id}` },
  {
    key: "locations",
    label: "Locations",
    href: (id: string) => `/clients/${id}/locations`,
  },
  {
    key: "members",
    label: "Members",
    href: (id: string) => `/clients/${id}/members`,
  },
] as const;

export function ClientSubnav({ clientId, active }: ClientSubnavProps) {
  return (
    <nav aria-label="Client sections" className="mb-6 flex gap-1 border-b border-slate-200">
      {LINKS.map((link) => (
        <Link
          key={link.key}
          href={link.href(clientId)}
          className={cn(
            "border-b-2 px-3 py-2 text-sm font-medium",
            active === link.key
              ? "border-brand-600 text-brand-700"
              : "border-transparent text-slate-500 hover:text-slate-800",
          )}
        >
          {link.label}
        </Link>
      ))}
    </nav>
  );
}

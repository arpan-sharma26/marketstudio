"use client";

import { useLinkStatus } from "next/link";

import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";

/** Inline spinner for a parent `Link` while navigation is pending. */
export function NavLinkPending({ className }: { className?: string }) {
  const { pending } = useLinkStatus();

  return (
    <span
      className={cn(
        "ml-1.5 inline-flex h-[1em] w-[1em] shrink-0 items-center justify-center transition-opacity duration-150",
        pending ? "opacity-100" : "opacity-0",
        className,
      )}
      aria-hidden={!pending}
    >
      {pending ? <Spinner label="Navigating" className="text-[0.85em]" /> : null}
    </span>
  );
}

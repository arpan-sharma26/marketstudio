"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTransition, type ComponentProps, type ReactNode } from "react";

import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";

type PendingNavLinkProps = Omit<ComponentProps<typeof Link>, "href"> & {
  href: string;
  children: ReactNode;
  /** Extra label shown next to the spinner while navigating. */
  pendingLabel?: string;
};

/**
 * Link that shows an immediate spinner via useTransition so slow RSC loads
 * still give feedback before the route `loading.tsx` appears.
 */
export function PendingNavLink({
  href,
  children,
  className,
  pendingLabel = "Opening",
  onClick,
  ...props
}: PendingNavLinkProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  return (
    <Link
      href={href}
      {...props}
      aria-busy={isPending}
      className={cn(
        "inline-flex items-center gap-1.5",
        isPending && "pointer-events-none opacity-70",
        className,
      )}
      onClick={(event) => {
        onClick?.(event);
        if (event.defaultPrevented) return;
        if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
        if (event.button !== 0) return;

        event.preventDefault();
        startTransition(() => {
          router.push(href);
        });
      }}
    >
      {children}
      {isPending ? <Spinner label={pendingLabel} className="text-brand-600" /> : null}
    </Link>
  );
}

"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";

import { Spinner } from "@/components/ui/spinner";
import {
  describeRoute,
  type RouteDescription,
} from "@/lib/navigation/route-descriptions";

/** Safety valve so a cancelled navigation can never leave the app blocked. */
const MAX_OVERLAY_MS = 15_000;

/**
 * Blurs and blocks the whole app while an in-app navigation is in flight, showing what
 * the user is moving to. Clears as soon as the App Router commits the new URL.
 */
export function NavigationOverlay() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [destination, setDestination] = useState<RouteDescription | null>(null);
  const dialogRef = useRef<HTMLDivElement | null>(null);
  const safetyTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // The new route has rendered — release the app.
  useEffect(() => {
    setDestination(null);
  }, [pathname, searchParams]);

  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0) return;
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

      const anchor = (event.target as Element | null)?.closest("a");
      if (!anchor) return;

      const href = anchor.getAttribute("href");
      if (!href || href.startsWith("#")) return;
      if (anchor.target === "_blank" || anchor.hasAttribute("download")) return;

      try {
        const url = new URL(href, window.location.origin);
        if (url.origin !== window.location.origin) return;
        const next = `${url.pathname}${url.search}`;
        const current = `${window.location.pathname}${window.location.search}`;
        if (next === current) return;
        setDestination(describeRoute(url.pathname));
      } catch {
        // Malformed href — let the browser handle it without an overlay.
      }
    };

    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, []);

  useEffect(() => {
    if (!destination) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    dialogRef.current?.focus();

    // Keep focus inside the overlay so background controls stay unreachable.
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Tab") event.preventDefault();
    };
    document.addEventListener("keydown", onKeyDown, true);

    safetyTimer.current = setTimeout(() => setDestination(null), MAX_OVERLAY_MS);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKeyDown, true);
      if (safetyTimer.current) clearTimeout(safetyTimer.current);
    };
  }, [destination]);

  if (!destination) return null;

  return (
    <div
      className="fixed inset-0 z-[150] flex items-center justify-center bg-paper/60 backdrop-blur-sm dark:bg-slate-950/60"
      role="dialog"
      aria-modal="true"
      aria-busy="true"
      aria-labelledby="navigation-overlay-title"
      aria-describedby="navigation-overlay-description"
    >
      <div
        ref={dialogRef}
        tabIndex={-1}
        className="mx-4 flex max-w-sm flex-col items-center gap-3 rounded-2xl border border-slate-200/80 bg-paper-elevated px-8 py-7 text-center shadow-xl outline-none dark:border-slate-700"
      >
        <Spinner className="text-3xl text-brand-600" label="Loading page" />
        <p
          id="navigation-overlay-title"
          className="text-base font-semibold text-ink"
        >
          {destination.title}
        </p>
        <p
          id="navigation-overlay-description"
          className="text-sm text-ink-muted"
        >
          {destination.description}
        </p>
      </div>
    </div>
  );
}

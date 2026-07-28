"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";

import { cn } from "@/lib/utils";

/**
 * Thin top progress bar during in-app link navigations (sidebar, tabs, lists).
 * Completes when the App Router pathname/search updates.
 */
export function NavigationProgress() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [visible, setVisible] = useState(false);
  const [completing, setCompleting] = useState(false);
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setCompleting(true);
    const done = setTimeout(() => {
      setVisible(false);
      setCompleting(false);
    }, 280);
    return () => clearTimeout(done);
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
      } catch {
        return;
      }

      if (hideTimer.current) clearTimeout(hideTimer.current);
      setCompleting(false);
      setVisible(true);

      // Safety: hide if navigation never commits (e.g. cancelled).
      hideTimer.current = setTimeout(() => {
        setCompleting(true);
        hideTimer.current = setTimeout(() => {
          setVisible(false);
          setCompleting(false);
        }, 280);
      }, 10_000);
    };

    document.addEventListener("click", onClick, true);
    return () => {
      document.removeEventListener("click", onClick, true);
      if (hideTimer.current) clearTimeout(hideTimer.current);
    };
  }, []);

  if (!visible && !completing) return null;

  return (
    <div
      className="pointer-events-none fixed inset-x-0 top-0 z-[100] h-1 overflow-hidden"
      aria-hidden
    >
      <div
        className={cn(
          "h-full origin-left bg-gradient-to-r from-brand-400 via-brand-600 to-brand-800",
          completing ? "w-full transition-all duration-200 ease-out" : "animate-nav-progress w-full",
        )}
      />
    </div>
  );
}

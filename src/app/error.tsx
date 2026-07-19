"use client";

import { useEffect } from "react";

import { Button } from "@/components/ui/button";

/** Global error boundary. Shows a friendly message; details are logged server-side. */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Client-side observability hook — no sensitive details are surfaced to the user.
    console.error("Unhandled application error", error.digest ?? error.message);
  }, [error]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <div className="max-w-md text-center">
        <h1 className="text-2xl font-semibold text-slate-900">Something went wrong</h1>
        <p className="mt-2 text-sm text-slate-500">
          An unexpected error occurred. Please try again. If the problem persists, contact
          support.
        </p>
        <div className="mt-6 flex justify-center">
          <Button onClick={reset}>Try again</Button>
        </div>
      </div>
    </main>
  );
}

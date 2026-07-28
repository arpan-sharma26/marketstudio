import { PageLoader } from "@/components/shared/page-loader";

/** Tab / client-detail segment loader. */
export default function ClientDetailLoading() {
  return (
    <div className="mx-auto max-w-4xl space-y-6" role="status" aria-live="polite">
      <div className="space-y-2">
        <div className="h-8 w-56 animate-pulse rounded-lg bg-slate-200" />
        <div className="h-4 w-72 animate-pulse rounded bg-slate-100" />
      </div>
      <div className="flex gap-1 border-b border-slate-200 pb-0">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-9 w-20 animate-pulse rounded-t bg-slate-100" />
        ))}
      </div>
      <PageLoader compact label="Loading section…" />
    </div>
  );
}

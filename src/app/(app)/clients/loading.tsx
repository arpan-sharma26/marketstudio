import { PageLoader } from "@/components/shared/page-loader";

export default function ClientsLoading() {
  return (
    <div className="mx-auto max-w-5xl space-y-4">
      <div className="h-8 w-48 animate-pulse rounded-lg bg-slate-200" />
      <PageLoader compact label="Loading clients…" />
    </div>
  );
}

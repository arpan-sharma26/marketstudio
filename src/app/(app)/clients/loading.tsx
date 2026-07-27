export default function ClientsLoading() {
  return (
    <div role="status" aria-live="polite" className="mx-auto max-w-5xl space-y-4">
      <div className="h-8 w-48 animate-pulse rounded bg-slate-200" />
      <div className="h-40 animate-pulse rounded-xl bg-slate-200" />
    </div>
  );
}

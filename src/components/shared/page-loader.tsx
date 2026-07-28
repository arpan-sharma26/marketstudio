import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";

interface PageLoaderProps {
  label?: string;
  className?: string;
  /** Compact loader for content regions inside the app shell. */
  compact?: boolean;
}

/** Centered page/section loading state used by route `loading.tsx` files. */
export function PageLoader({
  label = "Loading…",
  className,
  compact = false,
}: PageLoaderProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        "flex items-center justify-center",
        compact ? "min-h-[12rem] py-10" : "min-h-screen",
        className,
      )}
    >
      <div className="flex flex-col items-center gap-3 text-brand-700">
        <Spinner className="text-2xl" label={label} />
        <span className="text-sm text-ink-muted">{label}</span>
      </div>
    </div>
  );
}

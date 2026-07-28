import { cn } from "@/lib/utils";

interface SpinnerProps {
  className?: string;
  /** Accessible label announced to screen readers. */
  label?: string;
}

/** Brand-colored circular spinner for pending actions and route loads. */
export function Spinner({ className, label = "Loading" }: SpinnerProps) {
  return (
    <span
      role="status"
      aria-live="polite"
      className={cn("inline-flex items-center justify-center", className)}
    >
      <span
        className="h-[1.1em] w-[1.1em] animate-spin rounded-full border-2 border-current border-t-transparent opacity-80"
        aria-hidden
      />
      <span className="sr-only">{label}</span>
    </span>
  );
}

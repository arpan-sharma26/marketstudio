import * as React from "react";

import { cn } from "@/lib/utils";

type AlertVariant = "error" | "info" | "success";

const variantClasses: Record<AlertVariant, string> = {
  error: "border-red-200 bg-red-50 text-red-800 dark:border-red-900 dark:bg-red-950/60 dark:text-red-200",
  info: "border-slate-200 bg-slate-50 text-slate-800 dark:border-slate-700 dark:bg-slate-900/70 dark:text-slate-200",
  success:
    "border-green-200 bg-green-50 text-green-800 dark:border-green-900 dark:bg-green-950/50 dark:text-green-200",
};

export interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: AlertVariant;
}

export function Alert({ className, variant = "info", ...props }: AlertProps) {
  return (
    <div
      role={variant === "error" ? "alert" : "status"}
      className={cn(
        "rounded-md border px-4 py-3 text-sm",
        variantClasses[variant],
        className,
      )}
      {...props}
    />
  );
}

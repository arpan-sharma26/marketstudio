import * as React from "react";

import { cn } from "@/lib/utils";

type AlertVariant = "error" | "info" | "success";

const variantClasses: Record<AlertVariant, string> = {
  error: "border-red-200 bg-red-50 text-red-800",
  info: "border-slate-200 bg-slate-50 text-slate-800",
  success: "border-green-200 bg-green-50 text-green-800",
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

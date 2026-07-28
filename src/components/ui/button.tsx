import * as React from "react";

import { cn } from "@/lib/utils";

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
}

const variantClasses: Record<ButtonVariant, string> = {
  // Explicit hex keeps navy visible even if a Tailwind token fails to generate.
  primary:
    "bg-[#0a2f3d] text-white hover:bg-[#0a4f4c] focus-visible:ring-[#2fc4ae] shadow-sm",
  secondary:
    "bg-white text-ink border border-slate-300 hover:bg-[#e8faf5] focus-visible:ring-[#2fc4ae]",
  ghost:
    "bg-transparent text-ink-muted hover:bg-[#e8faf5] hover:text-[#0a2f3d] focus-visible:ring-[#2fc4ae]",
  danger: "bg-red-600 text-white hover:bg-red-700 focus-visible:ring-red-600",
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", type = "button", ...props }, ref) => (
    <button
      ref={ref}
      type={type}
      className={cn(
        "inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
        variantClasses[variant],
        className,
      )}
      {...props}
    />
  ),
);
Button.displayName = "Button";

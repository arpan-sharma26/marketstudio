import type { RecommendedPackage } from "@/features/audits/types";

export const PACKAGE_LABELS: Record<RecommendedPackage, string> = {
  "local-visibility": "Local Visibility ($499–799/mo)",
  "lead-engine": "Lead Engine ($999–1,499/mo)",
  "growth-partner": "Growth Partner ($1,999–2,499/mo)",
};

export function scoreColor(score: number): string {
  if (score >= 8) return "text-emerald-600";
  if (score >= 6) return "text-amber-600";
  return "text-rose-600";
}

export function severityStyles(severity: "high" | "medium" | "low"): string {
  switch (severity) {
    case "high":
      return "bg-rose-50 text-rose-700 border-rose-200";
    case "medium":
      return "bg-amber-50 text-amber-700 border-amber-200";
    case "low":
      return "bg-slate-50 text-slate-600 border-slate-200";
  }
}

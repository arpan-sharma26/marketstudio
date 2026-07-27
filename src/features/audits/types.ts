export interface AuditInput {
  businessName: string;
  city: string;
  websiteUrl: string;
  gbpUrl?: string;
  reviewCount?: number;
  averageRating?: number;
  competitors?: string;
  notes?: string;
}

export interface AuditIssue {
  title: string;
  severity: "high" | "medium" | "low";
  description: string;
}

export interface AuditQuickWin {
  title: string;
  impact: string;
  effort: "low" | "medium" | "high";
}

export interface AuditPlanItem {
  week: number;
  focus: string;
  actions: string[];
}

export type RecommendedPackage = "local-visibility" | "lead-engine" | "growth-partner";

export interface AuditResult {
  visibilityScore: number;
  summary: string;
  issues: AuditIssue[];
  quickWins: AuditQuickWin[];
  plan: AuditPlanItem[];
  competitorInsights: string[];
  recommendedPackage: RecommendedPackage;
  packageRationale: string;
}

export interface SavedAudit {
  id: string;
  createdAt: string;
}

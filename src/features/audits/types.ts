export interface AuditInput {
  businessName: string;
  country: string;
  city: string;
  websiteUrl: string;
  gbpUrl?: string;
  reviewCount?: number;
  averageRating?: number;
  notes?: string;
}

export interface AuditClientLocationOption {
  id: string;
  name: string;
  city: string;
  provinceCode: string;
  countryCode: string;
  websiteUrl: string | null;
  gbpUrl: string | null;
}

/** An existing client the audit form can be pre-filled from. */
export interface AuditClientOption {
  id: string;
  name: string;
  countryCode: string;
  websiteUrl: string | null;
  locations: AuditClientLocationOption[];
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
  /** AI-identified local daycare competitors and how they compare. */
  competitorInsights: string[];
  recommendedPackage: RecommendedPackage;
  packageRationale: string;
}

export interface SavedAudit {
  id: string;
  createdAt: string;
}

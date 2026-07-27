import { BRAND } from "@/config/brand";
import type { AuditInput, AuditResult } from "@/features/audits/types";

const DAYCARE_CONTEXT = {
  label: "Daycare / Childcare",
  outcome: "tour bookings and enrollment inquiries",
  kpis: "tour form fills, GBP direction requests, review count/rating, cost per lead",
  compliance:
    "Never suggest AI-generated images of children. Flag unverified staff-to-child ratio claims. Recommend human review on safety copy.",
};

export function buildAuditSystemPrompt(): string {
  return `You are ${BRAND.name}'s local marketing audit engine for ${DAYCARE_CONTEXT.label} centers.
Analyze the provided business inputs and return ONLY valid JSON matching the schema below.
Focus on outcomes: ${DAYCARE_CONTEXT.outcome}.
Primary KPIs: ${DAYCARE_CONTEXT.kpis}.
Compliance: ${DAYCARE_CONTEXT.compliance}
Be specific to the city and local childcare market. Avoid generic marketing fluff.`;
}

export function buildAuditUserPrompt(input: AuditInput): string {
  return `Audit this daycare / childcare center:

Business name: ${input.businessName}
City: ${input.city}
Website: ${input.websiteUrl}
Google Business Profile: ${input.gbpUrl || "Not provided"}
Review count: ${input.reviewCount ?? "Unknown"}
Average rating: ${input.averageRating ?? "Unknown"}
Known competitors: ${input.competitors || "Not provided"}
Additional notes: ${input.notes || "None"}

Return JSON with this exact shape:
{
  "visibilityScore": number (1-10),
  "summary": string (2-3 sentences),
  "issues": [{ "title": string, "severity": "high"|"medium"|"low", "description": string }] (exactly 5),
  "quickWins": [{ "title": string, "impact": string, "effort": "low"|"medium"|"high" }] (exactly 5),
  "plan": [{ "week": number, "focus": string, "actions": string[] }] (4 weeks),
  "competitorInsights": string[] (2-4 bullets),
  "recommendedPackage": "local-visibility"|"lead-engine"|"growth-partner",
  "packageRationale": string
}`;
}

export function parseAuditResult(raw: string): AuditResult {
  const cleaned = raw.replace(/```json\n?|\n?```/g, "").trim();
  const parsed = JSON.parse(cleaned) as AuditResult;

  if (
    typeof parsed.visibilityScore !== "number" ||
    !Array.isArray(parsed.issues) ||
    !Array.isArray(parsed.quickWins) ||
    !Array.isArray(parsed.plan)
  ) {
    throw new Error("Invalid audit response shape from AI.");
  }

  return parsed;
}

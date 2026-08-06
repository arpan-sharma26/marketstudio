export const LEAD_STATUSES = [
  "new",
  "contact_attempted",
  "contacted",
  "qualified",
  "unqualified",
  "tour_offered",
  "tour_booked",
  "tour_completed",
  "tour_missed",
  "application_started",
  "waitlisted",
  "enrolled",
  "not_interested",
  "no_response",
  "duplicate",
  "closed",
] as const;
export type LeadStatus = (typeof LEAD_STATUSES)[number];

/** Columns shown on the pipeline board (remaining statuses roll into “Other”). */
export const PIPELINE_COLUMNS: readonly {
  key: LeadStatus | "other";
  label: string;
  statuses: readonly LeadStatus[];
}[] = [
  { key: "new", label: "New", statuses: ["new"] },
  {
    key: "contacted",
    label: "Contacting",
    statuses: ["contact_attempted", "contacted"],
  },
  {
    key: "qualified",
    label: "Qualified",
    statuses: ["qualified", "tour_offered"],
  },
  {
    key: "tour_booked",
    label: "Tours",
    statuses: ["tour_booked", "tour_completed", "tour_missed"],
  },
  {
    key: "enrolled",
    label: "Enrolled",
    statuses: ["application_started", "waitlisted", "enrolled"],
  },
  {
    key: "other",
    label: "Closed / other",
    statuses: [
      "unqualified",
      "not_interested",
      "no_response",
      "duplicate",
      "closed",
    ],
  },
] as const;

export const LEAD_SOURCES = [
  "manual",
  "website",
  "phone",
  "email",
  "referral",
  "meta",
  "google_ads",
  "google_business",
  "walk_in",
  "other",
] as const;
export type LeadSource = (typeof LEAD_SOURCES)[number];

export const LEAD_PRIORITIES = ["low", "normal", "high", "urgent"] as const;
export type LeadPriority = (typeof LEAD_PRIORITIES)[number];

export const CONSENT_TYPES = [
  "email_marketing",
  "sms_marketing",
  "phone_contact",
  "privacy_policy",
  "general_enquiry_follow_up",
] as const;
export type ConsentType = (typeof CONSENT_TYPES)[number];

export const CONSENT_STATUSES = ["granted", "denied", "withdrawn"] as const;
export type ConsentStatus = (typeof CONSENT_STATUSES)[number];

export function normalizeEmail(email: string | null | undefined): string | null {
  if (!email) return null;
  const value = email.trim().toLowerCase();
  return value.length > 0 ? value : null;
}

/** Keep digits only; for CA numbers prefer last 10 digits when longer. */
export function normalizePhone(phone: string | null | undefined): string | null {
  if (!phone) return null;
  const digits = phone.replace(/\D/g, "");
  if (!digits) return null;
  if (digits.length > 10) return digits.slice(-10);
  return digits;
}

export function leadDisplayName(lead: {
  first_name: string | null;
  last_name: string | null;
  email: string | null;
  phone: string | null;
}): string {
  const name = [lead.first_name, lead.last_name].filter(Boolean).join(" ").trim();
  if (name) return name;
  if (lead.email) return lead.email;
  if (lead.phone) return lead.phone;
  return "Untitled lead";
}

export function formatLeadStatus(status: string): string {
  return status.replaceAll("_", " ");
}

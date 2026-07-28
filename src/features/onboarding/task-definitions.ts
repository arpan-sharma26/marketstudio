export const ONBOARDING_TASK_KEYS = [
  "client_profile",
  "locations",
  "business_hours",
  "brand_profile",
  "faqs",
  "programs",
  "members",
  "marketing_goals",
] as const;

export type OnboardingTaskKey = (typeof ONBOARDING_TASK_KEYS)[number];

export interface OnboardingTaskDefinition {
  task_key: OnboardingTaskKey;
  title: string;
  description: string;
  sort_order: number;
  is_required: boolean;
  /** Relative path under /clients/[clientId] — omit for in-page tasks. */
  hrefSuffix?: string;
}

/** Canonical default checklist created for every client. */
export const DEFAULT_ONBOARDING_TASKS: readonly OnboardingTaskDefinition[] = [
  {
    task_key: "client_profile",
    title: "Client profile",
    description: "Confirm legal name, primary contact, website, and timezone.",
    sort_order: 10,
    is_required: true,
    hrefSuffix: "",
  },
  {
    task_key: "locations",
    title: "Locations",
    description: "Add at least one daycare location with address details.",
    sort_order: 20,
    is_required: true,
    hrefSuffix: "/locations",
  },
  {
    task_key: "business_hours",
    title: "Business hours",
    description: "Set weekly operating hours for each location.",
    sort_order: 30,
    is_required: true,
    hrefSuffix: "/locations",
  },
  {
    task_key: "brand_profile",
    title: "Brand profile",
    description: "Draft and approve voice, claims, colours, and CTAs.",
    sort_order: 40,
    is_required: true,
    hrefSuffix: "/brand",
  },
  {
    task_key: "faqs",
    title: "FAQs",
    description: "Capture key parent questions and approved answers.",
    sort_order: 50,
    is_required: true,
    hrefSuffix: "/faqs",
  },
  {
    task_key: "programs",
    title: "Programs",
    description: "Add programs and link them to locations.",
    sort_order: 60,
    is_required: true,
    hrefSuffix: "/programs",
  },
  {
    task_key: "members",
    title: "Team members",
    description: "Invite a client admin and any location managers.",
    sort_order: 70,
    is_required: true,
    hrefSuffix: "/members",
  },
  {
    task_key: "marketing_goals",
    title: "Marketing goals",
    description: "Record near-term marketing goals and notes for this client.",
    sort_order: 80,
    is_required: true,
  },
] as const;

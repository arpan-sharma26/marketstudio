export interface RouteDescription {
  title: string;
  description: string;
}

const UUID_SEGMENT =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** Collapses dynamic ids so `/clients/<uuid>/leads` matches `/clients/:id/leads`. */
function toPattern(pathname: string): string {
  const segments = pathname
    .split("/")
    .filter(Boolean)
    .map((segment) => (UUID_SEGMENT.test(segment) ? ":id" : segment));
  return `/${segments.join("/")}`;
}

const ROUTE_DESCRIPTIONS: Record<string, RouteDescription> = {
  "/": {
    title: "Market Studio",
    description: "Taking you to your workspace.",
  },
  "/dashboard": {
    title: "Dashboard",
    description: "Leads needing follow-up, tours today, and work awaiting approval.",
  },
  "/clients": {
    title: "Clients",
    description: "All daycare businesses you have access to.",
  },
  "/clients/new": {
    title: "New client",
    description: "Create a daycare business in Market Studio.",
  },
  "/clients/:id": {
    title: "Client overview",
    description: "Profile, setup progress, and key details for this daycare.",
  },
  "/clients/:id/locations": {
    title: "Locations",
    description: "Daycare sites, addresses, and operating hours.",
  },
  "/clients/:id/locations/new": {
    title: "New location",
    description: "Add a daycare site with its address and settings.",
  },
  "/clients/:id/locations/:id": {
    title: "Location details",
    description: "Address, business hours, and registration settings.",
  },
  "/clients/:id/onboarding": {
    title: "Onboarding",
    description: "Setup checklist and marketing goals for this daycare.",
  },
  "/clients/:id/leads": {
    title: "Leads",
    description: "Enquiry pipeline, follow-ups, and consent tracking.",
  },
  "/clients/:id/leads/new": {
    title: "New lead",
    description: "Capture a parent enquiry with duplicate checking.",
  },
  "/clients/:id/leads/:id": {
    title: "Lead details",
    description: "Enquiry history, notes, status, and consent records.",
  },
  "/clients/:id/brand": {
    title: "Brand profile",
    description: "Voice, approved claims, colours, and calls to action.",
  },
  "/clients/:id/faqs": {
    title: "FAQs",
    description: "Approved answers to common parent questions.",
  },
  "/clients/:id/programs": {
    title: "Programs",
    description: "Age groups and programs offered at each location.",
  },
  "/clients/:id/members": {
    title: "Team members",
    description: "Who can access this daycare and what they can do.",
  },
  "/audit": {
    title: "AI Presence Audit",
    description: "Visibility score, top issues, quick wins, and a 30-day plan.",
  },
  "/sign-in": {
    title: "Sign in",
    description: "Returning you to the sign-in page.",
  },
  "/unauthorized": {
    title: "Access denied",
    description: "You do not have permission to view that page.",
  },
};

function humanize(segment: string): string {
  const text = segment.replaceAll("-", " ").replaceAll("_", " ").trim();
  if (!text) return "Market Studio";
  return text.charAt(0).toUpperCase() + text.slice(1);
}

/** Human-readable destination shown while a navigation is in flight. */
export function describeRoute(pathname: string): RouteDescription {
  const pattern = toPattern(pathname);
  const known = ROUTE_DESCRIPTIONS[pattern];
  if (known) return known;

  const lastSegment = pattern.split("/").filter(Boolean).at(-1) ?? "";
  return {
    title: humanize(lastSegment),
    description: "Loading the page you selected.",
  };
}

/** Client and location status vocabularies aligned with database CHECK constraints. */

export const CLIENT_STATUSES = [
  "prospect",
  "onboarding",
  "active",
  "paused",
  "cancelled",
  "archived",
] as const;
export type ClientStatus = (typeof CLIENT_STATUSES)[number];

export const LOCATION_STATUSES = [
  "planned",
  "coming_soon",
  "active",
  "temporarily_closed",
  "closed",
  "archived",
] as const;
export type LocationStatus = (typeof LOCATION_STATUSES)[number];

export const HOURS_TYPES = ["operating", "tour", "office"] as const;
export type HoursType = (typeof HOURS_TYPES)[number];

export const DAY_LABELS = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
] as const;

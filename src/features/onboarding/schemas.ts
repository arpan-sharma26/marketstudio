import { z } from "zod";

export const onboardingStatuses = [
  "not_started",
  "in_progress",
  "completed",
  "blocked",
] as const;
export type OnboardingStatus = (typeof onboardingStatuses)[number];

export const onboardingTaskStatuses = [
  "pending",
  "in_progress",
  "completed",
  "skipped",
] as const;
export type OnboardingTaskStatus = (typeof onboardingTaskStatuses)[number];

export const updateOnboardingTaskSchema = z.object({
  clientId: z.string().uuid(),
  taskId: z.string().uuid(),
  status: z.enum(onboardingTaskStatuses),
  notes: z.string().max(4000).optional().or(z.literal("")),
});

export const saveMarketingGoalsSchema = z.object({
  clientId: z.string().uuid(),
  marketing_goals: z.string().max(4000).optional().or(z.literal("")),
});

export const clientOnboardingActionSchema = z.object({
  clientId: z.string().uuid(),
});

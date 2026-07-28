import { describe, expect, it } from "vitest";

import {
  clientOnboardingActionSchema,
  saveMarketingGoalsSchema,
  updateOnboardingTaskSchema,
} from "./schemas";
import { DEFAULT_ONBOARDING_TASKS, ONBOARDING_TASK_KEYS } from "./task-definitions";

describe("onboarding schemas", () => {
  it("accepts a valid task update", () => {
    const result = updateOnboardingTaskSchema.safeParse({
      clientId: "11111111-1111-1111-1111-111111111111",
      taskId: "22222222-2222-2222-2222-222222222222",
      status: "completed",
      notes: "Done",
    });
    expect(result.success).toBe(true);
  });

  it("rejects an unknown task status", () => {
    const result = updateOnboardingTaskSchema.safeParse({
      clientId: "11111111-1111-1111-1111-111111111111",
      taskId: "22222222-2222-2222-2222-222222222222",
      status: "done",
    });
    expect(result.success).toBe(false);
  });

  it("accepts marketing goals", () => {
    const result = saveMarketingGoalsSchema.safeParse({
      clientId: "11111111-1111-1111-1111-111111111111",
      marketing_goals: "Fill infant rooms in Calgary.",
    });
    expect(result.success).toBe(true);
  });

  it("requires a client id to complete onboarding", () => {
    expect(clientOnboardingActionSchema.safeParse({}).success).toBe(false);
  });
});

describe("default onboarding tasks", () => {
  it("covers every canonical task key exactly once", () => {
    expect(DEFAULT_ONBOARDING_TASKS.map((t) => t.task_key).sort()).toEqual(
      [...ONBOARDING_TASK_KEYS].sort(),
    );
  });
});

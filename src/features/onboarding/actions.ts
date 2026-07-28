"use server";

import { revalidatePath } from "next/cache";

import { actionError, actionSuccess, type ActionResult } from "@/lib/action-result";
import { requireAuthContext, requirePermission } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { toFieldErrors } from "@/lib/validation";
import {
  clientOnboardingActionSchema,
  saveMarketingGoalsSchema,
  updateOnboardingTaskSchema,
} from "./schemas";
import { ensureOnboardingTasks } from "./queries";

function emptyToNull(value: string | undefined): string | null {
  if (!value || value.trim() === "") return null;
  return value.trim();
}

function revalidateOnboarding(clientId: string) {
  revalidatePath(`/clients/${clientId}`);
  revalidatePath(`/clients/${clientId}/onboarding`);
}

async function bumpOnboardingInProgress(clientId: string) {
  const supabase = await createClient();
  const { data: client } = await supabase
    .from("clients")
    .select("onboarding_status")
    .eq("id", clientId)
    .maybeSingle();

  if (client?.onboarding_status === "not_started") {
    await supabase
      .from("clients")
      .update({ onboarding_status: "in_progress" })
      .eq("id", clientId);
  }
}

export async function updateOnboardingTaskAction(
  _prev: ActionResult<void> | null,
  formData: FormData,
): Promise<ActionResult<void>> {
  const parsed = updateOnboardingTaskSchema.safeParse({
    clientId: formData.get("clientId"),
    taskId: formData.get("taskId"),
    status: formData.get("status"),
    notes: formData.get("notes") || undefined,
  });

  if (!parsed.success) {
    return actionError(
      "Please correct the highlighted fields.",
      toFieldErrors(parsed.error),
    );
  }

  const { clientId, taskId, status, notes } = parsed.data;
  await requirePermission("onboarding.manage", { clientId });
  const ctx = await requireAuthContext();

  const isDone = status === "completed" || status === "skipped";
  const supabase = await createClient();
  const { error } = await supabase
    .from("onboarding_tasks")
    .update({
      status,
      notes: emptyToNull(notes),
      completed_at: isDone ? new Date().toISOString() : null,
      completed_by: isDone ? ctx.profile.id : null,
    })
    .eq("id", taskId)
    .eq("client_id", clientId);

  if (error) {
    console.error("updateOnboardingTaskAction failed", error.message);
    return actionError("Could not update the onboarding task.");
  }

  if (status !== "pending") {
    await bumpOnboardingInProgress(clientId);
  }

  revalidateOnboarding(clientId);
  return actionSuccess(undefined);
}

export async function saveMarketingGoalsAction(
  _prev: ActionResult<void> | null,
  formData: FormData,
): Promise<ActionResult<void>> {
  const parsed = saveMarketingGoalsSchema.safeParse({
    clientId: formData.get("clientId"),
    marketing_goals: formData.get("marketing_goals") || undefined,
  });

  if (!parsed.success) {
    return actionError(
      "Please correct the highlighted fields.",
      toFieldErrors(parsed.error),
    );
  }

  const { clientId, marketing_goals } = parsed.data;
  await requirePermission("onboarding.manage", { clientId });
  const ctx = await requireAuthContext();
  const goals = emptyToNull(marketing_goals);

  const supabase = await createClient();
  const { error } = await supabase
    .from("clients")
    .update({ marketing_goals: goals })
    .eq("id", clientId);

  if (error) {
    console.error("saveMarketingGoalsAction failed", error.message);
    return actionError("Could not save marketing goals.");
  }

  if (goals) {
    await ensureOnboardingTasks(clientId);
    await supabase
      .from("onboarding_tasks")
      .update({
        status: "completed",
        completed_at: new Date().toISOString(),
        completed_by: ctx.profile.id,
      })
      .eq("client_id", clientId)
      .eq("task_key", "marketing_goals");
    await bumpOnboardingInProgress(clientId);
  }

  revalidateOnboarding(clientId);
  return actionSuccess(undefined);
}

export async function completeClientOnboardingAction(
  _prev: ActionResult<void> | null,
  formData: FormData,
): Promise<ActionResult<void>> {
  const parsed = clientOnboardingActionSchema.safeParse({
    clientId: formData.get("clientId"),
  });
  if (!parsed.success) {
    return actionError("Invalid client.", toFieldErrors(parsed.error));
  }

  const { clientId } = parsed.data;
  await requirePermission("onboarding.manage", { clientId });
  await ensureOnboardingTasks(clientId);

  const supabase = await createClient();
  const { data: tasks, error: listError } = await supabase
    .from("onboarding_tasks")
    .select("id, is_required, status")
    .eq("client_id", clientId);

  if (listError) {
    console.error("completeClientOnboardingAction list failed", listError.message);
    return actionError("Could not load onboarding tasks.");
  }

  const incompleteRequired = (tasks ?? []).filter(
    (task) =>
      task.is_required &&
      task.status !== "completed" &&
      task.status !== "skipped",
  );
  if (incompleteRequired.length > 0) {
    return actionError(
      "Complete or skip all required onboarding tasks before finishing.",
    );
  }

  const { error } = await supabase
    .from("clients")
    .update({
      onboarding_status: "completed",
      onboarding_completed_at: new Date().toISOString(),
    })
    .eq("id", clientId);

  if (error) {
    console.error("completeClientOnboardingAction failed", error.message);
    return actionError("Could not complete onboarding.");
  }

  revalidateOnboarding(clientId);
  return actionSuccess(undefined);
}

export async function reopenClientOnboardingAction(
  _prev: ActionResult<void> | null,
  formData: FormData,
): Promise<ActionResult<void>> {
  const parsed = clientOnboardingActionSchema.safeParse({
    clientId: formData.get("clientId"),
  });
  if (!parsed.success) {
    return actionError("Invalid client.", toFieldErrors(parsed.error));
  }

  const { clientId } = parsed.data;
  await requirePermission("onboarding.manage", { clientId });

  const supabase = await createClient();
  const { error } = await supabase
    .from("clients")
    .update({
      onboarding_status: "in_progress",
      onboarding_completed_at: null,
    })
    .eq("id", clientId);

  if (error) {
    console.error("reopenClientOnboardingAction failed", error.message);
    return actionError("Could not reopen onboarding.");
  }

  revalidateOnboarding(clientId);
  return actionSuccess(undefined);
}

"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { actionError, actionSuccess, type ActionResult } from "@/lib/action-result";
import { requireAuthContext, requirePermission } from "@/lib/auth";
import { isPlatformAdmin } from "@/lib/permissions";
import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/types/database";
import { toFieldErrors } from "@/lib/validation";
import { ensureOnboardingTasks } from "@/features/onboarding/queries";
import {
  createClientSchema,
  resolveClientSlug,
  updateClientSchema,
} from "./schemas";

function emptyToNull(value: string | undefined): string | null {
  if (!value || value.trim() === "") return null;
  return value.trim();
}

export async function createClientAction(
  _prev: ActionResult<{ id: string }> | null,
  formData: FormData,
): Promise<ActionResult<{ id: string }>> {
  const ctx = await requireAuthContext();
  if (!isPlatformAdmin(ctx)) {
    return actionError("Only Market Studio administrators can create clients.");
  }

  const parsed = createClientSchema.safeParse({
    name: formData.get("name"),
    legal_name: formData.get("legal_name") || undefined,
    slug: formData.get("slug") || undefined,
    website_url: formData.get("website_url") || undefined,
    primary_email: formData.get("primary_email") || undefined,
    primary_phone: formData.get("primary_phone") || undefined,
    timezone: formData.get("timezone") || "America/Edmonton",
    status: formData.get("status") || "prospect",
  });

  if (!parsed.success) {
    return actionError(
      "Please correct the highlighted fields.",
      toFieldErrors(parsed.error),
    );
  }

  const slug = resolveClientSlug(parsed.data.name, parsed.data.slug);
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("clients")
    .insert({
      name: parsed.data.name,
      legal_name: emptyToNull(parsed.data.legal_name),
      slug,
      website_url: emptyToNull(parsed.data.website_url),
      primary_email: emptyToNull(parsed.data.primary_email),
      primary_phone: emptyToNull(parsed.data.primary_phone),
      timezone: parsed.data.timezone,
      status: parsed.data.status,
      onboarding_status: "not_started",
    })
    .select("id")
    .single();

  if (error) {
    if (error.code === "23505") {
      return actionError("A client with this slug already exists.", {
        slug: ["Slug must be unique."],
      });
    }
    console.error("createClientAction failed", error.message);
    return actionError("Could not create the client. Please try again.");
  }

  try {
    await ensureOnboardingTasks(data.id);
  } catch (ensureError) {
    console.error("ensureOnboardingTasks after create failed", ensureError);
  }

  revalidatePath("/clients");
  redirect(`/clients/${data.id}`);
}

export async function updateClientAction(
  _prev: ActionResult<void> | null,
  formData: FormData,
): Promise<ActionResult<void>> {
  const parsed = updateClientSchema.safeParse({
    clientId: formData.get("clientId"),
    name: formData.get("name") || undefined,
    legal_name: formData.get("legal_name") || undefined,
    slug: formData.get("slug") || undefined,
    website_url: formData.get("website_url") || undefined,
    primary_email: formData.get("primary_email") || undefined,
    primary_phone: formData.get("primary_phone") || undefined,
    timezone: formData.get("timezone") || undefined,
    status: formData.get("status") || undefined,
  });

  if (!parsed.success) {
    return actionError(
      "Please correct the highlighted fields.",
      toFieldErrors(parsed.error),
    );
  }

  const { clientId, ...fields } = parsed.data;
  await requirePermission("client.update", { clientId });

  const updates: Database["public"]["Tables"]["clients"]["Update"] = {};
  if (fields.name !== undefined) updates.name = fields.name;
  if (fields.legal_name !== undefined) updates.legal_name = emptyToNull(fields.legal_name);
  if (fields.slug !== undefined) updates.slug = fields.slug;
  if (fields.website_url !== undefined) {
    updates.website_url = emptyToNull(fields.website_url);
  }
  if (fields.primary_email !== undefined) {
    updates.primary_email = emptyToNull(fields.primary_email);
  }
  if (fields.primary_phone !== undefined) {
    updates.primary_phone = emptyToNull(fields.primary_phone);
  }
  if (fields.timezone !== undefined) updates.timezone = fields.timezone;
  if (fields.status !== undefined) updates.status = fields.status;

  const supabase = await createClient();
  const { error } = await supabase.from("clients").update(updates).eq("id", clientId);

  if (error) {
    if (error.code === "23505") {
      return actionError("A client with this slug already exists.", {
        slug: ["Slug must be unique."],
      });
    }
    console.error("updateClientAction failed", error.message);
    return actionError("Could not update the client. Please try again.");
  }

  revalidatePath("/clients");
  revalidatePath(`/clients/${clientId}`);
  return actionSuccess(undefined);
}

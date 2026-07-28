"use server";

import { revalidatePath } from "next/cache";

import { actionError, actionSuccess, type ActionResult } from "@/lib/action-result";
import { requireAuthContext, requirePermission } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/types/database";
import { toFieldErrors } from "@/lib/validation";
import {
  deleteFaqSchema,
  deleteProgramSchema,
  linesToList,
  setBrandStatusSchema,
  upsertBrandProfileSchema,
  upsertFaqSchema,
  upsertProgramSchema,
} from "./schemas";

function emptyToNull(value: string | undefined): string | null {
  if (!value || value.trim() === "") return null;
  return value.trim();
}

function emptyToNullNumber(
  value: number | string | undefined,
): number | null {
  if (value === undefined || value === "") return null;
  const n = typeof value === "number" ? value : Number(value);
  return Number.isFinite(n) ? n : null;
}

function revalidateBrandPaths(clientId: string) {
  revalidatePath(`/clients/${clientId}`);
  revalidatePath(`/clients/${clientId}/brand`);
  revalidatePath(`/clients/${clientId}/faqs`);
  revalidatePath(`/clients/${clientId}/programs`);
}

export async function upsertBrandProfileAction(
  _prev: ActionResult<void> | null,
  formData: FormData,
): Promise<ActionResult<void>> {
  const parsed = upsertBrandProfileSchema.safeParse({
    clientId: formData.get("clientId"),
    name: formData.get("name"),
    business_summary: formData.get("business_summary") || undefined,
    mission_statement: formData.get("mission_statement") || undefined,
    brand_voice: formData.get("brand_voice") || undefined,
    primary_colour: formData.get("primary_colour") || undefined,
    secondary_colour: formData.get("secondary_colour") || undefined,
    accent_colour: formData.get("accent_colour") || undefined,
    logo_url: formData.get("logo_url") || undefined,
    target_audience: formData.get("target_audience") || undefined,
    unique_selling_points: formData.get("unique_selling_points") || undefined,
    content_pillars: formData.get("content_pillars") || undefined,
    approved_claims: formData.get("approved_claims") || undefined,
    restricted_claims: formData.get("restricted_claims") || undefined,
    approved_ctas: formData.get("approved_ctas") || undefined,
    status: formData.get("status") || "draft",
  });

  if (!parsed.success) {
    return actionError(
      "Please correct the highlighted fields.",
      toFieldErrors(parsed.error),
    );
  }

  const { clientId, status, ...fields } = parsed.data;
  await requirePermission("brand.manage", { clientId });
  if (status === "approved") {
    await requirePermission("brand.approve", { clientId });
  }

  const ctx = await requireAuthContext();
  const payload: Database["public"]["Tables"]["brand_profiles"]["Insert"] = {
    client_id: clientId,
    name: fields.name,
    business_summary: emptyToNull(fields.business_summary),
    mission_statement: emptyToNull(fields.mission_statement),
    brand_voice: emptyToNull(fields.brand_voice),
    primary_colour: emptyToNull(fields.primary_colour),
    secondary_colour: emptyToNull(fields.secondary_colour),
    accent_colour: emptyToNull(fields.accent_colour),
    logo_url: emptyToNull(fields.logo_url),
    target_audience: linesToList(fields.target_audience),
    unique_selling_points: linesToList(fields.unique_selling_points),
    content_pillars: linesToList(fields.content_pillars),
    approved_claims: linesToList(fields.approved_claims),
    restricted_claims: linesToList(fields.restricted_claims),
    approved_ctas: linesToList(fields.approved_ctas),
    status,
    approved_by: status === "approved" ? ctx.profile.id : null,
    approved_at: status === "approved" ? new Date().toISOString() : null,
  };

  const supabase = await createClient();
  const { error } = await supabase.from("brand_profiles").upsert(payload, {
    onConflict: "client_id",
  });

  if (error) {
    console.error("upsertBrandProfileAction failed", error.message);
    return actionError("Could not save the brand profile. Please try again.");
  }

  revalidateBrandPaths(clientId);
  return actionSuccess(undefined);
}

export async function setBrandStatusAction(
  _prev: ActionResult<void> | null,
  formData: FormData,
): Promise<ActionResult<void>> {
  const parsed = setBrandStatusSchema.safeParse({
    clientId: formData.get("clientId"),
    brandProfileId: formData.get("brandProfileId"),
    status: formData.get("status"),
  });

  if (!parsed.success) {
    return actionError(
      "Please correct the highlighted fields.",
      toFieldErrors(parsed.error),
    );
  }

  const { clientId, brandProfileId, status } = parsed.data;

  if (status === "approved") {
    await requirePermission("brand.approve", { clientId });
  } else {
    await requirePermission("brand.manage", { clientId });
  }

  const ctx = await requireAuthContext();
  const updates: Database["public"]["Tables"]["brand_profiles"]["Update"] = {
    status,
  };

  if (status === "approved") {
    updates.approved_by = ctx.profile.id;
    updates.approved_at = new Date().toISOString();
  } else {
    updates.approved_by = null;
    updates.approved_at = null;
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("brand_profiles")
    .update(updates)
    .eq("id", brandProfileId)
    .eq("client_id", clientId);

  if (error) {
    console.error("setBrandStatusAction failed", error.message);
    return actionError("Could not update brand status. Please try again.");
  }

  revalidateBrandPaths(clientId);
  return actionSuccess(undefined);
}

export async function upsertFaqAction(
  _prev: ActionResult<void> | null,
  formData: FormData,
): Promise<ActionResult<void>> {
  const parsed = upsertFaqSchema.safeParse({
    clientId: formData.get("clientId"),
    faqId: formData.get("faqId") || undefined,
    locationId: formData.get("locationId") || undefined,
    question: formData.get("question"),
    answer: formData.get("answer"),
    category: formData.get("category") || undefined,
    is_ai_usable: formData.get("is_ai_usable") === "on",
    status: formData.get("status") || "draft",
  });

  if (!parsed.success) {
    return actionError(
      "Please correct the highlighted fields.",
      toFieldErrors(parsed.error),
    );
  }

  const { clientId, faqId, locationId, status, ...fields } = parsed.data;
  await requirePermission("brand.manage", { clientId });
  if (status === "approved") {
    await requirePermission("brand.approve", { clientId });
  }

  const ctx = await requireAuthContext();
  const supabase = await createClient();
  const row = {
    client_id: clientId,
    location_id: emptyToNull(locationId),
    question: fields.question,
    answer: fields.answer,
    category: emptyToNull(fields.category),
    is_ai_usable: fields.is_ai_usable,
    status,
    approved_by: status === "approved" ? ctx.profile.id : null,
    approved_at: status === "approved" ? new Date().toISOString() : null,
  };

  let error;
  if (faqId) {
    ({ error } = await supabase
      .from("client_faqs")
      .update(row)
      .eq("id", faqId)
      .eq("client_id", clientId));
  } else {
    ({ error } = await supabase.from("client_faqs").insert(row));
  }

  if (error) {
    console.error("upsertFaqAction failed", error.message);
    return actionError("Could not save the FAQ. Please try again.");
  }

  revalidateBrandPaths(clientId);
  return actionSuccess(undefined);
}

export async function deleteFaqAction(
  _prev: ActionResult<void> | null,
  formData: FormData,
): Promise<ActionResult<void>> {
  const parsed = deleteFaqSchema.safeParse({
    clientId: formData.get("clientId"),
    faqId: formData.get("faqId"),
  });

  if (!parsed.success) {
    return actionError("Invalid FAQ delete request.", toFieldErrors(parsed.error));
  }

  const { clientId, faqId } = parsed.data;
  await requirePermission("brand.manage", { clientId });

  const supabase = await createClient();
  const { error } = await supabase
    .from("client_faqs")
    .delete()
    .eq("id", faqId)
    .eq("client_id", clientId);

  if (error) {
    console.error("deleteFaqAction failed", error.message);
    return actionError("Could not delete the FAQ. Please try again.");
  }

  revalidateBrandPaths(clientId);
  return actionSuccess(undefined);
}

export async function upsertProgramAction(
  _prev: ActionResult<void> | null,
  formData: FormData,
): Promise<ActionResult<void>> {
  const locationIds = formData
    .getAll("locationIds")
    .filter((value): value is string => typeof value === "string" && value.length > 0);

  const parsed = upsertProgramSchema.safeParse({
    clientId: formData.get("clientId"),
    programId: formData.get("programId") || undefined,
    name: formData.get("name"),
    description: formData.get("description") || undefined,
    minimum_age_months: formData.get("minimum_age_months") || undefined,
    maximum_age_months: formData.get("maximum_age_months") || undefined,
    status: formData.get("status") || "draft",
    locationIds,
  });

  if (!parsed.success) {
    return actionError(
      "Please correct the highlighted fields.",
      toFieldErrors(parsed.error),
    );
  }

  const { clientId, programId, locationIds: selectedLocations, ...fields } =
    parsed.data;
  await requirePermission("brand.manage", { clientId });

  const supabase = await createClient();
  const programPayload = {
    client_id: clientId,
    name: fields.name,
    description: emptyToNull(fields.description),
    minimum_age_months: emptyToNullNumber(fields.minimum_age_months),
    maximum_age_months: emptyToNullNumber(fields.maximum_age_months),
    status: fields.status,
  };

  let resolvedProgramId = programId;
  if (programId) {
    const { error } = await supabase
      .from("programs")
      .update(programPayload)
      .eq("id", programId)
      .eq("client_id", clientId);
    if (error) {
      if (error.code === "23505") {
        return actionError("A program with this name already exists.", {
          name: ["Program name must be unique for this client."],
        });
      }
      console.error("upsertProgramAction update failed", error.message);
      return actionError("Could not update the program. Please try again.");
    }
  } else {
    const { data, error } = await supabase
      .from("programs")
      .insert(programPayload)
      .select("id")
      .single();
    if (error) {
      if (error.code === "23505") {
        return actionError("A program with this name already exists.", {
          name: ["Program name must be unique for this client."],
        });
      }
      console.error("upsertProgramAction insert failed", error.message);
      return actionError("Could not create the program. Please try again.");
    }
    resolvedProgramId = data.id;
  }

  // Sync location associations: remove unchecked, upsert checked.
  const { data: existingLinks, error: listError } = await supabase
    .from("location_programs")
    .select("id, location_id")
    .eq("program_id", resolvedProgramId!)
    .eq("client_id", clientId);

  if (listError) {
    console.error("upsertProgramAction list links failed", listError.message);
    return actionError("Program saved, but location links could not be loaded.");
  }

  const selected = new Set(selectedLocations);
  const toDelete = (existingLinks ?? [])
    .filter((link) => !selected.has(link.location_id))
    .map((link) => link.id);

  if (toDelete.length > 0) {
    const { error: deleteError } = await supabase
      .from("location_programs")
      .delete()
      .in("id", toDelete);
    if (deleteError) {
      console.error("upsertProgramAction delete links failed", deleteError.message);
      return actionError("Program saved, but some location links could not be removed.");
    }
  }

  const existingLocationIds = new Set(
    (existingLinks ?? []).map((link) => link.location_id),
  );
  const toInsert = selectedLocations
    .filter((locationId) => !existingLocationIds.has(locationId))
    .map((locationId) => ({
      client_id: clientId,
      location_id: locationId,
      program_id: resolvedProgramId!,
      is_available: true,
      accepting_registrations: false,
    }));

  if (toInsert.length > 0) {
    const { error: insertError } = await supabase
      .from("location_programs")
      .insert(toInsert);
    if (insertError) {
      console.error("upsertProgramAction insert links failed", insertError.message);
      return actionError("Program saved, but some location links could not be added.");
    }
  }

  revalidateBrandPaths(clientId);
  return actionSuccess(undefined);
}

export async function deleteProgramAction(
  _prev: ActionResult<void> | null,
  formData: FormData,
): Promise<ActionResult<void>> {
  const parsed = deleteProgramSchema.safeParse({
    clientId: formData.get("clientId"),
    programId: formData.get("programId"),
  });

  if (!parsed.success) {
    return actionError(
      "Invalid program delete request.",
      toFieldErrors(parsed.error),
    );
  }

  const { clientId, programId } = parsed.data;
  await requirePermission("brand.manage", { clientId });

  const supabase = await createClient();
  const { error } = await supabase
    .from("programs")
    .delete()
    .eq("id", programId)
    .eq("client_id", clientId);

  if (error) {
    console.error("deleteProgramAction failed", error.message);
    return actionError("Could not delete the program. Please try again.");
  }

  revalidateBrandPaths(clientId);
  return actionSuccess(undefined);
}

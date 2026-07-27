"use server";

import { revalidatePath } from "next/cache";

import { actionError, actionSuccess, type ActionResult } from "@/lib/action-result";
import { assertSameClient, requirePermission } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { toFieldErrors } from "@/lib/validation";
import {
  addMembershipSchema,
  setLocationMembershipsSchema,
  setMembershipActiveSchema,
  updateMembershipRoleSchema,
} from "./schemas";

export async function addMembershipAction(
  _prev: ActionResult<void> | null,
  formData: FormData,
): Promise<ActionResult<void>> {
  const locationIds = formData
    .getAll("locationIds")
    .map(String)
    .filter((value) => value.length > 0);

  const parsed = addMembershipSchema.safeParse({
    clientId: formData.get("clientId"),
    email: formData.get("email"),
    role: formData.get("role"),
    locationIds,
  });

  if (!parsed.success) {
    return actionError(
      "Please correct the highlighted fields.",
      toFieldErrors(parsed.error),
    );
  }

  const { clientId, email, role } = parsed.data;
  await requirePermission("membership.manage", { clientId });

  const admin = createAdminClient();
  const { data: profile, error: profileError } = await admin
    .from("profiles")
    .select("id, email")
    .eq("email", email.toLowerCase())
    .maybeSingle();

  if (profileError) {
    console.error("addMembershipAction profile lookup failed", profileError.message);
    return actionError("Could not look up that user. Please try again.");
  }
  if (!profile) {
    return actionError("No Market Studio user exists with that email.", {
      email: ["Invite only works for existing users in this environment."],
    });
  }

  const supabase = await createClient();
  const { error } = await supabase.from("client_memberships").insert({
    client_id: clientId,
    profile_id: profile.id,
    role,
    is_active: true,
    invited_at: new Date().toISOString(),
    accepted_at: new Date().toISOString(),
  });

  if (error) {
    if (error.code === "23505") {
      return actionError("That user is already a member of this client.", {
        email: ["Membership already exists."],
      });
    }
    console.error("addMembershipAction insert failed", error.message);
    return actionError("Could not add the member. Please try again.");
  }

  if (parsed.data.locationIds.length > 0) {
    const locationResult = await setLocationMembershipsInternal({
      clientId,
      profileId: profile.id,
      locationIds: parsed.data.locationIds,
      role,
    });
    if (!locationResult.ok) return locationResult;
  }

  revalidatePath(`/clients/${clientId}/members`);
  return actionSuccess(undefined);
}

export async function updateMembershipRoleAction(
  _prev: ActionResult<void> | null,
  formData: FormData,
): Promise<ActionResult<void>> {
  const parsed = updateMembershipRoleSchema.safeParse({
    clientId: formData.get("clientId"),
    membershipId: formData.get("membershipId"),
    role: formData.get("role"),
  });

  if (!parsed.success) {
    return actionError(
      "Please correct the highlighted fields.",
      toFieldErrors(parsed.error),
    );
  }

  const { clientId, membershipId, role } = parsed.data;
  await requirePermission("membership.manage", { clientId });

  const supabase = await createClient();
  const { data: membership, error: lookupError } = await supabase
    .from("client_memberships")
    .select("id, client_id")
    .eq("id", membershipId)
    .maybeSingle();
  if (lookupError || !membership) {
    return actionError("Membership not found.");
  }
  assertSameClient(clientId, membership.client_id);

  const { error } = await supabase
    .from("client_memberships")
    .update({ role })
    .eq("id", membershipId)
    .eq("client_id", clientId);

  if (error) {
    console.error("updateMembershipRoleAction failed", error.message);
    return actionError("Could not update the member role. Please try again.");
  }

  revalidatePath(`/clients/${clientId}/members`);
  return actionSuccess(undefined);
}

export async function setMembershipActiveAction(
  _prev: ActionResult<void> | null,
  formData: FormData,
): Promise<ActionResult<void>> {
  const parsed = setMembershipActiveSchema.safeParse({
    clientId: formData.get("clientId"),
    membershipId: formData.get("membershipId"),
    isActive: formData.get("isActive") === "true",
  });

  if (!parsed.success) {
    return actionError(
      "Please correct the highlighted fields.",
      toFieldErrors(parsed.error),
    );
  }

  const { clientId, membershipId, isActive } = parsed.data;
  await requirePermission("membership.manage", { clientId });

  const supabase = await createClient();
  const { data: membership, error: lookupError } = await supabase
    .from("client_memberships")
    .select("id, client_id")
    .eq("id", membershipId)
    .maybeSingle();
  if (lookupError || !membership) {
    return actionError("Membership not found.");
  }
  assertSameClient(clientId, membership.client_id);

  const { error } = await supabase
    .from("client_memberships")
    .update({ is_active: isActive })
    .eq("id", membershipId)
    .eq("client_id", clientId);

  if (error) {
    console.error("setMembershipActiveAction failed", error.message);
    return actionError("Could not update membership status. Please try again.");
  }

  revalidatePath(`/clients/${clientId}/members`);
  return actionSuccess(undefined);
}

export async function setLocationMembershipsAction(
  _prev: ActionResult<void> | null,
  formData: FormData,
): Promise<ActionResult<void>> {
  const locationIds = formData
    .getAll("locationIds")
    .map(String)
    .filter((value) => value.length > 0);

  const parsed = setLocationMembershipsSchema.safeParse({
    clientId: formData.get("clientId"),
    profileId: formData.get("profileId"),
    role: formData.get("role"),
    locationIds,
  });

  if (!parsed.success) {
    return actionError(
      "Please correct the highlighted fields.",
      toFieldErrors(parsed.error),
    );
  }

  const result = await setLocationMembershipsInternal(parsed.data);
  if (!result.ok) return result;

  revalidatePath(`/clients/${parsed.data.clientId}/members`);
  return actionSuccess(undefined);
}

async function setLocationMembershipsInternal(input: {
  clientId: string;
  profileId: string;
  locationIds: string[];
  role: string;
}): Promise<ActionResult<void>> {
  await requirePermission("membership.manage", { clientId: input.clientId });

  const supabase = await createClient();

  if (input.locationIds.length > 0) {
    const { data: locations, error: locationError } = await supabase
      .from("client_locations")
      .select("id, client_id")
      .in("id", input.locationIds);
    if (locationError) {
      return actionError("Could not validate locations.");
    }
    for (const location of locations ?? []) {
      assertSameClient(input.clientId, location.client_id);
    }
    if ((locations ?? []).length !== input.locationIds.length) {
      return actionError("One or more locations were not found for this client.");
    }
  }

  const { error: deleteError } = await supabase
    .from("location_memberships")
    .delete()
    .eq("client_id", input.clientId)
    .eq("profile_id", input.profileId);
  if (deleteError) {
    console.error("setLocationMemberships delete failed", deleteError.message);
    return actionError("Could not update location access.");
  }

  if (input.locationIds.length === 0) {
    return actionSuccess(undefined);
  }

  const { error: insertError } = await supabase.from("location_memberships").insert(
    input.locationIds.map((locationId) => ({
      client_id: input.clientId,
      location_id: locationId,
      profile_id: input.profileId,
      role: input.role,
    })),
  );
  if (insertError) {
    console.error("setLocationMemberships insert failed", insertError.message);
    return actionError("Could not update location access.");
  }

  return actionSuccess(undefined);
}

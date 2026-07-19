"use server";

import { redirect } from "next/navigation";

import { actionError, type ActionResult } from "@/lib/action-result";
import { createClient } from "@/lib/supabase/server";
import { toFieldErrors } from "@/lib/validation";
import { signInSchema } from "./schemas";

/**
 * Authenticates a user with email/password. Validates input with Zod, returns
 * field-specific errors, and never leaks provider error details to the client.
 */
export async function signIn(
  _prev: ActionResult<void> | null,
  formData: FormData,
): Promise<ActionResult<void>> {
  const parsed = signInSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return actionError(
      "Please correct the highlighted fields.",
      toFieldErrors(parsed.error),
    );
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password,
  });

  if (error) {
    // Deliberately generic message — do not reveal whether the account exists.
    return actionError("Invalid email or password.");
  }

  redirect("/dashboard");
}

/** Signs the current user out and returns to the sign-in page. */
export async function signOut(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/sign-in");
}

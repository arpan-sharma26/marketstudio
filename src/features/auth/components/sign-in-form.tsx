"use client";

import { useActionState, type ReactNode } from "react";
import { useFormStatus } from "react-dom";

import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import type { ActionResult } from "@/lib/action-result";
import { signIn } from "../actions";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button
      type="submit"
      className="w-full gap-2"
      disabled={pending}
      aria-disabled={pending}
    >
      {pending ? (
        <>
          <Spinner label="Signing in" />
          Signing in…
        </>
      ) : (
        "Sign in"
      )}
    </Button>
  );
}

function PendingFields({ children }: { children: ReactNode }) {
  const { pending } = useFormStatus();
  return (
    <fieldset disabled={pending} className="min-w-0 space-y-4 disabled:opacity-70">
      {children}
    </fieldset>
  );
}

export function SignInForm() {
  const [state, formAction] = useActionState<ActionResult<void> | null, FormData>(
    signIn,
    null,
  );

  const fieldErrors = state && !state.ok ? state.fieldErrors : undefined;
  const formError = state && !state.ok ? state.error : undefined;

  return (
    <form action={formAction} className="sign-in-form space-y-4" noValidate>
      {formError && !fieldErrors && <Alert variant="error">{formError}</Alert>}

      <PendingFields>
        <div className="space-y-1.5">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            aria-invalid={Boolean(fieldErrors?.email)}
            aria-describedby={fieldErrors?.email ? "email-error" : undefined}
          />
          {fieldErrors?.email && (
            <p id="email-error" className="text-sm text-red-600">
              {fieldErrors.email[0]}
            </p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            aria-invalid={Boolean(fieldErrors?.password)}
            aria-describedby={fieldErrors?.password ? "password-error" : undefined}
          />
          {fieldErrors?.password && (
            <p id="password-error" className="text-sm text-red-600">
              {fieldErrors.password[0]}
            </p>
          )}
        </div>

        <SubmitButton />
      </PendingFields>
    </form>
  );
}

"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";

import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import type { ActionResult } from "@/lib/action-result";
import { CLIENT_ROLES } from "@/types/roles";
import { addMembershipAction } from "../actions";
import type { LocationRow } from "@/features/locations/queries";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} aria-disabled={pending}>
      {pending ? "Adding…" : "Add member"}
    </Button>
  );
}

interface AddMemberFormProps {
  clientId: string;
  locations: LocationRow[];
}

export function AddMemberForm({ clientId, locations }: AddMemberFormProps) {
  const [state, formAction] = useActionState<ActionResult<void> | null, FormData>(
    addMembershipAction,
    null,
  );

  const fieldErrors = state && !state.ok ? state.fieldErrors : undefined;

  return (
    <form action={formAction} className="space-y-4" noValidate>
      <input type="hidden" name="clientId" value={clientId} />

      {state && !state.ok && !fieldErrors ? (
        <Alert variant="error">{state.error}</Alert>
      ) : null}
      {state && state.ok ? <Alert variant="success">Member added.</Alert> : null}

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="email">
            Email <span className="text-red-600">*</span>
          </Label>
          <Input
            id="email"
            name="email"
            type="email"
            required
            aria-invalid={Boolean(fieldErrors?.email)}
          />
          {fieldErrors?.email ? (
            <p className="text-sm text-red-600">{fieldErrors.email[0]}</p>
          ) : null}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="role">Role</Label>
          <Select id="role" name="role" defaultValue="staff">
            {CLIENT_ROLES.map((role) => (
              <option key={role} value={role}>
                {role}
              </option>
            ))}
          </Select>
        </div>
      </div>

      {locations.length > 0 ? (
        <fieldset className="space-y-2">
          <legend className="text-sm font-medium text-slate-700">
            Location access (optional)
          </legend>
          <p className="text-xs text-slate-500">
            Leave unchecked for client-wide access. Check locations to restrict the member.
          </p>
          <div className="grid gap-2 sm:grid-cols-2">
            {locations.map((location) => (
              <label
                key={location.id}
                className="flex items-center gap-2 text-sm text-slate-700"
              >
                <input type="checkbox" name="locationIds" value={location.id} />
                {location.name}
              </label>
            ))}
          </div>
        </fieldset>
      ) : null}

      <SubmitButton />
    </form>
  );
}

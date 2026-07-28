"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";

import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import type { ActionResult } from "@/lib/action-result";
import { deleteProgramAction, upsertProgramAction } from "../actions";
import type { ProgramWithLocations } from "../queries";
import { programStatuses } from "../schemas";

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} aria-disabled={pending}>
      {pending ? "Saving…" : label}
    </Button>
  );
}

function DeleteButton() {
  const { pending } = useFormStatus();
  return (
    <Button
      type="submit"
      variant="secondary"
      disabled={pending}
      aria-disabled={pending}
    >
      {pending ? "Deleting…" : "Delete"}
    </Button>
  );
}

interface LocationOption {
  id: string;
  name: string;
}

interface ProgramFormProps {
  clientId: string;
  locations: LocationOption[];
  program?: ProgramWithLocations;
  canManage: boolean;
}

export function ProgramForm({
  clientId,
  locations,
  program,
  canManage,
}: ProgramFormProps) {
  const [state, formAction] = useActionState<ActionResult<void> | null, FormData>(
    upsertProgramAction,
    null,
  );
  const fieldErrors = state && !state.ok ? state.fieldErrors : undefined;
  const formError = state && !state.ok ? state.error : undefined;
  const success = state && state.ok;
  const linkedIds = new Set(
    (program?.location_programs ?? []).map((link) => link.location_id),
  );

  if (!canManage) return null;

  return (
    <form action={formAction} className="space-y-4" noValidate>
      <input type="hidden" name="clientId" value={clientId} />
      {program ? <input type="hidden" name="programId" value={program.id} /> : null}

      {formError ? <Alert variant="error">{formError}</Alert> : null}
      {success ? (
        <Alert variant="success">
          {program ? "Program updated." : "Program created."}
        </Alert>
      ) : null}

      <div className="space-y-1.5">
        <Label htmlFor={`name-${program?.id ?? "new"}`}>Program name</Label>
        <Input
          id={`name-${program?.id ?? "new"}`}
          name="name"
          required
          defaultValue={program?.name ?? ""}
          aria-invalid={Boolean(fieldErrors?.name)}
        />
        {fieldErrors?.name ? (
          <p className="text-sm text-red-600">{fieldErrors.name[0]}</p>
        ) : null}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor={`description-${program?.id ?? "new"}`}>Description</Label>
        <textarea
          id={`description-${program?.id ?? "new"}`}
          name="description"
          rows={3}
          defaultValue={program?.description ?? ""}
          className="flex w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-ink shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="space-y-1.5">
          <Label htmlFor={`min-age-${program?.id ?? "new"}`}>Min age (months)</Label>
          <Input
            id={`min-age-${program?.id ?? "new"}`}
            name="minimum_age_months"
            type="number"
            min={0}
            defaultValue={program?.minimum_age_months ?? ""}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor={`max-age-${program?.id ?? "new"}`}>Max age (months)</Label>
          <Input
            id={`max-age-${program?.id ?? "new"}`}
            name="maximum_age_months"
            type="number"
            min={0}
            defaultValue={program?.maximum_age_months ?? ""}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor={`status-${program?.id ?? "new"}`}>Status</Label>
          <Select
            id={`status-${program?.id ?? "new"}`}
            name="status"
            defaultValue={program?.status ?? "draft"}
          >
            {programStatuses.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </Select>
        </div>
      </div>

      <fieldset className="space-y-2">
        <legend className="text-sm font-medium text-ink">Offered at locations</legend>
        {locations.length === 0 ? (
          <p className="text-sm text-slate-500">Add locations before linking programs.</p>
        ) : (
          locations.map((location) => (
            <label
              key={location.id}
              className="flex items-center gap-2 text-sm text-ink"
            >
              <input
                type="checkbox"
                name="locationIds"
                value={location.id}
                defaultChecked={linkedIds.has(location.id)}
                className="h-4 w-4 rounded border-slate-300"
              />
              {location.name}
            </label>
          ))
        )}
      </fieldset>

      <SubmitButton label={program ? "Update program" : "Add program"} />
    </form>
  );
}

interface ProgramDeleteButtonProps {
  clientId: string;
  programId: string;
}

export function ProgramDeleteButton({
  clientId,
  programId,
}: ProgramDeleteButtonProps) {
  const [state, formAction] = useActionState<ActionResult<void> | null, FormData>(
    deleteProgramAction,
    null,
  );

  return (
    <form action={formAction} className="inline">
      <input type="hidden" name="clientId" value={clientId} />
      <input type="hidden" name="programId" value={programId} />
      <DeleteButton />
      {state && !state.ok ? (
        <p className="mt-1 text-xs text-red-600">{state.error}</p>
      ) : null}
    </form>
  );
}

"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";

import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import type { ActionResult } from "@/lib/action-result";
import { LOCATION_STATUSES } from "@/types/clients";
import { createLocationAction, updateLocationAction } from "../actions";
import type { LocationRow } from "../queries";

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} aria-disabled={pending}>
      {pending ? "Saving…" : label}
    </Button>
  );
}

interface LocationFormProps {
  mode: "create" | "edit";
  clientId: string;
  location?: LocationRow;
}

export function LocationForm({ mode, clientId, location }: LocationFormProps) {
  if (mode === "create") {
    return <CreateLocationForm clientId={clientId} />;
  }
  return <EditLocationForm clientId={clientId} location={location!} />;
}

function CreateLocationForm({ clientId }: { clientId: string }) {
  const [state, formAction] = useActionState<
    ActionResult<{ id: string }> | null,
    FormData
  >(createLocationAction, null);
  return (
    <LocationFormFields
      mode="create"
      clientId={clientId}
      formAction={formAction}
      state={state}
    />
  );
}

function EditLocationForm({
  clientId,
  location,
}: {
  clientId: string;
  location: LocationRow;
}) {
  const [state, formAction] = useActionState<ActionResult<void> | null, FormData>(
    updateLocationAction,
    null,
  );
  return (
    <LocationFormFields
      mode="edit"
      clientId={clientId}
      location={location}
      formAction={formAction}
      state={state}
    />
  );
}

function LocationFormFields({
  mode,
  clientId,
  location,
  formAction,
  state,
}: {
  mode: "create" | "edit";
  clientId: string;
  location?: LocationRow;
  formAction: (payload: FormData) => void;
  state: ActionResult<{ id: string } | void> | null;
}) {
  const fieldErrors = state && !state.ok ? state.fieldErrors : undefined;
  const formError = state && !state.ok ? state.error : undefined;
  const success = state && state.ok && mode === "edit";

  return (
    <form action={formAction} className="space-y-4" noValidate>
      <input type="hidden" name="clientId" value={clientId} />
      {mode === "edit" && location ? (
        <input type="hidden" name="locationId" value={location.id} />
      ) : null}

      {formError && !fieldErrors ? <Alert variant="error">{formError}</Alert> : null}
      {success ? <Alert variant="success">Location details saved.</Alert> : null}

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5 sm:col-span-2">
          <Label htmlFor="name">
            Name <span className="text-red-600">*</span>
          </Label>
          <Input
            id="name"
            name="name"
            required
            defaultValue={location?.name ?? ""}
            aria-invalid={Boolean(fieldErrors?.name)}
          />
          {fieldErrors?.name ? (
            <p className="text-sm text-red-600">{fieldErrors.name[0]}</p>
          ) : null}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="slug">Slug</Label>
          <Input
            id="slug"
            name="slug"
            defaultValue={location?.slug ?? ""}
            placeholder="auto-generated from name"
            aria-invalid={Boolean(fieldErrors?.slug)}
          />
          {fieldErrors?.slug ? (
            <p className="text-sm text-red-600">{fieldErrors.slug[0]}</p>
          ) : null}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="internal_name">Internal name</Label>
          <Input
            id="internal_name"
            name="internal_name"
            defaultValue={location?.internal_name ?? ""}
          />
        </div>

        <div className="space-y-1.5 sm:col-span-2">
          <Label htmlFor="address_line_1">
            Address <span className="text-red-600">*</span>
          </Label>
          <Input
            id="address_line_1"
            name="address_line_1"
            required
            defaultValue={location?.address_line_1 ?? ""}
          />
        </div>

        <div className="space-y-1.5 sm:col-span-2">
          <Label htmlFor="address_line_2">Address line 2</Label>
          <Input
            id="address_line_2"
            name="address_line_2"
            defaultValue={location?.address_line_2 ?? ""}
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="city">
            City <span className="text-red-600">*</span>
          </Label>
          <Input id="city" name="city" required defaultValue={location?.city ?? ""} />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="province_code">
            Province <span className="text-red-600">*</span>
          </Label>
          <Input
            id="province_code"
            name="province_code"
            required
            maxLength={2}
            defaultValue={location?.province_code ?? "AB"}
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="postal_code">
            Postal code <span className="text-red-600">*</span>
          </Label>
          <Input
            id="postal_code"
            name="postal_code"
            required
            defaultValue={location?.postal_code ?? ""}
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="phone">Phone</Label>
          <Input id="phone" name="phone" defaultValue={location?.phone ?? ""} />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            defaultValue={location?.email ?? ""}
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="status">Status</Label>
          <Select
            id="status"
            name="status"
            defaultValue={location?.status ?? "planned"}
          >
            {LOCATION_STATUSES.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="timezone">Timezone</Label>
          <Input
            id="timezone"
            name="timezone"
            defaultValue={location?.timezone ?? "America/Edmonton"}
          />
        </div>

        <label className="flex items-center gap-2 text-sm text-slate-700">
          <input
            type="checkbox"
            name="accepting_registrations"
            defaultChecked={location?.accepting_registrations ?? false}
          />
          Accepting registrations
        </label>

        <label className="flex items-center gap-2 text-sm text-slate-700">
          <input
            type="checkbox"
            name="tour_booking_enabled"
            defaultChecked={location?.tour_booking_enabled ?? false}
          />
          Tour booking enabled
        </label>
      </div>

      <SubmitButton label={mode === "create" ? "Create location" : "Save changes"} />
    </form>
  );
}

"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";

import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import type { ActionResult } from "@/lib/action-result";
import { CLIENT_STATUSES } from "@/types/clients";
import { createClientAction, updateClientAction } from "../actions";
import type { ClientRow } from "../queries";

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} aria-disabled={pending}>
      {pending ? "Saving…" : label}
    </Button>
  );
}

interface ClientFormProps {
  mode: "create" | "edit";
  client?: ClientRow;
}

export function ClientForm({ mode, client }: ClientFormProps) {
  if (mode === "create") {
    return <CreateClientForm />;
  }
  return <EditClientForm client={client!} />;
}

function CreateClientForm() {
  const [state, formAction] = useActionState<
    ActionResult<{ id: string }> | null,
    FormData
  >(createClientAction, null);
  return <ClientFormFields mode="create" formAction={formAction} state={state} />;
}

function EditClientForm({ client }: { client: ClientRow }) {
  const [state, formAction] = useActionState<ActionResult<void> | null, FormData>(
    updateClientAction,
    null,
  );
  return (
    <ClientFormFields
      mode="edit"
      client={client}
      formAction={formAction}
      state={state}
    />
  );
}

function ClientFormFields({
  mode,
  client,
  formAction,
  state,
}: {
  mode: "create" | "edit";
  client?: ClientRow;
  formAction: (payload: FormData) => void;
  state: ActionResult<{ id: string } | void> | null;
}) {
  const fieldErrors = state && !state.ok ? state.fieldErrors : undefined;
  const formError = state && !state.ok ? state.error : undefined;
  const success = state && state.ok && mode === "edit";

  return (
    <form action={formAction} className="space-y-4" noValidate>
      {mode === "edit" && client ? (
        <input type="hidden" name="clientId" value={client.id} />
      ) : null}

      {formError && !fieldErrors ? <Alert variant="error">{formError}</Alert> : null}
      {success ? <Alert variant="success">Client details saved.</Alert> : null}

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5 sm:col-span-2">
          <Label htmlFor="name">
            Name <span className="text-red-600">*</span>
          </Label>
          <Input
            id="name"
            name="name"
            required
            defaultValue={client?.name ?? ""}
            aria-invalid={Boolean(fieldErrors?.name)}
          />
          {fieldErrors?.name ? (
            <p className="text-sm text-red-600">{fieldErrors.name[0]}</p>
          ) : null}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="legal_name">Legal name</Label>
          <Input
            id="legal_name"
            name="legal_name"
            defaultValue={client?.legal_name ?? ""}
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="slug">Slug</Label>
          <Input
            id="slug"
            name="slug"
            defaultValue={client?.slug ?? ""}
            placeholder="auto-generated from name"
            aria-invalid={Boolean(fieldErrors?.slug)}
          />
          {fieldErrors?.slug ? (
            <p className="text-sm text-red-600">{fieldErrors.slug[0]}</p>
          ) : null}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="primary_email">Primary email</Label>
          <Input
            id="primary_email"
            name="primary_email"
            type="email"
            defaultValue={client?.primary_email ?? ""}
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="primary_phone">Primary phone</Label>
          <Input
            id="primary_phone"
            name="primary_phone"
            defaultValue={client?.primary_phone ?? ""}
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="website_url">Website</Label>
          <Input
            id="website_url"
            name="website_url"
            type="url"
            defaultValue={client?.website_url ?? ""}
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="timezone">Timezone</Label>
          <Input
            id="timezone"
            name="timezone"
            defaultValue={client?.timezone ?? "America/Edmonton"}
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="status">Status</Label>
          <Select id="status" name="status" defaultValue={client?.status ?? "prospect"}>
            {CLIENT_STATUSES.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </Select>
        </div>
      </div>

      <SubmitButton label={mode === "create" ? "Create client" : "Save changes"} />
    </form>
  );
}

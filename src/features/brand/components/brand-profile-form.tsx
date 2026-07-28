"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";

import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import type { ActionResult } from "@/lib/action-result";
import {
  setBrandStatusAction,
  upsertBrandProfileAction,
} from "../actions";
import type { BrandProfileRow } from "../queries";
import { brandStatuses, listToLines } from "../schemas";

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} aria-disabled={pending}>
      {pending ? "Saving…" : label}
    </Button>
  );
}

function StatusButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <Button
      type="submit"
      variant="secondary"
      disabled={pending}
      aria-disabled={pending}
    >
      {pending ? "Updating…" : label}
    </Button>
  );
}

interface BrandProfileFormProps {
  clientId: string;
  profile: BrandProfileRow | null;
  canManage: boolean;
  canApprove: boolean;
  defaultName: string;
}

export function BrandProfileForm({
  clientId,
  profile,
  canManage,
  canApprove,
  defaultName,
}: BrandProfileFormProps) {
  const [state, formAction] = useActionState<ActionResult<void> | null, FormData>(
    upsertBrandProfileAction,
    null,
  );
  const [statusState, statusAction] = useActionState<
    ActionResult<void> | null,
    FormData
  >(setBrandStatusAction, null);

  const fieldErrors = state && !state.ok ? state.fieldErrors : undefined;
  const formError = state && !state.ok ? state.error : undefined;
  const success = state && state.ok;

  if (!canManage) {
    return (
      <dl className="grid gap-4 text-sm sm:grid-cols-2">
        <div className="sm:col-span-2">
          <dt className="text-slate-500">Status</dt>
          <dd className="font-medium capitalize text-slate-900">
            {profile?.status ?? "—"}
          </dd>
        </div>
        <div className="sm:col-span-2">
          <dt className="text-slate-500">Summary</dt>
          <dd className="font-medium text-slate-900">
            {profile?.business_summary || "No brand profile yet."}
          </dd>
        </div>
        <div>
          <dt className="text-slate-500">Mission</dt>
          <dd className="font-medium text-slate-900">
            {profile?.mission_statement || "—"}
          </dd>
        </div>
        <div>
          <dt className="text-slate-500">Voice</dt>
          <dd className="font-medium text-slate-900">
            {profile?.brand_voice || "—"}
          </dd>
        </div>
      </dl>
    );
  }

  return (
    <div className="space-y-6">
      {profile ? (
        <div className="flex flex-wrap items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
          <p className="text-sm text-ink">
            Status:{" "}
            <span className="font-semibold capitalize">{profile.status}</span>
            {profile.approved_at
              ? ` · approved ${new Date(profile.approved_at).toLocaleDateString()}`
              : null}
          </p>
          <div className="flex flex-wrap gap-2">
            {profile.status === "draft" || profile.status === "archived" ? (
              <form action={statusAction}>
                <input type="hidden" name="clientId" value={clientId} />
                <input type="hidden" name="brandProfileId" value={profile.id} />
                <input type="hidden" name="status" value="review" />
                <StatusButton label="Submit for review" />
              </form>
            ) : null}
            {profile.status === "review" && canApprove ? (
              <form action={statusAction}>
                <input type="hidden" name="clientId" value={clientId} />
                <input type="hidden" name="brandProfileId" value={profile.id} />
                <input type="hidden" name="status" value="approved" />
                <StatusButton label="Approve brand" />
              </form>
            ) : null}
            {profile.status !== "draft" ? (
              <form action={statusAction}>
                <input type="hidden" name="clientId" value={clientId} />
                <input type="hidden" name="brandProfileId" value={profile.id} />
                <input type="hidden" name="status" value="draft" />
                <StatusButton label="Return to draft" />
              </form>
            ) : null}
          </div>
          {statusState && !statusState.ok ? (
            <p className="w-full text-sm text-red-600">{statusState.error}</p>
          ) : null}
        </div>
      ) : null}

      <form action={formAction} className="space-y-4" noValidate>
        <input type="hidden" name="clientId" value={clientId} />

        {formError ? <Alert variant="error">{formError}</Alert> : null}
        {success ? <Alert variant="success">Brand profile saved.</Alert> : null}

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="name">Brand name</Label>
            <Input
              id="name"
              name="name"
              required
              defaultValue={profile?.name ?? defaultName}
              aria-invalid={Boolean(fieldErrors?.name)}
            />
            {fieldErrors?.name ? (
              <p className="text-sm text-red-600">{fieldErrors.name[0]}</p>
            ) : null}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="status">Status</Label>
            <Select
              id="status"
              name="status"
              defaultValue={profile?.status ?? "draft"}
            >
              {brandStatuses.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="logo_url">Logo URL</Label>
            <Input
              id="logo_url"
              name="logo_url"
              type="url"
              placeholder="https://"
              defaultValue={profile?.logo_url ?? ""}
              aria-invalid={Boolean(fieldErrors?.logo_url)}
            />
            {fieldErrors?.logo_url ? (
              <p className="text-sm text-red-600">{fieldErrors.logo_url[0]}</p>
            ) : null}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="primary_colour">Primary colour</Label>
            <Input
              id="primary_colour"
              name="primary_colour"
              placeholder="#0A2F3D"
              defaultValue={profile?.primary_colour ?? ""}
              aria-invalid={Boolean(fieldErrors?.primary_colour)}
            />
            {fieldErrors?.primary_colour ? (
              <p className="text-sm text-red-600">{fieldErrors.primary_colour[0]}</p>
            ) : null}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="secondary_colour">Secondary colour</Label>
            <Input
              id="secondary_colour"
              name="secondary_colour"
              placeholder="#1FA6A0"
              defaultValue={profile?.secondary_colour ?? ""}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="accent_colour">Accent colour</Label>
            <Input
              id="accent_colour"
              name="accent_colour"
              placeholder="#7ED6C1"
              defaultValue={profile?.accent_colour ?? ""}
            />
          </div>
        </div>

        <TextAreaField
          id="business_summary"
          label="Business summary"
          defaultValue={profile?.business_summary ?? ""}
          rows={3}
        />
        <TextAreaField
          id="mission_statement"
          label="Mission statement"
          defaultValue={profile?.mission_statement ?? ""}
          rows={2}
        />
        <TextAreaField
          id="brand_voice"
          label="Brand voice"
          defaultValue={profile?.brand_voice ?? ""}
          rows={2}
        />

        <TextAreaField
          id="target_audience"
          label="Target audience (one per line)"
          defaultValue={listToLines(profile?.target_audience)}
          rows={3}
        />
        <TextAreaField
          id="unique_selling_points"
          label="Unique selling points (one per line)"
          defaultValue={listToLines(profile?.unique_selling_points)}
          rows={3}
        />
        <TextAreaField
          id="content_pillars"
          label="Content pillars (one per line)"
          defaultValue={listToLines(profile?.content_pillars)}
          rows={3}
        />
        <TextAreaField
          id="approved_claims"
          label="Approved claims (one per line)"
          defaultValue={listToLines(profile?.approved_claims)}
          rows={3}
        />
        <TextAreaField
          id="restricted_claims"
          label="Restricted claims (one per line)"
          defaultValue={listToLines(profile?.restricted_claims)}
          rows={3}
        />
        <TextAreaField
          id="approved_ctas"
          label="Approved CTAs (one per line)"
          defaultValue={listToLines(profile?.approved_ctas)}
          rows={3}
        />

        <SubmitButton label={profile ? "Save brand profile" : "Create brand profile"} />
      </form>
    </div>
  );
}

function TextAreaField({
  id,
  label,
  defaultValue,
  rows,
}: {
  id: string;
  label: string;
  defaultValue: string;
  rows: number;
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id}>{label}</Label>
      <textarea
        id={id}
        name={id}
        rows={rows}
        defaultValue={defaultValue}
        className="flex w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-ink shadow-sm placeholder:text-ink-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400"
      />
    </div>
  );
}

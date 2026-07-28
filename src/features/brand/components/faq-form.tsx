"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";

import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import type { ActionResult } from "@/lib/action-result";
import { deleteFaqAction, upsertFaqAction } from "../actions";
import type { ClientFaqRow } from "../queries";
import { faqStatuses } from "../schemas";

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

interface FaqFormProps {
  clientId: string;
  locations: LocationOption[];
  faq?: ClientFaqRow;
  canManage: boolean;
}

export function FaqForm({ clientId, locations, faq, canManage }: FaqFormProps) {
  const [state, formAction] = useActionState<ActionResult<void> | null, FormData>(
    upsertFaqAction,
    null,
  );
  const fieldErrors = state && !state.ok ? state.fieldErrors : undefined;
  const formError = state && !state.ok ? state.error : undefined;
  const success = state && state.ok;

  if (!canManage) return null;

  return (
    <form action={formAction} className="space-y-4" noValidate>
      <input type="hidden" name="clientId" value={clientId} />
      {faq ? <input type="hidden" name="faqId" value={faq.id} /> : null}

      {formError ? <Alert variant="error">{formError}</Alert> : null}
      {success ? (
        <Alert variant="success">{faq ? "FAQ updated." : "FAQ created."}</Alert>
      ) : null}

      <div className="space-y-1.5">
        <Label htmlFor={`question-${faq?.id ?? "new"}`}>Question</Label>
        <Input
          id={`question-${faq?.id ?? "new"}`}
          name="question"
          required
          defaultValue={faq?.question ?? ""}
          aria-invalid={Boolean(fieldErrors?.question)}
        />
        {fieldErrors?.question ? (
          <p className="text-sm text-red-600">{fieldErrors.question[0]}</p>
        ) : null}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor={`answer-${faq?.id ?? "new"}`}>Answer</Label>
        <textarea
          id={`answer-${faq?.id ?? "new"}`}
          name="answer"
          required
          rows={4}
          defaultValue={faq?.answer ?? ""}
          className="flex w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-ink shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400"
          aria-invalid={Boolean(fieldErrors?.answer)}
        />
        {fieldErrors?.answer ? (
          <p className="text-sm text-red-600">{fieldErrors.answer[0]}</p>
        ) : null}
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="space-y-1.5">
          <Label htmlFor={`category-${faq?.id ?? "new"}`}>Category</Label>
          <Input
            id={`category-${faq?.id ?? "new"}`}
            name="category"
            defaultValue={faq?.category ?? ""}
            placeholder="Fees, Tours, Subsidy…"
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor={`locationId-${faq?.id ?? "new"}`}>Location scope</Label>
          <Select
            id={`locationId-${faq?.id ?? "new"}`}
            name="locationId"
            defaultValue={faq?.location_id ?? ""}
          >
            <option value="">All locations</option>
            {locations.map((location) => (
              <option key={location.id} value={location.id}>
                {location.name}
              </option>
            ))}
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor={`status-${faq?.id ?? "new"}`}>Status</Label>
          <Select
            id={`status-${faq?.id ?? "new"}`}
            name="status"
            defaultValue={faq?.status ?? "draft"}
          >
            {faqStatuses.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </Select>
        </div>
      </div>

      <label className="flex items-center gap-2 text-sm text-ink">
        <input
          type="checkbox"
          name="is_ai_usable"
          defaultChecked={faq?.is_ai_usable ?? false}
          className="h-4 w-4 rounded border-slate-300"
        />
        Allow AI agents to use this answer (only when approved)
      </label>

      <SubmitButton label={faq ? "Update FAQ" : "Add FAQ"} />
    </form>
  );
}

interface FaqDeleteButtonProps {
  clientId: string;
  faqId: string;
}

export function FaqDeleteButton({ clientId, faqId }: FaqDeleteButtonProps) {
  const [state, formAction] = useActionState<ActionResult<void> | null, FormData>(
    deleteFaqAction,
    null,
  );

  return (
    <form action={formAction} className="inline">
      <input type="hidden" name="clientId" value={clientId} />
      <input type="hidden" name="faqId" value={faqId} />
      <DeleteButton />
      {state && !state.ok ? (
        <p className="mt-1 text-xs text-red-600">{state.error}</p>
      ) : null}
    </form>
  );
}

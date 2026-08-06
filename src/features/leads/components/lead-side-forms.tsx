"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";

import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import type { ActionResult } from "@/lib/action-result";
import { addLeadNoteAction, recordLeadConsentAction } from "../actions";
import { CONSENT_TYPES } from "../constants";

function PendingSubmit({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="gap-2">
      {pending ? (
        <>
          <Spinner label={label} />
          Saving…
        </>
      ) : (
        label
      )}
    </Button>
  );
}

export function AddLeadNoteForm({
  clientId,
  leadId,
}: {
  clientId: string;
  leadId: string;
}) {
  const [state, formAction] = useActionState<ActionResult<void> | null, FormData>(
    addLeadNoteAction,
    null,
  );
  const formError = state && !state.ok ? state.error : undefined;
  const saved = state?.ok === true;

  return (
    <form action={formAction} className="space-y-3">
      <input type="hidden" name="clientId" value={clientId} />
      <input type="hidden" name="leadId" value={leadId} />
      {formError ? <Alert variant="error">{formError}</Alert> : null}
      {saved ? <Alert variant="success">Note added.</Alert> : null}
      <div className="space-y-1.5">
        <Label htmlFor="note">Internal note</Label>
        <textarea
          id="note"
          name="note"
          rows={3}
          required
          className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 dark:border-slate-600 dark:bg-paper-elevated"
        />
      </div>
      <label className="flex items-center gap-2 text-sm text-ink-muted">
        <input type="checkbox" name="is_pinned" />
        Pin note
      </label>
      <PendingSubmit label="Add note" />
    </form>
  );
}

export function RecordLeadConsentForm({
  clientId,
  leadId,
}: {
  clientId: string;
  leadId: string;
}) {
  const [state, formAction] = useActionState<ActionResult<void> | null, FormData>(
    recordLeadConsentAction,
    null,
  );
  const formError = state && !state.ok ? state.error : undefined;
  const saved = state?.ok === true;

  return (
    <form action={formAction} className="space-y-3">
      <input type="hidden" name="clientId" value={clientId} />
      <input type="hidden" name="leadId" value={leadId} />
      {formError ? <Alert variant="error">{formError}</Alert> : null}
      {saved ? <Alert variant="success">Consent recorded.</Alert> : null}
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="consent_type">Consent type</Label>
          <select
            id="consent_type"
            name="consent_type"
            className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-600 dark:bg-paper-elevated"
            defaultValue="general_enquiry_follow_up"
          >
            {CONSENT_TYPES.map((type) => (
              <option key={type} value={type}>
                {type.replaceAll("_", " ")}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="status">Status</Label>
          <select
            id="status"
            name="status"
            className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-600 dark:bg-paper-elevated"
            defaultValue="granted"
          >
            <option value="granted">Granted</option>
            <option value="denied">Denied</option>
            <option value="withdrawn">Withdrawn</option>
          </select>
        </div>
      </div>
      <PendingSubmit label="Record consent" />
    </form>
  );
}

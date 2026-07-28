"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";

import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import type { ActionResult } from "@/lib/action-result";
import { saveMarketingGoalsAction } from "../actions";

function SaveButton({ disabled }: { disabled?: boolean }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={disabled || pending} aria-disabled={disabled || pending}>
      {pending ? (
        <>
          <Spinner label="Saving" className="mr-2" />
          Saving…
        </>
      ) : (
        "Save marketing goals"
      )}
    </Button>
  );
}

interface MarketingGoalsFormProps {
  clientId: string;
  initialGoals: string | null;
  canManage: boolean;
}

export function MarketingGoalsForm({
  clientId,
  initialGoals,
  canManage,
}: MarketingGoalsFormProps) {
  const [state, formAction] = useActionState<ActionResult<void> | null, FormData>(
    saveMarketingGoalsAction,
    null,
  );

  const fieldErrors = state && !state.ok ? state.fieldErrors : undefined;
  const formError = state && !state.ok ? state.error : undefined;
  const saved = state?.ok === true;

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="clientId" value={clientId} />

      {formError && !fieldErrors ? <Alert variant="error">{formError}</Alert> : null}
      {saved ? <Alert variant="success">Marketing goals saved.</Alert> : null}

      <div className="space-y-1.5">
        <Label htmlFor="marketing_goals">Marketing goals</Label>
        <textarea
          id="marketing_goals"
          name="marketing_goals"
          rows={5}
          defaultValue={initialGoals ?? ""}
          disabled={!canManage}
          placeholder="e.g. Fill infant rooms in Calgary; improve tour show-up rate; grow Google reviews."
          className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 disabled:bg-slate-50 disabled:text-ink-muted"
          aria-invalid={Boolean(fieldErrors?.marketing_goals)}
        />
        {fieldErrors?.marketing_goals ? (
          <p className="text-sm text-red-600">{fieldErrors.marketing_goals[0]}</p>
        ) : (
          <p className="text-xs text-ink-muted">
            Saving non-empty goals also marks the marketing goals checklist item complete.
          </p>
        )}
      </div>

      {canManage ? <SaveButton /> : null}
    </form>
  );
}

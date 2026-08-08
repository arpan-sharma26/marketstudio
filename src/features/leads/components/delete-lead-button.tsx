"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";

import { Spinner } from "@/components/ui/spinner";
import type { ActionResult } from "@/lib/action-result";
import { deleteLeadAction } from "../actions";

function TrashIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-4 w-4"
      aria-hidden="true"
    >
      <path d="M4 7h16" />
      <path d="M10 11v6" />
      <path d="M14 11v6" />
      <path d="M6 7l1 12a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-12" />
      <path d="M9 7V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2" />
    </svg>
  );
}

function DeleteSubmit({ leadName }: { leadName: string }) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      title={`Delete ${leadName}`}
      aria-label={`Delete ${leadName}`}
      className="inline-flex items-center justify-center rounded-md p-1.5 text-slate-400 transition-colors hover:bg-red-50 hover:text-red-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 disabled:pointer-events-none disabled:opacity-50 dark:hover:bg-red-950"
    >
      {pending ? <Spinner label="Deleting lead" /> : <TrashIcon />}
    </button>
  );
}

interface DeleteLeadButtonProps {
  clientId: string;
  leadId: string;
  leadName: string;
}

/** Row-level lead removal. Deleting cascades notes, activities, and consent records. */
export function DeleteLeadButton({
  clientId,
  leadId,
  leadName,
}: DeleteLeadButtonProps) {
  const [state, formAction] = useActionState<ActionResult<void> | null, FormData>(
    deleteLeadAction,
    null,
  );

  return (
    <form
      action={formAction}
      className="inline-flex flex-col items-end"
      onSubmit={(event) => {
        const confirmed = window.confirm(
          `Delete ${leadName}? This also removes their notes, activity, and consent history.`,
        );
        if (!confirmed) event.preventDefault();
      }}
    >
      <input type="hidden" name="clientId" value={clientId} />
      <input type="hidden" name="leadId" value={leadId} />
      <DeleteSubmit leadName={leadName} />
      {state && !state.ok ? (
        <p className="mt-1 text-xs text-red-600">{state.error}</p>
      ) : null}
    </form>
  );
}

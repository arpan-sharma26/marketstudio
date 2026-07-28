"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";

import { PendingNavLink } from "@/components/shared/pending-nav-link";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import type { ActionResult } from "@/lib/action-result";
import { cn } from "@/lib/utils";
import {
  completeClientOnboardingAction,
  reopenClientOnboardingAction,
  updateOnboardingTaskAction,
} from "../actions";
import type { OnboardingTaskStatus } from "../schemas";
import { DEFAULT_ONBOARDING_TASKS } from "../task-definitions";
import type { OnboardingProgress, OnboardingTaskRow } from "../queries";

function SubmitLabel({ idle, pending }: { idle: string; pending: string }) {
  const { pending: isPending } = useFormStatus();
  return (
    <>
      {isPending ? <Spinner label={pending} className="mr-1.5" /> : null}
      {isPending ? pending : idle}
    </>
  );
}

function TaskStatusForm({
  clientId,
  task,
  canManage,
}: {
  clientId: string;
  task: OnboardingTaskRow;
  canManage: boolean;
}) {
  const [state, formAction] = useActionState<ActionResult<void> | null, FormData>(
    updateOnboardingTaskAction,
    null,
  );
  const formError = state && !state.ok ? state.error : undefined;

  if (!canManage) {
    return (
      <span className="text-xs capitalize text-ink-muted">{task.status.replace("_", " ")}</span>
    );
  }

  return (
    <form action={formAction} className="space-y-2">
      <input type="hidden" name="clientId" value={clientId} />
      <input type="hidden" name="taskId" value={task.id} />
      {formError ? <Alert variant="error">{formError}</Alert> : null}
      <label className="sr-only" htmlFor={`notes-${task.id}`}>
        Notes for {task.title}
      </label>
      <textarea
        id={`notes-${task.id}`}
        name="notes"
        rows={2}
        defaultValue={task.notes ?? ""}
        placeholder="Optional notes"
        className="w-full rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600"
      />
      <div className="flex flex-wrap gap-2">
        {(
          [
            ["pending", "Pending"],
            ["in_progress", "In progress"],
            ["completed", "Complete"],
            ["skipped", "Skip"],
          ] as const satisfies ReadonlyArray<readonly [OnboardingTaskStatus, string]>
        ).map(([value, label]) => (
          <Button
            key={value}
            type="submit"
            name="status"
            value={value}
            variant={task.status === value ? "primary" : "secondary"}
            className="px-2.5 py-1 text-xs"
          >
            <SubmitLabel idle={label} pending="Saving…" />
          </Button>
        ))}
      </div>
    </form>
  );
}

interface OnboardingChecklistProps {
  clientId: string;
  tasks: OnboardingTaskRow[];
  progress: OnboardingProgress;
  onboardingStatus: string;
  canManage: boolean;
}

export function OnboardingChecklist({
  clientId,
  tasks,
  progress,
  onboardingStatus,
  canManage,
}: OnboardingChecklistProps) {
  const [completeState, completeAction] = useActionState<
    ActionResult<void> | null,
    FormData
  >(completeClientOnboardingAction, null);
  const [reopenState, reopenAction] = useActionState<
    ActionResult<void> | null,
    FormData
  >(reopenClientOnboardingAction, null);

  const definitionByKey = new Map(
    DEFAULT_ONBOARDING_TASKS.map((task) => [task.task_key, task]),
  );

  const completeError =
    completeState && !completeState.ok ? completeState.error : undefined;
  const reopenError = reopenState && !reopenState.ok ? reopenState.error : undefined;
  const completeOk = completeState?.ok === true;
  const reopenOk = reopenState?.ok === true;

  return (
    <div className="space-y-5">
      <div className="rounded-xl border border-slate-200 bg-brand-50/50 p-4">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-sm font-medium text-ink">
              {progress.percentComplete}% complete
            </p>
            <p className="text-xs text-ink-muted">
              {progress.requiredDone} of {progress.requiredTotal} required tasks done
            </p>
          </div>
          <span className="rounded-full bg-white px-2.5 py-1 text-xs font-medium capitalize text-brand-800 ring-1 ring-brand-100">
            {onboardingStatus.replaceAll("_", " ")}
          </span>
        </div>
        <div className="mt-3 h-2 overflow-hidden rounded-full bg-white">
          <div
            className="h-full rounded-full bg-brand-500 transition-all"
            style={{ width: `${progress.percentComplete}%` }}
            aria-hidden
          />
        </div>
      </div>

      <ul className="space-y-4">
        {tasks.map((task) => {
          const definition = definitionByKey.get(
            task.task_key as (typeof DEFAULT_ONBOARDING_TASKS)[number]["task_key"],
          );
          const href =
            definition?.hrefSuffix !== undefined
              ? `/clients/${clientId}${definition.hrefSuffix}`
              : null;
          const isDone = task.status === "completed" || task.status === "skipped";

          return (
            <li
              key={task.id}
              className={cn(
                "rounded-xl border border-slate-200 bg-white p-4",
                isDone && "opacity-90",
              )}
            >
              <div className="mb-3 flex flex-wrap items-start justify-between gap-2">
                <div>
                  <h3 className="text-sm font-semibold text-ink">{task.title}</h3>
                  {task.description ? (
                    <p className="mt-0.5 text-xs text-ink-muted">{task.description}</p>
                  ) : null}
                </div>
                <div className="flex items-center gap-2">
                  {task.is_required ? (
                    <span className="text-[10px] font-medium uppercase tracking-wide text-ink-soft">
                      Required
                    </span>
                  ) : null}
                  {href ? (
                    <PendingNavLink
                      href={href}
                      className="text-xs font-medium text-brand-700 hover:underline"
                    >
                      Open
                    </PendingNavLink>
                  ) : null}
                </div>
              </div>
              <TaskStatusForm clientId={clientId} task={task} canManage={canManage} />
            </li>
          );
        })}
      </ul>

      {canManage ? (
        <div className="space-y-3 border-t border-slate-200 pt-4">
          {completeError ? <Alert variant="error">{completeError}</Alert> : null}
          {reopenError ? <Alert variant="error">{reopenError}</Alert> : null}
          {completeOk ? (
            <Alert variant="success">Onboarding marked complete.</Alert>
          ) : null}
          {reopenOk ? <Alert variant="success">Onboarding reopened.</Alert> : null}

          {onboardingStatus === "completed" ? (
            <form action={reopenAction}>
              <input type="hidden" name="clientId" value={clientId} />
              <Button type="submit" variant="secondary">
                <SubmitLabel idle="Reopen onboarding" pending="Reopening…" />
              </Button>
            </form>
          ) : (
            <form action={completeAction}>
              <input type="hidden" name="clientId" value={clientId} />
              <Button type="submit" disabled={!progress.canComplete}>
                <SubmitLabel idle="Mark onboarding complete" pending="Completing…" />
              </Button>
              {!progress.canComplete ? (
                <p className="mt-2 text-xs text-ink-muted">
                  Complete or skip every required task to finish onboarding.
                </p>
              ) : null}
            </form>
          )}
        </div>
      ) : null}
    </div>
  );
}

"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";

import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import type { ActionResult } from "@/lib/action-result";
import { createLeadAction, updateLeadAction } from "../actions";
import {
  LEAD_PRIORITIES,
  LEAD_SOURCES,
  LEAD_STATUSES,
  type LeadPriority,
  type LeadSource,
  type LeadStatus,
} from "../constants";
import type { LeadRow } from "../queries";

function SubmitButton({ label }: { label: string }) {
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

interface LocationOption {
  id: string;
  name: string;
}

interface ProgramOption {
  id: string;
  name: string;
}

interface MemberOption {
  profile_id: string;
  label: string;
}

interface LeadFormProps {
  clientId: string;
  mode: "create" | "edit";
  lead?: LeadRow;
  locations: LocationOption[];
  programs: ProgramOption[];
  members: MemberOption[];
  canAssign: boolean;
}

export function LeadForm({
  clientId,
  mode,
  lead,
  locations,
  programs,
  members,
  canAssign,
}: LeadFormProps) {
  const action = mode === "create" ? createLeadAction : updateLeadAction;
  const [state, formAction] = useActionState<
    ActionResult<{ id: string } | void> | null,
    FormData
  >(action as never, null);

  const fieldErrors = state && !state.ok ? state.fieldErrors : undefined;
  const formError = state && !state.ok ? state.error : undefined;
  const saved = state?.ok === true && mode === "edit";

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="clientId" value={clientId} />
      {lead ? <input type="hidden" name="leadId" value={lead.id} /> : null}

      {formError ? <Alert variant="error">{formError}</Alert> : null}
      {saved ? <Alert variant="success">Lead saved.</Alert> : null}

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="first_name">First name</Label>
          <Input
            id="first_name"
            name="first_name"
            defaultValue={lead?.first_name ?? ""}
            aria-invalid={Boolean(fieldErrors?.first_name)}
          />
          {fieldErrors?.first_name ? (
            <p className="text-sm text-red-600">{fieldErrors.first_name[0]}</p>
          ) : null}
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="last_name">Last name</Label>
          <Input id="last_name" name="last_name" defaultValue={lead?.last_name ?? ""} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            defaultValue={lead?.email ?? ""}
            aria-invalid={Boolean(fieldErrors?.email)}
          />
          {fieldErrors?.email ? (
            <p className="text-sm text-red-600">{fieldErrors.email[0]}</p>
          ) : null}
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="phone">Phone</Label>
          <Input id="phone" name="phone" defaultValue={lead?.phone ?? ""} />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="locationId">Preferred location</Label>
          <Select id="locationId" name="locationId" defaultValue={lead?.location_id ?? ""}>
            <option value="">Unassigned</option>
            {locations.map((location) => (
              <option key={location.id} value={location.id}>
                {location.name}
              </option>
            ))}
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="programId">Program interest</Label>
          <Select id="programId" name="programId" defaultValue={lead?.program_id ?? ""}>
            <option value="">Not specified</option>
            {programs.map((program) => (
              <option key={program.id} value={program.id}>
                {program.name}
              </option>
            ))}
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="age_group">Age group</Label>
          <Input id="age_group" name="age_group" defaultValue={lead?.age_group ?? ""} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="child_age_months">Child age (months)</Label>
          <Input
            id="child_age_months"
            name="child_age_months"
            type="number"
            min={0}
            defaultValue={lead?.child_age_months ?? ""}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="desired_start_date">Desired start date</Label>
          <Input
            id="desired_start_date"
            name="desired_start_date"
            type="date"
            defaultValue={lead?.desired_start_date ?? ""}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="schedule_preference">Schedule</Label>
          <Select
            id="schedule_preference"
            name="schedule_preference"
            defaultValue={lead?.schedule_preference ?? ""}
          >
            <option value="">Unknown</option>
            <option value="full_time">Full time</option>
            <option value="part_time">Part time</option>
            <option value="flexible">Flexible</option>
            <option value="unknown">Unknown</option>
          </Select>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="lead_source">Source</Label>
          <Select
            id="lead_source"
            name="lead_source"
            defaultValue={(lead?.lead_source as LeadSource | undefined) ?? "manual"}
          >
            {LEAD_SOURCES.map((source) => (
              <option key={source} value={source}>
                {source.replaceAll("_", " ")}
              </option>
            ))}
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="preferred_contact_method">Preferred contact</Label>
          <Select
            id="preferred_contact_method"
            name="preferred_contact_method"
            defaultValue={lead?.preferred_contact_method ?? "any"}
          >
            <option value="any">Any</option>
            <option value="email">Email</option>
            <option value="phone">Phone</option>
            <option value="sms">SMS</option>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="status">Status</Label>
          <Select
            id="status"
            name="status"
            defaultValue={(lead?.status as LeadStatus | undefined) ?? "new"}
          >
            {LEAD_STATUSES.map((status) => (
              <option key={status} value={status}>
                {status.replaceAll("_", " ")}
              </option>
            ))}
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="priority">Priority</Label>
          <Select
            id="priority"
            name="priority"
            defaultValue={(lead?.priority as LeadPriority | undefined) ?? "normal"}
          >
            {LEAD_PRIORITIES.map((priority) => (
              <option key={priority} value={priority}>
                {priority}
              </option>
            ))}
          </Select>
        </div>
        {canAssign ? (
          <div className="space-y-1.5">
            <Label htmlFor="assignedTo">Assigned to</Label>
            <Select
              id="assignedTo"
              name="assignedTo"
              defaultValue={lead?.assigned_to ?? ""}
            >
              <option value="">Unassigned</option>
              {members.map((member) => (
                <option key={member.profile_id} value={member.profile_id}>
                  {member.label}
                </option>
              ))}
            </Select>
          </div>
        ) : null}
        {mode === "edit" ? (
          <div className="space-y-1.5">
            <Label htmlFor="next_action_at">Next action</Label>
            <Input
              id="next_action_at"
              name="next_action_at"
              type="datetime-local"
              defaultValue={
                lead?.next_action_at
                  ? new Date(lead.next_action_at).toISOString().slice(0, 16)
                  : ""
              }
            />
          </div>
        ) : null}
      </div>

      {mode === "create" ? (
        <div className="space-y-3 rounded-xl border border-slate-200 p-3 dark:border-slate-700">
          <div className="space-y-1.5">
            <Label htmlFor="consent_follow_up">Follow-up consent</Label>
            <Select id="consent_follow_up" name="consent_follow_up" defaultValue="">
              <option value="">Not captured</option>
              <option value="granted">Granted</option>
              <option value="denied">Denied</option>
            </Select>
          </div>
          <label className="flex items-center gap-2 text-sm text-ink-muted">
            <input type="checkbox" name="allowDuplicate" value="true" />
            Allow duplicate if email/phone already exists
          </label>
        </div>
      ) : null}

      <SubmitButton label={mode === "create" ? "Create lead" : "Save lead"} />
    </form>
  );
}

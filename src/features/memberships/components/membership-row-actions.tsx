"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";

import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import type { ActionResult } from "@/lib/action-result";
import { CLIENT_ROLES } from "@/types/roles";
import {
  setMembershipActiveAction,
  updateMembershipRoleAction,
} from "../actions";
import type { MembershipListItem } from "../queries";

function SmallSubmit({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" variant="secondary" disabled={pending} aria-disabled={pending}>
      {pending ? "…" : label}
    </Button>
  );
}

interface MembershipRowActionsProps {
  member: MembershipListItem;
}

export function MembershipRowActions({ member }: MembershipRowActionsProps) {
  const [roleState, roleAction] = useActionState<ActionResult<void> | null, FormData>(
    updateMembershipRoleAction,
    null,
  );
  const [activeState, activeAction] = useActionState<
    ActionResult<void> | null,
    FormData
  >(setMembershipActiveAction, null);

  return (
    <div className="flex flex-col items-end gap-2">
      <form action={roleAction} className="flex items-center gap-2">
        <input type="hidden" name="clientId" value={member.client_id} />
        <input type="hidden" name="membershipId" value={member.id} />
        <Select name="role" defaultValue={member.role} aria-label="Member role">
          {CLIENT_ROLES.map((role) => (
            <option key={role} value={role}>
              {role}
            </option>
          ))}
        </Select>
        <SmallSubmit label="Update role" />
      </form>

      <form action={activeAction}>
        <input type="hidden" name="clientId" value={member.client_id} />
        <input type="hidden" name="membershipId" value={member.id} />
        <input
          type="hidden"
          name="isActive"
          value={member.is_active ? "false" : "true"}
        />
        <SmallSubmit label={member.is_active ? "Deactivate" : "Activate"} />
      </form>

      {(roleState && !roleState.ok) || (activeState && !activeState.ok) ? (
        <p className="text-xs text-red-600">
          {(roleState && !roleState.ok && roleState.error) ||
            (activeState && !activeState.ok && activeState.error)}
        </p>
      ) : null}
    </div>
  );
}

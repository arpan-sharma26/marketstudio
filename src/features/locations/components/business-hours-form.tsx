"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";

import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { ActionResult } from "@/lib/action-result";
import { DAY_LABELS } from "@/types/clients";
import { saveBusinessHoursAction } from "../actions";
import type { BusinessHoursRow } from "../queries";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} aria-disabled={pending}>
      {pending ? "Saving…" : "Save operating hours"}
    </Button>
  );
}

function toHm(value: string | null): string {
  if (!value) return "";
  return value.slice(0, 5);
}

interface BusinessHoursFormProps {
  clientId: string;
  locationId: string;
  hours: BusinessHoursRow[];
}

export function BusinessHoursForm({
  clientId,
  locationId,
  hours,
}: BusinessHoursFormProps) {
  const [state, formAction] = useActionState<ActionResult<void> | null, FormData>(
    saveBusinessHoursAction,
    null,
  );

  const byDay = new Map(
    hours
      .filter((row) => row.hours_type === "operating")
      .map((row) => [row.day_of_week, row]),
  );

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="clientId" value={clientId} />
      <input type="hidden" name="locationId" value={locationId} />
      <input type="hidden" name="hours_type" value="operating" />

      {state && !state.ok ? <Alert variant="error">{state.error}</Alert> : null}
      {state && state.ok ? <Alert variant="success">Operating hours saved.</Alert> : null}

      <div className="overflow-x-auto rounded-lg border border-slate-200">
        <table className="min-w-full divide-y divide-slate-200 text-sm">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-3 py-2 text-left font-medium text-slate-600">Day</th>
              <th className="px-3 py-2 text-left font-medium text-slate-600">Closed</th>
              <th className="px-3 py-2 text-left font-medium text-slate-600">Open</th>
              <th className="px-3 py-2 text-left font-medium text-slate-600">Close</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            {DAY_LABELS.map((label, day) => {
              const row = byDay.get(day);
              const isClosed = row?.is_closed ?? day === 0;
              return (
                <tr key={label}>
                  <td className="px-3 py-2 font-medium text-slate-800">{label}</td>
                  <td className="px-3 py-2">
                    <input
                      type="checkbox"
                      name={`day_${day}_closed`}
                      defaultChecked={isClosed}
                      aria-label={`${label} closed`}
                    />
                  </td>
                  <td className="px-3 py-2">
                    <Input
                      type="time"
                      name={`day_${day}_open`}
                      defaultValue={toHm(row?.open_time ?? "07:30:00")}
                      className="w-32"
                    />
                  </td>
                  <td className="px-3 py-2">
                    <Input
                      type="time"
                      name={`day_${day}_close`}
                      defaultValue={toHm(row?.close_time ?? "18:00:00")}
                      className="w-32"
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <SubmitButton />
    </form>
  );
}

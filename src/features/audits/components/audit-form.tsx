"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { CityCombobox } from "@/features/audits/components/city-combobox";
import { CountryCombobox } from "@/features/audits/components/country-combobox";
import type { AuditInput } from "@/features/audits/types";

interface AuditFormProps {
  onSubmit: (input: AuditInput) => Promise<void>;
  loading: boolean;
}

const defaultValues: AuditInput = {
  businessName: "",
  country: "Canada",
  city: "",
  websiteUrl: "",
  gbpUrl: "",
  reviewCount: undefined,
  averageRating: undefined,
  notes: "",
};

const sampleDaycare: AuditInput = {
  businessName: "Blooming Steps Daycare",
  country: "Canada",
  city: "Calgary, AB",
  websiteUrl: "https://example-daycare.com",
  gbpUrl: "https://maps.google.com",
  reviewCount: 24,
  averageRating: 4.3,
  notes: "Enrollment push for September. Wants more tour bookings.",
};

export function AuditForm({ onSubmit, loading }: AuditFormProps) {
  const [form, setForm] = useState<AuditInput>(defaultValues);

  function updateField<K extends keyof AuditInput>(key: K, value: AuditInput[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    await onSubmit(form);
  }

  return (
    <form onSubmit={handleSubmit} className="card space-y-5 p-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-slate-900">Business details</h2>
        <button
          type="button"
          onClick={() => setForm(sampleDaycare)}
          className="text-xs font-semibold text-brand-700 hover:text-brand-800"
        >
          Load sample
        </button>
      </div>

      <Field label="Center name">
        <input
          required
          value={form.businessName}
          onChange={(e) => updateField("businessName", e.target.value)}
          className={inputClass}
          placeholder="Blooming Steps Daycare"
        />
      </Field>

      <Field label="Country">
        <CountryCombobox
          required
          disabled={loading}
          value={form.country}
          onChange={(country) => {
            setForm((current) => ({
              ...current,
              country,
              // Clear city when country changes so suggestions stay in sync.
              city: country === current.country ? current.city : "",
            }));
          }}
        />
      </Field>

      <Field label="City">
        <CityCombobox
          required
          disabled={loading}
          country={form.country}
          value={form.city}
          onChange={(city) => updateField("city", city)}
        />
      </Field>

      <Field label="Website URL">
        <input
          required
          type="url"
          value={form.websiteUrl}
          onChange={(e) => updateField("websiteUrl", e.target.value)}
          className={inputClass}
          placeholder="https://yourcenter.com"
        />
      </Field>

      <Field label="Google Business Profile URL">
        <input
          type="url"
          value={form.gbpUrl ?? ""}
          onChange={(e) => updateField("gbpUrl", e.target.value)}
          className={inputClass}
          placeholder="https://maps.google.com/..."
        />
      </Field>

      <div className="grid grid-cols-2 gap-4">
        <Field label="Review count">
          <input
            type="number"
            min={0}
            value={form.reviewCount ?? ""}
            onChange={(e) =>
              updateField(
                "reviewCount",
                e.target.value ? Number(e.target.value) : undefined,
              )
            }
            className={inputClass}
            placeholder="24"
          />
        </Field>
        <Field label="Average rating">
          <input
            type="number"
            min={0}
            max={5}
            step={0.1}
            value={form.averageRating ?? ""}
            onChange={(e) =>
              updateField(
                "averageRating",
                e.target.value ? Number(e.target.value) : undefined,
              )
            }
            className={inputClass}
            placeholder="4.5"
          />
        </Field>
      </div>

      <Field label="Notes">
        <textarea
          value={form.notes ?? ""}
          onChange={(e) => updateField("notes", e.target.value)}
          className={`${inputClass} min-h-[96px]`}
          placeholder="Enrollment goals, age groups, seasonal focus..."
        />
      </Field>

      <p className="text-xs text-ink-muted">
        Competitors are discovered automatically from the city and country — you do not need
        to enter them.
      </p>

      <div className="sticky bottom-0 -mx-6 mt-2 border-t border-slate-200/80 bg-white px-6 pb-1 pt-4">
        <Button
          type="submit"
          disabled={loading}
          className="w-full py-3 text-base"
          aria-disabled={loading}
        >
          {loading ? "Generating audit..." : "Generate AI audit"}
        </Button>
      </div>
    </form>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="relative block space-y-2">
      <span className="text-sm font-medium text-slate-700">{label}</span>
      {children}
    </div>
  );
}

const inputClass =
  "w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-100";

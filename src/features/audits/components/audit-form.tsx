"use client";

import { useState } from "react";

import type { AuditInput } from "@/features/audits/types";

interface AuditFormProps {
  onSubmit: (input: AuditInput) => Promise<void>;
  loading: boolean;
}

const defaultValues: AuditInput = {
  businessName: "",
  city: "",
  websiteUrl: "",
  gbpUrl: "",
  reviewCount: undefined,
  averageRating: undefined,
  competitors: "",
  notes: "",
};

const sampleDaycare: AuditInput = {
  businessName: "Sunshine Early Learning Center",
  city: "Calgary, AB",
  websiteUrl: "https://example-daycare.com",
  gbpUrl: "https://maps.google.com",
  reviewCount: 24,
  averageRating: 4.3,
  competitors: "Bright Beginnings Preschool, Little Sprouts Academy",
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
          className="text-xs font-medium text-brand-600 hover:text-brand-700"
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
          placeholder="Sunshine Early Learning Center"
        />
      </Field>

      <Field label="City">
        <input
          required
          value={form.city}
          onChange={(e) => updateField("city", e.target.value)}
          className={inputClass}
          placeholder="Calgary, AB"
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

      <Field label="Competitors">
        <input
          value={form.competitors ?? ""}
          onChange={(e) => updateField("competitors", e.target.value)}
          className={inputClass}
          placeholder="Competitor A, Competitor B"
        />
      </Field>

      <Field label="Notes">
        <textarea
          value={form.notes ?? ""}
          onChange={(e) => updateField("notes", e.target.value)}
          className={`${inputClass} min-h-[96px]`}
          placeholder="Enrollment goals, age groups, seasonal focus..."
        />
      </Field>

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-xl bg-brand-600 px-4 py-3 font-medium text-white transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading ? "Generating audit..." : "Generate AI audit"}
      </button>
    </form>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block space-y-2">
      <span className="text-sm font-medium text-slate-700">{label}</span>
      {children}
    </label>
  );
}

const inputClass =
  "w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-100";

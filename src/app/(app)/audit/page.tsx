"use client";

import { useState } from "react";

import { BRAND } from "@/config/brand";
import { AuditForm } from "@/features/audits/components/audit-form";
import { AuditResults } from "@/features/audits/components/audit-results";
import type { AuditInput, AuditResult, SavedAudit } from "@/features/audits/types";

export default function AuditPage() {
  const [result, setResult] = useState<AuditResult | null>(null);
  const [generatedAt, setGeneratedAt] = useState<string | null>(null);
  const [savedAudit, setSavedAudit] = useState<SavedAudit | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastInput, setLastInput] = useState<AuditInput | null>(null);

  async function handleSubmit(input: AuditInput) {
    setLoading(true);
    setError(null);
    setSavedAudit(null);

    try {
      const response = await fetch("/api/audit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });

      const data = await response.json();

      if (!response.ok) {
        const message =
          typeof data.error === "string"
            ? data.error
            : "Audit failed. Check your inputs and try again.";
        throw new Error(message);
      }

      setResult(data.result);
      setGeneratedAt(data.generatedAt);
      setLastInput(input);
      if (data.savedAudit) {
        setSavedAudit(data.savedAudit);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <p className="text-sm font-medium text-brand-600">Module 1</p>
        <h1 className="mt-1 text-3xl font-bold text-slate-900">AI Presence Audit</h1>
        <p className="mt-2 max-w-3xl text-slate-600">
          Enter a prospect&apos;s business details. {BRAND.name} generates a visibility
          score, top issues, quick wins, and a 30-day action plan — the same deliverable
          you use on sales calls and client onboarding.
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-[420px_1fr]">
        <AuditForm onSubmit={handleSubmit} loading={loading} />
        <div>
          {error && (
            <div className="mb-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
              {error}
            </div>
          )}
          {result && lastInput ? (
            <AuditResults
              result={result}
              input={lastInput}
              generatedAt={generatedAt}
              savedAudit={savedAudit}
            />
          ) : (
            <div className="card flex min-h-[420px] items-center justify-center p-8 text-center text-slate-500">
              {loading
                ? "Analyzing local presence..."
                : "Run an audit to see results here."}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

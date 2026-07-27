import { NextResponse } from "next/server";

import {
  buildAuditSystemPrompt,
  buildAuditUserPrompt,
  parseAuditResult,
} from "@/features/audits/prompts";
import { saveAudit } from "@/features/audits/queries";
import { auditInputSchema } from "@/features/audits/schemas";
import { generateAuditText } from "@/lib/ai/openai";
import { getAuthenticatedProfile } from "@/lib/auth";

export async function POST(request: Request) {
  // Authorization: the audit tool is an authenticated internal tool. Never expose it
  // (and the OpenAI/service-role usage behind it) to anonymous callers.
  const profile = await getAuthenticatedProfile();
  if (!profile) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  try {
    const body = await request.json();
    const parsed = auditInputSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.flatten().fieldErrors },
        { status: 400 },
      );
    }

    const input = {
      ...parsed.data,
      gbpUrl: parsed.data.gbpUrl || undefined,
    };

    const raw = await generateAuditText(
      buildAuditSystemPrompt(),
      buildAuditUserPrompt(input),
    );

    const result = parseAuditResult(raw);
    const generatedAt = new Date().toISOString();

    let savedAudit: { id: string; createdAt: string } | null = null;
    try {
      savedAudit = await saveAudit(input, result);
    } catch (saveError) {
      const message =
        saveError instanceof Error ? saveError.message : "Failed to save audit.";
      console.error(message);
      return NextResponse.json(
        { error: `${message} Run the Supabase migration if you have not yet.` },
        { status: 500 },
      );
    }

    return NextResponse.json({ result, generatedAt, savedAudit });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to generate audit.";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}

import "server-only";

import OpenAI from "openai";

import { getServerEnv } from "@/config/env";

let client: OpenAI | null = null;

function getOpenAIClient(): OpenAI {
  const { OPENAI_API_KEY } = getServerEnv();

  if (!OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY is not set. Add it to .env.local");
  }

  if (!client) {
    client = new OpenAI({ apiKey: OPENAI_API_KEY });
  }

  return client;
}

export async function generateAuditText(
  systemPrompt: string,
  userPrompt: string,
): Promise<string> {
  const openai = getOpenAIClient();
  const { OPENAI_MODEL } = getServerEnv();

  const response = await openai.chat.completions.create({
    model: OPENAI_MODEL ?? "gpt-4o-mini",
    temperature: 0.4,
    response_format: { type: "json_object" },
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
  });

  const content = response.choices[0]?.message?.content;

  if (!content) {
    throw new Error("OpenAI returned an empty response.");
  }

  return content;
}

/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { mode, prompt, json } = await req.json();
    const clientApiKey = req.headers.get("x-groq-api-key");
    const apiKey = clientApiKey || process.env.GROQ_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        {
          error:
            "Groq API Key tidak ditemukan. Silakan masukkan API Key Anda di panel settings AI.",
        },
        { status: 400 },
      );
    }

    let systemPrompt = "";
    let userContent = "";

    if (mode === "fix") {
      systemPrompt = `You are an expert Minecraft Dedicated Server config validator.
Fix the invalid JSON structure or syntax errors.
Return ONLY valid JSON. Keep the existing structure but fix syntax errors, missing brackets, trailing commas, or invalid quote types.
Do NOT wrap the output in markdown code blocks. Return ONLY the raw JSON string.
No explanation, no talk, just the raw JSON.`;
      userContent = `Please fix this JSON:\n\n${json}`;
    } else {
      systemPrompt = `You are an expert Minecraft Dedicated Server config generator.
Generate valid Minecraft Bedrock pack config JSON based on the user prompt.
Use the following format for world_behavior_packs.json / world_resource_packs.json (array of pack entries):
[
  {
    "pack_id": "UUID-v4-here",
    "version": [1, 0, 0]
  }
]
If the user specifies UUIDs or names, use them. If they want new/random entries, generate random UUID v4 values.
Return ONLY the raw JSON. Do NOT wrap in markdown code blocks. No explanation, no talk, just the raw JSON.`;
      userContent = prompt || "Generate a default world_behavior_packs.json";
    }

    const makeRequest = async (model: string) => {
      return fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model,
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userContent },
          ],
          temperature: 0.1,
        }),
      });
    };

    let response = await makeRequest("qwen-qwq-32b");

    if (!response.ok) {
      console.warn(
        `Primary model qwen-qwq-32b failed. Trying fallback llama-3.3-70b-versatile.`,
      );
      response = await makeRequest("llama-3.3-70b-versatile");
    }

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        errorData.error?.message || "Request to Groq API failed.",
      );
    }

    const data = await response.json();
    let result = data.choices[0]?.message?.content || "";

    // Clean response of any codeblock formatting
    result = cleanJsonOutput(result);

    return NextResponse.json({ result });
  } catch (err: any) {
    console.error("API Router Error:", err);
    return NextResponse.json(
      { error: err.message || "Internal Server Error" },
      { status: 500 },
    );
  }
}

function cleanJsonOutput(text: string): string {
  let cleaned = text.trim();
  if (cleaned.startsWith("```json")) {
    cleaned = cleaned.substring(7);
  } else if (cleaned.startsWith("```")) {
    cleaned = cleaned.substring(3);
  }
  if (cleaned.endsWith("```")) {
    cleaned = cleaned.substring(0, cleaned.length - 3);
  }
  return cleaned.trim();
}

// utils/generateContent.ts

export interface GenerateContentParams {
  inputBrief: string;
  tone: string;
  genre: string;
  contentLength: number;
  includeKeywords: boolean;
  keywords?: string;
  targetAudience: string;
}

export interface ContentData {
  output: string;
  reasoning: string;
}

export async function generateContent(
  params: GenerateContentParams
): Promise<ContentData> {
  const {
    inputBrief,
    tone,
    genre,
    contentLength,
    includeKeywords,
    keywords = "",
    targetAudience,
  } = params;

  console.log("[CONTENT-GENERATOR] Generating content with parameters:", params);

  // Build the system message instructing the model how to respond.
  const systemMessage = `
You are an AI content generator. Produce text with the specified tone, genre, audience, 
and approximate word count. If 'includeKeywords' is true, weave in those keywords naturally.
Return JSON in the format:
{
  "output": "...",
  "reasoning": "..."
}

Constraints:
- Use the parameters provided.
`;

  // Build the user message from the input values.
  const userMessage = `
User's Content Request
----------------------
Brief: "${inputBrief}"

Tone: ${tone}
Genre: ${genre}
Target Audience: ${targetAudience}
Desired Length: ~${contentLength} words

Include Keywords: ${includeKeywords ? "Yes" : "No"}
Keywords: ${keywords}
`;

  // Call the external API (OpenRouter)
  const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      // WARNING: Calling this from the client exposes your API key.
      Authorization: `Bearer ${process.env.NEXT_PUBLIC_OPENROUTER_API_KEY ?? ""}`,
    },
    body: JSON.stringify({
      model: "google/gemini-2.0-flash-thinking-exp:free",
      messages: [
        { role: "system", content: systemMessage },
        { role: "user", content: userMessage },
      ],
    }),
  });

  if (!res.ok) {
    throw new Error(`OpenRouter API error: ${res.statusText}`);
  }

  const data = await res.json();
  const rawText = data?.choices?.[0]?.message?.content || "";

  let output = rawText.trim();
  let reasoning = "";

  try {
    const parsed = JSON.parse(output);
    output = parsed.output || "";
    reasoning = parsed.reasoning || "";
  } catch (e) {
    console.warn("[CONTENT-GENERATOR] Could not parse JSON; returning raw text in 'output'.");
  }

  return { output, reasoning };
}

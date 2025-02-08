import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    console.log("[CONTENT-GENERATOR] Incoming request...");
    const {
      inputBrief,
      tone,
      genre,
      contentLength,
      includeKeywords,
      keywords = "",
      targetAudience,
    } = await req.json() as {
      inputBrief: string;
      tone: string;
      genre: string;
      contentLength: number;
      includeKeywords: boolean;
      keywords?: string;
      targetAudience: string;
    };

    console.log("[CONTENT-GENERATOR] Parsed body:", {
      inputBrief,
      tone,
      genre,
      contentLength,
      includeKeywords,
      keywords,
      targetAudience,
    });

    // Now we instruct the model to return "output" + "reasoning"
    const systemMessage = `
You are an AI content generator. Produce text with the specified tone, genre, audience, 
and approximate word count. If 'includeKeywords' is true, weave in those keywords naturally.
Return JSON in the format:
{
  "output": "...",
  "reasoning": "..."
}
`;

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

    console.log("[CONTENT-GENERATOR] Calling OpenRouter with model=openai/gpt-4o-mini...");
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENROUTER_API_KEY ?? ""}`,
      },
      body: JSON.stringify({
        model: "openai/gpt-4o-mini",
        messages: [
          { role: "system", content: systemMessage },
          { role: "user", content: userMessage },
        ],
      }),
    });

    if (!response.ok) {
      console.error("[CONTENT-GENERATOR] OpenRouter responded with error status:", response.status, response.statusText);
      throw new Error(`OpenRouter API error: ${response.statusText}`);
    }

    const data = await response.json();
    console.log("[CONTENT-GENERATOR] OpenRouter response data:", data);

    const rawText = data?.choices?.[0]?.message?.content || "";

    let output = rawText.trim();
    let reasoning = "";

    // Try to parse { output, reasoning }
    try {
      const parsed = JSON.parse(output);
      output = parsed.output || "";
      reasoning = parsed.reasoning || "";
    } catch {
      console.warn("[CONTENT-GENERATOR] Could not parse JSON; returning raw text in 'output'.");
    }

    return NextResponse.json({ output, reasoning });
  } catch (error: any) {
    console.error("[CONTENT-GENERATOR] Caught error:", error);
    return NextResponse.json(
      { error: error.message || "Something went wrong" },
      { status: 500 }
    );
  }
}

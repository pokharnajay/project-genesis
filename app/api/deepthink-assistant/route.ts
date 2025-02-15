import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    console.log("[DEEPTHINK-ASSISTANT] Incoming request...");
    const {
      task,
      inputText,
      files = [],
      detailLevel = 50,
      useExamples = false,
      language = "english",
    } = await req.json() as {
      task: string;
      inputText: string;
      files?: { name: string; content: string }[];
      detailLevel?: number;
      useExamples?: boolean;
      language?: string;
    };

    console.log("[DEEPTHINK-ASSISTANT] Parsed body:", {
      task,
      inputText,
      filesCount: files.length,
      detailLevel,
      useExamples,
      language,
    });

    const fileContext = files
      .map((file) => `---\nFile: ${file.name}\n${file.content}\n`)
      .join("\n");

    // We want "output" + "reasoning"
    const systemMessage = `
You are a multifaceted assistant providing in-depth thinking for tasks such as Summarize, Brainstorm, Outline, Analyze, or Research.
Respond in ${language}.
Detail level: ${detailLevel}%
Include examples if useExamples is true.
Return JSON in the format:
{
  "output": "...",
  "reasoning": "..."
}`;

    const userMessage = `
Task: ${task}
---
Main Text:
${inputText}

Knowledge Base (if any):
${fileContext}
 
Detail Level: ${detailLevel}%
Include Examples: ${useExamples ? "Yes" : "No"}
Language: ${language}
`;

    console.log("[DEEPTHINK-ASSISTANT] Calling OpenRouter with model=google/gemini-2.0-flash-thinking-exp:free...");
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
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

    if (!response.ok) {
      console.error("[DEEPTHINK-ASSISTANT] OpenRouter responded with error:", response.status, response.statusText);
      throw new Error(`OpenRouter API error: ${response.statusText}`);
    }

    const data = await response.json();
    console.log("[DEEPTHINK-ASSISTANT] OpenRouter response data:", data);

    const rawText = data?.choices?.[0]?.message?.content || "";

    // We'll attempt to parse JSON { output, reasoning }
    let output = rawText.trim();
    let reasoning = "";

    try {
      const parsed = JSON.parse(output);
      output = parsed.output || "";
      reasoning = parsed.reasoning || "";
    } catch {
      console.warn("[DEEPTHINK-ASSISTANT] Could not parse JSON; returning raw text as 'output'.");
    }

    return NextResponse.json({ output, reasoning });
  } catch (error: any) {
    console.error("[DEEPTHINK-ASSISTANT] Caught error:", error);
    return NextResponse.json(
      { error: error.message || "Something went wrong" },
      { status: 500 }
    );
  }
}

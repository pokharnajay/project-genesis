import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    console.log("[PROBLEM-SOLVER] Incoming request...");

    const body = await req.json();
    const {
      problemType = "math",
      conversationContext = "",
      question = "",
      errorInput = "",
      // files, // if you want them, you can parse them
    } = body;

    console.log("[PROBLEM-SOLVER] Parsed body:", {
      problemType,
      question,
      errorInput,
      conversationContextSample: conversationContext.slice(0, 60) + "...",
      // filesCount: files?.length
    });

    // We instruct the AI: return JSON in { solution, reasoning }.
    // If user says "math," do step-by-step logic. If "coding," do debugging steps, etc.
    const systemMessage = `
You are a problem solver that can handle both math and coding issues.
Return JSON in the format:
{
  "solution": "...",
  "reasoning": "..."
}
- If it's math, show step-by-step logic + final answer.
- If it's coding, provide debugging steps & a final solution.
`;

    // The user message includes: last conversation context, problem type, new question,
    // plus any errorInput if coding.
    const userMessage = `
Conversation so far (last 5):
${conversationContext}

Problem type: ${problemType}
New user question: "${question}"

Error or extra info (if coding): "${errorInput}"
`;

    console.log("[PROBLEM-SOLVER] Calling OpenRouter with model=google/gemini-2.0-flash-thinking-exp:free...");
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
      console.error("[PROBLEM-SOLVER] OpenRouter responded with error:", response.status, response.statusText);
      throw new Error(`OpenRouter API error: ${response.statusText}`);
    }

    const data = await response.json();
    console.log("[PROBLEM-SOLVER] OpenRouter response data:", data);

    const rawText = data?.choices?.[0]?.message?.content || "";

    let solution = rawText.trim();
    let reasoning = "";

    // Attempt to parse JSON
    try {
      const parsed = JSON.parse(solution);
      solution = parsed.solution || "";
      reasoning = parsed.reasoning || "";
    } catch {
      console.warn("[PROBLEM-SOLVER] Could not parse JSON; returning raw text as 'solution'.");
    }

    return NextResponse.json({ solution, reasoning });
  } catch (error: any) {
    console.error("[PROBLEM-SOLVER] Caught error:", error);
    return NextResponse.json(
      { error: error.message || "Something went wrong" },
      { status: 500 }
    );
  }
}

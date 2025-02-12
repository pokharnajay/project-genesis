import { NextRequest, NextResponse } from "next/server";

/**
 * Very rough approximation of token count:
 * ~1 token per 4 characters (including spaces & punctuation).
 */
function approximateTokenCount(text: string): number {
  return Math.ceil(text.length / 4);
}

export async function POST(req: NextRequest) {
  try {
    console.log("[QA-CHATBOT] Incoming request...");

    // Pull out question, files, and conversationContext
    const body = await req.json();
    const question = body.question as string;
    const files = (body.files as { name: string; content: string }[]) ?? [];
    const conversationContext = (body.conversationContext as string) ?? "";

    console.log("[QA-CHATBOT] Parsed request body:", {
      question,
      filesCount: files.length,
      conversationContext: conversationContext.slice(0, 80) + "...",
    });

    // 1. Check file sizes (80k token limit)
    for (const file of files) {
      const tokenCount = approximateTokenCount(file.content);
      console.log(
        `[QA-CHATBOT] File "${file.name}" has ~${tokenCount} tokens (limit 80000).`
      );
      if (tokenCount > 80000) {
        const errMsg = `File "${file.name}" is too large (~${tokenCount} tokens). Please remove it and try again.`;
        console.warn("[QA-CHATBOT] " + errMsg);
        // Return an error to the client
        return NextResponse.json({ error: errMsg }, { status: 400 });
      }
    }

    // 2. Build knowledge base from the allowed files
    const knowledgeBase = files
      .map((file) => `---\nFile: ${file.name}\n${file.content}\n`)
      .join("\n");

    // 3. Construct system & user messages
    const systemMessage = `
You are a helpful Q&A assistant. The user will provide a conversation so far, plus a new question, and optional knowledge-base files.
Use the conversation context and knowledge base to answer as accurately as possible. Provide a short chain-of-thought (as "reasoning").
Return JSON in the format:
{
  "answer": "...",
  "reasoning": "..."
}`;

    const userMessage = `
Conversation so far:
${conversationContext}

New user question: "${question}"

Knowledge Base (if any):
${knowledgeBase}
`;

    console.log("[QA-CHATBOT] Calling OpenRouter with model=openai/gpt-4o-mini...");
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.NEXT_PUBLIC_OPENROUTER_API_KEY ?? ""}`,
      },
      body: JSON.stringify({
        // If you want deepseek, use "deepseek/deepseek-r1:free" instead
        model: "openai/gpt-4o-mini",
        messages: [
          { role: "system", content: systemMessage },
          { role: "user", content: userMessage },
        ],
      }),
    });

    if (!response.ok) {
      console.error(
        "[QA-CHATBOT] OpenRouter responded with error status:",
        response.status,
        response.statusText
      );
      throw new Error(`OpenRouter API error: ${response.statusText}`);
    }

    const data = await response.json();
    console.log("[QA-CHATBOT] OpenRouter response data:", data.choices[0]);

    const rawText = data?.choices?.[0]?.message?.content || "";
    let answer = rawText.trim();
    let reasoning = "";

    try {
      // Attempt to parse JSON from the model's text
      const parsed = JSON.parse(answer);
      answer = parsed.answer || "";
      reasoning = parsed.reasoning || "";
    } catch (parseErr) {
      console.warn(
        "[QA-CHATBOT] Could not parse JSON from model; returning raw text."
      );
    }

    return NextResponse.json({ answer, reasoning });
  } catch (error: any) {
    console.error("[QA-CHATBOT] Caught error:", error);
    return NextResponse.json(
      { error: error.message || "Something went wrong" },
      { status: 500 }
    );
  }
}

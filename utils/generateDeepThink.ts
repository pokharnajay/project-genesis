export interface FileData {
  name: string;
  content: string;
}

export interface GenerateDeepThinkParams {
  task: string;
  inputText: string;
  files?: FileData[];
  detailLevel?: number;
  useExamples?: boolean;
  language?: string;
}

export interface DeepThinkData {
  output: string;
  reasoning: string;
}

export async function generateDeepThink(
  params: GenerateDeepThinkParams
): Promise<DeepThinkData> {
  const {
    task,
    inputText,
    files = [],
    detailLevel = 50,
    useExamples = false,
    language = "english",
  } = params;

  console.log("[DEEPTHINK-ASSISTANT] Generating deep think with parameters:", {
    task,
    inputText,
    filesCount: files.length,
    detailLevel,
    useExamples,
    language,
  });

  // Create file context from the knowledge base files.
  const fileContext = files
    .map((file) => `---\nFile: ${file.name}\n${file.content}\n`)
    .join("\n");

  // Build the system message.
  const systemMessage = `
You are a multifaceted assistant providing in-depth thinking for tasks such as Summarize, Brainstorm, Outline, Analyze, or Research.
Respond in ${language}.
Detail level: ${detailLevel}%
Include examples if useExamples is true.
Return JSON in the format:
{
  "output": "...",
  "reasoning": "..."
}
`;

  // Build the user message.
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

  // Call the external API (OpenRouter)
  const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      // WARNING: Exposing your API key on the client is not recommended.
      Authorization: `Bearer ${process.env.NEXT_PUBLIC_OPENROUTER_API_KEY ?? ""}`,
    },
    body: JSON.stringify({
      model: "openai/gpt-4o-mini",
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
  console.log("[DEEPTHINK-ASSISTANT] OpenRouter response data:", data);

  let rawText = data?.choices?.[0]?.message?.content || "";
  let output = rawText.trim();
  let reasoning = "";

  // Remove triple backticks (if present) from the raw text
  if (output.startsWith("```")) {
    const firstNewLine = output.indexOf("\n");
    const lastFence = output.lastIndexOf("```");
    if (firstNewLine !== -1 && lastFence !== -1) {
      output = output.slice(firstNewLine, lastFence).trim();
    }
  }

  try {
    const parsed = JSON.parse(output);
    output = parsed.output || "";
    reasoning = parsed.reasoning || "";
  } catch {
    console.warn(
      "[DEEPTHINK-ASSISTANT] Could not parse JSON; returning raw text as 'output'."
    );
  }

  return { output, reasoning };
}

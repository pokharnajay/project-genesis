"use client";

import { useState, useEffect, useRef } from "react";
import ReactMarkdown from "react-markdown";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  // CardFooter, // commented out in your version
} from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
// import { Input } from "@/components/ui/input";  // We'll comment out file upload
import { X, Upload, Code, Calculator, User, Bot } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { ThoughtProcessBox } from "@/components/thought-process-box";
// We won't actually use ScrollArea since we want no scrollbar
// import { ScrollArea } from "@/components/ui/scroll-area";

/**
 * Chat message type for local state
 */
interface ChatMessage {
  type: "user" | "ai";
  content: string;
}

/**
 * (Optional) If you want to keep the old file logic, define this helper
 */
// function readFileAsText(file: File): Promise<string> {
//   return new Promise((resolve, reject) => {
//     const reader = new FileReader();
//     reader.onload = (e) => {
//       resolve(e.target?.result as string);
//     };
//     reader.onerror = (err) => reject(err);
//     reader.readAsText(file);
//   });
// }

function trimTo30Words(text: string): string {
  const words = text.split(/\s+/);
  return words.length > 30 ? words.slice(0, 30).join(" ") + " ..." : text;
}

export default function ProblemSolver() {
  // Chat messages (both user + AI)
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  // We'll store the final "Solution" text in a separate state
  const [solution, setSolution] = useState("");

  // Additional inputs
  const [input, setInput] = useState(""); // main user input
  const [errorInput, setErrorInput] = useState(""); // coding error input

  // Problem type: "math" or "coding"
  const [problemType, setProblemType] = useState<"math" | "coding">("math");

  // *** We are commenting out file logic (not removing) ***
  // const [files, setFiles] = useState<File[]>([]);
  // function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
  //   if (e.target.files) {
  //     const newFiles = Array.from(e.target.files);
  //     setFiles((prev) => [...prev, ...newFiles]);
  //   }
  // }
  // function removeFile(index: number) {
  //   setFiles((f) => f.filter((_, i) => i !== index));
  // }

  // Loading state
  const [loading, setLoading] = useState(false);

  // Thought process box states
  const [reasoningMessages, setReasoningMessages] = useState<string[]>([]);
  const [isMinimized, setIsMinimized] = useState(false);

  // We'll use a ref for the chat container to auto-scroll
  const chatContainerRef = useRef<HTMLDivElement>(null);

  /**
   * Whenever we switch from math <-> coding, we clear the entire chat + solution.
   */
  useEffect(() => {
    setMessages([]);
    setSolution("");
    setErrorInput("");
    setInput("");
  }, [problemType]);

  /**
   * Build conversation context from the last 5 messages
   */
  function buildConversationContext() {
    // We'll take only the last 5 messages for brevity
    const last5 = messages.slice(-5);
    // Convert each to "User: ... or AI: ..."
    return last5
      .map((msg) => (msg.type === "user" ? `User: ${msg.content}` : `AI: ${msg.content}`))
      .join("\n");
  }

  /**
   * Auto-scroll to bottom whenever 'messages' changes
   */
  useEffect(() => {
    if (!chatContainerRef.current) return;
    chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
  }, [messages]);

  /**
   * Handle form submission
   */
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim()) return;

    setSolution("");
    setLoading(true);

    // 1. Add user message to local chat
    setMessages((prev) => [...prev, { type: "user", content: input }]);

    try {
      // 2. Build conversation context
      const conversationContext = buildConversationContext();

      // 3. Post to /api/problem-solver
      console.log("[PROBLEM-SOLVER] Posting with conversationContext + new question");

      const res = await fetch("/api/problem-solver", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          problemType,
          conversationContext,
          question: input,
          errorInput,
          // files: fileData, // commented out
        }),
      });

      const data = await res.json();
      console.log("[PROBLEM-SOLVER] Response from server:", data);

      if (data.error) {
        setSolution(`Error: ${data.error}`);
        // Also add AI message with error
        setMessages((prev) => [...prev, { type: "ai", content: `Error: ${data.error}` }]);
      } else {
        // If there's reasoning, add it to the box
        if (data.reasoning) {
          const trimmedReasoning = trimTo30Words(data.reasoning);
          setReasoningMessages((prev) => [...prev, trimmedReasoning]);
          setIsMinimized(false); // auto expand
        }

        // We'll store the final solution in "solution" state,
        // and also in the chat as an AI message
        const finalSolution = data.solution ? data.solution : "";
        setSolution(finalSolution);
        setMessages((prev) => [...prev, { type: "ai", content: finalSolution }]);
      }
    } catch (err: any) {
      console.error("[PROBLEM-SOLVER] Client error:", err);
      setSolution(`Error: ${String(err)}`);
      setMessages((prev) => [
        ...prev,
        { type: "ai", content: `Error: ${String(err)}` },
      ]);
    } finally {
      setLoading(false);
      setInput("");
    }
  }

  return (
    <div className="container mx-auto p-4 max-w-6xl">
      {/* ThoughtProcessBox for chain-of-thought */}
      <ThoughtProcessBox
        reasoningMessages={reasoningMessages}
        isMinimized={isMinimized}
        setIsMinimized={setIsMinimized}
      />

      <div className="max-w-6xl mx-auto">
        <motion.h1
          className="text-4xl font-bold mb-8 text-center gradient-text"
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          AI Problem Solver
        </motion.h1>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card className="w-full mb-8 hover-lift hover-glow">
            <CardHeader>
              <CardTitle className="text-2xl font-bold flex items-center">
                <span className="mr-2">Solve Complex Problems</span>
                {problemType === "math" ? (
                  <Calculator className="w-6 h-6 text-blue-500" />
                ) : (
                  <Code className="w-6 h-6 text-green-500" />
                )}
              </CardTitle>
              <CardDescription>Chat-like interface for math or coding.</CardDescription>
            </CardHeader>

            <CardContent>
              {/* Problem Type Toggle */}
              <div className="flex items-center justify-center space-x-2 mb-4">
                <Label
                  htmlFor="problem-type"
                  className={problemType === "math" ? "text-blue-500" : "text-muted-foreground"}
                >
                  Math
                </Label>
                <Switch
                  id="problem-type"
                  checked={problemType === "coding"}
                  onCheckedChange={(checked) => setProblemType(checked ? "coding" : "math")}
                />
                <Label
                  htmlFor="problem-type"
                  className={problemType === "coding" ? "text-green-500" : "text-muted-foreground"}
                >
                  Coding
                </Label>
              </div>

              {/* Chat area (no scroll bar, auto scroll to bottom) */}
              <div
                ref={chatContainerRef}
                className="border rounded-md p-4 mb-4 h-[400px] overflow-auto hide-scrollbar"
              >
                <AnimatePresence>
                  {messages.map((msg, index) => {
                    const isUser = msg.type === "user";

                    // If you want to show code fences:
                    const forcedCode = `\`\`\`js\n${msg.content}\n\`\`\``;

                    return (
                      <motion.div
                        key={index}
                        className={`mb-4 flex ${isUser ? "justify-end" : "justify-start"}`}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                      >
                        <div
                          className={`rounded-lg p-3 w-[70%] flex items-start ${
                            isUser
                              ? "bg-primary text-primary-foreground"
                              : "bg-muted text-muted-foreground"
                          }`}
                        >
                          {isUser ? (
                            <User className="inline-block w-4 h-4 mr-2 mt-1" />
                          ) : (
                            <Bot className="inline-block w-4 h-4 mr-2 mt-1" />
                          )}

                          {/* 2) Render 'forcedCode' instead of 'msg.content' */}
                          <ReactMarkdown
                            className="prose prose-sm break-words whitespace-pre-wrap"
                            components={{
                              code({ node, inline, className, children, ...props }) {
                                if (inline) {
                                  // Inline code: just wrap normally
                                  return (
                                    <code className="break-words whitespace-pre-wrap" {...props}>
                                      {children}
                                    </code>
                                  );
                                }
                                // Block code
                                return (
                                  <pre className="break-words whitespace-pre-wrap">
                                    <code className={className} {...props}>
                                      {children}
                                    </code>
                                  </pre>
                                );
                              },
                            }}
                          >
                            {forcedCode}
                          </ReactMarkdown>
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>

              {/* Form for new question */}
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="problem-input">New Question / Task</Label>
                  <Textarea
                    id="problem-input"
                    placeholder={`Ask a ${problemType} problem here...`}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    className="min-h-[300px]"
                    required
                  />
                </div>

                {problemType === "coding" && (
                  <div className="space-y-2">
                    <Label htmlFor="error-input">Error Messages / Console Output</Label>
                    <Textarea
                      id="error-input"
                      placeholder="Any error messages or extra details about your coding problem..."
                      value={errorInput}
                      onChange={(e) => setErrorInput(e.target.value)}
                      className="min-h-[100px]"
                    />
                  </div>
                )}

                {/* 
                  File Upload logic is commented out:
                  <div className="space-y-2">
                    <Label htmlFor="file-upload">Upload Code Files</Label>
                    <div className="flex items-center space-x-2">
                      <Input
                        id="file-upload"
                        type="file"
                        onChange={handleFileChange}
                        multiple
                        className="hidden"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => document.getElementById("file-upload")?.click()}
                      >
                        <Upload className="w-4 h-4 mr-2" />
                        Choose Files
                      </Button>
                    </div>
                    <AnimatePresence>
                      {files.length > 0 && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          className="bg-muted p-4 rounded-md"
                        >
                          <h4 className="font-semibold mb-2">Uploaded Files:</h4>
                          <ul className="space-y-2">
                            {files.map((file, index) => (
                              <motion.li
                                key={index}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                                transition={{ duration: 0.3 }}
                                className="flex items-center justify-between"
                              >
                                <span>{file.name}</span>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => removeFile(index)}
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              </motion.li>
                            ))}
                          </ul>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                */}

                <Button
                  type="submit"
                  className="w-full hover-scale"
                  disabled={loading}
                >
                  {loading ? "Thinking..." : "Submit"}
                </Button>
              </form>
            </CardContent>

            {/* <CardFooter>
              <div className="w-full">
                <h3 className="text-lg font-semibold mb-2">Current Solution:</h3>
                <ReactMarkdown className="prose prose-sm sm:prose lg:prose-lg min-h-[100px] whitespace-pre-wrap border border-gray-200 p-2 hide-scrollbar overflow-auto">
                  {solution}
                </ReactMarkdown>
              </div>
            </CardFooter> */}
          </Card>
        </motion.div>
      </div>
    </div>
  );
}

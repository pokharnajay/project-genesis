"use client";

import { useState } from "react";
import ReactMarkdown from "react-markdown"; // optional if you want MD
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { motion, AnimatePresence } from "framer-motion";
import { ThoughtProcessBox } from "@/components/thought-process-box";
import { Label } from "@/components/ui/label";
import { Upload, X, Send, Bot, User } from "lucide-react";
import { Typewriter } from 'react-simple-typewriter';

/**
 * Helper: read file as text on client
 */
function readFileAsText(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      resolve(e.target?.result as string);
    };
    reader.onerror = (err) => reject(err);
    reader.readAsText(file);
  });
}

interface ChatMessage {
  type: "user" | "ai";
  content: string;
  reasoning?: string;
}

export default function QAChatbot() {
  // Chat messages
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  // Minimization for ThoughtProcessBox
  const [isMinimized, setIsMinimized] = useState(false);

  // Reasoning text lines for the ThoughtProcessBox
  const [reasoningMessages, setReasoningMessages] = useState<string[]>([]);

  // User input & files
  const [input, setInput] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);

  /**
   * Build a conversationContext string from old messages.
   * We'll skip the "new" user message that hasn't been sent yet.
   */
  function buildConversationContext() {
    // If you want the entire conversation, including the user's last message,
    // you can skip the .filter(...) step. Otherwise, you could filter out the new message.
    return messages
      .map((m) =>
        m.type === "user"
          ? `User: ${m.content}`
          : `AI: ${m.content}`
      )
      .join("\n");
  }

  /**
   * Submit form
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    // 1. Immediately show the user's message
    setMessages((prev) => [...prev, { type: "user", content: input }]);
    setLoading(true);

    try {
      // 2. Convert each file to { name, content }
      const fileData = [];
      for (const file of files) {
        const content = await readFileAsText(file);
        fileData.push({ name: file.name, content });
      }

      // 3. Build the conversation context from old messages
      const conversationContext = buildConversationContext();

      console.log("[QA-CHATBOT] Sending to /api/qa-chatbot:", {
        question: input,
        files: fileData.map((f) => f.name),
        conversationContext,
      });

      // 4. Make the POST
      const res = await fetch("/api/qa-chatbot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: input,
          files: fileData,
          conversationContext,
        }),
      });

      // 5. Read server response
      const data = await res.json();
      console.log("[QA-CHATBOT] Response from server:", data);

      // If the server returned an error, we handle it in the chat
      if ("error" in data && data.error) {
        // Let user see the error as an AI message
        setMessages((prev) => [
          ...prev,
          { type: "ai", content: `Error: ${data.error}` },
        ]);
      } else {
        // If there's reasoning, show it in the ThoughtProcessBox
        if (data.reasoning) {
          setReasoningMessages((prev) => [...prev, data.reasoning]);
          setIsMinimized(false); // auto-expand
        }

        // For the final AI message in the chat, we can optionally delay it:
        setTimeout(() => {
          setMessages((prev) => [
            ...prev,
            {
              type: "ai",
              content: data.answer || "No response content",
              reasoning: data.reasoning || "",
            },
          ]);
        }, 3000); // 3-second delay
      }
    } catch (err) {
      console.error("[QA-CHATBOT] Client error:", err);

      // Show the error in chat
      setTimeout(() => {
        setMessages((prev) => [
          ...prev,
          {
            type: "ai",
            content: `Sorry, an error occurred: ${String(err)}`,
          },
        ]);
      }, 3000);
    } finally {
      setInput("");
      setLoading(false);
    }
  };

  /**
   * Handle file selection
   */
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setFiles((prevFiles) => [...prevFiles, ...newFiles]);
    }
  };

  /**
   * Remove file from list
   */
  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="container mx-auto p-4">
      {/* ThoughtProcessBox updated to accept isMinimized, setIsMinimized, and reasoningMessages */}
      <ThoughtProcessBox
        reasoningMessages={reasoningMessages}
        isMinimized={isMinimized}
        setIsMinimized={setIsMinimized}
      />

      <div className="max-w-4xl mx-auto">
        <motion.h1
          className="text-4xl font-bold mb-8 text-center gradient-text"
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          AI Q&A Chatbot
        </motion.h1>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card className="w-full mb-8 hover-lift hover-glow">
            <CardHeader>
              <CardTitle className="text-2xl font-bold flex items-center">
                <Bot className="w-6 h-6 mr-2 text-primary" />
                Ask Anything
              </CardTitle>
              <CardDescription className="text-muted-foreground">
                Get real-time answers with transparent reasoning.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* File Upload UI */}
              <div className="mb-4">
                <Label
                  htmlFor="file-upload"
                  className="block text-sm font-medium mb-2"
                >
                  Upload Knowledge Base Files
                </Label>
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
                    onClick={() =>
                      document.getElementById("file-upload")?.click()
                    }
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Choose Files
                  </Button>
                  <span className="text-sm text-muted-foreground">
                    {files.length} file(s) selected
                  </span>
                </div>
              </div>

              {/* Display chosen files */}
              <AnimatePresence>
                {files.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="bg-muted p-4 rounded-md mb-4"
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

              {/* Chat messages */}
              <ScrollArea className="h-[400px] w-full rounded-md border p-4">
                <AnimatePresence>
                  {messages.map((msg, index) => (
                    <motion.div
                      key={index}
                      className={`mb-4 ${msg.type === 'user' ? 'text-right' : 'text-left'}`}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.3 }}
                    >
                      <div
                        className={`inline-block p-3 rounded-lg ${msg.type === 'user'
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted text-muted-foreground'
                          }`}
                      >
                        {msg.type === 'user' ? (
                          <>
                            <User className="inline-block w-4 h-4 mr-2" />
                            <Typewriter
                              words={[msg.content]}
                              typeSpeed={25}
                              cursor = {false}
                            />
                          </>
                        ) : (
                          <>
                            <Bot className="inline-block w-4 h-4 mr-2" />
                            <Typewriter
                              words={[msg.content]}
                              typeSpeed={5}
                              cursor
                              cursorStyle=""
                            />
                          </>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </ScrollArea>
            </CardContent>
            <CardFooter>
              <form onSubmit={handleSubmit} className="flex w-full space-x-2">
                <Input
                  type="text"
                  placeholder="Type your question..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  className="flex-grow"
                  disabled={loading}
                />
                <Button
                  type="submit"
                  className="bg-primary text-primary-foreground hover:bg-primary/90 hover-scale"
                  disabled={loading}
                >
                  {loading ? (
                    "Loading..."
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      Send
                    </>
                  )}
                </Button>
              </form>
            </CardFooter>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}

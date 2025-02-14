"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Upload, X, Brain } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { ThoughtProcessBox } from "@/components/thought-process-box";
import { generateDeepThink } from "@/utils/generateDeepThink";

// Dynamically import ReactMarkdown with SSR disabled.
const ReactMarkdownNoSSR = dynamic(() => import("react-markdown"), {
  ssr: false,
});

// Helper function to read a file as text.
function readFileAsText(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target?.result as string);
    reader.onerror = (err) => reject(err);
    reader.readAsText(file);
  });
}

const FadeText = ({ text }: { text: string }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    transition={{ duration: 0.5, ease: "easeInOut" }}
  >
    {text}
  </motion.div>
);

export default function DeepThinkAssistant() {
  // Main user input
  const [input, setInput] = useState("");
  // Final AI output displayed to user
  const [output, setOutput] = useState("");

  // ThoughtProcessBox states
  const [reasoningMessages, setReasoningMessages] = useState<string[]>([]);
  const [isMinimized, setIsMinimized] = useState(false);

  // Additional form fields
  const [task, setTask] = useState("summarize");
  const [files, setFiles] = useState<File[]>([]);
  const [detailLevel, setDetailLevel] = useState(50);
  const [useExamples, setUseExamples] = useState(false);
  const [language, setLanguage] = useState("english");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setOutput("");

    try {
      // Convert file list to an array of { name, content }
      const fileData = [];
      for (const f of files) {
        const content = await readFileAsText(f);
        fileData.push({ name: f.name, content });
      }

      console.log("[DEEPTHINK] Generating deep think with parameters:", {
        task,
        inputText: input,
        files: fileData.map((f) => f.name),
        detailLevel,
        useExamples,
        language,
      });

      const { output: generatedOutput, reasoning } = await generateDeepThink({
        task,
        inputText: input,
        files: fileData,
        detailLevel,
        useExamples,
        language,
      });

      if (reasoning) {
        setReasoningMessages((prev) => [...prev, reasoning]);
        setIsMinimized(false);
      }

      setOutput(`${generatedOutput || ""}`);
    } catch (err: any) {
      console.error("[DEEPTHINK] Client error:", err);
      setOutput(`Error: ${String(err)}`);
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setFiles((prev) => [...prev, ...newFiles]);
    }
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="container mx-auto p-4">
      {/* ThoughtProcessBox */}
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
          <FadeText text="DeepThink Assistant" />
        </motion.h1>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card className="hover-lift hover-glow">
            <CardHeader>
              <CardTitle className="text-2xl font-bold flex items-center">
                <Brain className="w-6 h-6 mr-2 text-primary" />
                AI Productivity Tool
              </CardTitle>
              <CardDescription className="text-muted-foreground">
                Get concise outputs and detailed explanations for various tasks.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Task Select */}
                <Select value={task} onValueChange={setTask}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select task" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="summarize">Summarize</SelectItem>
                    <SelectItem value="brainstorm">Brainstorm</SelectItem>
                    <SelectItem value="outline">Outline</SelectItem>
                    <SelectItem value="analyze">Analyze</SelectItem>
                    <SelectItem value="research">Research</SelectItem>
                  </SelectContent>
                </Select>

                <Textarea
                  placeholder="Enter your task here..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  className="min-h-[200px]"
                />

                {/* File Upload */}
                <div>
                  <Label htmlFor="file-upload" className="block text-sm font-medium mb-2">
                    Attach Knowledge Base (optional)
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
                      onClick={() => document.getElementById("file-upload")?.click()}
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      Choose Files
                    </Button>
                    <span className="text-sm text-muted-foreground">
                      {files.length} file(s) selected
                    </span>
                  </div>
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

                {/* Detail Level */}
                <div className="space-y-2">
                  <Label htmlFor="detail-level" className="text-sm font-medium">
                    Detail Level: {detailLevel}%
                  </Label>
                  <Slider
                    id="detail-level"
                    min={0}
                    max={100}
                    step={10}
                    value={[detailLevel]}
                    onValueChange={(value) => setDetailLevel(value[0])}
                    className="w-full"
                  />
                </div>

                {/* Include examples switch */}
                <div className="flex items-center space-x-2">
                  <Switch
                    id="use-examples"
                    checked={useExamples}
                    onCheckedChange={setUseExamples}
                  />
                  <Label htmlFor="use-examples">Include Examples</Label>
                </div>

                {/* Language Select */}
                <Select value={language} onValueChange={setLanguage}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select language" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="english">English</SelectItem>
                    <SelectItem value="spanish">Spanish</SelectItem>
                    <SelectItem value="french">French</SelectItem>
                    <SelectItem value="german">German</SelectItem>
                    <SelectItem value="chinese">Chinese</SelectItem>
                  </SelectContent>
                </Select>

                <Button
                  type="submit"
                  className="w-full bg-primary text-primary-foreground hover:bg-primary/90 hover-scale"
                  disabled={loading}
                >
                  {loading ? "Processing..." : "Process Task"}
                </Button>
              </form>
            </CardContent>
            <CardFooter>
              <div className="w-full">
                <h3 className="text-lg font-semibold mb-2">DeepThink Output:</h3>
                <ReactMarkdownNoSSR className="prose prose-sm sm:prose lg:prose-lg min-h-[200px] whitespace-pre-wrap border border-gray-200 overflow-y-auto p-2">
                  {output}
                </ReactMarkdownNoSSR>
              </div>
            </CardFooter>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}

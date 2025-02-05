"use client";

import { useState } from "react";
import ReactMarkdown from "react-markdown";
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
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { motion } from "framer-motion";
import { ThoughtProcessBox } from "@/components/thought-process-box";

export default function ContentGenerator() {
  // Form fields
  const [input, setInput] = useState("");
  const [tone, setTone] = useState("formal");
  const [genre, setGenre] = useState("business");
  const [contentLength, setContentLength] = useState(500);
  const [includeKeywords, setIncludeKeywords] = useState(false);
  const [keywords, setKeywords] = useState("");
  const [targetAudience, setTargetAudience] = useState("general");
  const [loading, setLoading] = useState(false);

  // Final AI output
  const [output, setOutput] = useState("");

  // ThoughtProcessBox states
  const [reasoningMessages, setReasoningMessages] = useState<string[]>([]);
  const [isMinimized, setIsMinimized] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setOutput("");
    setLoading(true);

    try {
      console.log("[CONTENT-GENERATOR] Sending request to /api/content-generator:", {
        inputBrief: input,
        tone,
        genre,
        contentLength,
        includeKeywords,
        keywords,
        targetAudience,
      });

      const res = await fetch("/api/content-generator", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          inputBrief: input,
          tone,
          genre,
          contentLength,
          includeKeywords,
          keywords,
          targetAudience,
        }),
      });

      const data = await res.json();
      console.log("[CONTENT-GENERATOR] Response from server:", data);

      if (data.error) {
        setOutput(`Error: ${data.error}`);
      } else {
        // If the server returns chain-of-thought
        if (data.reasoning) {
          setReasoningMessages((prev) => [...prev, data.reasoning]);
          setIsMinimized(false); // auto-open
        }

        setOutput(`Generated Content:\n\n${data.output || ""}`);
      }
    } catch (err: any) {
      console.error("[CONTENT-GENERATOR] Client error:", err);
      setOutput(`Error: ${String(err)}`);
    } finally {
      setLoading(false);
    }
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
          AI Content Generator
        </motion.h1>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card className="hover-lift hover-glow">
            <CardHeader>
              <CardTitle className="text-2xl font-bold">
                Generate Custom Content
              </CardTitle>
              <CardDescription>
                Specify your preferences and let AI create content for you.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Tone */}
                  <div className="space-y-2">
                    <Label htmlFor="tone">Tone</Label>
                    <Select value={tone} onValueChange={setTone}>
                      <SelectTrigger id="tone">
                        <SelectValue placeholder="Select tone" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="formal">Formal</SelectItem>
                        <SelectItem value="informal">Informal</SelectItem>
                        <SelectItem value="conversational">
                          Conversational
                        </SelectItem>
                        <SelectItem value="humorous">Humorous</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Genre */}
                  <div className="space-y-2">
                    <Label htmlFor="genre">Genre</Label>
                    <Select value={genre} onValueChange={setGenre}>
                      <SelectTrigger id="genre">
                        <SelectValue placeholder="Select genre" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="business">Business</SelectItem>
                        <SelectItem value="creative">Creative</SelectItem>
                        <SelectItem value="technical">Technical</SelectItem>
                        <SelectItem value="academic">Academic</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Target Audience */}
                  <div className="space-y-2">
                    <Label htmlFor="target-audience">Target Audience</Label>
                    <Select
                      value={targetAudience}
                      onValueChange={setTargetAudience}
                    >
                      <SelectTrigger id="target-audience">
                        <SelectValue placeholder="Select target audience" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="general">General</SelectItem>
                        <SelectItem value="professionals">Professionals</SelectItem>
                        <SelectItem value="students">Students</SelectItem>
                        <SelectItem value="children">Children</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Content Length */}
                  <div className="space-y-2">
                    <Label htmlFor="content-length">
                      Content Length: {contentLength} words
                    </Label>
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                      <Slider
                        id="content-length"
                        min={100}
                        max={2000}
                        step={100}
                        value={[contentLength]}
                        onValueChange={(value) => setContentLength(value[0])}
                      />
                    </motion.div>
                  </div>
                </div>

                {/* Include Keywords */}
                <div className="flex items-center space-x-2">
                  <Switch
                    id="include-keywords"
                    checked={includeKeywords}
                    onCheckedChange={setIncludeKeywords}
                  />
                  <Label htmlFor="include-keywords">Include Keywords</Label>
                </div>
                {includeKeywords && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="space-y-2">
                      <Label htmlFor="keywords">Keywords</Label>
                      <Textarea
                        id="keywords"
                        placeholder="Enter keywords (comma-separated)"
                        value={keywords}
                        onChange={(e) => setKeywords(e.target.value)}
                      />
                    </div>
                  </motion.div>
                )}

                {/* Content Brief */}
                <div className="space-y-2">
                  <Label htmlFor="content-brief">Content Brief</Label>
                  <Textarea
                    id="content-brief"
                    placeholder="Enter your content brief here..."
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    className="min-h-[200px]"
                    required
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full bg-primary text-primary-foreground hover:bg-primary/90 hover-scale"
                  disabled={loading}
                >
                  {loading ? "Generating..." : "Generate Content"}
                </Button>
              </form>
            </CardContent>
            <CardFooter>
              <div className="w-full">
                <h3 className="text-lg font-semibold mb-2">
                  Content Generation Output:
                </h3>
                <ReactMarkdown className="prose prose-sm sm:prose lg:prose-lg min-h-[200px] whitespace-pre-wrap border border-gray-200 overflow-y-auto p-2">
                  {output}
                </ReactMarkdown>
              </div>
            </CardFooter>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}

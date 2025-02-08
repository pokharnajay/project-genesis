"use client";

import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { Minimize2, Maximize2 } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { Typewriter } from 'react-simple-typewriter';

interface ThoughtProcessBoxProps {
  /** An array of strings to display as the AI's reasoning or chain-of-thought. */
  reasoningMessages: string[];

  /** Controls whether the box is minimized. */
  isMinimized: boolean;
  /** Function to toggle the minimization state. */
  setIsMinimized: (value: boolean) => void;
}



export function ThoughtProcessBox({
  reasoningMessages,
  isMinimized,
  setIsMinimized,
}: ThoughtProcessBoxProps) {
  // 1) Use a ref for auto-scrolling
  const thoughtsRef = useRef<HTMLUListElement>(null);

  // 2) Whenever reasoningMessages changes, scroll to bottom
  useEffect(() => {
    if (!thoughtsRef.current) return;
    thoughtsRef.current.scrollTop = thoughtsRef.current.scrollHeight;
  }, [reasoningMessages]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="fixed top-24 right-4 w-80 z-50"
    >
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">AI Thought Process</CardTitle>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsMinimized(!isMinimized)}
          >
            {isMinimized ? (
              <Maximize2 className="h-4 w-4" />
            ) : (
              <Minimize2 className="h-4 w-4" />
            )}
          </Button>
        </CardHeader>
        <AnimatePresence initial={false}>
          {!isMinimized && (
            <motion.div
              key="content"
              initial="collapsed"
              animate="open"
              exit="collapsed"
              variants={{
                open: { opacity: 1, height: "auto" },
                collapsed: { opacity: 0, height: 0 },
              }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
            >
              <CardContent className="hide-scrollbar">
                {/* .hide-scrollbar hides the scrollbar; max-h-64 sets the height limit. */}
                <ul
                  ref={thoughtsRef}
                  className="max-h-64 overflow-auto hide-scrollbar space-y-2"
                >
                  {reasoningMessages.map((msg, idx) => (
                    <motion.li
                      key={idx}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: idx * 0.05 }}
                      className="text-xs text-muted-foreground border-b pb-1 mb-1"
                    >
                      {/* {msg} */}
                      {/* <ReactMarkdown>{msg}</ReactMarkdown> */}
                      <Typewriter
                        words={[msg]}
                        typeSpeed={5}
                        cursor = {false}
                      />
                    </motion.li>
                  ))}
                </ul>
              </CardContent>
            </motion.div>
          )}
        </AnimatePresence>
      </Card>
    </motion.div>
  );
}

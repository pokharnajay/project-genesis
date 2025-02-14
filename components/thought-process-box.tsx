"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { Typewriter } from "react-simple-typewriter";

interface ThoughtProcessBoxProps {
  /** An array of strings to display as the AI's reasoning or chain-of-thought. */
  reasoningMessages: string[];
}

/**
 * Simple slide-in/out animation from the right.
 */
const containerVariants = {
  open: { x: 0 },
  closed: { x: "100%" },
};

export function ThoughtProcessBox({ reasoningMessages }: ThoughtProcessBoxProps) {
  // isOpen = whether the main box is currently visible.
  const [isOpen, setIsOpen] = useState(false);

  // For auto-scrolling
  const thoughtsRef = useRef<HTMLUListElement>(null);

  useEffect(() => {
    if (!thoughtsRef.current) return;
    thoughtsRef.current.scrollTop = thoughtsRef.current.scrollHeight;
  }, [reasoningMessages, isOpen]);

  return (
    <>
      {/* 
        1) The small "tab" pinned to the right edge. 
           Only show it if the box is not open.
      */}
      {!isOpen && (
        <motion.button
          className="fixed top-24 right-0 z-50 bg-primary text-primary-foreground
                     px-2 py-1 rounded-l-md shadow hover:bg-primary/90"
          onClick={() => setIsOpen(true)}
          whileHover={{ scale: 1.05 }}
        >
          AI Thoughts
        </motion.button>
      )}

      {/* 
        2) The main box (a card) that slides in/out from the right. 
           It's pinned at top-24, right-0, with a fixed width (w-80).
      */}
      <motion.div
        className="fixed top-24 right-0 z-50 w-80"
        animate={isOpen ? "open" : "closed"}
        variants={containerVariants}
        transition={{ type: "spring", damping: 20, stiffness: 300 }}
      >
        <Card className="shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">AI Thought Process</CardTitle>
            {/* Close button to slide box back out */}
            <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)}>
              <X className="h-4 w-4" />
            </Button>
          </CardHeader>

          <CardContent className="hide-scrollbar">
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
                  <Typewriter
                    words={[msg]}
                    typeSpeed={5}
                    cursor={false}
                  />
                </motion.li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </motion.div>
    </>
  );
}

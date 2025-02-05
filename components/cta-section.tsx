"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"

export function CTASection() {
  return (
    <motion.div
      className="bg-primary/10 py-16 mt-16"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="container mx-auto text-center">
        <h2 className="text-3xl font-bold mb-4">Ready to Supercharge Your Workflow?</h2>
        <p className="text-xl text-muted-foreground mb-8">
          Explore our full suite of AI-powered tools and take your productivity to the next level.
        </p>
        <Button asChild size="lg" className="hover-scale">
          <Link href="/">Discover All Tools</Link>
        </Button>
      </div>
    </motion.div>
  )
}


"use client"

import Link from "next/link"
import { Instagram, Linkedin } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"

export function Footer() {
  return (
    <footer className="border-t border-border bg-gradient-to-b from-background to-secondary/10">
      <div className="container py-12 md:py-16 mx-auto justify-between">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
          >
            <h3 className="text-2xl font-semibold mb-6 text-primar text-center mx-auto">Collaborate with Us</h3>
            <form className="space-y-4">
              <Input type="email" placeholder="Your email" className="w-full" />
              <Textarea placeholder="Share your ideas" className="w-full" />
              <Button type="submit" className="w-full">
                Send
              </Button>
            </form>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            style={{ display: "flex", flexDirection: "column", alignItems: "center" }}
          >
            <h3 className="text-2xl font-semibold mb-6 text-primary">Connect with Us</h3>
            <div className="flex space-x-4 mb-6">
              <Link
                href="https://www.linkedin.com/in/jay-pokharna-940a42207/"
                target="_blank"
                rel="noreferrer"
                className="text-muted-foreground hover:text-primary transition-colors"
              >
                <Linkedin className="h-8 w-8" />
              </Link>
              <Link
                href="https://www.instagram.com/jay_pokharna/"
                target="_blank"
                rel="noreferrer"
                className="text-muted-foreground hover:text-primary transition-colors"
              >
                <Instagram className="h-8 w-8" />
              </Link>
            </div>
            <p className="text-muted-foreground mb-4">
              Stay updated with our latest AI innovations and industry insights.
            </p>
          </motion.div>
        </div>
        <div className="mt-12 text-center text-sm text-muted-foreground">
          <p>© 2023 Genesis. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}


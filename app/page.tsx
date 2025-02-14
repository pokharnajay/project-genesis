"use client"

import Link from "next/link"
import { Brain, MessageSquare, FileText, Calculator, ShoppingCart , ChefHat } from "lucide-react"
import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

const projects = [
  {
    title: "Q&A Chatbot",
    icon: MessageSquare,
    href: "/qa-chatbot",
    color: "text-orange-500 dark:text-orange-400",
    description: "Get instant answers to your questions with our AI-powered chatbot.",
  },
  {
    title: "Content Generator",
    icon: FileText,
    href: "/content-generator",
    color: "text-green-500 dark:text-green-400",
    description: "Generate high-quality content in seconds with our AI writing assistant.",
  },
  {
    title: "Problem Solver",
    icon: Calculator,
    href: "/problem-solver",
    color: "text-yellow-500 dark:text-yellow-400",
    description: "Solve complex problems with our AI-powered problem-solving engine.",
  },
  {
    title: "DeepThink Assistant",
    icon: Brain,
    href: "/deepthink-assistant",
    color: "text-purple-500 dark:text-purple-400",
    description: "Get personalized insights and recommendations with our AI assistant.",
  },
  {
    title: "Affiliate Reviews",
    icon: ShoppingCart,
    href: "/affiliate-reviews",
    color: "text-red-500 dark:text-red-400",
    description: "Find the best affiliate products with our AI-powered review generator.",
  },
  {
    title: "Recipe Generator",
    icon: ChefHat,
    href: "/chefai",
    color: "text-blue-500 dark:text-blue-400",
    description: "Create personalized recipes based on your ingredients and preferences.",
  },
]

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
}

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
  },
}

export default function Home() {
  return (
    <div className="container mx-auto px-4 py-12">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
        className="text-center mb-12"
      >
        <motion.h1
          className="text-5xl font-bold mb-4"
          initial={{ y: -50 }}
          animate={{ y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <span className="gradient-text">Empower Your Workflow</span>
        </motion.h1>
        <motion.h2
          className="text-4xl font-semibold mb-8"
          initial={{ y: -30 }}
          animate={{ y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          with Intelligent AI
        </motion.h2>
        <motion.p
          className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8"
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.6 }}
        >
          Discover our suite of AI-powered tools designed to enhance your productivity and decision-making.
        </motion.p>
      </motion.div>

      <motion.h2
        className="text-3xl font-bold mb-8 text-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        Our AI-Powered Tools
      </motion.h2>

      <motion.div
        id="tools"
        className="grid gap-8 md:grid-cols-2 lg:grid-cols-3"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {projects.map((project, index) => (
          <motion.div key={project.title} variants={itemVariants}>
            <Card className="h-full overflow-hidden group">
              <CardHeader className="relative">
                <div className="absolute inset-0 animated-background opacity-10 group-hover:opacity-20 transition-opacity duration-300"></div>
                <div className="relative z-10">
                  <CardTitle className="text-2xl font-semibold flex items-center justify-between">
                    <span>{project.title}</span>
                    <project.icon className={`w-8 h-8 ${project.color}`} />
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-muted-foreground text-lg">{project.description}</CardDescription>
              </CardContent>
              <CardFooter>
                <Button asChild className="w-full mt-4 group-hover:scale-105 transition-transform duration-300">
                  <Link href={project.href}>
                    Explore {project.title}
                    <span className="sr-only">{project.title}</span>
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          </motion.div>
        ))}
      </motion.div>
    </div>
  )
}


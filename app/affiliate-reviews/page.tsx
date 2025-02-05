"use client"

import Link from "next/link"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"
import { Star, ArrowRight } from "lucide-react"

const reviews = [
  {
    id: 1,
    title: "Best Laptops for Programmers in 2023",
    summary: "Our AI-powered analysis of the top laptops for coding and development.",
    image: "/placeholder.svg",
    rating: 4.8,
  },
  {
    id: 2,
    title: "Top 10 Noise-Cancelling Headphones",
    summary: "Discover the best headphones for immersive audio experiences.",
    image: "/placeholder.svg",
    rating: 4.6,
  },
  {
    id: 3,
    title: "Smart Home Devices: A Comprehensive Guide",
    summary: "Explore the latest in smart home technology and automation.",
    image: "/placeholder.svg",
    rating: 4.7,
  },
  {
    id: 4,
    title: "Best Ergonomic Office Chairs",
    summary: "Find the perfect chair for your home office setup.",
    image: "/placeholder.svg",
    rating: 4.5,
  },
  {
    id: 5,
    title: "Top Fitness Trackers and Smartwatches",
    summary: "Stay fit and connected with these top-rated wearables.",
    image: "/placeholder.svg",
    rating: 4.4,
  },
  {
    id: 6,
    title: "Ultimate Guide to Gaming Monitors",
    summary: "Level up your gaming experience with the best displays.",
    image: "/placeholder.svg",
    rating: 4.9,
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

export default function AffiliateReviews() {
  return (
    <div className="container mx-auto p-4">
      <div className="max-w-6xl mx-auto">
        <motion.h1
          className="text-4xl font-bold mb-8 text-center gradient-text"
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          AI-Powered Product Reviews
        </motion.h1>
        <motion.p
          className="text-xl text-center text-muted-foreground mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          Discover unbiased, AI-generated reviews with transparent reasoning behind each recommendation.
        </motion.p>
        <motion.div
          className="grid gap-8 md:grid-cols-2 lg:grid-cols-3"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {reviews.map((review) => (
            <motion.div key={review.id} variants={itemVariants}>
              <Card className="flex flex-col h-full group hover:shadow-lg transition-all duration-300 ease-in-out">
                <CardHeader>
                  <img
                    src={review.image || "/placeholder.svg"}
                    alt={review.title}
                    className="w-full h-48 object-cover rounded-t-lg group-hover:scale-105 transition-transform duration-300"
                  />
                </CardHeader>
                <CardContent className="flex-grow">
                  <CardTitle className="text-xl font-semibold text-primary mb-2">{review.title}</CardTitle>
                  <CardDescription className="text-muted-foreground">{review.summary}</CardDescription>
                </CardContent>
                <CardFooter className="flex justify-between items-center">
                  <div className="flex items-center">
                    <Star className="w-5 h-5 text-yellow-400 mr-1" />
                    <span className="font-semibold">{review.rating.toFixed(1)}</span>
                  </div>
                  <Button
                    asChild
                    variant="ghost"
                    className="group-hover:translate-x-1 transition-transform duration-300"
                  >
                    <Link href={`/affiliate-reviews/${review.id}`}>
                      Read Full Review
                      <ArrowRight className="ml-2 w-4 h-4" />
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  )
}


import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import type React from "react";
import { ThemeProvider } from "@/components/theme-provider";
import { ScrollToTop } from "@/components/scroll-to-top";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Genesis - AI Research Project",
  description: "An AI-driven research initiative exploring the future of technology.",
  icons: {
    icon: "/favicon.png",
    apple: "/apple-touch-icon.png",
    shortcut: "/favicon.png",
  },
  openGraph: {
    title: "Genesis - AI Research Project",
    description: "An AI-driven research initiative exploring the future of technology.",
    url: "https://www.jaypokharna.xyz/",
    siteName: "Genesis",
    locale: "en_US",
    type: "website",
    images: [
      {
        url: "/opengraph-image.jpg", // 1200x630 image (1.91:1 aspect ratio)
        width: 1200,
        height: 630,
        alt: "Genesis AI Research Preview",
      },
      {
        url: "/og-square.jpg", // Optional square image (600x600)
        width: 600,
        height: 600,
        alt: "Genesis AI Research Square Preview",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Genesis - AI Research Project",
    description: "An AI-driven research initiative exploring the future of technology.",
    images: ["/twitter-image.jpg"],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Favicon & Apple Touch Icon */}
        <link rel="icon" href="/favicon.png" type="image/x-icon" />
        <link rel="shortcut icon" href="/favicon.png" type="image/x-icon" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />

        {/* Open Graph Meta Tags */}
        <meta property="og:title" content="Genesis - AI Research Project" />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://www.jaypokharna.xyz/" />
        <meta property="og:image" content="/opengraph-image.jpg" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:description" content="An AI-driven research initiative exploring the future of technology." />
        <meta property="og:site_name" content="Genesis" />
        <meta property="og:locale" content="en_US" />

        {/* Twitter Meta Tags */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Genesis - AI Research Project" />
        <meta name="twitter:description" content="An AI-driven research initiative exploring the future of technology." />
        <meta name="twitter:image" content="/twitter-image.jpg" />
      </head>
      <body className={`${inter.className} min-h-screen flex flex-col`}>
        <ScrollToTop />
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <Header />
          <main className="flex-grow pb-32 relative">{children}</main>
          <Footer />
        </ThemeProvider>
      </body>
    </html>
  );
}

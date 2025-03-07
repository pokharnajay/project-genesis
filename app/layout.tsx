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
        url: "https://www.jaypokharna.xyz/open-graph.png",
        width: 1200,
        height: 630,
        alt: "Genesis OG Image - Default",
      },
      {
        url: "https://www.jaypokharna.xyz/open-graph.png",
        width: 600,
        height: 600,
        alt: "Genesis OG Image - Square",
      },
    ],
  },
  metadataBase: new URL("https://www.jaypokharna.xyz"),
  twitter: {
    card: "summary_large_image",
    title: "Genesis - AI Research Project",
    description: "An AI-driven research initiative exploring the future of technology.",
    images: [
      "https://www.jaypokharna.xyz/open-graph.png",
    ],
  },
};

// export const metadata = {
//   title: "Genesis - AI Research Project",
//   description: "An AI-driven research initiative exploring the future of technology.",
//   siteName: "Genesis",
//   favicon : "favicon.ico",
//   openGraph: {
//     title: "Genesis - AI Research Project",
//     description: "Discover AI solutions, chatbot development, and automation. Streamline processes and boost productivity through innovative automation technologies",
//     url: "https://etherwise.io/",
//     images: {
//       url: "https://etherwise.io/open-graph.png",
//       width: 800,
//       height: 600,
//     },
//     locale: "en_US",
//     type: "website",
//   },
//   metadataBase: new URL("https://etherwise.io"),  // Add this line
// };

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta property="og:url" content="https://www.jaypokharna.xyz/" />
        <meta property="og:type" content="website" />
        <meta property="og:description" content="An AI-driven research initiative exploring the future of technology." />
        <meta property="og:image" content="https://www.jaypokharna.xyz/open-graph.png" />
        <meta property="og:logo" content="https://www.jaypokharna.xyz/favicon.png" />
        <title>Genesis - AI Research Project</title>
        <meta name="description" content="" />

        <meta property="og:title" content="Genesis - AI Research Project" />
        <meta property="og:description" content="" />
        <meta property="og:image" content="https://www.jaypokharna.xyz/open-graph.png" />
        <meta property="og:url" content="https://www.jaypokharna.xyz" />
        <meta property="og:site_name" content="Genesis" />
        <meta property="og:type" content="website" />


        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Genesis - AI Research Project" />
        <meta name="twitter:description" content="" />
        <meta name="twitter:image" content="https://www.jaypokharna.xyz/open-graph.png" />
      </head>
      <body className={`${inter.className} min-h-screen flex flex-col`}>
        <ScrollToTop />
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <Header />
          <main className="flex-grow pb-32 relative max-md:pb-6">{children}</main>
          <Footer />
        </ThemeProvider>
      </body>
    </html>
  );
}

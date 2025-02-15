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
        url: "https://www.jaypokharna.xyz/opengraph-image.png",
        width: 1200,
        height: 630,
        alt: "Genesis OG Image - Default",
      },
      {
        url: "https://www.jaypokharna.xyz/og-square.png",
        width: 600,
        height: 600,
        alt: "Genesis OG Image - Square",
      },
    ],
  },
  metadataBase: new URL("https://www.jaypokharna.xy"),  // Add this line
  twitter: {
    card: "summary_large_image",
    title: "Genesis - AI Research Project",
    description: "An AI-driven research initiative exploring the future of technology.",
    images: [
      "https://www.jaypokharna.xyz/twitter-image.png",
    ],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
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

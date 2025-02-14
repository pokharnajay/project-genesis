import Link from "next/link"
import { ModeToggle } from "./mode-toggle"

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between mx-auto max-md:px-5">
        <Link href="/" className="flex items-center space-x-2">
          <span className="font-bold text-2xl text-primary">AI Solutions</span>
        </Link>
        <nav className="flex items-center space-x-4">
          <Link href="/" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
            Home
          </Link>
          <Link
            href="/contact"
            className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
          >
            Contact
          </Link>
          <ModeToggle />
        </nav>
      </div>
    </header>
  )
}


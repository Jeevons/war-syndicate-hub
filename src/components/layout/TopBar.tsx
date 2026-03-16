"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Menu } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/layout/ThemeToggle"
import { cn } from "@/lib/utils"

const navLinks = [
  { href: "/", label: "Hub" },
  { href: "/roster", label: "Roster GDC" },
  { href: "/sonde", label: "La Sonde" },
  { href: "/capitale", label: "Capitale" },
]

interface TopBarProps {
  onMenuClick: () => void
}

export function TopBar({ onMenuClick }: TopBarProps) {
  const pathname = usePathname()

  return (
    <header className="flex items-center justify-between h-14 px-4 border-b border-border bg-background/95 backdrop-blur-sm">
      {/* Logo / Nom du clan */}
      <div className="flex items-center gap-2">
        <span className="font-bold text-lg tracking-tight">War Syndicate</span>
      </div>

      {/* Liens de navigation — desktop uniquement */}
      <nav aria-label="Navigation principale" className="hidden md:flex items-center gap-1">
        {navLinks.map(({ href, label }) => {
          const isActive = pathname === href
          return (
            <Link
              key={href}
              href={href}
              aria-current={isActive ? "page" : undefined}
              className={cn(
                "px-3 py-1.5 rounded-md text-sm font-medium transition-colors",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-accent"
              )}
            >
              {label}
            </Link>
          )
        })}
      </nav>

      {/* Actions droite — ThemeToggle + Hamburger mobile */}
      <div className="flex items-center gap-1">
        <ThemeToggle />
        {/* Hamburger — visible uniquement sur mobile */}
        <Button
          variant="ghost"
          size="icon"
          onClick={onMenuClick}
          aria-label="Ouvrir le menu de navigation"
          className="md:hidden min-w-[44px] min-h-[44px] focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
        >
          <Menu className="h-5 w-5" aria-hidden="true" />
        </Button>
      </div>
    </header>
  )
}

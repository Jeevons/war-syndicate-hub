"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, Users, Crosshair, Castle } from "lucide-react"
import { cn } from "@/lib/utils"

const navLinks = [
  { href: "/", label: "Hub", icon: LayoutDashboard },
  { href: "/roster", label: "Roster GDC", icon: Users },
  { href: "/sonde", label: "La Sonde", icon: Crosshair },
  { href: "/capitale", label: "Capitale", icon: Castle },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside
      aria-label="Navigation secondaire"
      className="hidden md:flex flex-col items-center gap-1 py-4 px-2 border-r border-border w-14"
    >
      {navLinks.map(({ href, label, icon: Icon }) => {
        const isActive = pathname === href
        return (
          <Link
            key={href}
            href={href}
            aria-label={label}
            aria-current={isActive ? "page" : undefined}
            className={cn(
              "group relative flex items-center justify-center w-10 h-10 rounded-md transition-colors",
              "min-w-[44px] min-h-[44px]",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
              isActive
                ? "bg-accent text-accent-foreground"
                : "text-muted-foreground hover:text-foreground hover:bg-accent"
            )}
          >
            <Icon className="h-5 w-5" aria-hidden="true" />
            {/* Tooltip accessible — visible hover ET focus clavier */}
            <span className="pointer-events-none absolute left-full ml-2 whitespace-nowrap rounded-md bg-popover px-2 py-1 text-xs text-popover-foreground shadow-md opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100 transition-opacity z-50">
              {label}
            </span>
          </Link>
        )
      })}
    </aside>
  )
}

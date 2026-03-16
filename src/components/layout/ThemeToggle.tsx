"use client"

import { useTheme } from "next-themes"
import { useSyncExternalStore } from "react"
import { Moon, Sun } from "lucide-react"
import { Button } from "@/components/ui/button"

// useSyncExternalStore évite le mismatch SSR/CSR sans useEffect
// → retourne false côté serveur, true côté client
const mounted = () => true
const notMounted = () => false
const subscribe = () => () => {}

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const isMounted = useSyncExternalStore(subscribe, mounted, notMounted)

  if (!isMounted) return <div className="w-9 h-9" aria-hidden="true" />

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      aria-label={`Basculer vers le thème ${theme === "dark" ? "clair" : "sombre"}`}
      className="min-w-[44px] min-h-[44px] text-foreground focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
    >
      {theme === "dark" ? (
        <Sun className="h-5 w-5" aria-hidden="true" />
      ) : (
        <Moon className="h-5 w-5" aria-hidden="true" />
      )}
    </Button>
  )
}

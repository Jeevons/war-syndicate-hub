"use client"

import { useState } from "react"
import { TopBar } from "@/components/layout/TopBar"
import { Sidebar } from "@/components/layout/Sidebar"
import { MobileDrawer } from "@/components/layout/MobileDrawer"

export function AppShell({
  children,
  userMenu,
}: {
  children: React.ReactNode
  userMenu?: React.ReactNode
}) {
  const [drawerOpen, setDrawerOpen] = useState(false)

  return (
    <div className="overflow-hidden h-screen flex flex-col bg-background text-foreground">
      {/* Top Bar — toujours visible */}
      <TopBar onMenuClick={() => setDrawerOpen(true)} userMenu={userMenu} />

      {/* Corps de l'application */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar icônes — desktop uniquement (≥ 768px) */}
        <Sidebar />

        {/* Contenu principal */}
        <main
          className="flex-1 overflow-auto"
          aria-live="polite"
        >
          {/* Conteneur Glassmorphism — desktop (≥ 1024px) */}
          <div className="lg:max-w-[1500px] lg:mx-auto dark:lg:backdrop-blur-md dark:lg:bg-background/80 min-h-full">
            {children}
          </div>
        </main>
      </div>

      {/* Drawer mobile — visible uniquement < 768px */}
      <MobileDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />
    </div>
  )
}

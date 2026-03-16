import { describe, it, expect, vi } from "vitest"
import { render, screen } from "@testing-library/react"
import "@testing-library/jest-dom"
import { AppShell } from "./AppShell"

// Mock next-themes
vi.mock("next-themes", () => ({
  useTheme: () => ({ theme: "dark", setTheme: vi.fn() }),
}))

// Mock next/navigation
vi.mock("next/navigation", () => ({
  usePathname: () => "/",
  useRouter: () => ({ push: vi.fn() }),
}))

describe("AppShell", () => {
  it("affiche un élément <header> sémantique (TopBar)", () => {
    render(<AppShell><div>Contenu test</div></AppShell>)
    expect(screen.getByRole("banner")).toBeInTheDocument()
  })

  it("affiche un élément <main> (contenu principal)", () => {
    render(<AppShell><div>Contenu test</div></AppShell>)
    expect(screen.getByRole("main")).toBeInTheDocument()
  })

  it("affiche un élément <aside> avec aria-label (Sidebar desktop)", () => {
    render(<AppShell><div>Contenu test</div></AppShell>)
    expect(screen.getByRole("complementary")).toBeInTheDocument()
    expect(screen.getByLabelText("Navigation secondaire")).toBeInTheDocument()
  })

  it("rend les enfants dans le <main>", () => {
    render(<AppShell><p>Contenu enfant</p></AppShell>)
    expect(screen.getByText("Contenu enfant")).toBeInTheDocument()
  })

  it("le <main> a aria-live='polite' pour les changements dynamiques", () => {
    render(<AppShell><div>test</div></AppShell>)
    const main = screen.getByRole("main")
    expect(main).toHaveAttribute("aria-live", "polite")
  })
})

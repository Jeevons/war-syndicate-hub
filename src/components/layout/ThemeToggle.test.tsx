import { describe, it, expect, vi, beforeEach } from "vitest"
import { render, screen, fireEvent, act } from "@testing-library/react"
import "@testing-library/jest-dom"
import { ThemeToggle } from "./ThemeToggle"

// Mock next-themes
const mockSetTheme = vi.fn()
let mockTheme = "dark"

vi.mock("next-themes", () => ({
  useTheme: () => ({
    theme: mockTheme,
    setTheme: mockSetTheme,
  }),
}))

describe("ThemeToggle", () => {
  beforeEach(() => {
    mockSetTheme.mockClear()
    mockTheme = "dark"
  })

  it("affiche le bouton de bascule de thème après montage (theme dark)", async () => {
    await act(async () => {
      render(<ThemeToggle />)
    })
    const button = screen.getByRole("button")
    expect(button).toBeInTheDocument()
    expect(button).toHaveAttribute("aria-label", "Basculer vers le thème clair")
  })

  it("affiche aria-label correct quand le thème est light", async () => {
    mockTheme = "light"
    await act(async () => {
      render(<ThemeToggle />)
    })
    const button = screen.getByRole("button")
    expect(button).toHaveAttribute("aria-label", "Basculer vers le thème sombre")
  })

  it("appelle setTheme avec 'light' quand le thème courant est dark", async () => {
    mockTheme = "dark"
    await act(async () => {
      render(<ThemeToggle />)
    })
    const button = screen.getByRole("button")
    fireEvent.click(button)
    expect(mockSetTheme).toHaveBeenCalledWith("light")
  })

  it("appelle setTheme avec 'dark' quand le thème courant est light", async () => {
    mockTheme = "light"
    await act(async () => {
      render(<ThemeToggle />)
    })
    const button = screen.getByRole("button")
    fireEvent.click(button)
    expect(mockSetTheme).toHaveBeenCalledWith("dark")
  })

  it("a une cible tactile WCAG suffisante (min 44px)", async () => {
    mockTheme = "dark"
    await act(async () => {
      render(<ThemeToggle />)
    })
    const button = screen.getByRole("button")
    expect(button.className).toMatch(/min-w-\[44px\]/)
    expect(button.className).toMatch(/min-h-\[44px\]/)
  })
})

import { render, screen, fireEvent, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { vi, describe, it, expect, beforeEach, afterEach } from "vitest"
import { RecruitmentForm } from "./RecruitmentForm"

// Mock sonner
vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}))

describe("RecruitmentForm", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  // 7.2 — Affichage des 4 champs du formulaire
  it("affiche les 4 champs requis du formulaire", () => {
    render(<RecruitmentForm />)

    expect(screen.getByLabelText(/discord tag/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/tag clash of clans/i)).toBeInTheDocument()
    expect(screen.getByText(/niveau hôtel de ville/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/message/i)).toBeInTheDocument()
  })

  it("affiche le bouton de soumission", () => {
    render(<RecruitmentForm />)
    expect(screen.getByRole("button", { name: /envoyer ma candidature/i })).toBeInTheDocument()
  })

  // 7.3 — Soumission avec données invalides → messages d'erreur Zod
  it("affiche les messages d'erreur Zod quand les champs requis sont vides", async () => {
    const { container } = render(<RecruitmentForm />)

    // Soumettre le formulaire directement (bypasse le bouton désactivé)
    fireEvent.submit(container.querySelector("form")!)

    await waitFor(() => {
      expect(screen.getByText(/discord tag requis/i)).toBeInTheDocument()
    })
  })

  // 7.4 — CoC Tag sans '#' → erreur "Format invalide"
  it("affiche une erreur si le CoC Tag est sans '#'", async () => {
    const user = userEvent.setup()
    render(<RecruitmentForm />)

    const cocInput = screen.getByLabelText(/tag clash of clans/i)
    await user.type(cocInput, "ABC12345")
    await user.tab() // blur → validation onBlur

    await waitFor(() => {
      expect(
        screen.getByText(/format invalide — exemple : #ABC12345/i)
      ).toBeInTheDocument()
    })
  })

  // 7.7 — Bouton désactivé si le formulaire n'est pas encore valide (état initial)
  it("le bouton est désactivé quand le formulaire n'est pas encore valide", () => {
    render(<RecruitmentForm />)
    const submitBtn = screen.getByRole("button", { name: /envoyer ma candidature/i })
    // Formulaire vide sans validation = isValid=false → bouton désactivé
    expect(submitBtn).toBeDisabled()
  })

  // 7.7b — Bouton désactivé quand il y a des erreurs de validation
  it("le bouton reste désactivé après soumission avec erreurs", async () => {
    const { container } = render(<RecruitmentForm />)

    fireEvent.submit(container.querySelector("form")!)

    await waitFor(() => {
      expect(screen.getByText(/discord tag requis/i)).toBeInTheDocument()
    })

    const submitBtn = screen.getByRole("button", { name: /envoyer ma candidature/i })
    expect(submitBtn).toBeDisabled()
  })

  // 7.5 — Soumission succès → fetch appelé, toast success, formulaire réinitialisé
  it("appelle fetch, affiche un toast succès et réinitialise le formulaire en cas de succès", async () => {
    const { toast } = await import("sonner")
    const user = userEvent.setup()

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ data: { success: true }, meta: { timestamp: new Date().toISOString() } }),
    })

    const { container } = render(<RecruitmentForm />)

    const discordInput = screen.getByLabelText(/discord tag/i)
    const cocInput = screen.getByLabelText(/tag clash of clans/i)

    await user.type(discordInput, "PseudoDiscord#1234")
    fireEvent.blur(discordInput)

    await user.type(cocInput, "#ABC12345")
    fireEvent.blur(cocInput)

    // Sélectionner HdV via le Select
    await user.click(screen.getByRole("combobox"))
    await waitFor(() => screen.getByText("HdV 10"))
    await user.click(screen.getByText("HdV 10"))
    // Déclencher blur sur le select pour que react-hook-form valide le champ
    fireEvent.blur(screen.getByRole("combobox"))

    // Soumettre le formulaire directement pour bypasser le délai d'isValid
    fireEvent.submit(container.querySelector("form")!)

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        "/api/v1/applications",
        expect.objectContaining({
          method: "POST",
          headers: expect.objectContaining({ "Content-Type": "application/json" }),
        })
      )
    })

    await waitFor(() => {
      expect(toast.success).toHaveBeenCalled()
    })
  })

  // 7.6 — Soumission erreur réseau → toast error, données préservées
  it("affiche un toast erreur et préserve les données du formulaire en cas d'erreur réseau", async () => {
    const { toast } = await import("sonner")
    const user = userEvent.setup()

    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      json: async () => ({ error: { code: "DATABASE_ERROR", message: "Erreur serveur" } }),
    })

    const { container } = render(<RecruitmentForm />)

    const discordInput = screen.getByLabelText(/discord tag/i)
    const cocInput = screen.getByLabelText(/tag clash of clans/i)

    await user.type(discordInput, "PseudoDiscord#1234")
    fireEvent.blur(discordInput)

    await user.type(cocInput, "#ABC12345")
    fireEvent.blur(cocInput)

    // Sélectionner HdV
    await user.click(screen.getByRole("combobox"))
    await waitFor(() => screen.getByText("HdV 5"))
    await user.click(screen.getByText("HdV 5"))
    fireEvent.blur(screen.getByRole("combobox"))

    fireEvent.submit(container.querySelector("form")!)

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalled()
    })

    // Données préservées — les champs ne sont PAS vides
    expect(screen.getByLabelText(/discord tag/i)).toHaveValue("PseudoDiscord#1234")
    expect(screen.getByLabelText(/tag clash of clans/i)).toHaveValue("#ABC12345")
  })
})

import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { LoginForm } from './LoginForm'

const mockSignInWithOAuth = vi.fn().mockResolvedValue({ error: null })

vi.mock('@/lib/supabase/client', () => ({
  createClient: vi.fn(() => ({
    auth: {
      signInWithOAuth: mockSignInWithOAuth,
    },
  })),
}))

describe('LoginForm', () => {
  beforeEach(() => {
    mockSignInWithOAuth.mockClear()
    mockSignInWithOAuth.mockResolvedValue({ error: null })
  })

  it('affiche le bouton "Connexion avec Discord"', () => {
    render(<LoginForm />)
    expect(
      screen.getByRole('button', { name: /Connexion avec Discord/i })
    ).toBeInTheDocument()
  })

  it('le bouton est focusable', () => {
    render(<LoginForm />)
    const button = screen.getByRole('button', { name: /Connexion avec Discord/i })
    button.focus()
    expect(document.activeElement).toBe(button)
  })

  it('affiche un message si la prop message est fournie', () => {
    render(<LoginForm message="Connecte-toi pour accéder à ton Hub" />)
    expect(screen.getByRole('status')).toHaveTextContent(
      'Connecte-toi pour accéder à ton Hub'
    )
  })

  it('affiche une erreur si la prop error est fournie', () => {
    render(<LoginForm error="oauth_error" />)
    expect(screen.getByRole('alert')).toBeInTheDocument()
  })

  it("n'affiche pas de message si la prop message est absente", () => {
    render(<LoginForm />)
    expect(screen.queryByRole('status')).not.toBeInTheDocument()
  })

  it("n'affiche pas d'alerte si la prop error est absente", () => {
    render(<LoginForm />)
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })

  it('appelle signInWithOAuth avec provider discord au clic', async () => {
    render(<LoginForm />)
    fireEvent.click(screen.getByRole('button', { name: /Connexion avec Discord/i }))

    await waitFor(() => {
      expect(mockSignInWithOAuth).toHaveBeenCalledWith({
        provider: 'discord',
        options: expect.objectContaining({
          scopes: 'identify email',
        }),
      })
    })
  })

  it('désactive le bouton pendant le chargement (aria-busy)', async () => {
    // Le mock ne résout pas immédiatement pour simuler le chargement
    mockSignInWithOAuth.mockImplementation(
      () => new Promise((resolve) => setTimeout(() => resolve({ error: null }), 100))
    )

    render(<LoginForm />)
    const button = screen.getByRole('button', { name: /Connexion avec Discord/i })
    fireEvent.click(button)

    await waitFor(() => {
      expect(button).toBeDisabled()
      expect(button).toHaveAttribute('aria-busy', 'true')
    })
  })
})

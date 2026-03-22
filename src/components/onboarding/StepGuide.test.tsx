import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { StepGuide } from './StepGuide'

vi.stubGlobal('fetch', vi.fn())

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}))

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    refresh: vi.fn(),
  }),
}))

vi.mock('next/image', () => ({
  default: ({ alt, ...props }: { alt: string; [key: string]: unknown }) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img alt={alt} {...(props as React.ImgHTMLAttributes<HTMLImageElement>)} />
  ),
}))

import React from 'react'

describe('StepGuide', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('affiche les 3 step indicators', () => {
    render(<StepGuide />)
    const nav = screen.getByRole('navigation', { name: /Étapes de liaison/i })
    const steps = nav.querySelectorAll('div')
    expect(steps).toHaveLength(3)
  })

  it('affiche l\'étape 1 au démarrage avec le label Tag joueur', () => {
    render(<StepGuide />)
    expect(screen.getByText(/Ton tag Clash of Clans/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/Tag joueur/i)).toBeInTheDocument()
  })

  it('affiche une erreur si le #TAG a un format invalide (sans #)', async () => {
    render(<StepGuide />)
    const input = screen.getByLabelText(/Tag joueur/i)
    fireEvent.change(input, { target: { value: 'ABC12345' } })
    fireEvent.blur(input)
    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent(/Format invalide/i)
    })
  })

  it('accepte un #TAG au format valide et n\'affiche pas d\'erreur', async () => {
    render(<StepGuide />)
    const input = screen.getByLabelText(/Tag joueur/i)
    fireEvent.change(input, { target: { value: '#ABC12345' } })
    fireEvent.blur(input)
    await waitFor(() => {
      expect(screen.queryByRole('alert')).not.toBeInTheDocument()
    })
  })

  it('passe à l\'étape 2 si le tag est valide au clic sur Continuer', async () => {
    render(<StepGuide />)
    const input = screen.getByLabelText(/Tag joueur/i)
    fireEvent.change(input, { target: { value: '#ABC12345' } })
    fireEvent.click(screen.getByRole('button', { name: /Continuer/i }))
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /Token de vérification/i })).toBeInTheDocument()
    })
  })

  it('ne passe pas à l\'étape 2 si le tag est invalide', async () => {
    render(<StepGuide />)
    const input = screen.getByLabelText(/Tag joueur/i)
    fireEvent.change(input, { target: { value: 'INVALID' } })
    fireEvent.click(screen.getByRole('button', { name: /Continuer/i }))
    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeInTheDocument()
      expect(screen.queryByText(/Token de vérification/i)).not.toBeInTheDocument()
    })
  })

  it('désactive le bouton de soumission pendant le chargement (aria-busy)', async () => {
    vi.mocked(fetch).mockImplementationOnce(
      () => new Promise(() => { /* ne résoud jamais */ })
    )

    render(<StepGuide />)
    // Étape 1 → 2
    fireEvent.change(screen.getByLabelText(/Tag joueur/i), {
      target: { value: '#ABC12345' },
    })
    fireEvent.click(screen.getByRole('button', { name: /Continuer/i }))
    // Étape 2 → 3
    await waitFor(() => screen.getByLabelText(/Token/i))
    fireEvent.change(screen.getByLabelText(/Token/i), {
      target: { value: 'mytoken' },
    })
    fireEvent.click(screen.getByRole('button', { name: /Continuer/i }))
    // Soumission
    await waitFor(() => screen.getByRole('button', { name: /Vérifier et lier/i }))
    const submitBtn = screen.getByRole('button', { name: /Vérifier et lier/i })
    fireEvent.click(submitBtn)
    await waitFor(() => {
      expect(submitBtn).toBeDisabled()
      expect(submitBtn).toHaveAttribute('aria-busy', 'true')
    })
  })

  it('appelle POST /api/v1/coc/verify au submit avec tag + token', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      new Response(
        JSON.stringify({
          data: {
            success: true,
            profile: { name: 'Jeevons', tag: '#ABC12345', townhall_level: 16, is_main: true },
          },
        }),
        { status: 200 }
      )
    )

    render(<StepGuide />)
    fireEvent.change(screen.getByLabelText(/Tag joueur/i), {
      target: { value: '#ABC12345' },
    })
    fireEvent.click(screen.getByRole('button', { name: /Continuer/i }))
    await waitFor(() => screen.getByLabelText(/Token/i))
    fireEvent.change(screen.getByLabelText(/Token/i), {
      target: { value: 'mytoken' },
    })
    fireEvent.click(screen.getByRole('button', { name: /Continuer/i }))
    await waitFor(() => screen.getByRole('button', { name: /Vérifier et lier/i }))
    fireEvent.click(screen.getByRole('button', { name: /Vérifier et lier/i }))

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        '/api/v1/coc/verify',
        expect.objectContaining({
          method: 'POST',
          body: expect.stringContaining('#ABC12345'),
        })
      )
    })
  })

  it('affiche un Toast erreur TOKEN_INVALID si l\'API retourne 403', async () => {
    const { toast } = await import('sonner')
    vi.mocked(fetch).mockResolvedValueOnce(
      new Response(
        JSON.stringify({
          error: { code: 'TOKEN_INVALID', message: 'Token invalide' },
        }),
        { status: 403 }
      )
    )

    render(<StepGuide />)
    fireEvent.change(screen.getByLabelText(/Tag joueur/i), {
      target: { value: '#ABC12345' },
    })
    fireEvent.click(screen.getByRole('button', { name: /Continuer/i }))
    await waitFor(() => screen.getByLabelText(/Token/i))
    fireEvent.change(screen.getByLabelText(/Token/i), {
      target: { value: 'badtoken' },
    })
    fireEvent.click(screen.getByRole('button', { name: /Continuer/i }))
    await waitFor(() => screen.getByRole('button', { name: /Vérifier et lier/i }))
    fireEvent.click(screen.getByRole('button', { name: /Vérifier et lier/i }))

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith(
        expect.stringContaining('Token invalide ou expiré'),
        expect.any(Object)
      )
    })
  })

  it('affiche un Toast erreur TAG_ALREADY_LINKED si l\'API retourne 409', async () => {
    const { toast } = await import('sonner')
    vi.mocked(fetch).mockResolvedValueOnce(
      new Response(
        JSON.stringify({
          error: { code: 'TAG_ALREADY_LINKED', message: 'Tag déjà lié' },
        }),
        { status: 409 }
      )
    )

    render(<StepGuide />)
    fireEvent.change(screen.getByLabelText(/Tag joueur/i), {
      target: { value: '#ABC12345' },
    })
    fireEvent.click(screen.getByRole('button', { name: /Continuer/i }))
    await waitFor(() => screen.getByLabelText(/Token/i))
    fireEvent.change(screen.getByLabelText(/Token/i), {
      target: { value: 'mytoken' },
    })
    fireEvent.click(screen.getByRole('button', { name: /Continuer/i }))
    await waitFor(() => screen.getByRole('button', { name: /Vérifier et lier/i }))
    fireEvent.click(screen.getByRole('button', { name: /Vérifier et lier/i }))

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith(
        expect.stringContaining('déjà associé à un compte'),
        expect.any(Object)
      )
    })
  })

  it('affiche un Toast erreur si l\'API retourne COC_API_UNAVAILABLE (503)', async () => {
    const { toast } = await import('sonner')
    vi.mocked(fetch).mockResolvedValueOnce(
      new Response(
        JSON.stringify({ error: { code: 'COC_API_UNAVAILABLE', message: 'API indisponible' } }),
        { status: 503 }
      )
    )

    render(<StepGuide />)
    fireEvent.change(screen.getByLabelText(/Tag joueur/i), { target: { value: '#ABC12345' } })
    fireEvent.click(screen.getByRole('button', { name: /Continuer/i }))
    await waitFor(() => screen.getByLabelText(/Token/i))
    fireEvent.change(screen.getByLabelText(/Token/i), { target: { value: 'mytoken' } })
    fireEvent.click(screen.getByRole('button', { name: /Continuer/i }))
    await waitFor(() => screen.getByRole('button', { name: /Vérifier et lier/i }))
    fireEvent.click(screen.getByRole('button', { name: /Vérifier et lier/i }))

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith(
        expect.stringContaining('indisponible'),
        expect.any(Object)
      )
    })
  })

  it('affiche un Toast erreur réseau si fetch throw', async () => {
    const { toast } = await import('sonner')
    vi.mocked(fetch).mockRejectedValueOnce(new Error('Network error'))

    render(<StepGuide />)
    fireEvent.change(screen.getByLabelText(/Tag joueur/i), { target: { value: '#ABC12345' } })
    fireEvent.click(screen.getByRole('button', { name: /Continuer/i }))
    await waitFor(() => screen.getByLabelText(/Token/i))
    fireEvent.change(screen.getByLabelText(/Token/i), { target: { value: 'mytoken' } })
    fireEvent.click(screen.getByRole('button', { name: /Continuer/i }))
    await waitFor(() => screen.getByRole('button', { name: /Vérifier et lier/i }))
    fireEvent.click(screen.getByRole('button', { name: /Vérifier et lier/i }))

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith(
        expect.stringContaining('Erreur réseau'),
        expect.any(Object)
      )
    })
  })

  it('appelle onSuccess callback après liaison réussie', async () => {
    const onSuccess = vi.fn()
    vi.mocked(fetch).mockResolvedValueOnce(
      new Response(
        JSON.stringify({
          data: {
            success: true,
            profile: { name: 'Jeevons', tag: '#ABC12345', townhall_level: 16, is_main: false },
          },
        }),
        { status: 200 }
      )
    )

    render(<StepGuide onSuccess={onSuccess} />)
    fireEvent.change(screen.getByLabelText(/Tag joueur/i), { target: { value: '#ABC12345' } })
    fireEvent.click(screen.getByRole('button', { name: /Continuer/i }))
    await waitFor(() => screen.getByLabelText(/Token/i))
    fireEvent.change(screen.getByLabelText(/Token/i), { target: { value: 'mytoken' } })
    fireEvent.click(screen.getByRole('button', { name: /Continuer/i }))
    await waitFor(() => screen.getByRole('button', { name: /Vérifier et lier/i }))
    fireEvent.click(screen.getByRole('button', { name: /Vérifier et lier/i }))

    await waitFor(() => {
      expect(onSuccess).toHaveBeenCalledTimes(1)
    })
  })

  it('retour de l\'étape 3 à l\'étape 2 au clic sur Retour', async () => {
    render(<StepGuide />)
    fireEvent.change(screen.getByLabelText(/Tag joueur/i), { target: { value: '#ABC12345' } })
    fireEvent.click(screen.getByRole('button', { name: /Continuer/i }))
    await waitFor(() => screen.getByLabelText(/Token/i))
    fireEvent.change(screen.getByLabelText(/Token/i), { target: { value: 'mytoken' } })
    fireEvent.click(screen.getByRole('button', { name: /Continuer/i }))
    await waitFor(() => screen.getByRole('button', { name: /Vérifier et lier/i }))

    // Retour à l'étape 2
    fireEvent.click(screen.getByRole('button', { name: /Retour/i }))
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /Token de vérification/i })).toBeInTheDocument()
    })
  })
})

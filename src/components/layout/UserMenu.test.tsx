import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { UserMenu } from './UserMenu'

const mockSignOut = vi.fn().mockResolvedValue({})
const mockPush = vi.fn()
const mockRefresh = vi.fn()

vi.mock('@/lib/supabase/client', () => ({
  createClient: vi.fn(() => ({
    auth: {
      signOut: mockSignOut,
    },
  })),
}))

vi.mock('next/navigation', () => ({
  useRouter: vi.fn(() => ({
    push: mockPush,
    refresh: mockRefresh,
  })),
}))

vi.mock('next/image', () => ({
  default: ({ src, alt }: { src: string; alt: string }) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt={alt} />
  ),
}))

describe('UserMenu', () => {
  beforeEach(() => {
    mockSignOut.mockClear()
    mockPush.mockClear()
    mockRefresh.mockClear()
  })

  it("affiche l'initiale si avatarUrl est null", () => {
    render(<UserMenu username="Jeevons" avatarUrl={null} />)
    // Le bouton avec aria-label contient le username
    expect(screen.getByLabelText('Menu de Jeevons')).toBeInTheDocument()
    // L'initiale est affichée
    expect(screen.getByText('J')).toBeInTheDocument()
  })

  it("affiche l'avatar si avatarUrl est fourni", () => {
    render(
      <UserMenu
        username="Jeevons"
        avatarUrl="https://cdn.discordapp.com/avatars/123/abc.png"
      />
    )
    expect(screen.getByAltText('Avatar de Jeevons')).toBeInTheDocument()
  })

  it("affiche le nom d'utilisateur", () => {
    render(<UserMenu username="Jeevons" avatarUrl={null} />)
    // Le nom est affiché dans le span (hidden sm:block)
    expect(screen.getByText('Jeevons')).toBeInTheDocument()
  })

  it('le bouton Déconnexion est présent après ouverture du menu', async () => {
    render(<UserMenu username="Jeevons" avatarUrl={null} />)
    const trigger = screen.getByLabelText('Menu de Jeevons')
    fireEvent.click(trigger)

    expect(screen.getByRole('menuitem', { name: /Déconnexion/i })).toBeInTheDocument()
  })

  it('appelle signOut et redirige vers / au clic Déconnexion', async () => {
    render(<UserMenu username="Jeevons" avatarUrl={null} />)
    fireEvent.click(screen.getByLabelText('Menu de Jeevons'))
    fireEvent.click(screen.getByRole('menuitem', { name: /Déconnexion/i }))

    await waitFor(() => {
      expect(mockSignOut).toHaveBeenCalledTimes(1)
      expect(mockPush).toHaveBeenCalledWith('/')
    })
  })

  it('le menu est fermé par défaut (bouton Déconnexion absent)', () => {
    render(<UserMenu username="Jeevons" avatarUrl={null} />)
    expect(screen.queryByRole('menuitem')).not.toBeInTheDocument()
  })

  it('ferme le menu avec la touche Escape', async () => {
    render(<UserMenu username="Jeevons" avatarUrl={null} />)
    fireEvent.click(screen.getByLabelText('Menu de Jeevons'))
    expect(screen.getByRole('menuitem', { name: /Déconnexion/i })).toBeInTheDocument()

    fireEvent.keyDown(document, { key: 'Escape' })
    expect(screen.queryByRole('menuitem')).not.toBeInTheDocument()
  })

  it('désactive le bouton Déconnexion pendant le sign-out', async () => {
    mockSignOut.mockImplementation(
      () => new Promise((resolve) => setTimeout(() => resolve({}), 100))
    )
    render(<UserMenu username="Jeevons" avatarUrl={null} />)
    fireEvent.click(screen.getByLabelText('Menu de Jeevons'))
    fireEvent.click(screen.getByRole('menuitem', { name: /Déconnexion/i }))

    await waitFor(() => {
      expect(screen.getByText('Déconnexion…')).toBeInTheDocument()
    })
  })
})

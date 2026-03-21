import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { NewsCard } from './NewsCard'

const mockProps = {
  title: 'Victoire en GDC — Récap',
  excerpt: 'Nous avons remporté la dernière Guerre de Clans avec 3 étoiles.',
  slug: 'victoire-gdc-recap',
  authorUsername: 'WarLeader',
  authorAvatarUrl: null,
  publishedAt: '2026-03-15T10:00:00.000Z',
}

describe('NewsCard', () => {
  it('affiche le titre de l\'article', () => {
    render(<NewsCard {...mockProps} />)
    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent('Victoire en GDC — Récap')
  })

  it('affiche l\'extrait', () => {
    render(<NewsCard {...mockProps} />)
    expect(screen.getByText(/Nous avons remporté/)).toBeInTheDocument()
  })

  it('contient un lien vers l\'article', () => {
    render(<NewsCard {...mockProps} />)
    const link = screen.getByRole('link')
    expect(link).toHaveAttribute('href', '/news/victoire-gdc-recap')
  })

  it('affiche le nom de l\'auteur', () => {
    render(<NewsCard {...mockProps} />)
    expect(screen.getByText('WarLeader')).toBeInTheDocument()
  })

  it('affiche la date en français', () => {
    render(<NewsCard {...mockProps} />)
    // 15 mars 2026 en fr-FR
    expect(screen.getByText(/15 mars 2026/)).toBeInTheDocument()
  })

  it('affiche un fallback initiale quand avatarUrl est null', () => {
    render(<NewsCard {...mockProps} authorAvatarUrl={null} />)
    // Le fallback div avec initiale W est présent
    expect(screen.getByText('W')).toBeInTheDocument()
  })

  it('a un aria-label descriptif sur le lien', () => {
    render(<NewsCard {...mockProps} />)
    const link = screen.getByRole('link')
    expect(link).toHaveAttribute('aria-label', "Lire l'article : Victoire en GDC — Récap")
  })

  it('affiche l\'avatar de l\'auteur avec alt correct quand avatarUrl est fourni', () => {
    render(<NewsCard {...mockProps} authorAvatarUrl="https://cdn.discordapp.com/avatars/123/abc.jpg" />)
    const img = screen.getByRole('img')
    expect(img).toHaveAttribute('alt', 'Avatar de WarLeader')
  })
})

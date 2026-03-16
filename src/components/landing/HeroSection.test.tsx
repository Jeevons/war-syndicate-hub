/**
 * Tests de la landing page — Story 1.3
 *
 * MIS À JOUR le 2026-03-15 après le redesign complet (navbar, couleurs logo, warLeague).
 *
 * PÉRIMÈTRE :
 *   ✅ HeroSection        — RSC statique
 *   ✅ ClanStatsSection   — RSC async (API CoC + fallback)
 *   ✅ RecruitmentCTA     — RSC statique
 *   ✅ Composition landing — structure globale
 *   ⏳ PublicNavbar       — "use client" + scroll/menu burger → à couvrir séparément (jsdom + userEvent)
 *   ⏳ WhyJoinSection     — RSC statique → tests simples à ajouter
 *
 * ATTENTION CODE REVIEWER :
 *   - ClanStatsSection est async : pattern `await ClanStatsSection()` puis `render(element)`
 *   - L'API CoC n'est pas appelée sans CLASH_OF_CLANS_API_KEY → fallback systématique en test
 *   - warLeague remplace warWinStreak depuis le redesign (API: `{ warLeague: { name: string } }`)
 *   - Le CTA hero est un <a> (pas un <button>) — min-h-[52px] pour desktop
 *   - Le bouton candidature est disabled (Story 1.4 non implémentée)
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import { HeroSection } from './HeroSection'
import { ClanStatsSection } from './ClanStatsSection'
import { RecruitmentCTA } from './RecruitmentCTA'
import { WhyJoinSection } from './WhyJoinSection'

// ClanStatsSection est async — helper pour résoudre le composant avant render
async function renderClanStats() {
  const element = await ClanStatsSection()
  return render(element)
}

// ─────────────────────────────────────────────
// HeroSection
// ─────────────────────────────────────────────
describe('HeroSection', () => {
  it('affiche le h1 avec le nom du clan', () => {
    render(<HeroSection />)
    const h1 = screen.getByRole('heading', { level: 1 })
    expect(h1).toHaveTextContent(/war/i)
    expect(h1).toHaveTextContent(/syndicate/i)
  })

  it('possède la section avec id="hero"', () => {
    const { container } = render(<HeroSection />)
    expect(container.querySelector('#hero')).toBeInTheDocument()
  })

  it('la section hero a aria-labelledby="hero-heading"', () => {
    const { container } = render(<HeroSection />)
    const section = container.querySelector('#hero')
    expect(section).toHaveAttribute('aria-labelledby', 'hero-heading')
    expect(container.querySelector('#hero-heading')).toBeInTheDocument()
  })

  it('le lien CTA "Rejoindre" pointe vers #candidature', () => {
    render(<HeroSection />)
    const link = screen.getByRole('link', { name: /rejoindre le clan/i })
    expect(link).toHaveAttribute('href', '#candidature')
  })

  it('le lien CTA desktop a une cible tactile min-h-[52px]', () => {
    render(<HeroSection />)
    const link = screen.getByRole('link', { name: /rejoindre le clan/i })
    expect(link.className).toMatch(/min-h-\[52px\]/)
  })

  it('le lien secondaire "Voir les stats" pointe vers #stats', () => {
    render(<HeroSection />)
    const link = screen.getByRole('link', { name: /voir les stats/i })
    expect(link).toHaveAttribute('href', '#stats')
  })

  it('affiche le logo du clan', () => {
    render(<HeroSection />)
    const img = screen.getByAltText(/logo war syndicate/i)
    expect(img).toBeInTheDocument()
  })
})

// ─────────────────────────────────────────────
// ClanStatsSection
// warLeague remplace warWinStreak depuis le redesign 2026-03-15
// ─────────────────────────────────────────────
describe('ClanStatsSection', () => {
  beforeEach(() => {
    // Pas de clé API en test → fallback (pas de fetch réseau)
    vi.unstubAllEnvs()
  })

  it('possède la section avec id="stats"', async () => {
    const { container } = await renderClanStats()
    expect(container.querySelector('#stats')).toBeInTheDocument()
  })

  it('affiche les 4 labels de statistiques', async () => {
    await renderClanStats()
    expect(screen.getByText('Membres actifs')).toBeInTheDocument()
    // warWinStreak remplacé par warLeague
    expect(screen.getByText('Ligue de guerre')).toBeInTheDocument()
    expect(screen.getByText('Trophées du clan')).toBeInTheDocument()
    expect(screen.getByText('Niveau du clan')).toBeInTheDocument()
  })

  it('affiche les valeurs fallback quand aucune clé API n\'est définie', async () => {
    await renderClanStats()
    expect(screen.getByText('50')).toBeInTheDocument()
    // warLeague fallback = 'Non classé' (plus warWinStreak = 12)
    expect(screen.getByText('Non classé')).toBeInTheDocument()
    expect(screen.getByText('Niv. 15')).toBeInTheDocument()
  })

  it('affiche les données de l\'API quand le fetch réussit', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        members: 48,
        // warLeague est un objet avec name (API officielle CoC)
        warLeague: { id: 48000011, name: 'Silver League III' },
        clanPoints: 60000,
        clanLevel: 16,
      }),
    }))
    vi.stubEnv('CLASH_OF_CLANS_API_KEY', 'test-key')

    await renderClanStats()
    expect(screen.getByText('48')).toBeInTheDocument()
    expect(screen.getByText('Silver League III')).toBeInTheDocument()
    expect(screen.getByText('Niv. 16')).toBeInTheDocument()

    vi.unstubAllGlobals()
    vi.unstubAllEnvs()
  })

  it('utilise le fallback warLeague quand l\'API ne renvoie pas warLeague', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ members: 20, clanPoints: 10000, clanLevel: 3 }),
    }))
    vi.stubEnv('CLASH_OF_CLANS_API_KEY', 'test-key')

    await renderClanStats()
    expect(screen.getByText('Non classé')).toBeInTheDocument()

    vi.unstubAllGlobals()
    vi.unstubAllEnvs()
  })
})

// ─────────────────────────────────────────────
// RecruitmentCTA
// ─────────────────────────────────────────────
describe('RecruitmentCTA', () => {
  it('possède la section avec id="candidature"', () => {
    const { container } = render(<RecruitmentCTA />)
    expect(container.querySelector('#candidature')).toBeInTheDocument()
  })

  it('possède la div avec id="formulaire-candidature"', () => {
    const { container } = render(<RecruitmentCTA />)
    expect(container.querySelector('#formulaire-candidature')).toBeInTheDocument()
  })

  it('affiche le h2 de recrutement', () => {
    render(<RecruitmentCTA />)
    const h2 = screen.getByRole('heading', { level: 2 })
    expect(h2).toHaveTextContent(/rejoindre/i)
    expect(h2).toHaveTextContent(/war syndicate/i)
  })

  it('affiche les 4 conditions de recrutement', () => {
    render(<RecruitmentCTA />)
    // HdV 12 minimum (mis à jour depuis le redesign — était 14)
    expect(screen.getByText(/hôtel de ville niveau 12/i)).toBeInTheDocument()
    expect(screen.getByText(/guerres de clans/i)).toBeInTheDocument()
    expect(screen.getByText(/avoir un compte discord actif/i)).toBeInTheDocument()
    expect(screen.getByText(/capitale/i)).toBeInTheDocument()
  })

  it('affiche le formulaire de candidature (Story 1.4 implémentée)', () => {
    render(<RecruitmentCTA />)
    expect(screen.getByLabelText(/discord tag/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/tag clash of clans/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /envoyer ma candidature/i })).toBeInTheDocument()
  })
})

// ─────────────────────────────────────────────
// WhyJoinSection
// ─────────────────────────────────────────────
describe('WhyJoinSection', () => {
  it('possède la section avec id="pourquoi"', () => {
    const { container } = render(<WhyJoinSection />)
    expect(container.querySelector('#pourquoi')).toBeInTheDocument()
  })

  it('affiche les 3 piliers', () => {
    render(<WhyJoinSection />)
    expect(screen.getByText('Données en temps réel')).toBeInTheDocument()
    expect(screen.getByText('Guerres coordonnées')).toBeInTheDocument()
    expect(screen.getByText('Communauté active')).toBeInTheDocument()
  })

  it('le h2 a id="why-heading"', () => {
    const { container } = render(<WhyJoinSection />)
    expect(container.querySelector('#why-heading')).toBeInTheDocument()
  })
})

// ─────────────────────────────────────────────
// Composition landing — structure globale
// ─────────────────────────────────────────────
describe('Landing Page — composition des sections', () => {
  it('un seul h1 sur la page', async () => {
    const clanStats = await ClanStatsSection()
    const { container } = render(
      <main>
        <HeroSection />
        {clanStats}
        <WhyJoinSection />
        <RecruitmentCTA />
      </main>
    )
    const allH1 = container.querySelectorAll('h1')
    expect(allH1).toHaveLength(1)
  })

  it('les ids structurels sont tous présents', async () => {
    const clanStats = await ClanStatsSection()
    const { container } = render(
      <main>
        <HeroSection />
        {clanStats}
        <WhyJoinSection />
        <RecruitmentCTA />
      </main>
    )
    expect(container.querySelector('#hero')).toBeInTheDocument()
    expect(container.querySelector('#stats')).toBeInTheDocument()
    expect(container.querySelector('#pourquoi')).toBeInTheDocument()
    expect(container.querySelector('#candidature')).toBeInTheDocument()
    expect(container.querySelector('#formulaire-candidature')).toBeInTheDocument()
  })
})

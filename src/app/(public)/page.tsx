import type { Metadata } from 'next'
import { PublicNavbar } from '@/components/landing/PublicNavbar'
import { HeroSection } from '@/components/landing/HeroSection'
import { ClanStatsSection } from '@/components/landing/ClanStatsSection'
import { WhyJoinSection } from '@/components/landing/WhyJoinSection'
import { RecruitmentCTA } from '@/components/landing/RecruitmentCTA'

export const metadata: Metadata = {
  metadataBase: new URL(process.env['NEXT_PUBLIC_SITE_URL'] ?? 'https://warsyndicate.gg'),
  title: 'War Syndicate — Clan Clash of Clans Élite',
  description:
    'Rejoins War Syndicate, clan Clash of Clans compétitif. Données en temps réel, gestion stratégique et outils analytiques pour membres.',
  openGraph: {
    title: 'War Syndicate — Clan CoC Élite',
    description: 'Rejoins War Syndicate, clan Clash of Clans compétitif.',
    images: [
      { url: '/assets/og-image.png', width: 1200, height: 630, alt: 'War Syndicate' },
    ],
    type: 'website',
  },
}

export default function LandingPage() {
  return (
    <>
      <PublicNavbar />
      <main>
        <HeroSection />
        <ClanStatsSection />
        <WhyJoinSection />
        <RecruitmentCTA />
      </main>
    </>
  )
}

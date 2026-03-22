import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { OnboardingCarousel } from '@/components/onboarding/OnboardingCarousel'

export const metadata: Metadata = {
  title: 'War Syndicate — Rejoins le Hub',
}

export default function OnboardingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="h-screen overflow-hidden flex">
      {/* ── Left column — form ── */}
      <div className="flex flex-col w-full lg:w-1/2 bg-white overflow-hidden">
        <header className="flex items-center justify-between px-8 py-5 border-b border-zinc-100 shrink-0">
          <Link href="/" className="flex items-center gap-3">
            <Image
              src="/assets/Logos/war_syndicate-logo.png"
              alt="War Syndicate"
              width={32}
              height={32}
              className="rounded-lg"
            />
            <span className="text-sm font-semibold text-zinc-900 tracking-wide">
              War Syndicate
            </span>
          </Link>
          <span className="text-xs text-zinc-400">
            Vérification sécurisée par Supercell
          </span>
        </header>

        <main className="flex flex-1 min-h-0 flex-col items-center justify-center px-8 py-12 overflow-y-auto">
          {children}
        </main>
      </div>

      {/* ── Right column — carousel (desktop only) ── */}
      <div className="hidden lg:block lg:w-1/2 relative">
        <OnboardingCarousel />
      </div>
    </div>
  )
}

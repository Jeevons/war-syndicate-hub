import { CheckCircle } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { RecruitmentForm } from '@/components/landing/RecruitmentForm'

const RECRUITMENT_CONDITIONS = [
  'Hôtel de Ville niveau 12 minimum',
  'Faire ses 2 attaques en Guerres de Clans (GDC)',
  'Avoir un compte Discord actif',
  'Réaliser ses 6 attaques de Capitale chaque semaine',
] as const

export function RecruitmentCTA() {
  return (
    <div className="px-4 pb-4 pt-0 bg-white">
      <section
        id="candidature"
        aria-labelledby="recruitment-heading"
        className="relative rounded-2xl bg-black border border-zinc-800 shadow-[0_2px_24px_rgba(0,0,0,0.18)] overflow-hidden"
      >
        {/* Clan Castle décoratif */}
        <Image
          src="/assets/coc/buildings/town_hall_14_1.png"
          alt=""
          aria-hidden="true"
          width={220}
          height={220}
          className="absolute -bottom-4 right-8 md:right-24 opacity-10 md:opacity-20 pointer-events-none select-none"
        />

        {/* Contenu principal */}
        <div className="max-w-4xl mx-auto px-6 py-16">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* Left — copy */}
            <div>
              <p className="text-xs font-semibold tracking-widest uppercase text-zinc-500 mb-4">
                Recrutement ouvert
              </p>
              <h2
                id="recruitment-heading"
                className="text-3xl md:text-4xl font-black text-white tracking-tight leading-tight"
              >
                Rejoindre{' '}
                <span
                  className="text-transparent bg-clip-text"
                  style={{ backgroundImage: 'linear-gradient(135deg, #fb923c 0%, #f97316 100%)' }}
                >
                  War Syndicate
                </span>
              </h2>
              <p className="mt-4 text-zinc-400 leading-relaxed">
                On cherche des joueurs sérieux et assidus, prêts à s&apos;investir dans la durée. Pas de place pour les touristes.
              </p>

              <div id="formulaire-candidature">
                <RecruitmentForm />
              </div>
            </div>

            {/* Right — conditions */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
              <p className="text-xs font-semibold tracking-widest uppercase text-zinc-500 mb-5">
                Prérequis
              </p>
              <ul className="space-y-4" aria-label="Conditions de recrutement">
                {RECRUITMENT_CONDITIONS.map((condition) => (
                  <li key={condition} className="flex items-start gap-3">
                    <CheckCircle
                      className="h-5 w-5 text-emerald-400 shrink-0 mt-0.5"
                      aria-hidden="true"
                    />
                    <span className="text-sm text-zinc-300 leading-snug">{condition}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Footer intégré */}
        <div className="border-t border-white/5 px-6 py-4 flex flex-col md:flex-row items-center justify-between gap-3">
          <Link
            href="/"
            className="flex items-center gap-2 group"
            aria-label="War Syndicate — Accueil"
          >
            <Image
              src="/assets/Logos/war_syndicate-logo.png"
              alt="Logo War Syndicate"
              width={20}
              height={20}
              className="rounded opacity-60 group-hover:opacity-90 transition-opacity"
            />
            <span className="font-supercell text-xs text-zinc-600 group-hover:text-zinc-400 transition-colors">
              War Syndicate
            </span>
          </Link>

          <nav aria-label="Liens footer" className="flex items-center gap-4">
            <a href="#candidature" className="text-xs text-zinc-600 hover:text-zinc-400 transition-colors">
              Candidature
            </a>
            <Link href="/news" className="text-xs text-zinc-600 hover:text-zinc-400 transition-colors">
              Actualités
            </Link>
          </nav>

          <p className="text-[11px] text-zinc-700 text-center leading-snug">
            Fan site non officiel ·{' '}
            <a
              href="https://supercell.com/en/fan-content-policy/"
              target="_blank"
              rel="noopener noreferrer"
              className="underline underline-offset-2 hover:text-zinc-500 transition-colors"
            >
              Fan Content Policy
            </a>
          </p>
        </div>
      </section>
    </div>
  )
}

import Image from 'next/image'
import Link from 'next/link'

export function PublicFooter() {
  return (
    <footer className="px-4 pb-4 pt-8">
      <div className="max-w-5xl mx-auto rounded-2xl bg-zinc-900 border border-zinc-800 shadow-[0_2px_24px_rgba(0,0,0,0.18)] px-6 py-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Logo + nom */}
          <Link
            href="/"
            className="flex items-center gap-2.5 group"
            aria-label="War Syndicate — Accueil"
          >
            <Image
              src="/assets/Logos/war_syndicate-logo.png"
              alt="Logo War Syndicate"
              width={26}
              height={26}
              className="rounded-md opacity-90 group-hover:opacity-100 transition-opacity"
            />
            <span className="text-sm font-bold text-white/80 group-hover:text-white transition-colors">
              War Syndicate
            </span>
          </Link>

          {/* Liens */}
          <nav aria-label="Liens footer" className="flex items-center gap-4">
            <a
              href="#candidature"
              className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
            >
              Candidature
            </a>
            <Link
              href="/news"
              className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
            >
              Actualités
            </Link>
          </nav>

          {/* Mention fan content */}
          <p className="text-[11px] text-zinc-600 text-center md:text-right leading-snug">
            Fan site non officiel. Contenu sous{' '}
            <a
              href="https://supercell.com/en/fan-content-policy/"
              target="_blank"
              rel="noopener noreferrer"
              className="underline underline-offset-2 hover:text-zinc-400 transition-colors"
            >
              Fan Content Policy
            </a>{' '}
            Supercell.
          </p>
        </div>
      </div>
    </footer>
  )
}

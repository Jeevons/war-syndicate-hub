import Image from 'next/image'
import { VimeoBackground } from './VimeoBackground'

export function HeroSection() {
  return (
    <section
      id="hero"
      aria-labelledby="hero-heading"
      className="relative min-h-screen flex flex-col items-center justify-center text-center px-4 pt-28 pb-20 bg-zinc-950 overflow-hidden"
    >
      {/* ── Vidéo background Vimeo — montée après hydratation pour ne pas bloquer le FCP ── */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
        <VimeoBackground />
      </div>

      {/* ── Voile sombre ── */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: 'linear-gradient(to bottom, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.45) 60%, rgba(0,0,0,0.70) 100%)' }}
        aria-hidden="true"
      />

      {/* ── Vignette sur les bords ── */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ boxShadow: 'inset 0 0 120px rgba(0,0,0,0.6)' }}
        aria-hidden="true"
      />

      {/* Logo */}
      <div className="relative z-10 mb-8 animate-fade-in-up" style={{ animationDelay: '0.6s' }}>
        <div className="w-24 h-24 md:w-28 md:h-28 mx-auto relative">
          <Image
            src="/assets/Logos/war_syndicate-logo.png"
            alt="Logo War Syndicate"
            fill
            className="object-contain drop-shadow-2xl"
            priority
            sizes="(max-width: 768px) 96px, 112px"
          />
        </div>
      </div>

      {/* Titre principal */}
      <div className="relative z-10 max-w-4xl">
        <div
          className="inline-flex items-center gap-2 mb-6 px-3 py-1.5 rounded-full bg-orange-500/15 border border-orange-500/30 text-orange-400 text-xs font-semibold tracking-widest uppercase backdrop-blur-sm animate-fade-in-up"
          style={{ animationDelay: '0.9s' }}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-orange-400 animate-pulse" aria-hidden="true" />
          Clan Clash of Clans · Actif depuis 2026
        </div>

        <h1
          id="hero-heading"
          className="text-[clamp(3.5rem,10vw,8rem)] leading-none tracking-tighter text-white drop-shadow-2xl animate-fade-in-up"
          style={{ animationDelay: '1.1s' }}
        >
          War
          <br />
          <span
            className="text-transparent bg-clip-text"
            style={{ backgroundImage: 'linear-gradient(135deg, #fb923c 0%, #f97316 100%)' }}
          >
            Syndicate
          </span>
        </h1>

        <p
          className="mt-6 text-xl md:text-2xl text-white/60 font-light max-w-2xl mx-auto leading-relaxed animate-fade-in-up"
          style={{ animationDelay: '1.4s' }}
        >
          Données en temps réel. Stratégie collective.{' '}
          <span className="text-white font-semibold">Victoires répétées.</span>
        </p>
      </div>

      {/* CTAs */}
      <div
        className="relative z-20 mt-10 flex flex-col sm:flex-row gap-3 w-full max-w-sm sm:max-w-none sm:w-auto animate-fade-in-up"
        style={{ animationDelay: '1.65s' }}
      >
        <a
          href="#candidature"
          aria-label="Rejoindre le clan War Syndicate"
          className="inline-flex items-center justify-center rounded-xl text-white px-8 py-4 text-base font-semibold hover:opacity-90 transition-all hover:scale-[1.02] active:scale-[0.98] min-h-[52px] shadow-lg"
          style={{ background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)' }}
        >
          Rejoindre le clan →
        </a>
        <a
          href="#stats"
          className="inline-flex items-center justify-center rounded-xl bg-white/10 border border-white/20 text-white px-8 py-4 text-base font-semibold hover:bg-white/20 transition-colors min-h-[52px] backdrop-blur-sm"
        >
          Voir les stats
        </a>
      </div>

      {/* Héros décoratifs — Barbarian King & Archer Queen */}
      <Image
        src="/assets/coc/troops/models/barbarian_king.png"
        alt=""
        aria-hidden="true"
        width={260}
        height={260}
        className="absolute bottom-0 -right-[40px] md:right-8 lg:right-24 pointer-events-none select-none drop-shadow-2xl z-10 animate-fade-in-up"
        style={{ transform: 'scaleX(-1)', filter: 'drop-shadow(0 0 24px rgba(249,115,22,0.4))', animationDelay: '1.9s' }}
      />
      <Image
        src="/assets/coc/troops/models/archer_queen.png"
        alt=""
        aria-hidden="true"
        width={220}
        height={220}
        className="absolute bottom-0 left-0 md:left-8 lg:left-24 pointer-events-none select-none drop-shadow-2xl z-10 animate-fade-in-up"
        style={{ filter: 'drop-shadow(0 0 20px rgba(249,115,22,0.3))', animationDelay: '2.05s' }}
      />

      {/* Scroll indicator */}
      <div
        className="relative z-10 mt-20 flex flex-col items-center gap-1 text-white/40 animate-fade-in-up"
        style={{ animationDelay: '2.3s' }}
        aria-hidden="true"
      >
        <span className="text-xs font-medium tracking-widest uppercase">Découvrir</span>
        <span className="text-lg leading-none animate-bounce">↓</span>
      </div>
    </section>
  )
}

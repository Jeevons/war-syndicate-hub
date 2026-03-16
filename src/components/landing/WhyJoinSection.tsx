import { BarChart2, Swords, MessageCircle } from 'lucide-react'
import Image from 'next/image'

const PILLARS = [
  {
    icon: BarChart2,
    iconColor: 'text-orange-500',
    iconBg: 'bg-orange-50',
    title: 'Données en temps réel',
    description:
      "Accède aux statistiques live de chaque membre via l'API officielle Clash of Clans. Performances, trophées, contributions — tout est traçable.",
  },
  {
    icon: Swords,
    iconColor: 'text-amber-500',
    iconBg: 'bg-amber-50',
    title: 'Guerres coordonnées',
    description:
      "Des plans d'attaque concertés, des bases de guerre optimisées et une discipline collective qui transforme chaque GDC en victoire méthodique.",
  },
  {
    icon: MessageCircle,
    iconColor: 'text-emerald-500',
    iconBg: 'bg-emerald-50',
    title: 'Communauté active',
    description:
      'Un serveur Discord vivant avec des channels dédiés : stratégies, annonces de guerre, base building et entraide entre membres.',
  },
] as const

export function WhyJoinSection() {
  return (
    <section
      id="pourquoi"
      aria-labelledby="why-heading"
      className="relative py-24 px-4 bg-white overflow-hidden"
    >
      {/* Royal Champion décoratif */}
            <Image
              src="/assets/coc/troops/models/royal_champion.png"
              alt=""
              aria-hidden="true"
              width={180}
              height={180}
              className="absolute -bottom-2 left-4 md:left-16 pointer-events-none select-none drop-shadow-xl"
              style={{ transform: 'scaleX(-1)' }}
            />
      {/* Grand Warden décoratif */}
      <Image
        src="/assets/coc/troops/models/grand_warden.png"
        alt=""
        aria-hidden="true"
        width={180}
        height={180}
        className="absolute -bottom-4 right-4 md:right-16 pointer-events-none select-none drop-shadow-xl"
      />

      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <p className="text-xs font-semibold tracking-widest uppercase text-zinc-400 mb-3">
            Pourquoi nous rejoindre
          </p>
          <h2
            id="why-heading"
            className="text-3xl md:text-4xl font-black text-zinc-900 tracking-tight leading-tight"
          >
            Un clan, une{' '}
            <span
              className="text-transparent bg-clip-text"
              style={{ backgroundImage: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)' }}
            >
              méthode
            </span>
          </h2>
          <p className="mt-4 text-zinc-500 text-lg max-w-xl mx-auto leading-relaxed">
            War Syndicate n&apos;est pas un clan de passage. C&apos;est une structure pensée pour progresser ensemble.
          </p>
        </div>

        {/* Pillars */}
        <div className="grid md:grid-cols-3 gap-6 ">
          {PILLARS.map(({ icon: Icon, iconColor, iconBg, title, description }) => (
            <div
              key={title}
              className="group relative flex flex-col gap-4 rounded-2xl backdrop-blur-xs border border-zinc-200/80 bg-white/10 p-8 hover:border-zinc-300 hover:shadow-md transition-all duration-200"
            >
              {/* Subtle corner accent */}
              <div
                className="absolute top-0 right-0 w-24 h-24 rounded-tr-2xl opacity-[0.04] pointer-events-none"
                style={{ backgroundImage: 'radial-gradient(circle at top right, #f97316, transparent 70%)' }}
                aria-hidden="true"
              />

              <div className={`w-11 h-11 rounded-xl ${iconBg} flex items-center justify-center shrink-0`}>
                <Icon className={`h-5 w-5 ${iconColor}`} aria-hidden="true" />
              </div>

              <div>
                <h3 className="text-base font-bold text-zinc-900 mb-2">{title}</h3>
                <p className="text-sm text-zinc-800 leading-relaxed">{description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

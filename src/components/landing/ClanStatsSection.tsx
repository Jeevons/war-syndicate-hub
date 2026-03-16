import { Users, Crown, Trophy, Shield } from 'lucide-react'
import Image from 'next/image'

interface ClanApiData {
  members?: number
  warLeague?: { id?: number; name?: string }
  clanPoints?: number
  clanLevel?: number
}

const FALLBACK = {
  members: 50,
  warLeague: 'Non classé',
  clanPoints: 56000,
  clanLevel: 15,
}

async function fetchClanStats(): Promise<typeof FALLBACK> {
  const apiKey = process.env['CLASH_OF_CLANS_API_KEY']
  const clanTag = process.env['CLASH_OF_CLANS_CLAN_TAG'] ?? '%232CPY9YUY9'

  if (!apiKey) return FALLBACK

  try {
    const res = await fetch(
      `https://api.clashofclans.com/v1/clans/${clanTag}`,
      {
        headers: { Authorization: `Bearer ${apiKey}` },
        next: { revalidate: 3600 },
      }
    )
    if (!res.ok) return FALLBACK

    const data = (await res.json()) as ClanApiData
    return {
      members: data.members ?? FALLBACK.members,
      warLeague: data.warLeague?.name ?? FALLBACK.warLeague,
      clanPoints: data.clanPoints ?? FALLBACK.clanPoints,
      clanLevel: data.clanLevel ?? FALLBACK.clanLevel,
    }
  } catch {
    return FALLBACK
  }
}

export async function ClanStatsSection() {
  const stats = await fetchClanStats()

  const CLAN_STATS = [
    {
      label: 'Membres actifs',
      value: String(stats.members),
      icon: Users,
      color: 'text-orange-500',
      bg: 'bg-orange-50',
    },
    {
      label: 'Ligue de guerre',
      value: stats.warLeague,
      icon: Crown,
      color: 'text-amber-500',
      bg: 'bg-amber-50',
    },
    {
      label: 'Trophées du clan',
      value: stats.clanPoints.toLocaleString('fr-FR'),
      icon: Trophy,
      color: 'text-yellow-500',
      bg: 'bg-yellow-50',
    },
    {
      label: 'Niveau du clan',
      value: `Niv. ${stats.clanLevel}`,
      icon: Shield,
      color: 'text-emerald-500',
      bg: 'bg-emerald-50',
    },
  ]

  return (
    <section
      id="stats"
      aria-label="Statistiques du clan"
      className="relative py-20 px-4 bg-zinc-50 border-y border-zinc-100 overflow-hidden"
    >
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-3 mb-3">
            <Image
              src="/assets/coc/trophy.png"
              alt=""
              aria-hidden="true"
              width={32}
              height={32}
              className="opacity-80"
            />
            <p className="text-xs font-semibold tracking-widest uppercase text-zinc-400">
              Données en direct · API officielle CoC
            </p>
            <Image
              src="/assets/coc/trophy.png"
              alt=""
              aria-hidden="true"
              width={32}
              height={32}
              className="opacity-80"
            />
          </div>
          <h2 className="text-2xl md:text-3xl font-bold text-zinc-900 tracking-tight">
            Le clan en chiffres
          </h2>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {CLAN_STATS.map(({ label, value, icon: Icon, color, bg }) => (
            <div
              key={label}
              className="flex flex-col items-center text-center gap-3 bg-white rounded-2xl border border-zinc-200/80 p-6 shadow-sm z-10"
            >
              <div className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center`}>
                <Icon className={`h-5 w-5 ${color}`} aria-hidden="true" />
              </div>
              <span className="text-3xl font-black tabular-nums text-zinc-900 leading-none">
                {value}
              </span>
              <span className="text-xs font-medium text-zinc-400 leading-snug">
                {label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

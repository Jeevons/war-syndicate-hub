import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export const metadata: Metadata = {
  title: 'Hub — War Syndicate',
  description: 'Ton Hub War Syndicate.',
}

export default async function DashboardPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login?message=Connecte-toi pour accéder à ton Hub')
  }

  const { data: profiles } = await supabase
    .from('profiles')
    .select('name, tag, townhall_level, is_main')
    .eq('user_id', user.id)
    .eq('is_main', true)
    .maybeSingle()

  return (
    <main className="min-h-screen px-6 py-10">
      <div className="w-full max-w-2xl mx-auto flex flex-col gap-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">
            {profiles ? `Bienvenue, ${profiles.name} !` : 'Bienvenue sur ton Hub'}
          </h1>
          <p className="mt-1 text-sm text-zinc-400">
            War Syndicate — Dashboard en construction (Story 3.1)
          </p>
        </div>

        {profiles && (
          <div className="rounded-xl border border-white/10 bg-white/5 p-4 flex flex-col gap-1">
            <p className="text-sm text-zinc-400">
              Compte principal :{' '}
              <span className="font-mono text-white font-medium">{profiles.tag}</span>
            </p>
            <p className="text-sm text-zinc-400">
              Hôtel de Ville :{' '}
              <span className="text-white">Niveau {profiles.townhall_level}</span>
            </p>
          </div>
        )}

        <p className="text-xs text-zinc-500">
          Le dashboard complet sera disponible dans la prochaine story (3.1).
        </p>
      </div>
    </main>
  )
}

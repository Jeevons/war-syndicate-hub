import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { ProfileClient } from '@/components/onboarding/ProfileClient'

export const metadata: Metadata = {
  title: 'Mon Profil — War Syndicate',
  description: 'Gérez vos comptes Clash of Clans liés à War Syndicate.',
}

export default async function ProfilePage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login?message=Connecte-toi pour accéder à ton profil')
  }

  const { data: profiles } = await supabase
    .from('profiles')
    .select('id, tag, name, townhall_level, is_main, verified_at')
    .eq('user_id', user.id)
    .order('is_main', { ascending: false })

  return (
    <main className="min-h-screen px-6 py-10">
      <div className="w-full max-w-2xl mx-auto flex flex-col gap-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">
            Mes comptes CoC
          </h1>
          <p className="mt-1 text-sm text-zinc-400">
            Gère tes comptes Clash of Clans liés à War Syndicate.
          </p>
        </div>
        <ProfileClient profiles={profiles ?? []} />
      </div>
    </main>
  )
}

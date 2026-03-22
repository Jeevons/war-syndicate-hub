import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { StepGuide } from '@/components/onboarding/StepGuide'

export const metadata: Metadata = {
  title: 'Liaison CoC — War Syndicate',
  description: 'Lie ton compte Clash of Clans pour accéder à ton Hub personnel.',
}

export default async function OnboardingPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login?message=Connecte-toi pour accéder à ton Hub')
  }

  const { count } = await supabase
    .from('profiles')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', user.id)

  if ((count ?? 0) > 0) {
    redirect('/dashboard')
  }

  return (
    <div className="w-full max-w-md flex flex-col items-center gap-8">
      {/* En-tête */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 rounded-full border border-orange-500/30 bg-orange-500/10 px-3 py-1 text-xs text-orange-600 mb-2">
          Étape 1 sur 1 — Liaison de compte
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900">
          Lie ton compte Clash of Clans
        </h1>
        <p className="text-sm text-zinc-500 max-w-xs mx-auto">
          Une vérification cryptographique via Supercell pour protéger ton
          identité de joueur.
        </p>
      </div>

      {/* Formulaire */}
      <StepGuide light />

      {/* Aide */}
      <p className="text-xs text-zinc-400 text-center">
        Tu pourras ajouter d&apos;autres comptes depuis ton profil après la liaison.
      </p>
    </div>
  )
}

'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { buttonVariants } from '@/components/ui/button-variants'
import { cn } from '@/lib/utils'
import { StepGuide } from './StepGuide'

interface CocProfile {
  id: number
  tag: string
  name: string
  townhall_level: number
  is_main: boolean
  verified_at: string | null
}

interface ProfileClientProps {
  profiles: CocProfile[]
}

export function ProfileClient({ profiles: initialProfiles }: ProfileClientProps) {
  const router = useRouter()
  const [profiles, setProfiles] = useState<CocProfile[]>(initialProfiles)
  const [showAddForm, setShowAddForm] = useState(false)
  const [settingMain, setSettingMain] = useState<string | null>(null)

  // Sync avec les données serveur après router.refresh() — évite le stale state trap
  useEffect(() => {
    setProfiles(initialProfiles)
  }, [initialProfiles])

  const handleSetMain = async (tag: string) => {
    setSettingMain(tag)
    try {
      const response = await fetch('/api/v1/coc/set-main', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tag }),
      })

      if (!response.ok) {
        toast.error('Impossible de définir ce compte comme principal')
        return
      }

      // Mettre à jour localement
      setProfiles((prev) =>
        prev.map((p) => ({ ...p, is_main: p.tag === tag }))
      )
      toast.success('Compte principal mis à jour')
      router.refresh()
    } catch {
      toast.error('Erreur réseau — réessaie')
    } finally {
      setSettingMain(null)
    }
  }

  const handleAddSuccess = () => {
    setShowAddForm(false)
    router.refresh()
  }

  if (profiles.length === 0) {
    return (
      <div className="flex flex-col items-center gap-6 rounded-xl border border-white/10 bg-white/5 p-8 text-center">
        <p className="text-zinc-400 text-sm">
          Aucun compte CoC lié pour l&apos;instant.
        </p>
        <button
          onClick={() => setShowAddForm(true)}
          className={cn(buttonVariants(), 'min-h-[44px]')}
        >
          Lier mon premier compte CoC
        </button>
        {showAddForm && (
          <div className="w-full mt-4">
            <StepGuide onSuccess={handleAddSuccess} />
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Liste des profils */}
      <ul className="flex flex-col gap-3">
        {profiles.map((profile) => (
          <li
            key={profile.tag}
            className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 px-4 py-3 gap-4"
          >
            <div className="flex flex-col gap-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-semibold text-white truncate">
                  {profile.name}
                </span>
                {profile.is_main && (
                  <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-indigo-600/30 text-indigo-300 border border-indigo-500/30">
                    Principal
                  </span>
                )}
              </div>
              <span className="text-xs font-mono text-zinc-400">
                {profile.tag} · HV {profile.townhall_level}
              </span>
            </div>
            {!profile.is_main && (
              <button
                onClick={() => handleSetMain(profile.tag)}
                disabled={settingMain === profile.tag}
                aria-busy={settingMain === profile.tag}
                className={cn(
                  buttonVariants({ variant: 'outline', size: 'sm' }),
                  'shrink-0 min-h-[44px] text-xs'
                )}
              >
                {settingMain === profile.tag
                  ? 'Mise à jour…'
                  : 'Définir principal'}
              </button>
            )}
          </li>
        ))}
      </ul>

      {/* Ajouter un compte */}
      {!showAddForm ? (
        <button
          onClick={() => setShowAddForm(true)}
          className={cn(
            buttonVariants({ variant: 'outline' }),
            'w-full min-h-[44px]'
          )}
        >
          + Ajouter un compte CoC
        </button>
      ) : (
        <div className="rounded-xl border border-white/10 bg-white/5 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-base font-semibold text-white">
              Ajouter un compte
            </h2>
            <button
              onClick={() => setShowAddForm(false)}
              className="text-sm text-zinc-400 hover:text-white"
              aria-label="Fermer le formulaire"
            >
              ✕
            </button>
          </div>
          <StepGuide onSuccess={handleAddSuccess} />
        </div>
      )}
    </div>
  )
}

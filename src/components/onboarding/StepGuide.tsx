'use client'

import { useState } from 'react'
import Image from 'next/image'
import { z } from 'zod'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { buttonVariants } from '@/components/ui/button-variants'
import { cn } from '@/lib/utils'

const TagSchema = z
  .string()
  .transform((v) => v.toUpperCase().trim())
  .pipe(
    z
      .string()
      .regex(/^#[A-Z0-9]{6,9}$/, 'Format invalide — exemple : #ABC12345')
  )

type Step = 1 | 2 | 3

interface StepGuideProps {
  onSuccess?: () => void
  light?: boolean
}

export function StepGuide({ onSuccess, light }: StepGuideProps) {
  const router = useRouter()
  const [step, setStep] = useState<Step>(1)
  const [tag, setTag] = useState('')
  const [token, setToken] = useState('')
  const [tagError, setTagError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  // Theme tokens — light mode overrides the inherited dark-mode styles
  const t = light
    ? {
        stepInactive: 'bg-zinc-100 text-zinc-400',
        heading: 'text-zinc-900',
        body: 'text-zinc-500',
        label: 'text-zinc-700',
        code: 'text-orange-600',
        imgBorder: 'border-zinc-200',
        input:
          'bg-white border-zinc-200 text-zinc-900 placeholder:text-zinc-400',
        focusRing: 'focus:ring-orange-500',
        summary: 'border-zinc-100 bg-zinc-50',
        summaryLabel: 'text-zinc-500',
        summaryValue: 'text-zinc-900',
        summaryToken: 'text-zinc-400',
      }
    : {
        stepInactive: 'bg-white/10 text-zinc-400',
        heading: 'text-white',
        body: 'text-zinc-400',
        label: 'text-zinc-300',
        code: 'text-orange-400',
        imgBorder: 'border-white/10',
        input:
          'bg-white/5 border-white/10 text-white placeholder:text-zinc-500',
        focusRing: 'focus:ring-orange-500',
        summary: 'border-white/10 bg-white/5',
        summaryLabel: 'text-zinc-400',
        summaryValue: 'text-white',
        summaryToken: 'text-zinc-300',
      }

  // "Retour" button — in light mode we bypass buttonVariants entirely to avoid
  // dark: CSS variables that always apply (ThemeProvider sets .dark on <html>).
  // Sonner position — in two-column layout (light mode), center toast under the left column
  const tp = light ? ({ position: 'bottom-left' } as const) : {}

  const retourCls = light
    ? 'flex-1 min-h-[44px] inline-flex items-center justify-center rounded-lg border border-zinc-300 bg-white text-zinc-900 text-sm font-medium hover:bg-zinc-50 active:translate-y-px transition-colors disabled:opacity-50 disabled:pointer-events-none'
    : cn(buttonVariants({ variant: 'outline' }), 'flex-1 min-h-[44px]')

  const validateTag = (value: string): boolean => {
    const result = TagSchema.safeParse(value)
    if (!result.success) {
      setTagError(result.error.issues[0]?.message ?? 'Format invalide')
      return false
    }
    setTagError(null)
    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateTag(tag)) return

    setIsLoading(true)
    try {
      const response = await fetch('/api/v1/coc/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tag, token }),
      })

      const data = await response.json()

      if (!response.ok) {
        if (data.error?.code === 'TOKEN_INVALID') {
          toast.error(
            'Token invalide ou expiré — régénère-le dans ton profil in-game',
            tp
          )
        } else if (data.error?.code === 'TAG_ALREADY_LINKED') {
          toast.error('Ce tag est déjà associé à un compte War Syndicate', tp)
        } else if (data.error?.code === 'RATE_LIMIT_EXCEEDED') {
          toast.error(
            'Trop de tentatives — réessaie dans une heure',
            tp
          )
        } else if (data.error?.code === 'COC_API_KEY_REJECTED') {
          toast.error(
            "Configuration API incorrecte — contacte l'administrateur du site",
            tp
          )
        } else if (data.error?.code === 'COC_API_UNAVAILABLE') {
          toast.error(
            "L'API Supercell est temporairement indisponible — réessaie dans quelques instants",
            tp
          )
        } else {
          toast.error("Une erreur inattendue s'est produite", tp)
        }
        return
      }

      toast.success(
        `Compte lié ! Bienvenue sur ton Hub, ${data.data.profile.name} 🎉`,
        { ...tp, duration: 3000 }
      )

      if (onSuccess) {
        onSuccess()
      } else {
        router.push('/dashboard')
      }
    } catch {
      toast.error('Erreur réseau — vérifie ta connexion et réessaie', tp)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-md space-y-6">
      {/* Step Indicator */}
      <nav aria-label="Étapes de liaison" className="flex items-center gap-2">
        {([1, 2, 3] as Step[]).map((s) => (
          <div
            key={s}
            aria-current={step === s ? 'step' : undefined}
            aria-label={`Étape ${s}`}
            className={cn(
              'flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium',
              step === s
                ? 'bg-orange-500 text-white'
                : step > s
                  ? 'bg-emerald-600 text-white'
                  : t.stepInactive
            )}
          >
            {s}
          </div>
        ))}
      </nav>

      {/* Étape 1 — Saisie du #TAG */}
      {step === 1 && (
        <div className="space-y-4">
          <h2 className={cn('text-lg font-semibold', t.heading)}>
            Étape 1 — Ton tag Clash of Clans
          </h2>
          <p className={cn('text-sm', t.body)}>
            Trouve ton tag dans ton profil in-game. Il commence par{' '}
            <code className={t.code}>#</code>.
          </p>
          <div className="space-y-1">
            <label htmlFor="coc-tag" className={cn('text-sm', t.label)}>
              Tag joueur
            </label>
            <input
              id="coc-tag"
              type="text"
              value={tag}
              onChange={(e) => setTag(e.target.value)}
              onBlur={() => tag && validateTag(tag)}
              placeholder="#ABC12345"
              className={cn(
                'w-full rounded-lg border px-4 py-2.5',
                'focus:outline-none focus:ring-2',
                'min-h-[44px] font-mono tracking-wider',
                t.input,
                t.focusRing,
                tagError ? 'border-rose-500' : ''
              )}
              aria-invalid={!!tagError}
              aria-describedby={tagError ? 'tag-error' : undefined}
            />
            {tagError && (
              <p id="tag-error" className="text-sm text-rose-500" role="alert">
                {tagError}
              </p>
            )}
          </div>
          {/* Illustration — trouver son tag in-game */}
          <div className={cn('overflow-hidden rounded-lg border', t.imgBorder)}>
            <Image
              src="/assets/coc/coc-profile-tag.png"
              alt="Profil CoC — le tag est affiché sous ton pseudo"
              width={800}
              height={600}
              className="w-full object-cover"
            />
          </div>
          <button
            type="button"
            onClick={() => {
              if (validateTag(tag)) setStep(2)
            }}
            className={cn(
              'inline-flex w-full min-h-[44px] items-center justify-center rounded-lg',
              'bg-orange-500 text-white text-sm font-medium',
              'hover:bg-orange-600 transition-colors'
            )}
          >
            Continuer
          </button>
        </div>
      )}

      {/* Étape 2 — Token In-Game */}
      {step === 2 && (
        <div className="space-y-4">
          <h2 className={cn('text-lg font-semibold', t.heading)}>
            Étape 2 — Token de vérification
          </h2>
          <ol
            className={cn(
              'list-decimal list-inside space-y-2 text-sm',
              t.body
            )}
          >
            <li>Ouvre Clash of Clans sur ton appareil</li>
            <li>Va dans ton Profil → Paramètres → Plus de paramètres</li>
            <li>Trouve &quot;Token API&quot; et copie le code affiché</li>
          </ol>
          {/* Illustration — trouver le Jeton API in-game */}
          <div className={cn('overflow-hidden rounded-lg border', t.imgBorder)}>
            <Image
              src="/assets/coc/coc-token-guide.png"
              alt="Paramètres supplémentaires CoC — section Jeton API"
              width={800}
              height={600}
              className="w-full object-cover"
            />
          </div>
          <div className="space-y-1">
            <label htmlFor="coc-token" className={cn('text-sm', t.label)}>
              Token de vérification
            </label>
            <input
              id="coc-token"
              type="text"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              placeholder="Colle ton token ici"
              className={cn(
                'w-full rounded-lg border px-4 py-2.5',
                'focus:outline-none focus:ring-2 min-h-[44px]',
                t.input,
                t.focusRing
              )}
            />
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setStep(1)}
              className={retourCls}
            >
              Retour
            </button>
            <button
              type="button"
              onClick={() => token.trim() && setStep(3)}
              disabled={!token.trim()}
              className={cn(
                'flex-1 min-h-[44px] inline-flex items-center justify-center rounded-lg',
                'bg-orange-500 text-white text-sm font-medium',
                'hover:bg-orange-600 transition-colors',
                'disabled:opacity-50 disabled:pointer-events-none'
              )}
            >
              Continuer
            </button>
          </div>
        </div>
      )}

      {/* Étape 3 — Confirmation et soumission */}
      {step === 3 && (
        <div className="space-y-4">
          <h2 className={cn('text-lg font-semibold', t.heading)}>
            Étape 3 — Confirmer la liaison
          </h2>
          <div className={cn('rounded-lg border p-4 space-y-2', t.summary)}>
            <p className={cn('text-sm', t.summaryLabel)}>
              Tag CoC :{' '}
              <span className={cn('font-mono', t.summaryValue)}>{tag}</span>
            </p>
            <p className={cn('text-sm', t.summaryLabel)}>
              Token : <span className={t.summaryToken}>••••••••</span>
            </p>
          </div>
          {/* Illustration — Vérification Supercell */}
          <div className={cn('overflow-hidden rounded-lg border py-6', t.imgBorder)}>
            <div className="flex flex-col items-center gap-3">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/20">
                <svg
                  className="h-7 w-7 text-emerald-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                  />
                </svg>
              </div>
              <p className={cn('text-xs text-center px-4', t.body)}>
                Supercell va vérifier ton token en temps réel pour confirmer que tu es bien le propriétaire de ce compte.
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setStep(2)}
              disabled={isLoading}
              className={retourCls}
            >
              Retour
            </button>
            <button
              type="submit"
              disabled={isLoading}
              aria-busy={isLoading}
              className={cn(
                'flex-1 min-h-[44px] inline-flex items-center justify-center rounded-lg',
                'bg-orange-500 text-white text-sm font-medium',
                'hover:bg-orange-600 transition-colors',
                'disabled:opacity-50 disabled:pointer-events-none',
                isLoading && 'opacity-70 cursor-not-allowed'
              )}
            >
              {isLoading ? 'Vérification en cours…' : 'Vérifier et lier mon compte'}
            </button>
          </div>
        </div>
      )}
    </form>
  )
}

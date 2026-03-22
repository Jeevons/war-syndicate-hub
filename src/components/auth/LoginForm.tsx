'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { buttonVariants } from '@/components/ui/button-variants'
import { cn } from '@/lib/utils'

interface LoginFormProps {
  message?: string | undefined
  error?: string | undefined
}

export function LoginForm({ message, error }: LoginFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const supabase = createClient()

  const handleDiscordLogin = async () => {
    setIsLoading(true)
    try {
      const { error: oauthError } = await supabase.auth.signInWithOAuth({
        provider: 'discord',
        options: {
          scopes: 'identify email',
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      })
      if (oauthError) {
        console.error('[LoginForm] signInWithOAuth error:', oauthError)
        setIsLoading(false)
      }
      // Si pas d'erreur, la page redirige — isLoading reste true
    } catch (err) {
      console.error('[LoginForm] Unexpected error:', err)
      setIsLoading(false)
    }
  }

  return (
    <div className="flex flex-col items-center gap-6 w-full max-w-sm">
      {message && (
        <p
          className="text-sm text-zinc-400 text-center px-4 py-3 rounded-lg bg-white/5 border border-white/10"
          role="status"
          aria-live="polite"
        >
          {message}
        </p>
      )}

      {error && (
        <p
          className="text-sm text-rose-400 text-center px-4 py-3 rounded-lg bg-rose-500/10 border border-rose-500/20"
          role="alert"
        >
          Une erreur est survenue. Réessaie.
        </p>
      )}

      <button
        onClick={handleDiscordLogin}
        disabled={isLoading}
        aria-busy={isLoading}
        className={cn(
          buttonVariants({ size: 'lg' }),
          'gap-3 w-full min-h-[44px]',
          isLoading && 'opacity-70 cursor-not-allowed'
        )}
      >
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="currentColor"
          aria-hidden="true"
        >
          <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03z" />
        </svg>
        {isLoading ? 'Redirection en cours…' : 'Connexion avec Discord'}
      </button>
    </div>
  )
}

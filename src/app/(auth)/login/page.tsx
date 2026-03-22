import type { Metadata } from 'next'
import { LoginForm } from '@/components/auth/LoginForm'

export const metadata: Metadata = {
  title: 'Connexion — War Syndicate',
  description: 'Connecte-toi à War Syndicate avec ton compte Discord pour accéder au Hub du clan.',
}

interface Props {
  searchParams: Promise<{ message?: string; error?: string }>
}

export default async function LoginPage({ searchParams }: Props) {
  const { message, error } = await searchParams

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-6">
      <div className="w-full max-w-sm flex flex-col items-center gap-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold tracking-tight text-white">
            War Syndicate
          </h1>
          <p className="mt-2 text-sm text-zinc-400">
            Hub stratégique du clan
          </p>
        </div>

        <LoginForm message={message} error={error} />
      </div>
    </main>
  )
}

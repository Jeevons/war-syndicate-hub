import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Liaison CoC — War Syndicate',
  description: 'Lie ton compte Clash of Clans à War Syndicate.',
}

export default function OnboardingPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-3.5rem)] px-6">
      <div className="w-full max-w-md text-center flex flex-col gap-4">
        <h1 className="text-2xl font-bold tracking-tight">
          Lie ton compte Clash of Clans
        </h1>
        <p className="text-muted-foreground text-sm">
          Pour accéder à ton Hub complet, tu dois lier ton compte CoC à ton profil Discord.
          Cette fonctionnalité sera disponible dans la prochaine mise à jour.
        </p>
      </div>
    </div>
  )
}

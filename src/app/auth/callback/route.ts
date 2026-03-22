import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const errorParam = searchParams.get('error')

  if (errorParam) {
    return NextResponse.redirect(`${origin}/login?error=${encodeURIComponent(errorParam)}`)
  }

  if (!code) {
    return NextResponse.redirect(`${origin}/login?error=missing_code`)
  }

  // Collecter les cookies que Supabase veut écrire — appliqués sur la réponse redirect finale.
  // Raison : cookies() de next/headers ne propage PAS les Set-Cookie sur une NextResponse.redirect()
  // custom. Il faut les appliquer explicitement sur l'objet response.
  const pendingCookies: Array<{ name: string; value: string; options: Record<string, unknown> }> = []

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            pendingCookies.push({ name, value, options: options ?? {} })
          )
        },
      },
    }
  )

  const { data, error } = await supabase.auth.exchangeCodeForSession(code)

  if (error || !data.session) {
    console.error('[Auth Callback] exchangeCodeForSession error:', error)
    return NextResponse.redirect(`${origin}/login?error=session_error`)
  }

  const user = data.session.user

  // Synchronisation vers public.users
  const discordId =
    user.user_metadata?.provider_id ??
    user.user_metadata?.sub ??
    user.user_metadata?.user_id ??
    null

  // Guard — discord_id est NOT NULL dans la table users
  if (!discordId) {
    console.error('[Auth Callback] discordId manquant — user_metadata:', JSON.stringify(user.user_metadata))
    return NextResponse.redirect(`${origin}/login?error=discord_metadata_error`)
  }

  const username =
    user.user_metadata?.full_name ??
    user.user_metadata?.name ??
    user.user_metadata?.user_name ??
    'Membre War Syndicate'

  const avatarUrl = user.user_metadata?.avatar_url ?? null
  const email = user.email ?? null

  if (process.env.NODE_ENV === 'development') {
    console.log('[Auth] user_metadata:', JSON.stringify(user.user_metadata, null, 2))
  }

  const { error: upsertError } = await supabase
    .from('users')
    .upsert(
      {
        id: user.id,
        discord_id: discordId,
        username,
        avatar_url: avatarUrl,
        email,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'discord_id' }
    )

  if (upsertError) {
    console.error('[Auth Callback] UPSERT users error:', upsertError)
  }

  // Vérifier si profil CoC déjà lié
  const { count } = await supabase
    .from('profiles')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', user.id)

  const hasCoC = (count ?? 0) > 0
  const redirectTo = hasCoC ? '/dashboard' : '/onboarding'

  // Créer la réponse redirect et y appliquer les cookies de session explicitement
  const response = NextResponse.redirect(`${origin}${redirectTo}`)
  pendingCookies.forEach(({ name, value, options }) => {
    if (options) {
      response.cookies.set(name, value, options)
    } else {
      response.cookies.set(name, value)
    }
  })

  return response
}

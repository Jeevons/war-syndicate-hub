// supabase/functions/verify-clan-membership/handler.ts
// Logique métier extraite pour testabilité (Vitest / Node.js compatible)
// index.ts injecte les dépendances Deno dans cette fonction pure

export interface Profile {
  id: number
  user_id: string
  tag: string
  name: string
}

// Interface minimale du client Supabase utilisé dans le handler
export interface SupabaseClientLike {
  from: (table: string) => {
    select: (cols: string) => {
      eq: (col: string, val: unknown) => Promise<{ data: Profile[] | null; error: unknown }>
    }
    update: (data: Record<string, unknown>) => {
      in: (col: string, vals: unknown[]) => Promise<{ error: unknown }>
      eq: (col: string, val: unknown) => Promise<{ error: unknown }>
    }
    insert: (data: Record<string, unknown>) => Promise<{ error: unknown }>
  }
}

export interface HandlerDeps {
  supabase: SupabaseClientLike
  clanTag: string
  cocApiKey: string
  sentryDsn?: string
  redisUrl?: string
  redisToken?: string
  fetchFn?: typeof fetch
}

export type HandlerResult =
  | { status: 'ok'; message: string }
  | { status: 'config-error'; message: string }
  | { status: 'no-profiles'; message: string }
  | { status: 'api-unavailable'; message: string }

const COC_BASE_URL = 'https://api.clashofclans.com/v1'

// ── Sentry : reporting via HTTP direct ──────────────────────────────────────
async function reportToSentry(
  sentryDsn: string | undefined,
  error: unknown,
  extra: Record<string, unknown>,
  fetchFn: typeof fetch = globalThis.fetch
): Promise<void> {
  if (!sentryDsn) return

  try {
    const url = new URL(sentryDsn)
    const projectId = url.pathname.replace('/', '')
    const storeEndpoint = `${url.protocol}//${url.host}/api/${projectId}/store/`
    const publicKey = url.username

    await fetchFn(storeEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Sentry-Auth': `Sentry sentry_version=7, sentry_key=${publicKey}`,
      },
      body: JSON.stringify({
        message: `[VerifyClan] ${error instanceof Error ? error.message : String(error)}`,
        level: 'error',
        extra,
        timestamp: new Date().toISOString(),
        platform: 'other',
      }),
    }).catch(() => {}) // Ne jamais bloquer sur un échec Sentry
  } catch {
    // Ne jamais bloquer sur un échec Sentry
  }
}

export async function verifyClanMembership(deps: HandlerDeps): Promise<HandlerResult> {
  const { supabase, clanTag, cocApiKey, sentryDsn, redisUrl, redisToken } = deps
  const fetchFn = deps.fetchFn ?? globalThis.fetch

  // ── 1. Récupérer tous les profils actifs ─────────────────────────────────
  const { data: activeProfiles, error: profilesError } = await supabase
    .from('profiles')
    .select('id, user_id, tag, name')
    .eq('is_active', true)

  if (profilesError) {
    console.error('[VerifyClan] Erreur lecture profiles:', profilesError)
    return { status: 'config-error', message: 'DB error' }
  }

  if (!activeProfiles || activeProfiles.length === 0) {
    console.log('[VerifyClan] Aucun profil actif — job terminé sans action')
    return { status: 'no-profiles', message: 'Aucun profil actif' }
  }

  // ── 2. Récupérer les membres du clan (avec cache Redis optionnel) ─────────
  let clanMembers: Array<{ tag: string }> = []
  try {
    const encodedTag = encodeURIComponent(clanTag)
    const cacheKey = `coc:clan:members:${encodedTag}`

    let fromCache = false

    // Tentative cache Redis (optionnel — si variables configurées)
    if (redisUrl && redisToken) {
      try {
        const cacheRes = await fetchFn(`${redisUrl}/get/${cacheKey}`, {
          headers: { Authorization: `Bearer ${redisToken}` },
        })
        if (cacheRes.ok) {
          const cacheData = await cacheRes.json()
          if (cacheData.result) {
            clanMembers = JSON.parse(cacheData.result)
            fromCache = true
          }
        }
      } catch {
        // Cache indisponible → continuer avec l'API directe
      }
    }

    if (!fromCache) {
      const response = await fetchFn(
        `${COC_BASE_URL}/clans/${encodedTag}/members`,
        {
          headers: {
            'Authorization': `Bearer ${cocApiKey}`,
            'Accept': 'application/json',
          },
          signal: AbortSignal.timeout(5000),
        }
      )

      if (!response.ok) {
        throw new Error(`API Supercell HTTP ${response.status}`)
      }

      const data = await response.json()
      clanMembers = data.items ?? []

      // Mettre en cache Redis TTL 300s — NFR-IN-01
      if (redisUrl && redisToken) {
        const encodedMembersJson = encodeURIComponent(JSON.stringify(clanMembers))
        await fetchFn(`${redisUrl}/setex/${cacheKey}/300/${encodedMembersJson}`, {
          headers: { Authorization: `Bearer ${redisToken}` },
        }).catch(() => {})
      }
    }
  } catch (error) {
    // AC-4 : API indisponible → log Sentry → ne pas modifier de profils
    console.error('[VerifyClan] API Supercell indisponible:', error)

    await reportToSentry(sentryDsn, error, {
      profilesCount: activeProfiles.length,
      clanTag,
      timestamp: new Date().toISOString(),
    }, fetchFn)

    return { status: 'api-unavailable', message: 'API Supercell indisponible — aucun profil modifié' }
  }

  // ── 3. Comparer et mettre à jour ─────────────────────────────────────────
  const clanTagSet = new Set(clanMembers.map((m) => m.tag.toUpperCase()))
  const now = new Date().toISOString()

  const stillInClan = activeProfiles.filter((p) => clanTagSet.has(p.tag.toUpperCase()))
  const leftClan = activeProfiles.filter((p) => !clanTagSet.has(p.tag.toUpperCase()))

  // AC-2 : verified_at mis à jour pour les membres encore présents
  if (stillInClan.length > 0) {
    const ids = stillInClan.map((p) => p.id)
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ verified_at: now })
      .in('id', ids)

    if (updateError) {
      console.error('[VerifyClan] Erreur mise à jour verified_at:', updateError)
    }
  }

  // AC-3 : Dégradation pour les membres partis + notification
  for (const profile of leftClan) {
    const { error: degradeError } = await supabase
      .from('profiles')
      .update({
        is_active: false,
        syndicate_role: 'PENDING_REVIEW',
        updated_at: now,
      })
      .eq('id', profile.id)

    if (degradeError) {
      console.error(`[VerifyClan] Erreur dégradation profil ${profile.tag}:`, degradeError)
      continue
    }

    await supabase.from('notifications').insert({
      type: 'MEMBER_LEFT_CLAN',
      data: {
        tag: profile.tag,
        name: profile.name,
        user_id: profile.user_id,
        detected_at: now,
      },
    })
  }

  console.log(
    `[VerifyClan] Job terminé — ${stillInClan.length} actifs, ${leftClan.length} partis`
  )

  return { status: 'ok', message: `${stillInClan.length} actifs, ${leftClan.length} partis` }
}

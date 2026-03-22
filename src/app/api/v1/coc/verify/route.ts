// src/app/api/v1/coc/verify/route.ts
// POST /api/v1/coc/verify — Liaison tag CoC + token In-Game
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { verifyPlayerToken, getPlayerData } from '@/lib/coc/client'
import { rateLimit } from '@/lib/redis/client'

const VerifyBodySchema = z.object({
  tag: z
    .string()
    .transform((v) => v.toUpperCase().trim())
    .pipe(
      z
        .string()
        .regex(/^#[A-Z0-9]{6,9}$/, 'Format de tag invalide — exemple : #ABC12345')
    ),
  token: z.string().trim().min(1, 'Le token est requis'),
})

function apiError(code: string, message: string, status: number) {
  return NextResponse.json(
    { error: { code, message, details: {} } },
    { status }
  )
}

export async function POST(request: NextRequest) {
  // 1. Authentification
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return apiError('UNAUTHORIZED', 'Authentification requise', 401)
  }

  // 2. Rate limiting — max 5 tentatives/heure par utilisateur (NFR-IN-01 anti-brute force)
  const { allowed } = await rateLimit(`rate:coc:verify:${user.id}`, 5, 3600)
  if (!allowed) {
    return apiError(
      'RATE_LIMIT_EXCEEDED',
      'Trop de tentatives de liaison — réessaie dans une heure',
      429
    )
  }

  // 3. Validation du body
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return apiError('INVALID_BODY', 'Corps de requête invalide', 400)
  }

  const parseResult = VerifyBodySchema.safeParse(body)
  if (!parseResult.success) {
    return apiError(
      'VALIDATION_ERROR',
      parseResult.error.issues[0]?.message ?? 'Données invalides',
      400
    )
  }

  const { tag, token } = parseResult.data

  // 3. Vérification token In-Game Supercell (NFR-SE-01)
  let isValid: boolean
  try {
    const result = await verifyPlayerToken(tag, token)
    isValid = result.valid
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Erreur inconnue'
    // Erreur IP whitelist → message explicite
    if (message.includes('whitelistée')) {
      return apiError('COC_API_KEY_REJECTED', message, 503)
    }
    return apiError(
      'COC_API_UNAVAILABLE',
      'API Supercell indisponible — réessaie dans quelques instants',
      503
    )
  }

  if (!isValid) {
    return apiError(
      'TOKEN_INVALID',
      'Token invalide ou expiré — régénère-le dans ton profil in-game',
      403
    )
  }

  // 4. Récupérer les données du joueur via cache Redis (TTL 300s)
  let playerData
  try {
    playerData = await getPlayerData(tag)
  } catch {
    return apiError(
      'COC_API_UNAVAILABLE',
      'Impossible de récupérer les données du joueur',
      503
    )
  }

  // 5. Vérifier si le tag est déjà lié à un AUTRE compte Discord
  const { data: existingProfile } = await supabase
    .from('profiles')
    .select('user_id')
    .eq('tag', tag)
    .maybeSingle()

  if (existingProfile && existingProfile.user_id !== user.id) {
    return apiError(
      'TAG_ALREADY_LINKED',
      'Ce tag est déjà associé à un compte War Syndicate',
      409
    )
  }

  // 6. Déterminer is_main (true si c'est le premier profil de cet utilisateur)
  const { count } = await supabase
    .from('profiles')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .neq('tag', tag) // Exclure le profil actuel si re-vérification

  const is_main = (count ?? 0) === 0

  // 7. UPSERT dans profiles
  const { data: profile, error: upsertError } = await supabase
    .from('profiles')
    .upsert(
      {
        user_id: user.id,
        tag,
        name: playerData.name,
        townhall_level: playerData.townhall_level,
        role_in_clan: playerData.role_in_clan,
        is_main,
        verified_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'tag' }
    )
    .select()
    .single()

  if (upsertError) {
    // Code 23505 = unique violation (tag lié à autre compte — double vérification)
    if (upsertError.code === '23505') {
      return apiError(
        'TAG_ALREADY_LINKED',
        'Ce tag est déjà associé à un compte War Syndicate',
        409
      )
    }
    console.error('[CocVerify] UPSERT error:', upsertError)
    return apiError('DB_ERROR', 'Erreur lors de la sauvegarde du profil', 500)
  }

  return NextResponse.json({
    data: {
      success: true,
      profile: {
        tag: profile.tag,
        name: profile.name,
        townhall_level: profile.townhall_level,
        is_main: profile.is_main,
      },
    },
    meta: { timestamp: new Date().toISOString() },
  })
}

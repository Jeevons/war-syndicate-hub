// src/app/api/v1/coc/set-main/route.ts
// POST /api/v1/coc/set-main — Définir un compte CoC comme principal
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'

const SetMainBodySchema = z.object({
  tag: z.string().min(1, 'Le tag est requis'),
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

  // 2. Validation du body
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return apiError('INVALID_BODY', 'Corps de requête invalide', 400)
  }

  const parseResult = SetMainBodySchema.safeParse(body)
  if (!parseResult.success) {
    return apiError(
      'VALIDATION_ERROR',
      parseResult.error.issues[0]?.message ?? 'Données invalides',
      400
    )
  }

  const { tag } = parseResult.data

  // 3. Vérifier que le tag appartient bien à cet utilisateur
  const { data: targetProfile } = await supabase
    .from('profiles')
    .select('id')
    .eq('user_id', user.id)
    .eq('tag', tag)
    .maybeSingle()

  if (!targetProfile) {
    return apiError(
      'PROFILE_NOT_FOUND',
      'Ce tag ne fait pas partie de tes comptes liés',
      404
    )
  }

  // 4. SET le tag ciblé à is_main=true EN PREMIER
  // Stratégie : SET avant RESET pour éliminer la fenêtre "zéro is_main".
  // Si crash entre les deux étapes → plusieurs is_main=true (état dégradé acceptable,
  // auto-corrigible au prochain appel) vs zéro is_main=true (état cassé).
  const { error: setError } = await supabase
    .from('profiles')
    .update({ is_main: true, updated_at: new Date().toISOString() })
    .eq('user_id', user.id)
    .eq('tag', tag)

  if (setError) {
    console.error('[SetMain] Set error:', setError)
    return apiError('DB_ERROR', 'Erreur lors de la mise à jour', 500)
  }

  // 5. RESET tous les AUTRES profils à is_main=false
  const { error: resetError } = await supabase
    .from('profiles')
    .update({ is_main: false, updated_at: new Date().toISOString() })
    .eq('user_id', user.id)
    .neq('tag', tag)

  if (resetError) {
    // Non-bloquant : le tag ciblé est déjà is_main=true (choix utilisateur honoré).
    // Les autres profils ont is_main=true aussi → dégradé mais cohérent.
    // Le prochain appel set-main corrigera l'état.
    console.error('[SetMain] Reset others error (non-bloquant):', resetError)
  }

  return NextResponse.json({
    data: { success: true, main_tag: tag },
    meta: { timestamp: new Date().toISOString() },
  })
}

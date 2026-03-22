// src/app/api/cron/verify-clan-membership/route.ts
// POST — Vérification périodique de l'appartenance au clan (Story 2.3)
// Déclenché par Vercel Cron toutes les 6h via vercel.json
// L'appel API CoC part de l'IP Vercel → whitelistable dans developer.clashofclans.com

import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createServiceClient } from '@/lib/supabase/service'
import { getClanMembers } from '@/lib/coc/client'

// ── Sécurité : Vercel envoie Authorization: Bearer <CRON_SECRET> ─────────────
function verifyCronSecret(request: NextRequest): boolean {
  const cronSecret = process.env.CRON_SECRET
  if (!cronSecret) return false // Pas de secret configuré → refuser

  const authHeader = request.headers.get('authorization')
  return authHeader === `Bearer ${cronSecret}`
}

export async function POST(request: NextRequest) {
  // 1. Vérifier l'autorisation cron
  if (!verifyCronSecret(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const clanTag = process.env.COC_CLAN_TAG
  if (!clanTag) {
    console.error('[VerifyClan] COC_CLAN_TAG manquant')
    return NextResponse.json({ error: 'Configuration manquante' }, { status: 500 })
  }

  const supabase = createServiceClient()

  // 2. Récupérer tous les profils actifs
  const { data: activeProfiles, error: profilesError } = await supabase
    .from('profiles')
    .select('id, user_id, tag, name')
    .eq('is_active', true)

  if (profilesError) {
    console.error('[VerifyClan] Erreur lecture profiles:', profilesError)
    return NextResponse.json({ error: 'DB error' }, { status: 500 })
  }

  if (!activeProfiles || activeProfiles.length === 0) {
    console.log('[VerifyClan] Aucun profil actif — job terminé sans action')
    return NextResponse.json({ status: 'ok', message: 'Aucun profil actif' })
  }

  // 3. Récupérer les membres du clan via getClanMembers() (cache Redis TTL 300s — NFR-IN-01)
  //    L'appel API CoC sort de l'IP Vercel → whitelistée dans developer.clashofclans.com
  let clanMembers: Array<{ tag: string }>
  try {
    clanMembers = await getClanMembers(clanTag)
  } catch (error) {
    // AC-4 : API indisponible → log → ne pas modifier de profils
    console.error('[VerifyClan] API Supercell indisponible:', error)

    // Report Sentry si configuré
    const sentryDsn = process.env.SENTRY_DSN
    if (sentryDsn) {
      try {
        const url = new URL(sentryDsn)
        const projectId = url.pathname.replace('/', '')
        await fetch(`${url.protocol}//${url.host}/api/${projectId}/store/`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Sentry-Auth': `Sentry sentry_version=7, sentry_key=${url.username}`,
          },
          body: JSON.stringify({
            message: `[VerifyClan] API Supercell indisponible: ${error}`,
            level: 'error',
            extra: { profilesCount: activeProfiles.length, clanTag },
          }),
        }).catch(() => {})
      } catch { /* silencieux */ }
    }

    return NextResponse.json(
      { status: 'api-unavailable', message: 'API Supercell indisponible — aucun profil modifié' },
      { status: 200 }
    )
  }

  // 4. Comparer et mettre à jour
  const clanTagSet = new Set(clanMembers.map((m) => m.tag.toUpperCase()))
  const now = new Date().toISOString()

  const stillInClan = activeProfiles.filter((p) => clanTagSet.has(p.tag.toUpperCase()))
  const leftClan = activeProfiles.filter((p) => !clanTagSet.has(p.tag.toUpperCase()))

  // AC-2 : verified_at mis à jour pour les membres encore présents
  if (stillInClan.length > 0) {
    const ids = stillInClan.map((p) => p.id)
    const { error } = await supabase
      .from('profiles')
      .update({ verified_at: now })
      .in('id', ids)
    if (error) console.error('[VerifyClan] Erreur update verified_at:', error)
  }

  // AC-3 : Dégradation + notification pour les membres partis
  for (const profile of leftClan) {
    const { error: degradeError } = await supabase
      .from('profiles')
      .update({ is_active: false, syndicate_role: 'PENDING_REVIEW', updated_at: now })
      .eq('id', profile.id)

    if (degradeError) {
      console.error(`[VerifyClan] Erreur dégradation ${profile.tag}:`, degradeError)
      continue
    }

    await supabase.from('notifications').insert({
      type: 'MEMBER_LEFT_CLAN',
      data: { tag: profile.tag, name: profile.name, user_id: profile.user_id, detected_at: now },
    })
  }

  console.log(`[VerifyClan] Job terminé — ${stillInClan.length} actifs, ${leftClan.length} partis`)

  return NextResponse.json({
    status: 'ok',
    verified: stillInClan.length,
    degraded: leftClan.length,
  })
}

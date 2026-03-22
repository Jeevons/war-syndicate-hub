// supabase/functions/verify-clan-membership/index.ts
// Story 2.3 — Vérification périodique de l'appartenance au clan
// Tourne sur Deno (Edge Runtime Supabase) — PAS Node.js
// Imports via esm.sh (pas de node_modules)

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.99.1'
import { verifyClanMembership } from './handler.ts'

Deno.serve(async (_req) => {
  const clanTag = Deno.env.get('COC_CLAN_TAG')
  if (!clanTag) {
    console.error('[VerifyClan] COC_CLAN_TAG manquant')
    return new Response('Configuration manquante', { status: 500 })
  }

  const cocApiKey = Deno.env.get('CLASH_OF_CLANS_API_KEY')
  if (!cocApiKey) {
    console.error('[VerifyClan] CLASH_OF_CLANS_API_KEY manquant')
    return new Response('Configuration manquante', { status: 500 })
  }

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!, // service_role : bypass RLS
  )

  const result = await verifyClanMembership({
    supabase: supabase as never,
    clanTag,
    cocApiKey,
    sentryDsn: Deno.env.get('SENTRY_DSN'),
    redisUrl: Deno.env.get('UPSTASH_REDIS_REST_URL'),
    redisToken: Deno.env.get('UPSTASH_REDIS_REST_TOKEN'),
  })

  if (result.status === 'config-error') {
    return new Response(result.message, { status: 500 })
  }

  return new Response(result.message, { status: 200 })
})

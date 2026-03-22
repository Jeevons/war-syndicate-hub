// supabase/functions/verify-clan-membership/index.test.ts
// Story 2.3 — Tests du handler de vérification d'appartenance au clan
// Utilise Vitest avec mocks (Node.js) — teste le handler.ts extrait

import { describe, it, expect, vi } from 'vitest'
import { verifyClanMembership, type SupabaseClientLike } from './handler'

const COC_CLAN_TAG = '#2CPY9YUY9'
const COC_API_KEY = 'test-api-key'

// ── Types de profil minimal ──────────────────────────────────────────────────

function makeProfile(tag: string, id = 1) {
  return { id, user_id: 'user-uuid', tag, name: `Joueur ${tag}` }
}

// ── Builder de mock Supabase avec mocks nommés exportés ─────────────────────

function buildSupabaseMock(
  profilesResult: { data: ReturnType<typeof makeProfile>[] | null; error: unknown } = {
    data: [makeProfile('#ABC123', 1)],
    error: null,
  },
  updateError: unknown = null,
  insertError: unknown = null
) {
  const updateInFn = vi.fn().mockResolvedValue({ error: updateError })
  const updateEqFn = vi.fn().mockResolvedValue({ error: updateError })
  const updateFn = vi.fn().mockReturnValue({ in: updateInFn, eq: updateEqFn })
  const insertFn = vi.fn().mockResolvedValue({ error: insertError })

  const supabase: SupabaseClientLike = {
    from: vi.fn().mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockResolvedValue(profilesResult),
      update: updateFn,
      insert: insertFn,
    }),
  }

  return { supabase, updateFn, updateInFn, updateEqFn, insertFn }
}

function makeFetchSuccess(members: Array<{ tag: string }>) {
  return vi.fn().mockResolvedValue({
    ok: true,
    json: () => Promise.resolve({ items: members }),
  } as Response)
}

function makeFetchFailure() {
  return vi.fn().mockRejectedValue(new Error('Network error'))
}

// ── Tests ────────────────────────────────────────────────────────────────────

describe('verifyClanMembership — AC-1 : récupération des profils actifs', () => {
  it('appelle l\u2019API Supercell pour récupérer les membres du clan', async () => {
    const fetchFn = makeFetchSuccess([{ tag: '#ABC123' }])
    const { supabase } = buildSupabaseMock()

    await verifyClanMembership({
      supabase,
      clanTag: COC_CLAN_TAG,
      cocApiKey: COC_API_KEY,
      fetchFn,
    })

    expect(fetchFn).toHaveBeenCalledWith(
      expect.stringContaining('/clans/'),
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: `Bearer ${COC_API_KEY}`,
        }),
      })
    )
  })

  it('retourne "no-profiles" si aucun profil actif en base', async () => {
    const { supabase } = buildSupabaseMock({ data: [], error: null })
    const fetchFn = vi.fn()

    const result = await verifyClanMembership({
      supabase,
      clanTag: COC_CLAN_TAG,
      cocApiKey: COC_API_KEY,
      fetchFn,
    })

    expect(result.status).toBe('no-profiles')
    expect(fetchFn).not.toHaveBeenCalled()
  })
})

describe('verifyClanMembership — AC-2 : membre encore dans le clan', () => {
  it('met à jour verified_at pour les profils trouvés dans le clan', async () => {
    const { supabase, updateFn } = buildSupabaseMock({
      data: [makeProfile('#ABC123', 1)],
      error: null,
    })
    const fetchFn = makeFetchSuccess([{ tag: '#ABC123' }])

    const result = await verifyClanMembership({
      supabase,
      clanTag: COC_CLAN_TAG,
      cocApiKey: COC_API_KEY,
      fetchFn,
    })

    expect(updateFn).toHaveBeenCalledWith(
      expect.objectContaining({ verified_at: expect.any(String) })
    )
    expect(result.status).toBe('ok')
  })

  it('ne crée pas de notification si le membre est toujours dans le clan', async () => {
    const { supabase, insertFn } = buildSupabaseMock({
      data: [makeProfile('#ABC123', 1)],
      error: null,
    })
    const fetchFn = makeFetchSuccess([{ tag: '#ABC123' }])

    await verifyClanMembership({
      supabase,
      clanTag: COC_CLAN_TAG,
      cocApiKey: COC_API_KEY,
      fetchFn,
    })

    expect(insertFn).not.toHaveBeenCalled()
  })
})

describe('verifyClanMembership — AC-3 : membre sorti du clan', () => {
  it('marque is_active=false et syndicate_role=PENDING_REVIEW si membre absent', async () => {
    const { supabase, updateFn } = buildSupabaseMock({
      data: [makeProfile('#GONE123', 1)],
      error: null,
    })
    const fetchFn = makeFetchSuccess([{ tag: '#OTHERMEMBER' }])

    const result = await verifyClanMembership({
      supabase,
      clanTag: COC_CLAN_TAG,
      cocApiKey: COC_API_KEY,
      fetchFn,
    })

    expect(updateFn).toHaveBeenCalledWith(
      expect.objectContaining({
        is_active: false,
        syndicate_role: 'PENDING_REVIEW',
      })
    )
    expect(result.status).toBe('ok')
  })

  it('crée une notification MEMBER_LEFT_CLAN si membre absent du clan', async () => {
    const { supabase, insertFn } = buildSupabaseMock({
      data: [makeProfile('#GONE123', 1)],
      error: null,
    })
    const fetchFn = makeFetchSuccess([])

    await verifyClanMembership({
      supabase,
      clanTag: COC_CLAN_TAG,
      cocApiKey: COC_API_KEY,
      fetchFn,
    })

    expect(insertFn).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'MEMBER_LEFT_CLAN',
        data: expect.objectContaining({
          tag: '#GONE123',
          name: 'Joueur #GONE123',
          user_id: 'user-uuid',
        }),
      })
    )
  })

  it('compare les tags sans tenir compte de la casse', async () => {
    const { supabase, insertFn } = buildSupabaseMock({
      data: [makeProfile('#abc123', 1)],
      error: null,
    })
    const fetchFn = makeFetchSuccess([{ tag: '#ABC123' }])

    await verifyClanMembership({
      supabase,
      clanTag: COC_CLAN_TAG,
      cocApiKey: COC_API_KEY,
      fetchFn,
    })

    expect(insertFn).not.toHaveBeenCalled()
  })
})

describe('verifyClanMembership — AC-4 : API Supercell indisponible', () => {
  it('retourne api-unavailable si fetch échoue', async () => {
    const { supabase } = buildSupabaseMock({
      data: [makeProfile('#ABC123', 1)],
      error: null,
    })
    const fetchFn = makeFetchFailure()

    const result = await verifyClanMembership({
      supabase,
      clanTag: COC_CLAN_TAG,
      cocApiKey: COC_API_KEY,
      fetchFn,
    })

    expect(result.status).toBe('api-unavailable')
  })

  it('ne modifie aucun profil si l\u2019API Supercell est indisponible', async () => {
    const { supabase, updateFn } = buildSupabaseMock({
      data: [makeProfile('#ABC123', 1)],
      error: null,
    })
    const fetchFn = makeFetchFailure()

    await verifyClanMembership({
      supabase,
      clanTag: COC_CLAN_TAG,
      cocApiKey: COC_API_KEY,
      fetchFn,
    })

    expect(updateFn).not.toHaveBeenCalled()
  })

  it('appelle Sentry via fetch si sentryDsn est configuré lors d\u2019une erreur API', async () => {
    const { supabase } = buildSupabaseMock({
      data: [makeProfile('#ABC123', 1)],
      error: null,
    })

    const fetchFn = vi.fn()
      .mockRejectedValueOnce(new Error('Network error'))
      .mockResolvedValueOnce({ ok: true } as Response)

    await verifyClanMembership({
      supabase,
      clanTag: COC_CLAN_TAG,
      cocApiKey: COC_API_KEY,
      sentryDsn: 'https://key@sentry.io/123',
      fetchFn,
    })

    expect(fetchFn).toHaveBeenCalledTimes(2)
    const sentryCall = fetchFn.mock.calls[1]
    const sentryUrl = sentryCall?.[0] as string
    expect(sentryUrl).toContain('/api/123/store/')
  })
})

describe('verifyClanMembership — gestion erreur DB', () => {
  it('retourne config-error si la lecture des profils échoue', async () => {
    const { supabase } = buildSupabaseMock({
      data: null,
      error: new Error('DB connection failed'),
    })
    const fetchFn = vi.fn()

    const result = await verifyClanMembership({
      supabase,
      clanTag: COC_CLAN_TAG,
      cocApiKey: COC_API_KEY,
      fetchFn,
    })

    expect(result.status).toBe('config-error')
    expect(fetchFn).not.toHaveBeenCalled()
  })
})

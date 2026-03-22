// src/lib/coc/client.ts
// ⚠️ Ce fichier est SERVEUR UNIQUEMENT — jamais importé côté client
// CLASH_OF_CLANS_API_KEY doit rester côté serveur (sans NEXT_PUBLIC)
import { getOrSet } from '@/lib/redis/client'

const COC_BASE_URL = 'https://api.clashofclans.com/v1'

function getCocHeaders(): HeadersInit {
  const apiKey = process.env.CLASH_OF_CLANS_API_KEY
  if (!apiKey) throw new Error('[CocClient] CLASH_OF_CLANS_API_KEY manquante')
  return {
    Authorization: `Bearer ${apiKey}`,
    Accept: 'application/json',
    'Content-Type': 'application/json',
  }
}

// Le # doit être encodé en %23 dans l'URL Supercell
function encodeTag(tag: string): string {
  return encodeURIComponent(tag.toUpperCase().trim())
}

export interface CocPlayer {
  tag: string
  name: string
  townhall_level: number
  role_in_clan: string | null
}

/**
 * Vérifie le token In-Game Supercell (NFR-SE-01 — anti-usurpation)
 * NE PAS mettre en cache — vérification en temps réel requise
 */
export async function verifyPlayerToken(
  playerTag: string,
  token: string
): Promise<{ valid: boolean }> {
  const encodedTag = encodeTag(playerTag)

  let response: Response
  try {
    response = await fetch(
      `${COC_BASE_URL}/players/${encodedTag}/verifytoken`,
      {
        method: 'POST',
        headers: getCocHeaders(),
        body: JSON.stringify({ token }),
        signal: AbortSignal.timeout(5000),
      }
    )
  } catch (error) {
    console.error('[CocClient] verifyPlayerToken network error:', error)
    throw new Error('API Supercell indisponible — réessaie dans quelques instants')
  }

  if (response.status === 200) {
    const data = await response.json()
    return { valid: data.status === 'ok' }
  }

  if (response.status === 401) {
    // Clé API rejetée par Supercell — probablement IP non whitelistée
    console.error('[CocClient] 401 Unauthorized — vérifie le whitelist IP de ta clé API CoC')
    throw new Error('Clé API Supercell rejetée — vérifie que ton IP est whitelistée sur developer.clashofclans.com')
  }

  // 403 = token invalide/expiré, 404 = tag introuvable
  return { valid: false }
}

/**
 * Récupère les données d'un joueur via cache Redis (TTL 300s — NFR-IN-01)
 */
export async function getPlayerData(playerTag: string): Promise<CocPlayer> {
  const encodedTag = encodeTag(playerTag)
  const cacheKey = `coc:player:${encodedTag}`

  return getOrSet<CocPlayer>(
    cacheKey,
    async () => {
      const response = await fetch(`${COC_BASE_URL}/players/${encodedTag}`, {
        headers: getCocHeaders(),
        signal: AbortSignal.timeout(5000),
      })

      if (!response.ok) {
        const body = await response.text()
        console.error(`[CocClient] getPlayerData HTTP ${response.status} body=${body}`)
        throw new Error(`[CocClient] getPlayerData HTTP ${response.status}`)
      }

      const data = await response.json()
      return {
        tag: data.tag,
        name: data.name,
        townhall_level: data.townHallLevel, // camelCase dans l'API Supercell
        role_in_clan: data.role ?? null,
      }
    },
    300 // TTL 300s — respecte NFR-IN-01 (quota Supercell)
  )
}

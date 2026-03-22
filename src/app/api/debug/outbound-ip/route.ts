// src/app/api/debug/outbound-ip/route.ts
// GET — Retourne l'IP sortante du serveur Vercel (pour whitelist CoC API)
// ⚠️ À supprimer après avoir récupéré et whitelisté l'IP
// Sécurisé par CRON_SECRET pour éviter l'exposition publique

import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  const cronSecret = process.env.CRON_SECRET
  const authHeader = request.headers.get('authorization')

  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const res = await fetch('https://api.ipify.org?format=json')
    const data = await res.json() as { ip: string }
    return NextResponse.json({
      outbound_ip: data.ip,
      note: 'Ajouter cette IP sur developer.clashofclans.com, puis supprimer cette route',
    })
  } catch {
    return NextResponse.json({ error: 'Impossible de récupérer l\'IP' }, { status: 500 })
  }
}

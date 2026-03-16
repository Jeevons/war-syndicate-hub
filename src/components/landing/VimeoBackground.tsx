'use client'

import { useSyncExternalStore } from 'react'

const VIMEO_VIDEO_ID = '1173722073'

// useSyncExternalStore : retourne false côté serveur (SSR), true côté client (après hydratation)
// Pattern recommandé par React pour éviter setState dans useEffect
const emptySubscribe = () => () => {}

export function VimeoBackground() {
  const mounted = useSyncExternalStore(emptySubscribe, () => true, () => false)

  if (!mounted) return null

  return (
    <iframe
      src={`https://player.vimeo.com/video/${VIMEO_VIDEO_ID}?background=1&autopause=0`}
      allow="autoplay; fullscreen; picture-in-picture"
      className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
      style={{ width: '177.78vh', height: '100vh', minWidth: '100%', minHeight: '56.25vw' }}
      tabIndex={-1}
      title=""
    />
  )
}

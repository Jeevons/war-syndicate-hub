'use client'

import { useEffect } from 'react'

/**
 * Injecte le curseur gauntlet du Barbarian King + animation d'impact au clic.
 * Monté une seule fois dans le RootLayout.
 */
export function CursorProvider() {
  useEffect(() => {
    // Désactive la restauration de scroll du navigateur au rechargement
    if ('scrollRestoration' in history) {
      history.scrollRestoration = 'manual'
    }
  }, [])

  useEffect(() => {
    // Création de l'élément d'impact au clic
    const handleClick = (e: MouseEvent) => {
      const el = document.createElement('div')
      el.className = 'cursor-click-burst'
      el.style.left = `${e.clientX}px`
      el.style.top = `${e.clientY}px`
      document.body.appendChild(el)
      el.addEventListener('animationend', () => el.remove())
    }

    document.addEventListener('click', handleClick)
    return () => document.removeEventListener('click', handleClick)
  }, [])

  return null
}

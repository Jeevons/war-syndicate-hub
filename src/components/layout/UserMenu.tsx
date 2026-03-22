'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

interface UserMenuProps {
  username: string
  avatarUrl: string | null
  showName?: boolean
  onSignOut?: () => void
}

export function UserMenu({ username, avatarUrl, showName = true, onSignOut }: UserMenuProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isSigningOut, setIsSigningOut] = useState(false)
  const router = useRouter()
  const supabase = createClient()
  const menuRef = useRef<HTMLDivElement>(null)

  // M-1: Fermeture au clic extérieur
  useEffect(() => {
    if (!isOpen) return
    const handleClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [isOpen])

  // M-4: Fermeture via touche Escape
  useEffect(() => {
    if (!isOpen) return
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false)
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen])

  // M-2: signOut avec gestion d'erreur
  const handleSignOut = async () => {
    setIsSigningOut(true)
    try {
      await supabase.auth.signOut()
      if (onSignOut) {
        onSignOut()
      } else {
        router.push('/')
        router.refresh()
      }
    } catch (err) {
      console.error('[UserMenu] signOut error:', err)
      setIsSigningOut(false)
    }
  }

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
        aria-expanded={isOpen}
        aria-haspopup="true"
        aria-label={`Menu de ${username}`}
      >
        {avatarUrl ? (
          <Image
            src={avatarUrl}
            alt={`Avatar de ${username}`}
            width={32}
            height={32}
            className="rounded-full"
            sizes="32px"
          />
        ) : (
          <div
            className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-xs font-medium text-white"
            aria-hidden="true"
          >
            {username.charAt(0).toUpperCase()}
          </div>
        )}
        {showName && <span className="hidden sm:block text-sm text-muted-foreground">{username}</span>}
      </button>

      {isOpen && (
        <div
          className="absolute right-0 mt-2 w-48 rounded-lg border border-border bg-background/95 backdrop-blur-sm p-1 shadow-xl z-50"
          role="menu"
        >
          <div className="px-3 py-2 text-xs text-muted-foreground border-b border-border mb-1 truncate">
            {username}
          </div>
          <Link
            href="/dashboard"
            className="flex items-center px-3 py-2 text-sm text-foreground rounded-md hover:bg-accent hover:text-accent-foreground transition-colors"
            role="menuitem"
          >
            Mon Hub
          </Link>
          <button
            onClick={handleSignOut}
            disabled={isSigningOut}
            className="w-full text-left px-3 py-2 text-sm text-foreground rounded-md hover:bg-accent hover:text-accent-foreground transition-colors"
            role="menuitem"
          >
            {isSigningOut ? 'Déconnexion…' : 'Déconnexion'}
          </button>
        </div>
      )}
    </div>
  )
}

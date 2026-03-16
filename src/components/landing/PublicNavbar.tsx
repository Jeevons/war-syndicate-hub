'use client'

import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import Link from 'next/link'

const NAV_LINKS = [
  { label: 'Actualités', href: '/news' },
  { label: 'Candidature', href: '#candidature' },
] as const

export function PublicNavbar() {
  const [visible, setVisible] = useState(true)
  const [atHero, setAtHero] = useState(true)
  const [menuOpen, setMenuOpen] = useState(false)
  const lastYRef = useRef(0)
  const navRef = useRef<HTMLDivElement>(null)

  // Scroll hide/show + détection hero
  useEffect(() => {
    const handleScroll = () => {
      const currentY = window.scrollY
      const heroHeight = window.innerHeight

      setAtHero(currentY < heroHeight * 0.85)

      if (currentY < 10) {
        setVisible(true)
      } else if (currentY > lastYRef.current) {
        setVisible(false)
        setMenuOpen(false)
      } else {
        setVisible(true)
      }
      lastYRef.current = currentY
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Close on outside click
  useEffect(() => {
    if (!menuOpen) return
    const handleClick = (e: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(e.target as Node)) {
        setMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [menuOpen])

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 px-4 pt-4 transition-transform duration-300 ${
        visible ? 'translate-y-0' : '-translate-y-full'
      }`}
    >
      <nav
        ref={navRef}
        aria-label="Navigation principale"
        style={{ animationDelay: '0.2s' }}
        className={`max-w-5xl mx-auto rounded-2xl backdrop-blur-xl overflow-hidden transition-all duration-500 animate-fade-in-up ${
          atHero
            ? 'bg-white/10 border border-white/20 shadow-[0_2px_20px_rgba(0,0,0,0.2)]'
            : 'bg-white/80 border border-zinc-200/70 shadow-[0_2px_20px_rgba(0,0,0,0.06)]'
        }`}
      >
        {/* Barre principale */}
        <div className="flex items-center justify-between px-4 py-2.5">
          {/* Logo + Nom */}
          <Link
            href="/"
            className="flex items-center gap-2.5 group"
            aria-label="War Syndicate — Accueil"
          >
            <Image
              src="/assets/Logos/war_syndicate-logo.png"
              alt="Logo War Syndicate"
              width={30}
              height={30}
              className="rounded-md"
            />
            <span className={`font-supercell text-sm tracking-tight transition-colors duration-500 ${
              atHero
                ? 'text-white group-hover:text-white/70'
                : 'text-zinc-900 group-hover:text-zinc-600'
            }`}>
              War Syndicate
            </span>
          </Link>

          {/* Liens desktop */}
          <ul className="hidden md:flex items-center gap-1" role="list">
            {NAV_LINKS.map(({ label, href }) => (
              <li key={label}>
                {href.startsWith('#') ? (
                  <a
                    href={href}
                    className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors duration-500 ${
                      atHero
                        ? 'text-white/80 hover:text-white hover:bg-white/10'
                        : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100'
                    }`}
                  >
                    {label}
                  </a>
                ) : (
                  <Link
                    href={href}
                    className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors duration-500 ${
                      atHero
                        ? 'text-white/80 hover:text-white hover:bg-white/10'
                        : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100'
                    }`}
                  >
                    {label}
                  </Link>
                )}
              </li>
            ))}
          </ul>

          <div className="flex items-center gap-2">
            {/* CTA desktop */}
            <a
              href="#candidature"
              className="hidden md:inline-flex items-center justify-center rounded-xl text-white text-sm font-semibold px-4 py-2 min-h-[36px] hover:opacity-90 transition-opacity"
              style={{ background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)' }}
              aria-label="Rejoindre le clan War Syndicate"
            >
              Rejoindre
            </a>

            {/* Bouton hamburger mobile */}
            <button
              className={`md:hidden flex flex-col justify-center items-center w-9 h-9 rounded-xl transition-colors gap-[5px] ${
                atHero ? 'hover:bg-white/10' : 'hover:bg-zinc-100'
              }`}
              onClick={() => setMenuOpen((o) => !o)}
              aria-label={menuOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
              aria-expanded={menuOpen}
            >
              {(['rotate-45 translate-y-[6.5px]', 'opacity-0 scale-x-0', '-rotate-45 -translate-y-[6.5px]'] as const).map((activeClass, i) => (
                <span
                  key={i}
                  className={`block w-5 h-[1.5px] transition-all duration-300 origin-center ${
                    atHero ? 'bg-white' : 'bg-zinc-800'
                  } ${menuOpen ? activeClass : ''}`}
                />
              ))}
            </button>
          </div>
        </div>

        {/* Menu mobile déroulant */}
        <div
          className={`md:hidden transition-all duration-300 ease-in-out overflow-hidden ${
            menuOpen ? 'max-h-64 opacity-100' : 'max-h-0 opacity-0'
          }`}
        >
          <div className={`px-3 pb-3 pt-1 border-t flex flex-col gap-1 ${
            atHero ? 'border-white/10' : 'border-zinc-100'
          }`}>
            {NAV_LINKS.map(({ label, href }) =>
              href.startsWith('#') ? (
                <a
                  key={label}
                  href={href}
                  onClick={() => setMenuOpen(false)}
                  className={`flex items-center px-3 py-2.5 text-sm font-medium rounded-xl transition-colors ${
                    atHero
                      ? 'text-white/80 hover:text-white hover:bg-white/10'
                      : 'text-zinc-700 hover:text-zinc-900 hover:bg-zinc-100'
                  }`}
                >
                  {label}
                </a>
              ) : (
                <Link
                  key={label}
                  href={href}
                  onClick={() => setMenuOpen(false)}
                  className={`flex items-center px-3 py-2.5 text-sm font-medium rounded-xl transition-colors ${
                    atHero
                      ? 'text-white/80 hover:text-white hover:bg-white/10'
                      : 'text-zinc-700 hover:text-zinc-900 hover:bg-zinc-100'
                  }`}
                >
                  {label}
                </Link>
              )
            )}

            {/* CTA mobile */}
            <a
              href="#candidature"
              onClick={() => setMenuOpen(false)}
              className="mt-1 flex items-center justify-center rounded-xl text-white text-sm font-semibold px-4 py-3 min-h-[44px] hover:opacity-90 transition-opacity"
              style={{ background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)' }}
            >
              Rejoindre le clan →
            </a>
          </div>
        </div>
      </nav>
    </header>
  )
}

'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { cn } from '@/lib/utils'

const slides = [
  {
    troop: '/assets/coc/troops/models/barbarian_king.png',
    quote: 'La guerre forge les légendes.',
    sub: 'Rejoins les meilleurs chefs de clan.',
  },
  {
    troop: '/assets/coc/troops/models/dragon.png',
    quote: 'Ensemble, rien ne résiste.',
    sub: 'Un clan uni est un clan invincible.',
  },
  {
    troop: '/assets/coc/troops/models/pekka.png',
    quote: 'Force. Stratégie. Victoire.',
    sub: 'War Syndicate — Clan FR.',
  },
  {
    troop: '/assets/coc/buildings/town_hall_14_5.png',
    quote: "Ton château t'attend.",
    sub: 'Lie ton compte et accède à ton Hub personnalisé.',
  },
]

export function OnboardingCarousel() {
  const [current, setCurrent] = useState(0)
  const [fading, setFading] = useState(false)

  useEffect(() => {
    const interval = setInterval(() => {
      setFading(true)
      setTimeout(() => {
        setCurrent((c) => (c + 1) % slides.length)
        setFading(false)
      }, 300)
    }, 5000)
    return () => clearInterval(interval)
  }, [])

  const slide = slides[current]

  return (
    <div className="relative h-full w-full bg-zinc-950 overflow-hidden">
      {/* Background image */}
      <Image
        src="/assets/coc/background/Clash of Clans Clan Background.jpg"
        alt=""
        fill
        className="object-cover opacity-30"
        priority
      />
      <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/20 to-zinc-950/70" />

      {/* Troop / building image */}
      <div
        className={cn(
          'absolute inset-0 flex items-center justify-center transition-opacity duration-300',
          fading ? 'opacity-0' : 'opacity-100'
        )}
      >
        <div className="relative w-80 h-80">
          <Image
            src={slide.troop}
            alt=""
            fill
            className="object-contain drop-shadow-2xl"
          />
        </div>
      </div>

      {/* Quote */}
      <div
        className={cn(
          'absolute bottom-0 left-0 right-0 px-10 pb-12 transition-opacity duration-300',
          fading ? 'opacity-0' : 'opacity-100'
        )}
      >
        <blockquote className="space-y-1 mb-6">
          <p className="text-2xl font-bold text-white leading-snug">
            «&nbsp;{slide.quote}&nbsp;»
          </p>
          <p className="text-sm text-zinc-400">{slide.sub}</p>
        </blockquote>

        {/* Progress dots */}
        <div className="flex gap-2">
          {slides.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => {
                setFading(false)
                setCurrent(i)
              }}
              aria-label={`Slide ${i + 1}`}
              className={cn(
                'h-1 rounded-full transition-all duration-300',
                i === current ? 'w-8 bg-white' : 'w-2 bg-white/30'
              )}
            />
          ))}
        </div>
      </div>

      {/* Top-right branding */}
      <div className="absolute top-8 right-8">
        <p className="text-xs font-medium text-white/30 tracking-widest uppercase">
          War Syndicate
        </p>
      </div>
    </div>
  )
}

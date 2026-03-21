// Server Component — PAS de "use client"
import Image from 'next/image'
import Link from 'next/link'
import { cn } from '@/lib/utils'

interface NewsCardProps {
  title: string
  excerpt: string        // déjà tronqué à 150 chars par la page parente
  slug: string
  authorUsername: string
  authorAvatarUrl: string | null
  publishedAt: string    // ISO-8601 UTC string
}

export function NewsCard({
  title, excerpt, slug, authorUsername, authorAvatarUrl, publishedAt,
}: NewsCardProps) {
  const formattedDate = new Intl.DateTimeFormat('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date(publishedAt))

  return (
    <article>
      <Link
        href={`/news/${slug}`}
        className={cn(
          'group block rounded-2xl border border-white/10 bg-white/5',
          'p-5 transition-colors hover:bg-white/10',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2',
        )}
        aria-label={`Lire l'article : ${title}`}
      >
        {/* Header auteur */}
        <div className="flex items-center gap-3 mb-4">
          {authorAvatarUrl ? (
            <Image
              src={authorAvatarUrl}
              alt={`Avatar de ${authorUsername}`}
              width={32}
              height={32}
              sizes="32px"
              className="rounded-full"
            />
          ) : (
            <div
              className="w-8 h-8 rounded-full bg-zinc-700 flex items-center justify-center text-xs text-zinc-400"
              aria-hidden="true"
            >
              {authorUsername.charAt(0).toUpperCase()}
            </div>
          )}
          <span className="text-sm text-zinc-400">{authorUsername}</span>
          <time
            dateTime={publishedAt}
            className="ml-auto text-xs text-zinc-600"
          >
            {formattedDate}
          </time>
        </div>

        {/* Titre */}
        <h2 className="text-base font-semibold text-white group-hover:text-indigo-400 transition-colors mb-2 line-clamp-2">
          {title}
        </h2>

        {/* Extrait */}
        <p className="text-sm text-zinc-400 line-clamp-3 leading-relaxed">
          {excerpt}
        </p>
      </Link>
    </article>
  )
}

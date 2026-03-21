import type { Metadata } from 'next'
import { Suspense } from 'react'
import { createClient } from '@/lib/supabase/server'
import { NewsCard } from '@/components/shared/NewsCard'
import { NewsCardSkeleton } from '@/components/shared/NewsCardSkeleton'
import { PublicNavbar } from '@/components/landing/PublicNavbar'

export const revalidate = 3600 // ISR : re-génération toutes les heures

export const metadata: Metadata = {
  title: 'Actualités — War Syndicate',
  description: 'Dernières actualités et articles du clan War Syndicate — Clash of Clans.',
  openGraph: {
    title: 'Actualités — War Syndicate',
    description: 'Restez informés des activités et stratégies du clan War Syndicate.',
    type: 'website',
  },
}

interface NewsWithAuthor {
  id: number
  title: string
  content: string
  slug: string
  created_at: string
  author: {
    username: string
    avatar_url: string | null
  } | null
}

async function NewsList() {
  const supabase = await createClient()

  const { data: articles, error } = await supabase
    .from('news')
    .select('id, title, content, slug, created_at, author:users(username, avatar_url)')
    .eq('is_public', true)
    .order('created_at', { ascending: false })
    .limit(50) // guard V1 — pagination à ajouter en Story future si >50 articles
    .returns<NewsWithAuthor[]>()

  if (error) {
    console.error('[NewsList] Supabase error:', error.message)
    return (
      <div role="alert" className="flex flex-col items-center justify-center py-24 text-center">
        <p className="text-xl text-red-400">Une erreur est survenue lors du chargement des articles.</p>
        <p className="mt-2 text-sm text-zinc-600">Veuillez réessayer dans quelques instants.</p>
      </div>
    )
  }

  if (!articles || articles.length === 0) {
    return (
      <div
        className="flex flex-col items-center justify-center py-24 text-center"
        role="status"
        aria-live="polite"
      >
        <p className="text-xl text-zinc-400">
          Aucun article publié pour l&apos;instant 📢
        </p>
        <p className="mt-2 text-sm text-zinc-600">
          Revenez bientôt — le Staff publie régulièrement.
        </p>
      </div>
    )
  }

  return (
    <ul
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
      aria-label="Liste des articles"
    >
      {articles.map((article) => {
        const excerpt = article.content.length > 150
          ? article.content.slice(0, 150).replace(/\s+\S*$/, '') + '...'
          : article.content

        return (
          <li key={article.id}>
            <NewsCard
              title={article.title}
              excerpt={excerpt}
              slug={article.slug}
              authorUsername={article.author?.username ?? 'War Syndicate'}
              authorAvatarUrl={article.author?.avatar_url ?? null}
              publishedAt={article.created_at}
            />
          </li>
        )
      })}
    </ul>
  )
}

export default function NewsPage() {
  return (
    <>
      <PublicNavbar />
      <main className="max-w-[1500px] mx-auto px-6 py-16">
        <header className="mt-12 mb-12">
          <h1 className="text-3xl font-bold tracking-tight text-white">
            Actualités du clan
          </h1>
          <p className="mt-2 text-zinc-400">
            Les derniers articles publiés par le Staff de War Syndicate.
          </p>
        </header>

        <Suspense
          fallback={
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" aria-label="Chargement des articles">
              <NewsCardSkeleton />
              <NewsCardSkeleton />
              <NewsCardSkeleton />
            </div>
          }
        >
          <NewsList />
        </Suspense>
      </main>
    </>
  )
}

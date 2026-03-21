import type { Metadata } from 'next'
import { cache } from 'react'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { cn } from '@/lib/utils'
import { buttonVariants } from '@/components/ui/button-variants'
import { createClient } from '@/lib/supabase/server'
import { PublicNavbar } from '@/components/landing/PublicNavbar'

interface ArticleWithAuthor {
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

interface Props {
  params: Promise<{ slug: string }>
}

// React cache() déduplique les appels identiques dans la même request SSR
// → generateMetadata et ArticlePage partagent le même résultat Supabase
const getArticle = cache(async (slug: string): Promise<ArticleWithAuthor | null> => {
  const supabase = await createClient()

  const { data: article, error } = await supabase
    .from('news')
    .select('id, title, content, slug, created_at, author:users(username, avatar_url)')
    .eq('slug', slug)
    .eq('is_public', true)
    .single<ArticleWithAuthor>()

  if (error) {
    console.error('[getArticle] Supabase error:', error.message)
    return null
  }

  return article
})

export const revalidate = 3600 // ISR : re-génération toutes les heures

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const article = await getArticle(slug)

  if (!article) notFound() // 404 HTTP réel — évite le Soft 404 SEO

  const description = article.content.length > 160
    ? article.content.slice(0, 160) + '...'
    : article.content

  return {
    title: `${article.title} — War Syndicate`,
    description,
    openGraph: {
      title: article.title,
      description,
      type: 'article',
      images: [{ url: '/assets/og-image.png', width: 1200, height: 630 }],
    },
  }
}

export default async function ArticlePage({ params }: Props) {
  const { slug } = await params
  const article = await getArticle(slug)

  if (!article) notFound()

  const formattedDate = new Intl.DateTimeFormat('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date(article.created_at))

  return (
    <>
      <PublicNavbar />
      <main className="max-w-3xl mx-auto px-6 py-16">
        {/* Lien retour */}
        <Link
          href="/news"
          className={cn(buttonVariants({ variant: 'ghost', size: 'sm' }), 'mb-8 gap-2')}
        >
          ← Toutes les actualités
        </Link>

        {/* Header article */}
        <header className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-white mb-4">
            {article.title}
          </h1>
          <div className="flex items-center gap-3 text-sm text-zinc-400">
            {article.author?.avatar_url ? (
              <Image
                src={article.author.avatar_url}
                alt={`Avatar de ${article.author?.username ?? 'auteur'}`}
                width={28}
                height={28}
                sizes="28px"
                className="rounded-full"
              />
            ) : null}
            <span>{article.author?.username ?? 'War Syndicate'}</span>
            <span aria-hidden="true">·</span>
            <time dateTime={article.created_at}>{formattedDate}</time>
          </div>
        </header>

        {/* Contenu */}
        <article className="text-zinc-300 leading-relaxed whitespace-pre-wrap">
          {article.content}
        </article>
      </main>
    </>
  )
}

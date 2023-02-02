import Head from 'next/head'
import { useRouter } from 'next/router'

import { Container } from '~/components/Container'
import { CommentSection } from '~/components/Comments'
import { formatDate } from '~/lib/formatDate'
import { QueryProvider, useCommentStats } from '~/lib/comments'
import { Prose } from '~/components/Prose'

function ArrowLeftIcon(props: React.HTMLAttributes<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 16 16" fill="none" aria-hidden="true" {...props}>
      <path
        d="M7.25 11.25 3.75 8m0 0 3.5-3.25M3.75 8h8.5"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function ArticleHeader({ date, title, slug }) {
  const { data: stats } = useCommentStats()
  return (
    <header className="flex flex-col">
      <h1 className="mt-6 text-2xl font-extrabold tracking-tight text-primary-800 dark:text-primary-100 sm:text-5xl">
        {title}
      </h1>
      <div>
        <time
          dateTime={date}
          className="order-first flex items-center text-base text-primary-400 dark:text-primary-500"
        >
          <span className="h-4 w-0.5 rounded-full bg-primary-200 dark:bg-primary-500" />
          <span className="ml-3">{formatDate(date)}</span>
        </time>
        {stats && stats[slug] && <div>{stats[slug]} comments</div>}
      </div>
    </header>
  )
}

const gravatarURL = process.env.NEXT_PUBLIC_GRAVATAR_URL

export function ArticleLayout({
  children,
  meta,
  isRssFeed = false,
  previousPathname,
}) {
  const router = useRouter()
  if (isRssFeed) return children
  const tags = [meta.category].concat(meta.tags ?? [])
  const title = `${meta.title} - Daniel Gray`
  return (
    <QueryProvider>
      <Head>
        <title>{title}</title>
        <meta name="keywords" content={tags.join(' ')} />
        <meta property="og:title" content={title} />
        <meta name="twitter:title" content={title} />
        <meta name="description" content={meta.description} />
        <meta property="og:description" content={meta.description} />
        <meta
          name="twitter:description"
          content={[meta.description ?? '', tags.map(t => `#${t}`).join(' ')].join('\n')}
        />
        <meta property="og:type" content="article" key="og:type" />
        {tags.map(tag => (
          <meta property="og:article:tag" content={tag} key={tag} />
        ))}
        <meta property="og:image" content={meta.image ?? gravatarURL} key="og:image" />
        <meta name="twitter:image" content={meta.image ?? gravatarURL} key="twitter:image" />
      </Head>
      <Container className="mt-16 lg:mt-32">
        <div className="xl:relative">
          <div className="mx-auto max-w-5xl">
            {previousPathname && (
              <button
                type="button"
                onClick={() => router.back()}
                aria-label="Go back to articles"
                className="group mb-8 flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-md shadow-primary-800/5 ring-1 ring-primary-900/5 transition dark:border dark:border-primary-700/50 dark:bg-primary-900 dark:ring-0 dark:ring-white/10 dark:hover:border-primary-700 dark:hover:ring-white/20 lg:absolute lg:-left-5 lg:mb-0 lg:-mt-2 xl:-left-16"
              >
                <ArrowLeftIcon className="h-4 w-4 stroke-primary-500 transition group-hover:stroke-primary-700 dark:stroke-primary-500 dark:group-hover:stroke-primary-400" />
              </button>
            )}
            <article>
              <ArticleHeader {...meta} />
              <Prose className="mt-8">{children}</Prose>
            </article>
          </div>
        </div>
        <CommentSection />
      </Container>
    </QueryProvider>
  )
}

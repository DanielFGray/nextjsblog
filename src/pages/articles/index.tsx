import Head from 'next/head'
import { Card } from '~/components/Card'
import { SimpleLayout } from '~/components/SimpleLayout'
import { useCommentStats } from '~/lib/comments'
import { getAllArticles } from '~/lib/getAllArticles'
import { formatDate } from '~/lib/formatDate'
import Link from 'next/link'
import { useRouter } from 'next/router'
import clsx from 'clsx'
import { Article } from '~/types'
import { labelize } from '~/lib/labelize'

export async function getStaticProps() {
  const articles = await getAllArticles()
  return {
    props: {
      articles: articles.map(a => a.meta),
    },
  }
}

export default function ArticlesIndex({
  articles,
}: {
  articles: Array<Article>
}) {
  const { data: stats } = useCommentStats()
  const { query } = useRouter()
  const selectedTags = (
    Array.isArray(query.tag) ? query.tag : [query.tag] ?? []
  ).filter(Boolean)
  return (
    <>
      <Head>
        <title>Articles - Daniel Gray</title>
        <meta
          name="description"
          content="All of my long-form thoughts on programming, and a few on music and drumming."
        />
      </Head>
      <SimpleLayout
        title="Writing on software development."
        intro={
          <>
            All of my long-form thoughts on programming, and a few on music and drumming
            {selectedTags && selectedTags.length > 0
              ? ', filtered by posts tagged '.concat(
                new Intl.ListFormat('en', {
                  style: 'long',
                  type: 'conjunction',
                }).format(selectedTags.map(x => `"${x}"`))
              )
              : null}
            .
          </>
        }
      >
        <div className="md:border-l md:border-primary-100 md:pl-6 md:dark:border-primary-700/40">
          <div className="flex max-w-3xl flex-col space-y-16">
            {(! query.tag
              ? articles
              : articles.filter(article =>
                selectedTags.every(tag => article.tags.includes(tag))
              )
            ).map(article => (
              <Article
                key={article.slug}
                article={article}
                selectedTags={selectedTags}
                commentCount={stats ? stats[article.slug] : null}
              />
            ))}
          </div>
        </div>
      </SimpleLayout>
    </>
  )
}

export function Article({
  article,
  selectedTags,
  commentCount,
}: {
  article: Article
  selectedTags?: Array<string>
  commentCount?: string
}) {
  return (
    <article className="md:grid md:grid-cols-4 md:items-baseline">
      <Card className="md:col-span-3">
        <Card.Title href={`/articles/${article.slug}`}>
          {article.title}
        </Card.Title>
        <Card.Eyebrow
          as="time"
          dateTime={article.date}
          className="md:hidden"
          decorate
        >
          {formatDate(article.date)}
        </Card.Eyebrow>
        <Card.Description>{article.description}</Card.Description>
        <Card.Description className="font-light">
          {article.time},{' '}
          {labelize({ word: article.words, comment: commentCount })}
        </Card.Description>
        <Card.Cta>Read article</Card.Cta>
      </Card>
      <Card.Eyebrow as="div" className="mt-1 hidden md:block">
        <time dateTime={article.date}>{formatDate(article.date)}</time>
        <ul className="flex flex-wrap gap-1 pr-8 text-xs">
          {article.tags.map(tag => (
            <Tag key={tag} tag={tag} selectedTags={selectedTags} />
          ))}
        </ul>
      </Card.Eyebrow>
    </article>
  )
}

function Tag({
  tag,
  selectedTags,
}: {
  tag: string
  selectedTags: undefined | Array<string>
}) {
  const query =
    selectedTags && selectedTags.length === 1 && selectedTags[0] === tag
      ? {}
      : selectedTags?.includes(tag)
        ? { tag: selectedTags.filter(t => t !== tag) }
        : { tag: [tag].concat(selectedTags ?? []) }
  return (
    <Link key={tag} href={{ pathname: `/articles`, query }} prefetch={false}>
      <li
        className={clsx(
          selectedTags?.includes(tag)
            ? 'bg-secondary-600 text-secondary-50'
            : 'bg-primary-200/50 text-primary-600 hover:outline-secondary-200 hover:outline-secondary-800 dark:bg-primary-800 dark:text-primary-400',
          'rounded-md px-1 outline outline-1 outline-transparent'
        )}
      >
        {tag}
      </li>
    </Link>
  )
}

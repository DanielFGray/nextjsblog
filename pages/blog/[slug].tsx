import * as React from 'react'
import type { GetStaticProps, GetStaticPaths, NextPage } from 'next'
import Head from 'next/head'
import Link from 'next/link'
import ago from 's-ago'
import { getMDXComponent } from 'mdx-bundler/client'
import { bundleMDX } from 'mdx-bundler'
import { remarkCodeHike } from '@code-hike/mdx'
import shikiNordTheme from 'shiki/themes/nord.json' assert { type: 'json' }
import headings from 'rehype-autolink-headings'
import rehypeSlug from 'rehype-slug'
import rehypeToc from '@jsdevtools/rehype-toc'
import type { FrontMatter } from '~/types'
import { getStaticBlogPaths, mdxFromSlug, matter } from '~/lib/mdx'
import { Tag } from '~/components/Tag'
import { Comments } from '~/components/Comments'
import { useCommentFetcher, useCommentStats } from '~/lib/comments'

type Props = { code: string; data: FrontMatter }

const BlogPost: NextPage<Props> = ({ code, data }) => {
  const date = new Date(data.date)
  const MDX = React.useMemo(() => getMDXComponent(code), [code])
  const { data: comments } = useCommentFetcher({ slug: data.slug })
  const { data: stats } = useCommentStats()
  const commentCount = stats?.[data.slug]
  return (
    <>
      <Head>
        <title>{data.title}</title>
        <meta property="og:title" key="title" content={data.title} />
        <meta name="description" content={data.excerpt} />
        {data.tags && <meta name="keywords" content={data.tags.join(', ')} />}
      </Head>
      <div className="mx-auto max-w-5xl p-6 sm:p-8 text-brand-400">
        <p className="text-sm font-medium">
          {data.category}
        </p>
        <p className="my-4 text-2xl font-extrabold text-brand-50">{data.title}</p>
        <div className="flex flex-col items-start">
          <div className="flex flex-wrap gap-x-1">
            {data.tags?.map(tag => (
              <Link key={tag} href={`/blog/tags/${tag}`}>
                <a>
                  <Tag>{tag}</Tag>
                </a>
              </Link>
            )) || null}
          </div>
          <div className="mt-2 flex flex-wrap space-x-1 text-sm">
            {date && (
              <>
                <time dateTime={date.toLocaleDateString()}><a title={date.toLocaleString()}>{ago(date)}</a></time>
                <span aria-hidden="true"> · </span>
              </>
            )}
            <span>{data.words} words</span>
            <span aria-hidden="true"> · </span>
            <span>{data.time}</span>
            {commentCount && (
              <>
                <span aria-hidden="true"> · </span>
                <span>
                  <Link href="#comment-section">
                    <a className="underline hover:no-underline">
                      {`${commentCount} comment${commentCount === '1' ? '' : 's'}`}
                    </a>
                  </Link>
                </span>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="prose prose-lg prose-quoteless mx-auto max-w-full bg-gray-50 p-8 shadow-lg dark:prose-invert dark:bg-gray-800 sm:prose-base lg:max-w-5xl lg:rounded-xl">
        <MDX />
      </div>

      <Comments comments={comments} />
    </>
  )
}

export default BlogPost

export const getStaticProps: GetStaticProps = async ({
  params,
}): Promise<{
  props: Props
}> => {
  if (! params?.slug) throw new Error('missing slug param')
  if (params.slug instanceof Array) throw new Error('too many slugs')
  const { slug } = params
  const source = await mdxFromSlug(slug)
  const { data } = matter(source, slug)
  const { code } = await bundleMDX({
    source,
    mdxOptions: options => {
      options.remarkPlugins = [
        ...(options.remarkPlugins ?? []),
        [
          remarkCodeHike,
          {
            theme: shikiNordTheme,
            autoImport: true,
            lineNumbers: false,
          },
        ],
      ]
      options.rehypePlugins = [
        ...(options.rehypePlugins ?? []),
        headings,
        rehypeToc,
        rehypeSlug
      ]

      return options
    },
  })
  return { props: { code, data } }
}

export const getStaticPaths: GetStaticPaths = async () => {
  const paths = await getStaticBlogPaths()
  return { paths, fallback: false }
}

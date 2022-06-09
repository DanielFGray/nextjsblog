import type { NextPage, GetStaticProps } from 'next'
import { BlogCard, BlogList } from '~/components/BlogCards'
import { getAllFilesFrontMatter } from '~/lib/mdx'
import Link from 'next/link'
import type { FrontMatter } from '~/types'
import { useCommentStats } from '~/lib/comments'
import RSS from 'rss'
import fs from 'fs/promises'
import path from 'path'

interface StaticProps {
  posts: FrontMatter[]
}

const Home: NextPage<StaticProps> = ({ posts }) => {
  const { data: stats } = useCommentStats()
  return (
    <BlogList>
      {posts.map(post => (
        <BlogCard key={post.slug} post={post} commentCount={stats ? stats[post.slug] : null} />
      ))}
      <div className="flex flex-col overflow-hidden shadow-lg">
        <Link href="/blog">
          <a className="flex flex-1 flex-col justify-around rounded-lg bg-white bg-gradient-to-br from-white to-gray-200 p-6 dark:bg-gray-800 dark:from-gray-800 dark:to-gray-900 dark:text-white">
            See more &mdash;&gt;
          </a>
        </Link>
      </div>
    </BlogList>
  )
}

export default Home

/* eslint-disable @typescript-eslint/no-non-null-assertion, @typescript-eslint/ban-ts-comment */
export const getStaticProps: GetStaticProps = async (): Promise<{ props: StaticProps }> => {
  const posts = await getAllFilesFrontMatter()
  const feed = new RSS({
    title: 'dfg.rocks',
    site_url: 'https://dfg.rocks',
    feed_url: 'https://dfg.rocks/feed.xml',
    language: 'en',
  })

  posts.map(post => {
    feed.item({
      title: post.title,
      url: `https://dfg.rocks/blog/${post.slug}`,
      date: post.date,
      categories: [post.category!],
      description: post.excerpt!,
      author: 'Daniel F. Gray',
    })
  })

  try {
    await fs.mkdir(path.resolve('./public'))
  } catch (e) {
    // @ts-ignore
    if (e.code !== 'EEXIST') throw e
    // it exists, no problem
  }
  await fs.writeFile(path.resolve('./public/feed.xml'), feed.xml({ indent: true }), 'utf8')

  return { props: { posts: posts.slice(0, 5) } }
}

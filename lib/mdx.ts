import fs from 'fs/promises'
import path from 'path'
import { globby } from 'globby'
import { descend } from './util'
import grayMatter from 'gray-matter'
import readingTime from 'reading-time'
import RSS from 'rss'
import type { FrontMatter } from '~/types'

export type SourceWithMatter = {
  code: string
  data: FrontMatter
}

export function matter(source: string, path: string): { content: string; data: FrontMatter } {
  const { content, data, excerpt } = grayMatter(source, {
    excerpt_separator: '\n\n',
  })
  const date = (data.date as Date)?.toJSON?.() ?? null
  const updated = (data.updated as Date | undefined)?.toJSON?.() ?? null
  const { words, text: time } = readingTime(content)
  return {
    content,
    data: {
      title: data.title as string,
      category: data.category as string,
      tags: data.tags as string[],
      excerpt: excerpt!.trim(),
      date,
      updated,
      slug: path.replace(/\.mdx?$/, ''),
      words,
      time,
    },
  }
}

const postsPath = () => path.join(process.cwd(), 'blog', '/')

export async function mdxFromSlug(slug: string): Promise<string> {
  const filePath = path.join(postsPath(), `${slug}.mdx`)
  return await fs.readFile(filePath, 'utf8')
}

async function getFileList() {
  const glob = path.join(postsPath(), '**', '*{.md,.mdx}')
  return await globby(glob)
}

const stripExtension = (path: string) => path.replace(/.mdx?$/, '')
const removeRoot = (path: string) => path.replace(postsPath(), '')
const pathToSlug = (path: string) => stripExtension(removeRoot(path))

export async function getAllFilesFrontMatter(): Promise<FrontMatter[]> {
  const files = await getFileList()
  const allFrontMatter = await Promise.all(
    files.map(async file => {
      const name = pathToSlug(file)
      return matter(await mdxFromSlug(name), name).data
    }, []),
  )
  return allFrontMatter.sort(descend(x => Number(new Date(x?.updated || x.date))))
}

export async function getStaticBlogPaths(): Promise<{ params: { slug: string } }[]> {
  const files = await getFileList()
  return files
    .map(path => ({ params: { slug: pathToSlug(path) } }))
}

export async function makeRssFeed(allPosts: FrontMatter[]): Promise<void> {
  const feed = new RSS({
    title: 'dfg.rocks',
    site_url: 'https://dfg.rocks',
    feed_url: 'https://dfg.rocks/feed.xml',
    language: 'en',
  })

  allPosts.map(post => {
    feed.item({
      title: post.title,
      url: `https://dfg.rocks/blog/${post.slug}`,
      date: post.date,
      categories: [post.category].concat(post.tags),
      description: post.excerpt,
      author: 'Daniel F. Gray',
    })
  })

  try {
    await fs.mkdir(path.resolve('./public'))
  } catch (e) {
    /* eslint @typescript-eslint/ban-ts-comment: warn */
    // @ts-ignore
    if (e.code !== 'EEXIST') throw e
    // it exists, no problem
  }
  await fs.writeFile(path.resolve('./public/feed.xml'), feed.xml({ indent: true }), 'utf8')
}

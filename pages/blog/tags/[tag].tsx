import type { GetStaticPaths, GetStaticProps, NextPage } from 'next'
import { getAllFilesFrontMatter } from '~/lib/mdx'
import { BlogCard, BlogList } from '~/components/BlogCards'
import { FrontMatter } from '~/types'

interface Props {
  posts: FrontMatter[]
}

const TagList: NextPage<Props> = ({ posts }) => {
  return (
    <BlogList>
      {posts.map(post => (
        <BlogCard key={post.slug} post={post} />
      ))}
    </BlogList>
  )
}

export default TagList

export const getStaticPaths: GetStaticPaths = async () => {
  const posts = await getAllFilesFrontMatter()
  const tags = Array.from(new Set(posts.flatMap(x => x.tags)))
  const paths = tags.map(tag => ({ params: { tag } }))
  return { paths, fallback: false }
}

export const getStaticProps: GetStaticProps<Props> = async ({ params }) => {
  if (! params?.tag) throw new Error('missing tag param')
  if (params.tag instanceof Array) throw new Error('too many tags')
  const { tag } = params
  const posts = await getAllFilesFrontMatter()
  const postsWithTags = posts.filter(x => x.tags?.includes(tag))
  return { props: { posts: postsWithTags } }
}

import type { GetStaticProps, NextPage } from 'next'
import { getAllFilesFrontMatter } from '~/lib/mdx'
import { BlogList, BlogCard } from '~/components/BlogCards'
import { FrontMatter } from '~/pages/types'

interface StaticProps {
  posts: FrontMatter[]
}

const TagList: NextPage<StaticProps> = ({ posts }) => {
  return (
    <BlogList>
      {posts.map(post => (
        <BlogCard key={post.slug} post={post} />
      ))}
    </BlogList>
  )
}

export default TagList

export const getStaticProps: GetStaticProps = async (): Promise<{ props: StaticProps }> => {
  const posts = await getAllFilesFrontMatter()
  return { props: { posts } }
}

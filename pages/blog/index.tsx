import type { GetStaticProps, NextPage } from 'next'
import { getAllFilesFrontMatter } from '~/lib/mdx'
import { BlogList, BlogCard } from '~/components/BlogCards'
import { FrontMatter } from '~/types'
import { useCommentStats } from '~/lib/comments'

interface StaticProps {
  posts: FrontMatter[]
}

const TagList: NextPage<StaticProps> = ({ posts }) => {
  const { data: stats } = useCommentStats()
  return (
    <BlogList>
      {posts.map(post => (
        <BlogCard key={post.slug} post={post} commentCount={stats ? stats[post.slug] : null} />
      ))}
    </BlogList>
  )
}

export default TagList

export const getStaticProps: GetStaticProps = async (): Promise<{ props: StaticProps }> => {
  const posts = await getAllFilesFrontMatter()
  return { props: { posts } }
}

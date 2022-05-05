import type { NextPage, GetStaticProps } from 'next'
import { BlogCard, BlogList } from '~/components/BlogCards'
import { getAllFilesFrontMatter } from '~/lib/mdx'
import Link from 'next/link'
import type { FrontMatter } from '~/types'

interface StaticProps {
  posts: FrontMatter[]
}

const Home: NextPage<StaticProps> = ({ posts }) => {
  return (
    <BlogList>
      {posts.map(post => (
        <BlogCard key={post.slug} post={post} />
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

export const getStaticProps: GetStaticProps = async (): Promise<{ props: StaticProps }> => {
  const posts = await getAllFilesFrontMatter()
  return { props: { posts: posts.slice(0, 5) } }
}

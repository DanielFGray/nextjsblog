import type { GetStaticProps, NextPage } from 'next'
import { getAllFilesFrontMatter } from '~/lib/mdx'

interface Props {
  tags: { name: string; count: number }[]
}

const BlogList: NextPage<Props> = ({ tags }) => (
  <>
    {tags.map(({ name, count }) => (
      <div key={name}>
        <h2 className="font-bold">{name}</h2>
        <p>{count}</p>
      </div>
    ))}
  </>
)

export default BlogList

export const getStaticProps: GetStaticProps<Props> = async () => {
  const posts = await getAllFilesFrontMatter()
  const tags = Object.entries(
    posts
      .flatMap(p => p.tags)
      .reduce((acc, tag) => {
        if (tag) acc[tag] = acc[tag] ? acc[tag] + 1 : 1
        return acc
      }, {} as { [key: string]: number }),
  )
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
  return { props: { tags } }
}

import React from 'react'
import ago from 's-ago'
import Link from 'next/link'
import { Tag } from '~/components/Tag'
import { FrontMatter } from '~/pages/types'

export const BlogList = ({ children }: { children: React.ReactNode }): JSX.Element => (
  <div className="mx-auto mt-16 max-w-7xl">
    <div className="mx-auto grid max-w-lg gap-4 px-4 lg:max-w-none lg:grid-cols-3">{children}</div>
  </div>
)

export const Card = ({
  className = '',
  children,
  header = null,
}: {
  header?: React.ReactNode
  className?: string
  children: React.ReactNode
}): React.ReactElement => (
  <div className="flex flex-col overflow-hidden rounded-xl shadow-lg">
    {header}
    <div
      className={`flex flex-1 flex-col justify-between bg-white bg-gradient-to-br from-white to-gray-200 p-6 dark:bg-gray-800 dark:from-gray-800 dark:to-gray-900 dark:text-gray-50 ${className}`}
    >
      {children}
    </div>
  </div>
)

export function BlogCard({ post }: { post: FrontMatter }): React.ReactElement {
  const date = post.date ? new Date(post.updated || post.date) : null
  return (
    <Card
      key={post.slug}
      header={
        post.image && (
          <div className="hidden flex-shrink-0">
            <img className="h-48 w-full object-cover" src={post.image} alt="" />
          </div>
        )
      }
    >
      <div className="flex-1">
        <p className="text-sm font-medium text-gray-500">{post.category}</p>
        <Link href={`/blog/${post.slug}`}>
          <a className="mt-2 block">
            <p className="text-xl font-extrabold text-gray-900 dark:text-gray-50">{post.title}</p>
            <p className="mt-3 text-base text-gray-500 dark:text-gray-400">{post.excerpt}</p>
          </a>
        </Link>
      </div>
      <div className="mt-6 flex flex-col items-start">
        {post.tags && (
          <div className="-ml-1 flex flex-wrap gap-x-1">
            {post.tags.map(tag => (
              <Link key={tag} href={`/blog/tags/${tag}`}>
                <a>
                  <Tag className="dark:border-gray-700 dark:bg-gray-700 dark:text-gray-200 dark:hover:border-gray-500">
                    {tag}
                  </Tag>
                </a>
              </Link>
            ))}
          </div>
        )}
        <div className="mt-2 flex flex-wrap space-x-1 text-sm text-gray-500">
          {date && (
            <>
              <time dateTime={date.toLocaleDateString()}>{ago(date)}</time>
              <span aria-hidden="true"> · </span>
            </>
          )}
          <span>{post.words} words</span>
          <span aria-hidden="true"> · </span>
          <span>{post.time}</span>
        </div>
      </div>
    </Card>
  )
}

import React from 'react'

import { renderToStaticMarkup } from 'react-dom/server'
import glob from 'fast-glob'
import readingTime from 'reading-time'
import * as path from 'path'

async function importArticle(articleFilename: string) {
  const { meta, default: component } = await import(
    `../pages/articles/${articleFilename}`
  )
  const { words, text: time } = readingTime(
    renderToStaticMarkup(React.createElement(component))
  )
  const slug = articleFilename.replace(/(\/index)?\.mdx$/, '')
  return {
    meta: { ...meta, slug, time, words },
    component,
  }
}

export async function getAllArticles() {
  const articleFilenames = await glob(['*.mdx', '*/index.mdx'], {
    cwd: path.join(process.cwd(), 'src/pages/articles'),
  })

  const articles = await Promise.all(articleFilenames.map(importArticle))

  return articles.sort((a, z) => +new Date(z.meta.date) - +new Date(a.meta.date))
}

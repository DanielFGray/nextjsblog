export type FrontMatter = Readonly<{
  title: string
  excerpt: string
  category: string
  image?: string
  tags: readonly string[]
  date: string
  updated?: string | null
  words: number
  time: string
  slug: string
}>

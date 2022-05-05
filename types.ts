export interface FrontMatter {
  title: string
  excerpt?: string
  category?: string
  image?: string
  tags?: string[]
  date: string
  updated?: string | null
  words: number
  time: string
  slug: string
}

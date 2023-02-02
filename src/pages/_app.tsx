import type { AppProps } from 'next/app'
import { useEffect, useRef } from 'react'
import { Footer } from '~/components/Footer'
import { Header } from '~/components/Header'
import { QueryProvider } from '~/lib/comments'

import '@code-hike/mdx/dist/index.css'
import '~/styles/tailwind.css'
import 'focus-visible'

function usePrevious<T>(value: T): T {
  const ref = useRef<T>()

  useEffect(() => {
    ref.current = value
  }, [value])

  return ref.current
}

export default function App({ Component, pageProps, router }: AppProps) {
  const previousPathname = usePrevious(router.pathname)
  return (
    <QueryProvider>
      <div className="fixed inset-0 flex justify-center sm:px-8">
        <div className="flex w-full max-w-7xl lg:px-4">
          <div className="w-full bg-primary-100 ring-1 ring-primary-100 dark:bg-primary-800/50 dark:ring-primary-300/20" />
        </div>
      </div>
      <div className="relative">
        <Header />
        <main>
          <Component previousPathname={previousPathname} {...pageProps} />
        </main>
        <Footer />
      </div>
    </QueryProvider>
  )
}

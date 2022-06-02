import type { AppProps } from 'next/app'
import React from 'react'
import '../styles/main.css'
import { QueryClient, QueryClientProvider } from 'react-query'
import "@code-hike/mdx/dist/index.css"
import Layout from '~/components/Layout'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 0,
      refetchOnMount: false,
      refetchOnWindowFocus: true,
      staleTime: Infinity,
    }
  }
})

export default function App({ Component, pageProps }: AppProps) {
  return (
    <QueryClientProvider client={queryClient}>
      <Layout>
        <Component {...pageProps} />
      </Layout>
    </QueryClientProvider>
  )
}

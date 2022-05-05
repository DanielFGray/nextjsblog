import type { AppProps } from 'next/app'
import React from 'react'
import '../styles/main.css'
import "@code-hike/mdx/dist/index.css"
import Layout from '~/components/Layout'

export default function App({ Component, pageProps }: AppProps) {
  return (
    <Layout>
      <Component {...pageProps} />
    </Layout>
  )
}

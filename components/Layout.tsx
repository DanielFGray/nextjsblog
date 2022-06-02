import React from 'react'
import Head from 'next/head'
import { Nav } from '~/components/Nav'
import type { NextPage } from 'next'

const siteTitle = process.env.NEXT_PUBLIC_SITE_TITLE ?? 'dfg.rocks'

type LayoutProps = {
  title?: string
  gradient?: string
  children: React.ReactNode
}

const NavLinks = [
  { path: '/', label: 'Home' },
  { path: '/blog', label: 'Blog' },
]

const Layout: NextPage<LayoutProps> = ({ title, children }) => {
  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-brand-800 to-gray-900 pb-8">
        <Head>
          <title>{title ? `${title} | ${siteTitle}` : siteTitle}</title>
          <meta charSet="utf-8" />
          <meta name="viewport" content="initial-scale=1.0, width=device-width" />
        </Head>
        <Nav links={NavLinks} />
        <article className="h-full">{children}</article>
      </div>
    </>
  )
}

export default Layout

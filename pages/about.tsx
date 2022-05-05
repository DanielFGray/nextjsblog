import Link from 'next/link'
import Layout from '~/components/Layout'

export default function AboutPage(): JSX.Element {
  return (
    <Layout title="About Me">
      <h1>About</h1>
      <p>This is the about page</p>
      <p>
        <Link href="/">
          <a>Go home</a>
        </Link>
      </p>
    </Layout>
  )
}

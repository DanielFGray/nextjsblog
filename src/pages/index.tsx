import Head from 'next/head'
import clsx from 'clsx'

import {
  SocialLinks,
  ArrowDownIcon,
  BriefcaseIcon,
  MailIcon,
} from '~/components/SocialIcons'
import { Button } from '~/components/Button'
import { Article } from '~/pages/articles'
import { Container } from '~/components/Container'
import { generateRssFeed } from '~/lib/generateRssFeed'
import { getAllArticles } from '~/lib/getAllArticles'
import { Article as TArticle } from '~/types'

export async function getStaticProps() {
  await generateRssFeed()

  return {
    props: {
      articles: (await getAllArticles()).slice(0, 4).map(({ meta }) => meta),
    },
  }
}

export default function Home({ articles }: { articles: Array<TArticle> }) {
  return (
    <>
      <Head>
        <title>Daniel Gray - Software developer</title>
        <meta
          name="description"
          content="Software developer and drummer based in Houston, Texas."
        />
      </Head>
      <Container className="mt-9">
        <div className="max-w-2xl space-y-6">
          <h1 className="text-4xl font-bold tracking-tight text-primary-800 dark:text-primary-100 sm:text-5xl">
            Daniel Gray
          </h1>
          <p className="text-base text-primary-600 dark:text-primary-400">
            Software developer and drummer based in Houston, Texas.
          </p>
          <ul className="flex gap-0.5">
            <SocialLinks labels={false} />
          </ul>
        </div>
      </Container>
      <Photos />
      <Container className="md:mt-18 mt-16">
        <div className="md:border-l md:border-primary-100 md:pl-6 md:dark:border-primary-700/40">
          <div className="flex max-w-3xl flex-col space-y-16">
            {articles.map(article => (
              <Article key={article.slug} article={article} />
            ))}
          </div>
          <Button
            href="/articles"
            variant="secondary"
            className="group mt-12 w-full"
          >
            Read more
          </Button>
        </div>
      </Container>
    </>
  )
}

function Newsletter() {
  return (
    <form
      action="/thank-you"
      className="rounded-2xl border border-primary-200 bg-primary-50 p-6 dark:border-primary-700/40 dark:bg-primary-900/50"
    >
      <h2 className="flex text-sm font-semibold text-primary-900 dark:text-primary-100">
        <MailIcon className="h-6 w-6 flex-none" />
        <span className="ml-3">Stay up to date</span>
      </h2>
      <p className="mt-2 text-sm text-primary-600 dark:text-primary-400">
        Get notified when I publish something new, and unsubscribe at any time.
      </p>
      <div className="mt-6 flex">
        <input
          type="email"
          placeholder="Email address"
          aria-label="Email address"
          required
          className="min-w-0 flex-auto appearance-none rounded-md border border-primary-900/10 bg-white px-3 py-[calc(theme(spacing.2)-1px)] shadow-md shadow-primary-800/5 placeholder:text-primary-400 focus:border-secondary-500 focus:outline-none focus:ring-4 focus:ring-secondary-500/10 dark:border-primary-700 dark:bg-primary-700/[0.15] dark:text-primary-200 dark:placeholder:text-primary-500 dark:focus:border-secondary-400 dark:focus:ring-secondary-400/10 sm:text-sm"
        />
        <Button type="submit" variant="secondary" className="ml-4 flex-none">
          Join
        </Button>
      </div>
    </form>
  )
}

const shortResumeList: Array<{
  company: string
  title: string
  logo?: any
  start: string | { label: string; dateTime: string }
  end: string | { label: string; dateTime: string }
}> = [
  {
    company: 'Planetaria',
    title: 'CEO',
    // logo: logoPlanetaria,
    start: '2019',
    end: {
      label: 'Present',
      dateTime: `${new Date().getFullYear()}`,
    },
  },
  {
    company: 'Airbnb',
    title: 'Product Designer',
    // logo: logoAirbnb,
    start: '2014',
    end: '2019',
  },
  {
    company: 'Facebook',
    title: 'iOS Software Engineer',
    // logo: logoFacebook,
    start: '2011',
    end: '2014',
  },
]

function Resume() {
  return (
    <div className="rounded-2xl border border-primary-200 bg-primary-50 p-6 dark:border-primary-700/40 dark:bg-primary-900/50">
      <h2 className="flex text-sm font-semibold text-primary-900 dark:text-primary-100">
        <BriefcaseIcon className="h-6 w-6 flex-none" />
        <span className="ml-3">Work</span>
      </h2>
      <ol className="mt-6 space-y-4">
        {shortResumeList.map((role, roleIndex) => (
          <li key={roleIndex} className="flex gap-4">
            {role.logo && (
              <div className="relative mt-1 flex h-10 w-10 flex-none items-center justify-center rounded-full shadow-md shadow-primary-800/5 ring-1 ring-primary-900/5 dark:border dark:border-primary-700/50 dark:bg-primary-800 dark:ring-0">
                <img src={role.logo} alt="" className="h-7 w-7" />
              </div>
            )}
            <dl className="flex flex-auto flex-wrap gap-x-2">
              <dt className="sr-only">Company</dt>
              <dd className="w-full flex-none text-sm font-medium text-primary-900 dark:text-primary-100">
                {role.company}
              </dd>
              <dt className="sr-only">Role</dt>
              <dd className="text-xs text-primary-500 dark:text-primary-400">
                {role.title}
              </dd>
              <dt className="sr-only">Date</dt>
              <dd
                className="ml-auto text-xs text-primary-400 dark:text-primary-500"
                aria-label={`${
                  typeof role.start === 'string' ? role.start : role.start.label
                } until ${
                  typeof role.end === 'string' ? role.end : role.end.label
                }`}
              >
                <time
                  dateTime={
                    typeof role.start === 'string'
                      ? role.start
                      : role.start.dateTime
                  }
                >
                  {typeof role.start === 'string'
                    ? role.start
                    : role.start.label}
                </time>{' '}
                <span aria-hidden="true">—</span>{' '}
                <time
                  dateTime={
                    typeof role.end === 'string' ? role.end : role.end.dateTime
                  }
                >
                  {typeof role.end === 'string' ? role.end : role.end.label}
                </time>
              </dd>
            </dl>
          </li>
        ))}
      </ol>
      <Button href="#" variant="secondary" className="group mt-6 w-full">
        Download CV
        <ArrowDownIcon className="h-4 w-4 stroke-primary-400 transition group-active:stroke-primary-600 dark:group-hover:stroke-primary-50 dark:group-active:stroke-primary-50" />
      </Button>
    </div>
  )
}

function Photos() {
  return (
    <div className="mt-16 sm:mt-20">
      <div className="-my-4 flex justify-center gap-5 overflow-hidden py-4 sm:gap-8">
        {[].map((image, imageIndex) => (
          <div
            key={image}
            className={clsx(
              'relative aspect-[9/10] w-44 flex-none overflow-hidden rounded-xl bg-primary-100 dark:bg-primary-800 sm:w-72 sm:rounded-2xl',
              imageIndex % 2 === 0 ? '-rotate-2' : 'rotate-2',
            )}
          >
            <img
              src={image}
              alt=""
              sizes="(min-width: 640px) 18rem, 11rem"
              className="absolute inset-0 h-full w-full object-cover"
            />
          </div>
        ))}
      </div>
    </div>
  )
}

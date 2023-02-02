import { remarkCodeHike} from '@code-hike/mdx'
import theme from 'shiki/themes/dracula.json' assert { type: 'json' }

/** @type {import('next').NextConfig} */
const config = {
  pageExtensions: ['tsx', 'jsx', 'mdx'],
  reactStrictMode: true,
  experimental: {
    newNextLinkBehavior: true,
    scrollRestoration: true,
  },
  images: {
    unoptimized: true,
  },
  webpack(config, options) {
    config.module.rules.push({
      test: /\.mdx$/,
      use: [
        // The default `babel-loader` used by Next:
        options.defaultLoaders.babel,
        {
          loader: '@mdx-js/loader',
          /** @type {import('@mdx-js/loader').Options} */
          options: {
            remarkPlugins: [[remarkCodeHike, { theme }]],
          },
        },
      ],
    })
    return config
  },
}
export default config

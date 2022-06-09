const colors = require('tailwindcss/colors')

module.exports = {
  content: ['./pages/**/*.tsx', './components/**/*.tsx'],
  darkMode: 'media',
  theme: {
    extend: {
      colors: {
        gray: colors.neutral,
        brand: colors.slate,
      },
      typography: {
        quoteless: {
          css: {
            'blockquote': { fontStyle: 'normal' },
            'blockquote p:first-of-type::before': { content: 'none' },
            'blockquote p:first-of-type::after': { content: 'none' },
          },
        },
      },
    },
  },
  plugins: [
    require('@danielfgray/tw-heropatterns'),
    require('@tailwindcss/aspect-ratio'),
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
  ],
}

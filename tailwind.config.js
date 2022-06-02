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
    },
  },
  plugins: [
    require('@danielfgray/tw-heropatterns'),
    require('@tailwindcss/aspect-ratio'),
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
  ],
}

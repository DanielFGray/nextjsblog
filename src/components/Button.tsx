import { classed } from '@tw-classed/react'

export const Button = classed('button', {
  variants: {
    color: {
      primary: 'bg-primary-800 font-semibold text-primary-100 hover:bg-primary-700 active:bg-primary-800 active:text-primary-100/70 dark:bg-primary-700 dark:hover:bg-primary-600 dark:active:bg-primary-700 dark:active:text-primary-100/70',
      secondary: 'bg-primary-50 font-medium text-primary-900 hover:bg-primary-100 active:bg-primary-100 active:text-primary-900/60 dark:bg-primary-800/50 dark:text-primary-300 dark:hover:bg-primary-800 dark:hover:text-primary-50 dark:active:bg-primary-800/50 dark:active:text-primary-50/70',
    }
  },
  defaultVariants: { color: "primary" },
})

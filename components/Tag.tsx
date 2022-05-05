import React from 'react'

export const Tag = ({ children, className = '' }: {
  children: React.ReactNode
  className?: string | undefined
}): JSX.Element => (
  <span className={`bg-gray-200 border border-gray-200 hover:border-gray-400 font-medium text-gray-700 text-xs items-center my-1 pb-0.5 pt-0 px-1 rounded-lg ${className}`}>
    {children}
  </span>
)

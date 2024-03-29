import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { Popover, Transition } from '@headlessui/react'
import clsx from 'clsx'

import { Container } from '~/components/Container'
import avatarImage from '~/images/avatar.jpg'
import { Fragment, useEffect, useRef } from 'react'
import { ChevronDownIcon, CloseIcon, MoonIcon, SunIcon } from './SocialIcons'
import { navlinks } from '~/navlinks'

function MobileNavItem({ href, children }) {
  return (
    <li>
      <Popover.Button as={Link} href={href} className="block py-2">
        {children}
      </Popover.Button>
    </li>
  )
}

function MobileNavigation(props: Parameters<typeof Popover<"div">>[0]) {
  return (
    <Popover {...props} as="div">
      <Popover.Button className="group flex items-center rounded-full bg-white/90 px-4 py-2 text-sm font-medium text-primary-800 shadow-lg shadow-primary-800/5 ring-1 ring-primary-900/5 backdrop-blur dark:bg-primary-800/90 dark:text-primary-200 dark:ring-white/10 dark:hover:ring-white/20">
        Menu
        <ChevronDownIcon className="ml-3 h-auto w-2 stroke-primary-500 group-hover:stroke-primary-700 dark:group-hover:stroke-primary-400" />
      </Popover.Button>
      <Transition.Root>
        <Transition.Child
          as={Fragment}
          enter="duration-150 ease-out"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="duration-150 ease-in"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <Popover.Overlay className="fixed inset-0 z-50 bg-primary-800/40 backdrop-blur-sm dark:bg-black/80" />
        </Transition.Child>
        <Transition.Child
          as={Fragment}
          enter="duration-150 ease-out"
          enterFrom="opacity-0 scale-95"
          enterTo="opacity-100 scale-100"
          leave="duration-150 ease-in"
          leaveFrom="opacity-100 scale-100"
          leaveTo="opacity-0 scale-95"
        >
          <Popover.Panel
            focus
            className="fixed inset-x-4 top-8 z-50 origin-top rounded-3xl bg-white p-8 ring-1 ring-primary-900/5 dark:bg-primary-900 dark:ring-primary-800"
          >
            <div className="flex flex-row-reverse items-center justify-between">
              <Popover.Button aria-label="Close menu" className="-m-1 p-1">
                <CloseIcon className="h-6 w-6 text-primary-500 dark:text-primary-400" />
              </Popover.Button>
              <h2 className="text-sm font-medium text-primary-600 dark:text-primary-400">
                Navigation
              </h2>
            </div>
            <nav className="mt-6">
              <ul className="-my-2 divide-y divide-primary-100 text-base text-primary-800 dark:divide-primary-100/5 dark:text-primary-300">
                {navlinks.map(link => <MobileNavItem key={link.href} href={link.href}>{link.label}</MobileNavItem>)}
              </ul>
            </nav>
          </Popover.Panel>
        </Transition.Child>
      </Transition.Root>
    </Popover>
  )
}

function NavItem({ href, children }) {
  const isActive = useRouter().pathname === href

  return (
    <li>
      <Link
        href={href}
        className={clsx(
          'relative block px-3 py-2 transition',
          isActive
            ? 'text--500 dark:text-secondary-400'
            : 'hover:text--500 dark:hover:text-secondary-400'
        )}
      >
        {children}
        {isActive && (
          <span className="from--500/0 absolute inset-x-1 -bottom-px h-px bg-gradient-to-r via-secondary-500/40 to-secondary-500/0 dark:from-secondary-400/0 dark:via-secondary-400/40 dark:to-secondary-400/0" />
        )}
      </Link>
    </li>
  )
}

function DesktopNavigation(props: React.HTMLAttributes<HTMLElement>) {
  return (
    <nav {...props}>
      <ul className="flex rounded-full bg-white/90 px-3 text-sm font-medium text-primary-800 shadow-lg shadow-primary-800/5 ring-1 ring-primary-900/5 dark:bg-primary-800/90 dark:text-primary-200 dark:ring-white/10">
        {navlinks.map(link => <NavItem key={link.href} href={link.href}>{link.label}</NavItem>)}
      </ul>
    </nav>
  )
}

function ModeToggle() {
  function disableTransitionsTemporarily() {
    document.documentElement.classList.add('[&_*]:!transition-none')
    window.setTimeout(() => {
      document.documentElement.classList.remove('[&_*]:!transition-none')
    }, 0)
  }

  function toggleMode() {
    disableTransitionsTemporarily()

    const darkModeMediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    const isSystemDarkMode = darkModeMediaQuery.matches
    const isDarkMode = document.documentElement.classList.toggle('dark')

    if (isDarkMode === isSystemDarkMode) {
      delete window.localStorage.isDarkMode
    } else {
      window.localStorage.isDarkMode = isDarkMode
    }
  }

  return (
    <button
      type="button"
      aria-label="Toggle dark mode"
      className="group rounded-full bg-white/90 px-3 py-2 shadow-lg shadow-primary-800/5 ring-1 ring-primary-800/5 backdrop-blur transition dark:bg-primary-800/90 dark:ring-white/10 dark:hover:ring-white/20"
      onClick={toggleMode}
    >
      <SunIcon className="[@media(prefers-color-scheme:dark)]:fill--50 h-6 w-6 fill-primary-100 stroke-primary-500 transition group-hover:fill-primary-200 group-hover:stroke-primary-700 dark:hidden [@media(prefers-color-scheme:dark)]:stroke-secondary-500 [@media(prefers-color-scheme:dark)]:group-hover:fill-secondary-50 [@media(prefers-color-scheme:dark)]:group-hover:stroke-secondary-600" />
      <MoonIcon className="[@media_not_(prefers-color-scheme:dark)]:fill--400/10 hidden h-6 w-6 fill-primary-700 stroke-primary-500 transition dark:block [@media(prefers-color-scheme:dark)]:group-hover:stroke-primary-400 [@media_not_(prefers-color-scheme:dark)]:stroke-secondary-500" />
    </button>
  )
}

function clamp(number: number, a: number, b: number) {
  const min = Math.min(a, b)
  const max = Math.max(a, b)
  return Math.min(Math.max(number, min), max)
}

function AvatarContainer({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={clsx(
        className,
        'h-10 w-10 rounded-full bg-white/90 p-0.5 shadow-lg shadow-primary-800/5 ring-1 ring-primary-900/5 backdrop-blur dark:bg-primary-800/90 dark:ring-white/10'
      )}
      {...props}
    />
  )
}

function Avatar({ large = false, className, ...props }: { large?: boolean } & React.HTMLAttributes<HTMLAnchorElement>) {
  return (
    <Link
      href="/"
      aria-label="Home"
      className={clsx(className, 'pointer-events-auto')}
      {...props}
    >
      <Image
        src={avatarImage}
        alt=""
        sizes={large ? '4rem' : '2.25rem'}
        className={clsx(
          'rounded-full bg-primary-100 object-cover dark:bg-primary-800',
          large ? 'h-16 w-16' : 'h-9 w-9'
        )}
        priority
      />
    </Link>
  )
}

export function Header() {
  const isHomePage = useRouter().pathname === '/'

  const headerRef = useRef<undefined | HTMLDivElement>()
  const avatarRef = useRef<undefined | HTMLDivElement>()
  const isInitial = useRef(true)

  useEffect(() => {
    const downDelay = avatarRef.current?.offsetTop ?? 0
    const upDelay = 64

    function setStyleProperty(property: string, value: string) {
      document.documentElement.style.setProperty(property, value)
    }

    function updateHeaderStyles() {
      const { top, height } = headerRef.current?.getBoundingClientRect()
      const scrollY = clamp(
        window.scrollY,
        0,
        document.body.scrollHeight - window.innerHeight
      )

      if (isInitial.current) {
        setStyleProperty('--header-position', 'sticky')
      }

      setStyleProperty('--content-offset', `${downDelay}px`)

      if (isInitial.current || scrollY < downDelay) {
        setStyleProperty('--header-height', `${downDelay + height}px`)
        setStyleProperty('--header-mb', `${-downDelay}px`)
      } else if (top + height < -upDelay) {
        const offset = Math.max(height, scrollY - upDelay)
        setStyleProperty('--header-height', `${offset}px`)
        setStyleProperty('--header-mb', `${height - offset}px`)
      } else if (top === 0) {
        setStyleProperty('--header-height', `${scrollY + height}px`)
        setStyleProperty('--header-mb', `${-scrollY}px`)
      }
    }

    function updateAvatarStyles() {
      if (! isHomePage) {
        return
      }

      const fromScale = 1
      const toScale = 36 / 64
      const fromX = 0
      const toX = 2 / 16

      const scrollY = downDelay - window.scrollY

      let scale = (scrollY * (fromScale - toScale)) / downDelay + toScale
      scale = clamp(scale, fromScale, toScale)

      let x = (scrollY * (fromX - toX)) / downDelay + toX
      x = clamp(x, fromX, toX)

      setStyleProperty(
        '--avatar-image-transform',
        `translate3d(${x}rem, 0, 0) scale(${scale})`
      )

      const borderScale = 1 / (toScale / scale)
      const borderX = (-toX + x) * borderScale
      const borderTransform = `translate3d(${borderX}rem, 0, 0) scale(${borderScale})`

      setStyleProperty('--avatar-border-transform', borderTransform)
      setStyleProperty('--avatar-border-opacity', scale === toScale ? '1' : '0')
    }

    function updateStyles() {
      updateHeaderStyles()
      updateAvatarStyles()
      isInitial.current = false
    }

    updateStyles()
    window.addEventListener('scroll', updateStyles, { passive: true })
    window.addEventListener('resize', updateStyles)

    return () => {
      window.removeEventListener('scroll', updateStyles)
      window.removeEventListener('resize', updateStyles)
    }
  }, [isHomePage])

  return (
    <>
      <header
        className="pointer-events-none relative z-50 flex flex-col"
        style={{
          height: 'var(--header-height)',
          marginBottom: 'var(--header-mb)',
        }}
      >
        {isHomePage && (
          <>
            <div
              ref={avatarRef}
              className="order-last mt-[calc(theme(spacing.16)-theme(spacing.3))]"
            />
            <Container
              className="top-0 order-last -mb-3 pt-3"
              style={{ position: 'var(--header-position)' } as unknown as React.CSSProperties}
            >
              <div className="relative">
                <AvatarContainer
                  className="absolute left-0 top-3 origin-left transition-opacity"
                  style={{
                    opacity: 'var(--avatar-border-opacity, 0)',
                    transform: 'var(--avatar-border-transform)',
                  }}
                />
                <Avatar
                  large
                  className="block h-16 w-16 origin-left"
                  style={{ transform: 'var(--avatar-image-transform)' }}
                />
              </div>
            </Container>
          </>
        )}
        <div
          ref={headerRef}
          className="top-0 z-10 pt-6 pb-8"
          style={{ position: 'var(--header-position)' } as unknown as React.CSSProperties}
        >
          <Container>
            <div className="relative flex gap-4">
              <div className="flex flex-1">
                {! isHomePage && (
                  <AvatarContainer>
                    <Avatar />
                  </AvatarContainer>
                )}
              </div>
              <div className="flex flex-1 justify-end md:justify-center">
                <MobileNavigation className="pointer-events-auto md:hidden" />
                <DesktopNavigation className="pointer-events-auto hidden md:block" />
              </div>
              <div className="flex justify-end md:flex-1">
                <div className="pointer-events-auto">
                  <ModeToggle />
                </div>
              </div>
            </div>
          </Container>
        </div>
      </header>
      {isHomePage && <div style={{ height: 'var(--content-offset)' }} />}
    </>
  )
}

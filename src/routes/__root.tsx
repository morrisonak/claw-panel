/// <reference types="vite/client" />
import {
  HeadContent,
  Link,
  Outlet,
  Scripts,
  createRootRoute,
} from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import * as React from 'react'
import { useState } from 'react'
import { DefaultCatchBoundary } from '~/components/DefaultCatchBoundary'
import { NotFound } from '~/components/NotFound'
import { UserNav } from '~/components/UserNav'
import { ThemeProvider } from '~/components/theme-provider'
import { ThemeToggle } from '~/components/theme-toggle'
import { MobileNav } from '~/components/mobile-nav'
import appCss from '~/styles/app.css?url'
import { seo } from '~/utils/seo'

// Script to prevent flash of unstyled content
const themeScript = `
  (function() {
    const stored = localStorage.getItem('metavadvisors-theme');
    const theme = stored || 'system';
    const root = document.documentElement;

    if (theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      root.classList.add('dark');
    }
  })();
`

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      ...seo({
        title: 'MetaV Advisors | Custom AI Agents for Revenue Growth',
        description: 'We design and deploy intelligent AI agents tailored to your business. Automate workflows, accelerate revenue, scale with zero technical overhead.',
      }),
    ],
    links: [
      { rel: 'stylesheet', href: appCss },
      { rel: 'icon', href: '/favicon.ico' },
    ],
    scripts: [
      {
        children: themeScript,
      },
    ],
  }),
  errorComponent: DefaultCatchBoundary,
  notFoundComponent: () => <NotFound />,
  component: RootComponent,
})

function RootComponent() {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000, // 1 minute
            refetchOnWindowFocus: false,
          },
        },
      })
  )

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="system" storageKey="metavadvisors-theme">
        <RootDocument>
          <Outlet />
        </RootDocument>
      </ThemeProvider>
      <ReactQueryDevtools buttonPosition="bottom-left" />
    </QueryClientProvider>
  )
}

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <HeadContent />
      </head>
      <body>
        <nav className="border-b relative">
          <div className="container mx-auto px-4 py-4 flex items-center justify-between">
            <Link
              to="/"
              className="font-bold text-lg hover:text-primary"
              activeProps={{ className: 'text-primary' }}
              activeOptions={{ exact: true }}
            >
              MetaV Advisors
            </Link>
            <div className="hidden md:flex gap-6 text-sm">
              <Link
                to="/services"
                className="hover:text-primary"
                activeProps={{ className: 'text-primary' }}
              >
                Services
              </Link>
              <Link
                to="/roi-calculator"
                className="hover:text-primary"
                activeProps={{ className: 'text-primary' }}
              >
                ROI Calculator
              </Link>
              <Link
                to="/about"
                className="hover:text-primary"
                activeProps={{ className: 'text-primary' }}
              >
                About
              </Link>
              <Link
                to="/contact"
                className="hover:text-primary"
                activeProps={{ className: 'text-primary' }}
              >
                Contact
              </Link>
              <Link
                to="/marketing-plan"
                className="hover:text-primary"
                activeProps={{ className: 'text-primary' }}
              >
                Marketing Plan
              </Link>
              <Link
                to="/business-plan"
                className="hover:text-primary"
                activeProps={{ className: 'text-primary' }}
              >
                Business Plan
              </Link>
            </div>
            <div className="flex items-center gap-2">
              <ThemeToggle />
              <MobileNav />
            </div>
          </div>
        </nav>
        <main className="container mx-auto px-4 py-8">
          {children}
        </main>
        <TanStackRouterDevtools position="bottom-right" />
        <Scripts />
      </body>
    </html>
  )
}

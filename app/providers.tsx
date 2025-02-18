'use client'

import * as React from 'react'
import { ThemeProvider } from 'next-themes'
import { Provider as JotaiProvider } from 'jotai'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AuthProvider } from '@/components/auth/AuthProvider'

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = React.useState(() => new QueryClient())

  return (
    <JotaiProvider>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={false}
          disableTransitionOnChange
        >
          <AuthProvider>
            {children}
          </AuthProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </JotaiProvider>
  )
} 
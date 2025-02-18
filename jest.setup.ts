import '@testing-library/jest-dom'
import { jest } from '@jest/globals'
import React from 'react'

// Mock next/navigation
jest.mock('next/navigation', () => ({
  usePathname: () => '/',
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
  }),
}))

// Mock next/image
jest.mock('next/image', () => ({
  __esModule: true,
  default: (props: any) => {
    // eslint-disable-next-line jsx-a11y/alt-text, @next/next/no-img-element
    return React.createElement('img', props)
  },
}))

// Mock framer-motion
jest.mock('framer-motion', () => ({
  motion: {
    div: (props: any) => React.createElement('div', props),
    form: (props: any) => React.createElement('form', props),
    h1: (props: any) => React.createElement('h1', props),
    p: (props: any) => React.createElement('p', props),
  },
}))

// Mock next-themes
jest.mock('next-themes', () => ({
  useTheme: () => ({
    theme: 'light',
    setTheme: jest.fn(),
  }),
}))

// Mock next-intl
jest.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
}))

// Mock Supabase client
jest.mock('@/utils/supabase/client', () => ({
  createClient: jest.fn(() => ({
    from: jest.fn(() => ({
      insert: jest.fn(() => Promise.resolve({ error: null }))
    }))
  }))
}))

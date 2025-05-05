'use client'

import { useParams } from 'next/navigation'
import { createSharedPathnamesNavigation } from 'next-intl/navigation'

export function useLocale() {
  const params = useParams()
  return params.locale as string
}

export const { Link, redirect, usePathname, useRouter } = createSharedPathnamesNavigation({
  locales: ['en', 'fi', 'sv'],
  localePrefix: 'always'
}) 
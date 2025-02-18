'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useTranslations } from 'next-intl'

interface FloatingNavProps {
  locale: string
}

export default function FloatingNav({ locale }: FloatingNavProps) {
  const t = useTranslations('Blog')
  const [isHidden, setIsHidden] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      // Hide nav only when at the very top of the page
      setIsHidden(window.scrollY < 50)
    }

    // Initial check
    handleScroll()

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <div className={`fixed bottom-8 right-8 z-50 transition-opacity duration-300 ${
      isHidden ? 'opacity-0 pointer-events-none' : 'opacity-100'
    }`}>
      <Link
        href={`/${locale}/blog`}
        className="flex items-center gap-2 px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-full shadow-lg transition-all hover:scale-105"
      >
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          className="h-5 w-5" 
          viewBox="0 0 20 20" 
          fill="currentColor"
        >
          <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
        </svg>
        {t('backToBlog')}
      </Link>
    </div>
  )
} 
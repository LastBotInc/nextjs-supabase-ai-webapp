'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useLocale } from 'next-intl'
import { useTranslations } from 'next-intl'

type BlogCardProps = {
  title: string;
  description: string;
  imageSrc: string;
  imageAlt: string;
  date?: string;
  href?: string;
  className?: string;
}

export function BlogCard({
  title,
  description,
  imageSrc,
  imageAlt,
  date = '',
  href = '#',
  className = ''
}: BlogCardProps) {
  const locale = useLocale()
  const t = useTranslations('Blog')
  const linkHref = href.startsWith('/') || href.startsWith('http') ? href : `/${locale}/${href}`
  
  return (
    <Link href={linkHref} className={`block group hover:shadow-lg transition-shadow duration-200 ${className}`}>
      <div className="relative aspect-[4/3] w-full mb-4">
        <Image 
          src={imageSrc} 
          alt={imageAlt}
          fill
          className="object-cover rounded-lg"
          sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
          quality={90}
        />
      </div>
      
      <h3 className="text-xl font-bold mb-2 text-piki group-hover:text-kupari transition-colors duration-200">{title}</h3>
      
      <p className="text-betoni text-sm mb-3 line-clamp-3">
        {description}
      </p>
      
      <div className="flex justify-between items-center">
        {date && (
          <p className="text-kupari text-sm font-medium">{date}</p>
        )}
        
        <span className="text-kupari text-sm font-medium group-hover:underline">
          {t('readMore')}
        </span>
      </div>
    </Link>
  )
} 
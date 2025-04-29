'use client'

import { BlogCard } from './BlogCard'
import { useTranslations } from 'next-intl'

type BlogPost = {
  id: string;
  title: string;
  description: string;
  imageSrc: string;
  imageAlt: string;
  date?: string;
  href: string;
}

type BlogCardListProps = {
  posts: BlogPost[];
  title?: string;
  className?: string;
}

export function BlogCardList({
  posts,
  title,
  className = ''
}: BlogCardListProps) {
  const t = useTranslations('Home')
  
  return (
    <section className={`py-12 ${className}`}>
      {title && (
        <h2 className="text-3xl font-bold mb-8">{title}</h2>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {posts.map((post) => (
          <BlogCard
            key={post.id}
            title={post.title}
            description={post.description}
            imageSrc={post.imageSrc}
            imageAlt={post.imageAlt}
            date={post.date}
            href={post.href}
          />
        ))}
      </div>
    </section>
  )
} 
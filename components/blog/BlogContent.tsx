'use client'

import React from 'react'

interface BlogContentProps {
  content: string
}

const BlogContent: React.FC<BlogContentProps> = ({ content }) => {
  return (
    <>
      <div 
        className="prose prose-lg max-w-none \
                   prose-headings:text-black \
                   prose-p:text-black \
                   prose-li:text-black \
                   prose-strong:text-black \
                   prose-a:text-blue-600 hover:prose-a:text-blue-800 \
                   prose-blockquote:border-l-blue-600 prose-blockquote:pl-4 prose-blockquote:italic prose-blockquote:text-gray-600"
        dangerouslySetInnerHTML={{ __html: content }} 
      />
    </>
  )
}

export default BlogContent 
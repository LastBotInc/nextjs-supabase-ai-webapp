'use client'

import React from 'react'

interface BlogContentProps {
  content: string
}

const BlogContent: React.FC<BlogContentProps> = ({ content }) => {
  return (
    <>
      <style jsx global>{`
        .prose h2 {
          background: linear-gradient(to right, var(--tw-gradient-from) 0%, var(--tw-gradient-via) 50%, var(--tw-gradient-to) 100%);
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
          --tw-gradient-from: #818cf8;
          --tw-gradient-via: #c084fc;
          --tw-gradient-to: #f472b6;
          margin-top: 1.8em;
          margin-bottom: 0.8em;
          font-size: 2.25rem;
          line-height: 1.2;
        }
        .prose h3 {
          background: linear-gradient(to right, var(--tw-gradient-from) 0%, var(--tw-gradient-to) 100%);
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
          --tw-gradient-from: #818cf8;
          --tw-gradient-to: #c084fc;
          margin-top: 1.5em;
          margin-bottom: 0.6em;
          font-size: 1.75rem;
          line-height: 1.3;
        }
        .prose p {
          margin-top: 1.2em;
          margin-bottom: 1.2em;
        }
      `}</style>
      <div 
        className="prose prose-lg max-w-none \n                   prose-p:text-gray-700 prose-p:leading-relaxed \n                   prose-a:text-blue-600 hover:prose-a:text-blue-800 \n                   prose-headings:text-gray-900 prose-headings:font-semibold \n                   prose-h2:text-3xl prose-h2:mb-4 prose-h2:mt-10 \n                   prose-h3:text-2xl prose-h3:mb-3 prose-h3:mt-8 \n                   prose-strong:text-gray-900 prose-strong:font-semibold \n                   prose-ul:list-disc prose-ul:pl-6 prose-ul:my-4 prose-li:my-1 \n                   prose-ol:list-decimal prose-ol:pl-6 prose-ol:my-4 \n                   prose-img:rounded-lg prose-img:shadow-md prose-img:my-8 \n                   prose-blockquote:border-l-blue-600 prose-blockquote:pl-4 prose-blockquote:italic prose-blockquote:text-gray-600 \n                   dark:prose-invert dark:prose-p:text-gray-300 dark:prose-headings:text-gray-100 \n                   dark:prose-strong:text-gray-100 dark:prose-a:text-blue-400 dark:hover:prose-a:text-blue-300 \n                   dark:prose-blockquote:border-l-blue-400 dark:prose-blockquote:text-gray-400"
        dangerouslySetInnerHTML={{ __html: content }} 
      />
    </>
  )
}

export default BlogContent 
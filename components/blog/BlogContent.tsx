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
      <div className="prose prose-lg max-w-none dark:prose-invert prose-headings:font-bold prose-headings:tracking-tight prose-h2:text-[2.25rem] prose-h2:leading-tight prose-h2:font-extrabold prose-h3:text-[1.75rem] prose-h3:leading-snug prose-h3:font-bold prose-p:leading-relaxed prose-p:text-gray-800 dark:prose-p:text-gray-200 prose-p:my-5 prose-a:text-purple-500 hover:prose-a:text-purple-400 prose-img:rounded-xl prose-img:shadow-lg prose-blockquote:border-l-purple-500 prose-blockquote:bg-gray-50 dark:prose-blockquote:bg-gray-800 prose-blockquote:py-2 prose-blockquote:px-6 prose-blockquote:rounded-r-lg" dangerouslySetInnerHTML={{ __html: content }} />
    </>
  )
}

export default BlogContent 
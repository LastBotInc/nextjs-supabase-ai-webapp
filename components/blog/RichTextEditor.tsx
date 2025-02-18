'use client'

import { useState } from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Link from '@tiptap/extension-link'
import Image from '@tiptap/extension-image'
import Placeholder from '@tiptap/extension-placeholder'
import { useTranslations } from 'next-intl'
import { useCallback, useEffect } from 'react'
import { MediaAsset } from '@/types/media'
import MediaSelector from './MediaSelector'
import { PhotoIcon } from '@heroicons/react/24/outline'

interface RichTextEditorProps {
  content: string
  onChange: (content: string) => void
  placeholder?: string
}

export default function RichTextEditor({ content, onChange, placeholder }: RichTextEditorProps) {
  const t = useTranslations('Blog.admin')
  const [isMediaSelectorOpen, setIsMediaSelectorOpen] = useState(false)

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [2],
          HTMLAttributes: {
            class: 'text-2xl font-bold mt-6 mb-4',
          },
        },
        bulletList: {
          HTMLAttributes: {
            class: 'list-disc pl-6 space-y-2',
          },
        },
        orderedList: {
          HTMLAttributes: {
            class: 'list-decimal pl-6 space-y-2',
          },
        },
        listItem: {
          HTMLAttributes: {
            class: 'mb-1',
          },
        },
        code: {
          HTMLAttributes: {
            class: 'font-mono text-sm text-black ',
          },
        },
        codeBlock: {
          HTMLAttributes: {
            class: 'block font-mono text-sm my-4 text-black whitespace-pre-wrap break-words leading-relaxed overflow-x-auto',
          },
        },
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-200',
        },
      }),
      Image.configure({
        HTMLAttributes: {
          class: 'max-w-full h-auto rounded-lg',
        },
        inline: false,
      }),
      Placeholder.configure({
        placeholder: placeholder || t('fields.content'),
      }),
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML())
    },
  })

  const setContent = useCallback((newContent: string) => {
    if (editor) {
      editor.commands.setContent(newContent)
    }
  }, [editor])

  useEffect(() => {
    if (content !== editor?.getHTML()) {
      setContent(content)
    }
  }, [content, editor, setContent])

  const handleMediaSelect = (asset: MediaAsset) => {
    if (editor) {
      editor.chain().focus().insertContent({
        type: 'image',
        attrs: {
          src: asset.originalUrl,
          alt: asset.altText || asset.title || '',
          title: asset.title || ''
        }
      }).run()
    }
    setIsMediaSelectorOpen(false)
  }

  if (!editor) {
    return null
  }

  const MenuBar = () => {
    return (
      <div className="border-b border-gray-200 dark:border-gray-700 mb-4 pb-2 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleMark('bold').run()}
          className={`p-2 rounded-md ${
            editor.isActive('bold') ? 'bg-gray-200 dark:bg-gray-600' : ''
          }`}
          title={t('editor.bold')}
        >
          <span className="sr-only">{t('editor.bold')}</span>
          <strong>B</strong>
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleMark('italic').run()}
          className={`p-2 rounded-md ${
            editor.isActive('italic') ? 'bg-gray-200 dark:bg-gray-600' : ''
          }`}
          title={t('editor.italic')}
        >
          <span className="sr-only">{t('editor.italic')}</span>
          <em>I</em>
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleMark('strike').run()}
          className={`p-2 rounded-md ${
            editor.isActive('strike') ? 'bg-gray-200 dark:bg-gray-600' : ''
          }`}
          title={t('editor.strike')}
        >
          <span className="sr-only">{t('editor.strike')}</span>
          <s>S</s>
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleMark('code').run()}
          className={`p-2 rounded-md ${
            editor.isActive('code') ? 'bg-gray-200 dark:bg-gray-600' : ''
          }`}
          title={t('editor.code')}
        >
          <span className="sr-only">{t('editor.code')}</span>
          <code>&lt;/&gt;</code>
        </button>
        <button
          type="button"
          onClick={() => editor.commands.toggleHeading({ level: 2 })}
          className={`p-2 rounded-md ${
            editor.isActive('heading', { level: 2 }) ? 'bg-gray-200 dark:bg-gray-600' : ''
          }`}
          title={t('editor.heading')}
        >
          H2
        </button>
        <button
          type="button"
          onClick={() => editor.commands.toggleBulletList()}
          className={`p-2 rounded-md ${
            editor.isActive('bulletList') ? 'bg-gray-200 dark:bg-gray-600' : ''
          }`}
          title={t('editor.bulletList')}
        >
          • List
        </button>
        <button
          type="button"
          onClick={() => editor.commands.toggleOrderedList()}
          className={`p-2 rounded-md ${
            editor.isActive('orderedList') ? 'bg-gray-200 dark:bg-gray-600' : ''
          }`}
          title={t('editor.orderedList')}
        >
          1. List
        </button>
        <button
          type="button"
          onClick={() => editor.commands.toggleBlockquote()}
          className={`p-2 rounded-md ${
            editor.isActive('blockquote') ? 'bg-gray-200 dark:bg-gray-600' : ''
          }`}
          title={t('editor.quote')}
        >
          &ldquo;Quote&rdquo;
        </button>
        <button
          type="button"
          onClick={() => setIsMediaSelectorOpen(true)}
          className="p-2 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600"
          title={t('editor.image')}
        >
          <span className="sr-only">{t('editor.image')}</span>
          <PhotoIcon className="h-5 w-5" />
        </button>
      </div>
    )
  }

  return (
    <div className="prose dark:prose-invert max-w-none border rounded-lg p-4 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
      <MenuBar />
      <EditorContent
        editor={editor}
        className="min-h-[200px] focus:outline-none mt-4 prose-sm sm:prose lg:prose-lg xl:prose-xl [&_h2]:text-2xl [&_h2]:font-bold [&_h2]:mb-4 [&_h2]:mt-6 [&_ul]:list-disc [&_ul]:pl-6 [&_ol]:list-decimal [&_ol]:pl-6 [&_li]:mb-2 [&_blockquote]:border-l-4 [&_blockquote]:border-gray-300 [&_blockquote:dark]:border-gray-600 [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:my-4 [&_pre]:bg-gray-100 [&_pre:dark]:bg-gray-700 [&_pre]:rounded-lg [&_pre]:p-4 [&_pre]:my-4 [&_code]:bg-gray-100 [&_code:dark]:bg-gray-700 [&_code]:rounded [&_code]:px-1 [&_code]:py-0.5 [&_code]:font-mono [&_code]:text-sm"
        data-testid="rich-text-editor"
      />
      <MediaSelector
        isOpen={isMediaSelectorOpen}
        onClose={() => setIsMediaSelectorOpen(false)}
        onSelect={handleMediaSelect}
      />
    </div>
  )
}

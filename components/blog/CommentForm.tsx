'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { createClient } from '@/utils/supabase/client'
import { useAuth } from '@/components/auth/AuthProvider'

interface CommentFormProps {
  postId: string
  onCommentAdded: () => void
}

export default function CommentForm({ postId, onCommentAdded }: CommentFormProps) {
  const t = useTranslations('Blog')
  const { user } = useAuth()
  const [content, setContent] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !content.trim()) return

    setSubmitting(true)
    const { error } = await supabase
      .from('comments')
      .insert({
        content: content.trim(),
        post_id: postId,
        author_id: user.id
      })

    setSubmitting(false)
    if (error) {
      console.error('Error submitting comment:', error)
      return
    }

    setContent('')
    onCommentAdded()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="comment" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          {t('yourComment')}
        </label>
        <textarea
          id="comment"
          rows={3}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-900 dark:border-gray-700 dark:text-white p-4"
          placeholder={t('commentPlaceholder')}
          required
        />
      </div>
      <button
        type="submit"
        disabled={submitting || !content.trim()}
        className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 dark:bg-blue-500 dark:hover:bg-blue-600"
      >
        {submitting ? t('submittingComment') : t('submitComment')}
      </button>
    </form>
  )
} 
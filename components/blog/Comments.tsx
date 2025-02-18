'use client'

import { useEffect, useState, useCallback } from 'react'
import { useTranslations } from 'next-intl'
import { createClient } from '@/utils/supabase/client'
import { useAuth } from '@/components/auth/AuthProvider'
import CommentForm from './CommentForm'
import Image from 'next/image'
import Link from 'next/link'

type Comment = {
  id: string
  created_at: string
  content: string
  post_id: string
  author_id: string
  author_username: string
  author_avatar_url: string | null
}

interface CommentsProps {
  postId: string
}

export default function Comments({ postId }: CommentsProps) {
  const t = useTranslations('Blog')
  const { user } = useAuth()
  const [comments, setComments] = useState<Comment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  const fetchComments = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('comment_details')
        .select('*')
        .eq('post_id', postId)
        .order('created_at', { ascending: true })

      if (error) {
        console.error('Error fetching comments:', error.message)
        setError(t('fetchCommentsError'))
        return
      }

      setComments(data || [])
      setError(null)
    } catch (err) {
      console.error('Error in fetchComments:', err)
      setError(t('fetchCommentsError'))
    } finally {
      setLoading(false)
    }
  }, [supabase, postId, t])

  useEffect(() => {
    fetchComments()
  }, [fetchComments])

  const handleCommentAdded = () => {
    fetchComments()
  }

  const handleDeleteComment = async (commentId: string) => {
    if (!user) return

    try {
      const { error } = await supabase
        .from('comments')
        .delete()
        .eq('id', commentId)
        .eq('author_id', user.id) // Extra safety check

      if (error) {
        console.error('Error deleting comment:', error.message)
        setError(t('deleteCommentError'))
        return
      }

      fetchComments()
    } catch (err) {
      console.error('Error in handleDeleteComment:', err)
      setError(t('deleteCommentError'))
    }
  }

  if (loading) {
    return <div className="animate-pulse">
      <div className="h-20 bg-gray-200 dark:bg-gray-700 rounded-lg mb-4"></div>
      <div className="h-20 bg-gray-200 dark:bg-gray-700 rounded-lg mb-4"></div>
    </div>
  }

  return (
    <div className="mt-8 space-y-8">
      <h2 className="text-2xl font-bold">{t('comments')}</h2>
      
      {error && (
        <div className="bg-red-50 dark:bg-red-900/50 p-4 rounded-lg">
          <p className="text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}

      {user ? (
        <CommentForm postId={postId} onCommentAdded={handleCommentAdded} />
      ) : (
        <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
          <p>
            {t('loginToComment')}{' '}
            <Link href={`/en/auth/sign-in`} className="text-blue-600 hover:underline">
              {t('signIn')}
            </Link>
          </p>
        </div>
      )}

      <div className="space-y-6">
        {comments.length === 0 ? (
          <p className="text-gray-600 dark:text-gray-400">{t('noComments')}</p>
        ) : (
          comments.map((comment) => (
            <div 
              key={comment.id} 
              className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow"
            >
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                  {comment.author_avatar_url ? (
                    <Image
                      src={comment.author_avatar_url}
                      alt={comment.author_username}
                      width={40}
                      height={40}
                      className="rounded-full"
                    />
                  ) : (
                    <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full" />
                  )}
                </div>
                <div className="flex-grow">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {comment.author_username}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {new Date(comment.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    {user?.id === comment.author_id && (
                      <button
                        onClick={() => handleDeleteComment(comment.id)}
                        className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                      >
                        {t('deleteComment')}
                      </button>
                    )}
                  </div>
                  <div className="mt-2 text-gray-700 dark:text-gray-300">
                    {comment.content}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
} 
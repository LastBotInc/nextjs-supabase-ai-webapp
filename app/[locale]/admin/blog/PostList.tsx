'use client'

import { useState } from 'react'
import PostEditor from '@/components/blog/PostEditor'
import { Database } from '@/types/database'
import { useTranslations } from 'next-intl'
import { createClient } from '@/utils/supabase/client'
import { toast } from 'react-hot-toast'

type Post = Database['public']['Tables']['posts']['Row']

interface FormData {
  title: string
  content: string
  excerpt: string
  meta_description: string
  tags: string[]
  featured_image: string
  slug: string
  prompt: string
  image_prompt?: string
  locale: string
  published: boolean
  target_languages: string[]
}

interface PostListProps {
  initialPosts: Post[]
}

export default function PostList({ initialPosts }: PostListProps) {
  const t = useTranslations('Blog.admin')
  const [posts, setPosts] = useState<Post[]>(initialPosts)
  const [selectedPost, setSelectedPost] = useState<Post | undefined>()
  const [isEditing, setIsEditing] = useState(false)
  const supabase = createClient()

  const handleNewPost = () => {
    setSelectedPost(undefined)
    setIsEditing(true)
  }

  const handleEdit = (post: Post) => {
    setSelectedPost(post)
    setIsEditing(true)
  }

  const handleCancel = () => {
    setSelectedPost(undefined)
    setIsEditing(false)
  }

  const handleSave = (formData: FormData) => {
    // Convert FormData to Post type for state update
    const post = selectedPost || {
      id: '', // Will be set by the server
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      author_id: '', // Will be set by the server
      embedding: null,
      ...formData
    }
    
    setPosts(prev => {
      const index = prev.findIndex(p => p.id === post.id)
      if (index >= 0) {
        return [...prev.slice(0, index), post, ...prev.slice(index + 1)]
      }
      return [post, ...prev]
    })
        setIsEditing(false)
  }

  const handlePublish = async (post: Post) => {
    try {
      const { error } = await supabase
        .from('posts')
        .update({ published: !post.published })
        .eq('id', post.id)
        .select()
        .single()

      if (error) throw error

      setPosts(prev => prev.map(p => 
        p.id === post.id ? { ...p, published: !p.published } : p
      ))

      toast.success(post.published ? t('unpublishSuccess') : t('publishSuccess'))

      // If this is an English post being published, trigger translations
      if (!post.published && post.locale === 'en') {
        try {
          const response = await fetch('/api/blog/translate', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ postId: post.id })
          })

          if (!response.ok) {
            throw new Error('Translation failed')
          }

          const { translations } = await response.json()
          console.log('Translations created:', translations)
          toast.success(t('translationSuccess'))
        } catch (translationError) {
          console.error('Translation error:', translationError)
          toast.error(t('translationError'))
        }
      }
    } catch (error) {
      console.error('Error toggling publish status:', error)
      toast.error(post.published ? t('unpublishError') : t('publishError'))
    }
  }

  if (isEditing) {
    return (
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <PostEditor
            post={selectedPost}
            onSave={handleSave}
            onCancel={handleCancel}
          />
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <div className="px-4 py-6 sm:px-0">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            {t('title')}
          </h1>
          <button
            onClick={handleNewPost}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            {t('newPost')}
          </button>
        </div>

        <div className="bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-md">
          <ul className="divide-y divide-gray-200 dark:divide-gray-700">
            {posts.map((post) => (
              <li key={post.id}>
                <div className="px-4 py-4 sm:px-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2">
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white truncate">
                          {post.title}
                        </h3>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          post.published 
                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                            : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                        }`}>
                          {post.published ? 'Published' : 'Draft'}
                        </span>
                      </div>
                      <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                        {new Date(post.created_at).toLocaleDateString()} - {post.locale ? post.locale.toUpperCase() : 'EN'}
                      </p>
                    </div>
                    <div className="flex space-x-4">
                      <button
                        onClick={() => handlePublish(post)}
                        className={`inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md ${
                          post.published
                            ? 'text-yellow-700 bg-yellow-100 hover:bg-yellow-200 dark:text-yellow-200 dark:bg-yellow-900 dark:hover:bg-yellow-800'
                            : 'text-green-700 bg-green-100 hover:bg-green-200 dark:text-green-200 dark:bg-green-900 dark:hover:bg-green-800'
                        } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
                      >
                        {post.published ? t('unpublishPost') : t('publishPost')}
                      </button>
                      <button
                        onClick={() => handleEdit(post)}
                        className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200 dark:text-blue-200 dark:bg-blue-900 dark:hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        {t('editPost')}
                      </button>
                    </div>
                  </div>
                  <div className="mt-2">
                    <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2">
                      {post.excerpt || (post.content && post.content.substring(0, 150) + '...') || ''}
                    </p>
                  </div>
                  <div className="mt-2">
                    {post.tags?.map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200 mr-2"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}
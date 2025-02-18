'use client'

import { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'
import { createClient } from '@/utils/supabase/client'
import { Database } from '@/types/database'
import { useAuth } from '@/components/auth/AuthProvider'
import { useRouter } from 'next/navigation'
import { useParams } from 'next/navigation'
import { LoadingSpinner } from '@/components/ui/loading-spinner'

type Post = Database['public']['Tables']['posts']['Row']

const PostList = dynamic(() => import('./PostList'), {
  ssr: false,
})

export default function AdminBlogPage() {
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const { session, isAdmin, loading: authLoading } = useAuth()
  const router = useRouter()
  const params = useParams()
  const locale = params.locale as string
  const supabase = createClient()

  useEffect(() => {
    // Only fetch posts if we're authenticated and admin
    if (!authLoading && session?.user && isAdmin) {
      const fetchPosts = async () => {
        const { data } = await supabase
          .from('posts')
          .select('*')
          .order('created_at', { ascending: false })

        setPosts(data || [])
        setLoading(false)
      }

      fetchPosts()
    }
  }, [supabase, session, isAdmin, authLoading])

  // Redirect if not authenticated or not admin
  useEffect(() => {
    if (!authLoading && (!session?.user || !isAdmin)) {
      router.replace(`/${locale}/auth/sign-in?next=${encodeURIComponent(`/${locale}/admin/blog`)}`)
    }
  }, [session, isAdmin, authLoading, router, locale])

  // Show loading while checking auth or fetching posts
  if (authLoading || loading) {
    return (
      <div className="min-h-screen">
        <LoadingSpinner size="lg" text="Loading..." className="mt-8" />
      </div>
    )
  }

  // Don't render anything while redirecting
  if (!session?.user || !isAdmin) {
    return null
  }

  return <PostList initialPosts={posts} />
}

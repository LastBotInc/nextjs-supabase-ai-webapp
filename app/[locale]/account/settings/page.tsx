'use client'

import { useTranslations } from 'next-intl'
import { useAuth } from '@/components/auth/AuthProvider'
import { Card } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { ThemeToggle } from '@/app/components/ThemeToggle'
import LocaleSwitcher from '@/app/components/LocaleSwitcher'
import { useState, useEffect } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useRouter } from 'next/navigation'
import { use } from 'react'

export const dynamic = 'force-dynamic'

interface Props {
  params: Promise<{
    locale: string
  }>
}

export default function SettingsPage({ params }: Props) {
  const { locale } = use(params)
  const router = useRouter()
  const t = useTranslations('Account.settings')
  const { session, loading } = useAuth()
  const [name, setName] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [isClient, setIsClient] = useState(false)
  const supabase = createClientComponentClient()

  // Set isClient to true when component mounts
  useEffect(() => {
    setIsClient(true)
  }, [])

  // Initialize name from session when it's available
  useEffect(() => {
    if (session?.user?.user_metadata?.full_name) {
      setName(session.user.user_metadata.full_name)
    }
  }, [session])

  // Redirect if not authenticated
  useEffect(() => {
    if (!loading && !session) {
      router.replace(`/${locale}/auth/sign-in?next=${encodeURIComponent(`/${locale}/account/settings`)}`)
    }
  }, [session, loading, router, locale])

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    if (isSaving || !session?.user) return
    
    try {
      setIsSaving(true)

      // Update user metadata first
      const { error: userError } = await supabase.auth.updateUser({
        data: { full_name: name }
      })

      if (userError) {
        console.error('Error updating user:', userError)
        setIsSaving(false)
        return
      }
      
      // Then update profiles table
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ full_name: name })
        .eq('id', session.user.id)

      if (profileError) {
        console.error('Error updating profile:', profileError)
        setIsSaving(false)
        return
      }

      // Success - keep isSaving true for a moment to show success state
      setTimeout(() => setIsSaving(false), 1000)
    } catch (error) {
      console.error('Error:', error)
      setIsSaving(false)
    }
  }

  // Show loading state while checking auth or before client-side hydration
  if (loading || !isClient) {
    return (
      <div className="container mx-auto p-4">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="space-y-6">
            <Card className="p-6">
              <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
              <div className="space-y-4">
                <div className="h-10 bg-gray-200 rounded"></div>
                <div className="h-10 bg-gray-200 rounded w-1/4"></div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    )
  }

  // Don't render anything if not authenticated
  if (!session) {
    return null
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">{t('title')}</h1>
      
      <div className="space-y-6">
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">{t('profile')}</h2>
          <form onSubmit={handleUpdateProfile} className="space-y-4">
            <div>
              <Label htmlFor="name">{t('fullName')}</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={t('fullNamePlaceholder')}
              />
            </div>
            <Button type="submit" loading={isSaving}>
              {isSaving ? t('saving') : t('save')}
            </Button>
          </form>
        </Card>

        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">{t('preferences')}</h2>
          <div className="space-y-4">
            <div>
              <Label>{t('theme')}</Label>
              <ThemeToggle />
            </div>
            <div>
              <Label>{t('language')}</Label>
              <LocaleSwitcher />
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
} 
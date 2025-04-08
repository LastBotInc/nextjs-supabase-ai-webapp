'use client'

import { useTranslations } from 'next-intl'
import { useAuth } from '@/components/auth/AuthProvider'
import { Card } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useState, useEffect, useMemo } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useParams, useRouter } from 'next/navigation'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { Database } from '@/types/database'

export const dynamic = 'force-dynamic'

export default function SecurityPage() {
  const params = useParams()
  const locale = params.locale as string
  const t = useTranslations('Account.security')
  const { session, loading: authLoading } = useAuth()
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isUpdating, setIsUpdating] = useState(false)
  const [error, setError] = useState('')
  
  // Create Supabase client with useMemo
  const supabase = useMemo(() => createClientComponentClient<Database>(), [])

  // Handle authentication check in useEffect
  useEffect(() => {
    if (!authLoading && !session?.user) {
      router.replace(`/${locale}/auth/sign-in?next=${encodeURIComponent(`/${locale}/account/security`)}`)
    }
  }, [session, authLoading, router, locale])

  // Show loading while checking auth
  if (authLoading) {
    return (
      <div className="min-h-screen">
        <LoadingSpinner size="lg" text={t('loading')} className="mt-8" />
      </div>
    )
  }

  // Don't render anything while redirecting
  if (!session?.user) {
    return null
  }

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    if (isUpdating) return
    setError('')

    if (password !== confirmPassword) {
      setError(t('passwordMismatch'))
      return
    }

    if (password.length < 6) {
      setError(t('passwordTooShort'))
      return
    }

    try {
      setIsUpdating(true)
      const { error: updateError } = await supabase.auth.updateUser({
        password: password
      })

      if (updateError) throw updateError

      // Clear form after successful update
      setPassword('')
      setConfirmPassword('')
    } catch (error) {
      console.error('Error updating password:', error)
      setError(t('updateError'))
    } finally {
      setIsUpdating(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">
          {t('title')}
        </h3>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          {t('description')}
        </p>
      </div>

      <form onSubmit={handleUpdatePassword}>
        <Card className="p-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="password">{t('newPassword')}</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="confirmPassword">{t('confirmPassword')}</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="mt-1"
              />
            </div>
            {error && (
              <p className="text-sm text-red-600 dark:text-red-500">
                {error}
              </p>
            )}
            <Button type="submit" disabled={isUpdating} variant="default">
              {isUpdating ? t('updating') : t('updatePassword')}
            </Button>
          </div>
        </Card>
      </form>

      <div>
        <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
          {t('sessions')}
        </h4>
        <Card className="p-6">
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
            {t('currentSession')}
          </p>
          <div className="space-y-2">
            <p className="text-sm">
              <span className="font-medium">{t('lastSignIn')}:</span>{' '}
              {new Date(session?.user?.last_sign_in_at || '').toLocaleString()}
            </p>
            <p className="text-sm">
              <span className="font-medium">{t('browser')}:</span>{' '}
              {session?.user?.user_metadata?.browser || t('unknown')}
            </p>
          </div>
        </Card>
      </div>
    </div>
  )
} 
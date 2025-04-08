'use client'

import { useEffect, useState } from 'react'
import { useTranslations } from 'next-intl'
import { notFound } from 'next/navigation'
import { FormProvider, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useToast } from '@/components/ui/use-toast'
import { Database } from '@/types/database'
import { landingPageSchema } from './schema'
import type { z } from 'zod'
import LandingPageForm from './LandingPageForm'
import SeoSettings from './SeoSettings'
import CustomCode from './CustomCode'
import CtaSettings from './CtaSettings'
import React from 'react'
import { useRouter } from 'next/navigation'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useAuth } from '@/components/auth/AuthProvider'

type LandingPage = Database['public']['Tables']['landing_pages']['Row']
type FormData = z.infer<typeof landingPageSchema>

interface Props {
  params: Promise<{
    locale: string
    id: string
  }>
}

export default function LandingPageEditor({ params: paramsPromise }: Props) {
  const params = React.use(paramsPromise)
  const t = useTranslations('LandingPages')
  const { toast } = useToast()
  const [page, setPage] = useState<LandingPage | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const { session, isAuthenticated, loading: authLoading } = useAuth()
  const supabase = createClientComponentClient<Database>()

  const methods = useForm<FormData>({
    resolver: zodResolver(landingPageSchema),
    defaultValues: {
      title: '',
      slug: '',
      content: '',
      excerpt: '',
      featured_image: '',
      tags: [],
      seo_data: {
        meta_title: '',
        meta_description: '',
        keywords: [],
        og_image: ''
      },
      custom_head: '',
      custom_css: '',
      custom_js: '',
      published: false,
      locale: params.locale,
      cta_headline: '',
      cta_description: '',
      cta_button_text: '',
      cta_button_link: '',
      cta_secondary_text: '',
    },
  })

  useEffect(() => {
    async function fetchPage() {
      if (params.id === 'new') {
        setPage(null)
        setIsLoading(false)
        return
      }

      if (!isAuthenticated) {
        router.push(`/${params.locale}/auth/signin?next=${encodeURIComponent(window.location.pathname)}`)
        return
      }

      try {
        const response = await fetch(`/api/landing-pages/${params.id}?locale=${params.locale}`, {
          headers: session?.access_token ? {
            'Authorization': `Bearer ${session.access_token}`
          } : {}
        })
        if (!response.ok) {
          throw new Error('Failed to fetch page')
        }
        const data = await response.json()
        setPage(data)
        methods.reset(data)
      } catch (error) {
        console.error('Error fetching page:', error)
        notFound()
      } finally {
        setIsLoading(false)
      }
    }

    if (!authLoading) {
      fetchPage()
    }
  }, [params.id, params.locale, methods, isAuthenticated, session, authLoading, router])

  const onSubmit = async (data: FormData) => {
    if (!isAuthenticated || !session?.access_token) {
      toast({
        title: 'Not authenticated',
        description: 'Please sign in to continue',
        variant: 'destructive',
      })
      router.push(`/${params.locale}/auth/signin?next=${encodeURIComponent(window.location.pathname)}`)
      return
    }

    const isUpdating = params.id !== 'new';
    const url = isUpdating ? `/api/landing-pages` : '/api/landing-pages'; // Keep URL same, method changes
    const method = isUpdating ? 'PATCH' : 'POST';

    let payload: any = {
        ...data,
        locale: params.locale,
        updated_by: session.user.id,
    };

    if (isUpdating) {
        payload.id = params.id; // Include ID for PATCH
    } else {
        payload.created_by = session.user.id; // Include created_by for POST
    }

    try {
      const response = await fetch(url, { // Use dynamic URL and Method
        method: method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify(payload)
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || `Failed to ${isUpdating ? 'update' : 'save'} landing page`)
      }

      const savedPage = await response.json()
      
      toast({
        title: t(isUpdating ? 'success.updated' : 'success.created'),
        variant: 'default',
      })

      // Redirect to index page after save/update
      router.push(`/${params.locale}/admin/landing-pages`)
    } catch (err) {
      console.error('Error saving landing page:', err)
      toast({
        title: err instanceof Error ? err.message : 'Failed to save landing page',
        variant: 'destructive',
      })
    }
  }

  if (authLoading || isLoading) {
    return <div className="p-8">Loading...</div>
  }

  if (!isAuthenticated) {
    return null // Let the useEffect handle redirect
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-semibold text-gray-900 dark:text-white">
              {params.id === 'new' ? t('createPage') : t('editPage')}
            </h1>
            <p className="mt-2 text-sm text-gray-700 dark:text-gray-300">
              {params.id === 'new' ? t('createPageDescription') : t('editPageDescription')}
            </p>
          </div>
          {page?.id && (
            <div className="flex gap-4">
              <Button
                variant="outline"
                onClick={() => window.open(`/preview/${page.id}`, '_blank')}
              >
                {t('preview')}
              </Button>
              {page.published ? (
                <Button
                  variant="destructive"
                  onClick={async () => {
                    if (!isAuthenticated || !session?.access_token) {
                      toast({
                        title: 'Not authenticated',
                        description: 'Please sign in to continue',
                        variant: 'destructive',
                      })
                      router.push(`/${params.locale}/auth/signin?next=${encodeURIComponent(window.location.pathname)}`)
                      return
                    }

                    const response = await fetch(`/api/landing-pages/${page.id}/unpublish`, {
                      method: 'POST',
                      headers: {
                        'Authorization': `Bearer ${session.access_token}`
                      }
                    })
                    if (response.ok) {
                      window.location.reload()
                    } else {
                      const error = await response.json()
                      toast({
                        title: error.error || 'Failed to unpublish',
                        variant: 'destructive',
                      })
                    }
                  }}
                >
                  {t('unpublish')}
                </Button>
              ) : (
                <Button
                  variant="default"
                  onClick={async () => {
                    if (!isAuthenticated || !session?.access_token) {
                      toast({
                        title: 'Not authenticated',
                        description: 'Please sign in to continue',
                        variant: 'destructive',
                      })
                      router.push(`/${params.locale}/auth/signin?next=${encodeURIComponent(window.location.pathname)}`)
                      return
                    }

                    const response = await fetch(`/api/landing-pages/${page.id}/publish`, {
                      method: 'POST',
                      headers: {
                        'Authorization': `Bearer ${session.access_token}`
                      }
                    })
                    if (response.ok) {
                      window.location.reload()
                    } else {
                      const error = await response.json()
                      toast({
                        title: error.error || 'Failed to publish',
                        variant: 'destructive',
                      })
                    }
                  }}
                >
                  {t('publish')}
                </Button>
              )}
            </div>
          )}
        </div>
      </div>

      <FormProvider {...methods}>
        <form onSubmit={methods.handleSubmit(onSubmit)} className="space-y-8">
          <Tabs defaultValue="content" className="w-full">
            <TabsList>
              <TabsTrigger value="content">{t('tabs.content')}</TabsTrigger>
              <TabsTrigger value="seo">{t('tabs.seo')}</TabsTrigger>
              <TabsTrigger value="cta">{t('tabs.cta', { defaultValue: 'CTA' })}</TabsTrigger>
              <TabsTrigger value="code">{t('tabs.code')}</TabsTrigger>
            </TabsList>
            <TabsContent value="content">
              <Card className="p-6">
                <LandingPageForm page={page} locale={params.locale} />
              </Card>
            </TabsContent>
            <TabsContent value="seo">
              <Card className="p-6">
                <SeoSettings page={page} locale={params.locale} />
              </Card>
            </TabsContent>
            <TabsContent value="cta">
              <Card className="p-6">
                <CtaSettings />
              </Card>
            </TabsContent>
            <TabsContent value="code">
              <Card className="p-6">
                <CustomCode page={page} locale={params.locale} />
              </Card>
            </TabsContent>
          </Tabs>

          <div className="flex justify-end space-x-4 mt-8">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => router.push(`/${params.locale}/admin/landing-pages`)}
            >
              {t('form.cancel')}
            </Button>
            <Button type="submit" disabled={methods.formState.isSubmitting || isLoading}>
              {methods.formState.isSubmitting
                ? t('form.generating')
                : (page ? t('form.save') : t('form.createPage'))}
            </Button>
          </div>
        </form>
      </FormProvider>
    </div>
  )
} 
'use client'

import { useTranslations } from 'next-intl'
import { useState, useEffect } from 'react'
import { useFormContext } from 'react-hook-form'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { useToast } from '@/components/ui/use-toast'
import { Database } from '@/types/database'
import { landingPageSchema } from './schema'
import type { z } from 'zod'
import { createClient } from '@/utils/supabase/client'
import dynamic from 'next/dynamic'
import { useAuth } from '@/components/auth/AuthProvider'
import { slugify } from '@/utils/string'
import { Switch } from '@/components/ui/switch'

// Dynamically import the editor to avoid SSR issues
const Editor = dynamic(() => import('@/components/editor').then(mod => mod.Editor), { 
  ssr: false,
  loading: () => (
    <div className="h-[600px] flex items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-white" />
    </div>
  )
})

type LandingPage = Database['public']['Tables']['landing_pages']['Row']
type FormData = z.infer<typeof landingPageSchema>

interface Props {
  page: LandingPage | null
  locale: string
}

export default function LandingPageForm({ page, locale }: Props) {
  const t = useTranslations('LandingPages')
  const { toast } = useToast()
  const { register, formState: { errors }, watch, setValue, control } = useFormContext<FormData>()
  const [generating, setGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [prompt, setPrompt] = useState('')
  const [imageStyle, setImageStyle] = useState('digital_illustration')
  const { session, isAuthenticated } = useAuth()
  const supabase = createClient()

  const styleOptions = [
    { value: 'digital_illustration', label: 'Digital Illustration' },
    { value: 'realistic_image', label: 'Realistic' },
    { value: 'pixel_art', label: 'Pixel Art' },
    { value: 'hand_drawn', label: 'Hand Drawn' },
    { value: '2d_art_poster', label: '2D Art Poster' },
  ]

  // Add slug generation when title changes
  useEffect(() => {
    const title = watch('title')
    if (title && !watch('slug')) {
      setValue('slug', slugify(title))
    }
  }, [watch('title'), setValue])

  const generateContent = async () => {
    try {
      setGenerating(true)
      setError('')

      if (!isAuthenticated || !session?.access_token) {
        throw new Error('Not authenticated')
      }

      const response = await fetch('/api/landing-pages/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({
          prompt,
          locale: locale
        })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to generate content')
      }

      const data = await response.json()
      
      // Update form fields with generated content
      setValue('title', data.title)
      setValue('content', data.content)
      setValue('excerpt', data.excerpt)
      setValue('seo_data.meta_title', data.meta_title)
      setValue('seo_data.meta_description', data.meta_description)
      setValue('seo_data.keywords', data.keywords || [])
      setValue('slug', data.slug)

      // If image prompt was generated, trigger image generation
      if (data.image_prompt) {
        generateImage(data.image_prompt)
      }

      toast({
        title: t('success.generated'),
        description: t('success.generatedDescription'),
      })
    } catch (err) {
      console.error('Error generating content:', err)
      setError(err instanceof Error ? err.message : 'Failed to generate content')
      toast({
        title: t('error.generateFailed'),
        description: err instanceof Error ? err.message : 'Failed to generate content',
        variant: 'destructive',
      })
    } finally {
      setGenerating(false)
    }
  }

  const generateImage = async (imagePrompt: string) => {
    if (!watch('title')) {
      toast({
        title: t('error.titleRequired'),
        description: t('error.titleRequiredForImage'),
        variant: 'destructive',
      })
      return
    }
    
    setGenerating(true)
    setError(null)
    
    try {
      if (!isAuthenticated || !session?.access_token) {
        throw new Error('Not authenticated')
      }

      const slug = watch('slug') || slugify(watch('title'))
      const filename = `${slug}-${Date.now()}.png`

      const response = await fetch('/api/media/generate', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({
          prompt: imagePrompt,
          style: imageStyle,
          width: 1200,
          height: 630,
          folder: 'landing-pages',
          filename
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to generate image')
      }
      
      const { data } = await response.json()
      if (!data) {
        throw new Error('No image data returned')
      }

      // Handle both array and single URL responses
      const imageUrl = Array.isArray(data) ? data[0] : data
      if (!imageUrl) {
        throw new Error('No image URL returned')
      }

      setValue('featured_image', imageUrl)
      toast({
        title: t('success.imageGenerated'),
        description: t('success.imageGeneratedDescription'),
      })
    } catch (err) {
      console.error('Error generating image:', err)
      setError(err instanceof Error ? err.message : 'Failed to generate image')
      toast({
        title: t('error.generateImageFailed'),
        description: err instanceof Error ? err.message : 'Failed to generate image',
        variant: 'destructive',
      })
    } finally {
      setGenerating(false)
    }
  }

  return (
    <div className="space-y-8 p-6">
      {error && (
        <div className="bg-red-50 dark:bg-red-900/50 p-4 rounded-md">
          <p className="text-red-800 dark:text-red-200">{error}</p>
        </div>
      )}

      {!page && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <label htmlFor="prompt" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              {t('form.prompt')}
            </label>
            <Button
              type="button"
              variant="secondary"
              onClick={generateContent}
              disabled={!prompt || generating}
            >
              {generating ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  {t('form.generating')}
                </>
              ) : (
                t('generateContent')
              )}
            </Button>
          </div>
          <textarea
            id="prompt"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            rows={3}
            placeholder={t('form.promptPlaceholder')}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-900 dark:border-gray-700 dark:text-white px-3 py-1.5"
          />
        </div>
      )}

      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="title">{t('form.title')}</Label>
            <Input
              id="title"
              {...register('title')}
              error={errors.title?.message}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="slug">{t('form.slug')}</Label>
            <Input
              id="slug"
              {...register('slug')}
              error={errors.slug?.message}
            />
          </div>
        </div>

        <div className="flex items-center space-x-2 pt-4">
          <Switch 
            id="published"
            checked={watch('published')}
            onCheckedChange={(checked) => setValue('published', checked)}
          />
          <Label htmlFor="published" className="cursor-pointer">
            {t('form.published')}
          </Label>
        </div>

        <div className="space-y-2">
          <Label htmlFor="content">{t('form.content')}</Label>
          <div className="min-h-[600px] border rounded-md overflow-hidden">
            <Editor
              content={watch('content') || ''}
              onChange={(value: string) => setValue('content', value)}
              error={errors.content?.message}
              className="h-full w-full"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="excerpt">{t('form.excerpt')}</Label>
          <Textarea
            id="excerpt"
            {...register('excerpt')}
            error={errors.excerpt?.message}
          />
        </div>

        <div className="space-y-2">
          <Label>{t('form.featuredImage')}</Label>
          <div className="flex space-x-2">
            <Input
              type="url"
              value={watch('featured_image') || ''}
              onChange={(e) => setValue('featured_image', e.target.value)}
              placeholder="Image URL"
              error={errors.featured_image?.message}
            />
            <div className="flex items-center gap-4">
              <select
                value={imageStyle}
                onChange={(e) => setImageStyle(e.target.value)}
                className="block w-48 rounded-md border-gray-300 py-1.5 pl-3 pr-10 text-gray-900 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-900 dark:border-gray-700"
              >
                {styleOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <Button
                type="button"
                onClick={() => generateImage(prompt)}
                disabled={!watch('title') || generating}
                variant="secondary"
              >
                {generating ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                    {t('generating')}
                  </>
                ) : (
                  t('generateImage')
                )}
              </Button>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <Label>{t('form.tags')}</Label>
          <Input
            type="text"
            value={watch('tags')?.join(', ') || ''}
            onChange={(e) => setValue('tags', e.target.value.split(',').map(tag => tag.trim()).filter(Boolean))}
            placeholder="Enter tags separated by commas"
            error={errors.tags?.message}
          />
        </div>
      </div>
    </div>
  )
} 
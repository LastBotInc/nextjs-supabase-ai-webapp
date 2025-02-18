'use client'

import { useTranslations } from 'next-intl'
import * as React from 'react'
import { useFormContext } from 'react-hook-form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { MediaSelector } from '@/components/media-selector'
import { TagInput } from '@/components/ui/tag-input'
import { Database } from '@/types/database'
import { LandingPageFormData } from './schema'

type LandingPage = Database['public']['Tables']['landing_pages']['Row']

interface Props {
  page: LandingPage | null
  locale: string
}

export default function SeoSettings({ page, locale }: Props) {
  const t = useTranslations('LandingPages')
  const { register, formState: { errors }, watch, setValue } = useFormContext<LandingPageFormData>()

  return (
    <div className="space-y-6 p-6">
      <div className="space-y-2">
        <Label htmlFor="meta_title">{t('seo.metaTitle')}</Label>
        <Input
          id="meta_title"
          {...register('seo_data.meta_title')}
          error={errors.seo_data?.meta_title?.message}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="meta_description">{t('seo.metaDescription')}</Label>
        <Textarea
          id="meta_description"
          {...register('seo_data.meta_description')}
          error={errors.seo_data?.meta_description?.message}
        />
      </div>

      <div className="space-y-2">
        <Label>{t('seo.ogImage')}</Label>
        <MediaSelector
          value={watch('seo_data.og_image')}
          onChange={(value: string | null) => setValue('seo_data.og_image', value || '')}
          error={errors.seo_data?.og_image?.message}
        />
      </div>

      <div className="space-y-2">
        <Label>{t('seo.keywords')}</Label>
        <TagInput
          value={watch('seo_data.keywords') || []}
          onChange={(value: string[]) => setValue('seo_data.keywords', value)}
          error={errors.seo_data?.keywords?.message}
        />
      </div>
    </div>
  )
} 
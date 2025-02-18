'use client'

import { useTranslations } from 'next-intl'
import * as React from 'react'
import { useFormContext } from 'react-hook-form'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { Database } from '@/types/database'

type LandingPage = Database['public']['Tables']['landing_pages']['Row']

interface Props {
  page: LandingPage | null
  locale: string
}

export default function Analytics({ page, locale }: Props) {
  const t = useTranslations('LandingPages')
  const { register, formState: { errors }, watch, setValue } = useFormContext<LandingPage>()

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <Label htmlFor="enable_analytics">{t('editor.analytics.enableAnalytics')}</Label>
          <p className="text-sm text-muted-foreground">
            {t('editor.analytics.enableAnalyticsDescription')}
          </p>
        </div>
        <Switch
          id="enable_analytics"
          checked={watch('enable_analytics')}
          onCheckedChange={(checked: boolean) => setValue('enable_analytics', checked)}
        />
      </div>

      {watch('enable_analytics') && (
        <>
          <div className="space-y-2">
            <Label htmlFor="ga_measurement_id">{t('editor.analytics.gaMeasurementId')}</Label>
            <Input
              id="ga_measurement_id"
              {...register('ga_measurement_id')}
              error={errors.ga_measurement_id?.message as string}
              placeholder="G-XXXXXXXXXX"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="gtm_container_id">{t('editor.analytics.gtmContainerId')}</Label>
            <Input
              id="gtm_container_id"
              {...register('gtm_container_id')}
              error={errors.gtm_container_id?.message as string}
              placeholder="GTM-XXXXXXX"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="fb_pixel_id">{t('editor.analytics.fbPixelId')}</Label>
            <Input
              id="fb_pixel_id"
              {...register('fb_pixel_id')}
              error={errors.fb_pixel_id?.message as string}
              placeholder="XXXXXXXXXXXXXXXXXX"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="linkedin_pixel_id">{t('editor.analytics.linkedinPixelId')}</Label>
            <Input
              id="linkedin_pixel_id"
              {...register('linkedin_pixel_id')}
              error={errors.linkedin_pixel_id?.message as string}
              placeholder="XXXXXXXXXX"
            />
          </div>
        </>
      )}
    </div>
  )
} 
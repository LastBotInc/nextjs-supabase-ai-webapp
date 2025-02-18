'use client'

import { useTranslations } from 'next-intl'
import * as React from 'react'
import { useFormContext } from 'react-hook-form'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Database } from '@/types/database'

type LandingPage = Database['public']['Tables']['landing_pages']['Row']

interface Props {
  page: LandingPage | null
  locale: string
}

export default function CustomCode({ page, locale }: Props) {
  const t = useTranslations('LandingPages')
  const { register, formState: { errors } } = useFormContext<LandingPage>()

  return (
    <div className="space-y-6 p-6">
      <div className="space-y-2">
        <Label htmlFor="custom_head">{t('code.customHead')}</Label>
        <Textarea
          id="custom_head"
          {...register('custom_head')}
          error={errors.custom_head?.message as string}
          placeholder="<meta>, <link>, <script> tags etc."
          className="font-mono"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="custom_css">{t('code.customCss')}</Label>
        <Textarea
          id="custom_css"
          {...register('custom_css')}
          error={errors.custom_css?.message as string}
          placeholder="Custom CSS styles"
          className="font-mono"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="custom_js">{t('code.customJs')}</Label>
        <Textarea
          id="custom_js"
          {...register('custom_js')}
          error={errors.custom_js?.message as string}
          placeholder="Custom JavaScript code"
          className="font-mono"
        />
      </div>
    </div>
  )
} 
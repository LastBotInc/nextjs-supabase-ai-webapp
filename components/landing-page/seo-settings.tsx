import { useTranslations } from 'next-intl'
import { useFormContext } from 'react-hook-form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { MediaSelector } from '@/components/media-selector'
import { TagInput } from '@/components/tag-input'

export function SeoSettings() {
  const t = useTranslations('LandingPages')
  const { register, formState: { errors }, watch, setValue } = useFormContext()

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="meta_title">{t('metaTitle')}</Label>
        <Input
          id="meta_title"
          {...register('meta_title')}
          error={errors.meta_title?.message as string}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="meta_description">{t('metaDescription')}</Label>
        <Textarea
          id="meta_description"
          {...register('meta_description')}
          error={errors.meta_description?.message as string}
        />
      </div>

      <div className="space-y-2">
        <Label>{t('ogImage')}</Label>
        <MediaSelector
          value={watch('og_image')}
          onChange={(value) => setValue('og_image', value)}
          error={errors.og_image?.message as string}
        />
      </div>

      <div className="space-y-2">
        <Label>{t('keywords')}</Label>
        <TagInput
          value={watch('keywords') || []}
          onChange={(value) => setValue('keywords', value)}
          error={errors.keywords?.message as string}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="canonical_url">{t('canonicalUrl')}</Label>
        <Input
          id="canonical_url"
          {...register('canonical_url')}
          error={errors.canonical_url?.message as string}
        />
      </div>
    </div>
  )
} 
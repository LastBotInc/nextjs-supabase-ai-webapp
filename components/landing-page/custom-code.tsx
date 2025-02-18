import { useTranslations } from 'next-intl'
import { useFormContext } from 'react-hook-form'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

export function CustomCode() {
  const t = useTranslations('LandingPages')
  const { register, formState: { errors } } = useFormContext()

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="custom_head">{t('customHead')}</Label>
        <Textarea
          id="custom_head"
          {...register('custom_head')}
          error={errors.custom_head?.message as string}
          placeholder="<meta>, <link>, <script> tags etc."
          className="font-mono"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="custom_css">{t('customCss')}</Label>
        <Textarea
          id="custom_css"
          {...register('custom_css')}
          error={errors.custom_css?.message as string}
          placeholder="Custom CSS styles"
          className="font-mono"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="custom_js">{t('customJs')}</Label>
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
'use client'

import { useFormContext, get } from 'react-hook-form'
import { useTranslations } from 'next-intl'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'

export default function CtaSettings() {
  const { register, formState: { errors } } = useFormContext()
  const t = useTranslations('LandingPages.editor.cta')

  // Function to get nested error messages
  const getErrorMessage = (name: string) => {
    const error = get(errors, name);
    return error ? <p className="text-sm font-medium text-destructive">{error.message?.toString()}</p> : null;
  };

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-medium">{t('title', { defaultValue: 'Call to Action Settings' })}</h3>
      
      {/* Headline */}
      <div className="space-y-2">
        <Label htmlFor="cta_headline">{t('headline.label', { defaultValue: 'CTA Headline' })}</Label>
        <Input 
          id="cta_headline"
          placeholder={t('headline.placeholder', { defaultValue: 'e.g., Ready to Grow?' })} 
          {...register('cta_headline')} 
        />
        {getErrorMessage('cta_headline')}
      </div>

      {/* Description */}
      <div className="space-y-2">
        <Label htmlFor="cta_description">{t('description.label', { defaultValue: 'CTA Description' })}</Label>
        <Textarea 
          id="cta_description"
          placeholder={t('description.placeholder', { defaultValue: 'Briefly describe the offer or next step.' })} 
          {...register('cta_description')}
        />
        {getErrorMessage('cta_description')}
      </div>

      {/* Button Text */}
      <div className="space-y-2">
        <Label htmlFor="cta_button_text">{t('buttonText.label', { defaultValue: 'Button Text' })}</Label>
        <Input 
          id="cta_button_text"
          placeholder={t('buttonText.placeholder', { defaultValue: 'e.g., Get Started Now' })} 
          {...register('cta_button_text')}
        />
        {getErrorMessage('cta_button_text')}
      </div>

      {/* Button Link */}
      <div className="space-y-2">
        <Label htmlFor="cta_button_link">{t('buttonLink.label', { defaultValue: 'Button Link URL' })}</Label>
        <Input 
          id="cta_button_link"
          type="url" 
          placeholder={t('buttonLink.placeholder', { defaultValue: 'https://example.com/signup' })} 
          {...register('cta_button_link')} 
        />
        {getErrorMessage('cta_button_link')}
      </div>

      {/* Secondary Text */}
      <div className="space-y-2">
        <Label htmlFor="cta_secondary_text">{t('secondaryText.label', { defaultValue: 'Secondary Text (Optional)' })}</Label>
        <Input 
          id="cta_secondary_text"
          placeholder={t('secondaryText.placeholder', { defaultValue: 'e.g., No credit card required' })} 
          {...register('cta_secondary_text')}
        />
        {getErrorMessage('cta_secondary_text')}
      </div>
    </div>
  )
} 
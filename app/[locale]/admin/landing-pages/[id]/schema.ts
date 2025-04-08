import { z } from 'zod'

export const landingPageSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  slug: z.string().min(1, 'URL path is required').regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Invalid slug format'),
  content: z.string().optional(),
  excerpt: z.string().optional(),
  featured_image: z.string().url().optional().or(z.literal('')),
  tags: z.array(z.string()).optional(),
  seo_data: z.object({
    meta_title: z.string().optional(),
    meta_description: z.string().optional(),
    keywords: z.array(z.string()).optional(),
    og_image: z.string().url().optional().or(z.literal('')),
    // Add other potential SEO fields if needed
  }).optional(),
  custom_head: z.string().optional(),
  custom_css: z.string().optional(),
  custom_js: z.string().optional(),
  published: z.boolean().default(false),
  locale: z.string(), // Added locale
  
  // Add optional CTA fields
  cta_headline: z.string().optional(),
  cta_description: z.string().optional(),
  cta_button_text: z.string().optional(),
  cta_button_link: z.string().url().optional().or(z.literal('')),
  cta_secondary_text: z.string().optional(),
})

export type LandingPageFormData = z.infer<typeof landingPageSchema> 
import { z } from 'zod'

export const landingPageSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  slug: z.string().min(1, 'URL slug is required'),
  content: z.string().min(1, 'Content is required'),
  excerpt: z.string().optional(),
  featured_image: z.string().optional(),
  tags: z.array(z.string()).optional(),
  seo_data: z.object({
    meta_title: z.string().optional(),
    meta_description: z.string().optional(),
    keywords: z.array(z.string()).optional(),
    og_image: z.string().optional()
  }).optional().default({}),
  custom_head: z.string().optional(),
  custom_css: z.string().optional(),
  custom_js: z.string().optional(),
  published: z.boolean().optional(),
  locale: z.string().optional()
})

export type LandingPageFormData = z.infer<typeof landingPageSchema> 
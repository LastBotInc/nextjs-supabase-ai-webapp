import { expect, describe, it, beforeEach } from 'vitest'
import { brandInfo, getGeminiPrompt, validateContent } from '@/lib/brand-info'

describe('Brand Info', () => {
  describe('brandInfo', () => {
    it('should have correct structure', () => {
      expect(brandInfo).toHaveProperty('name')
      expect(brandInfo).toHaveProperty('description')
      expect(brandInfo).toHaveProperty('tone')
      expect(brandInfo).toHaveProperty('personality')
      expect(brandInfo).toHaveProperty('writingStyle')
      expect(brandInfo).toHaveProperty('commonPhrases')
      expect(brandInfo).toHaveProperty('avoidPhrases')
    })

    it('should have valid tone values', () => {
      const { tone } = brandInfo
      expect(tone.formal).toBeGreaterThanOrEqual(0)
      expect(tone.formal).toBeLessThanOrEqual(10)
      expect(tone.friendly).toBeGreaterThanOrEqual(0)
      expect(tone.friendly).toBeLessThanOrEqual(10)
      expect(tone.technical).toBeGreaterThanOrEqual(0)
      expect(tone.technical).toBeLessThanOrEqual(10)
      expect(tone.innovative).toBeGreaterThanOrEqual(0)
      expect(tone.innovative).toBeLessThanOrEqual(10)
    })

    it('should have non-empty personality arrays', () => {
      const { personality } = brandInfo
      expect(personality.primary.length).toBeGreaterThan(0)
      expect(personality.secondary.length).toBeGreaterThan(0)
      expect(personality.avoid.length).toBeGreaterThan(0)
    })
  })

  describe('getGeminiPrompt', () => {
    it('should include brand name and description', () => {
      const prompt = getGeminiPrompt('Test content')
      expect(prompt).toContain(brandInfo.name)
      expect(prompt).toContain(brandInfo.description)
    })

    it('should include tone guidelines', () => {
      const prompt = getGeminiPrompt('Test content')
      Object.entries(brandInfo.tone).forEach(([key, value]) => {
        expect(prompt).toContain(`${key}: ${value}/10`)
      })
    })

    it('should include personality traits', () => {
      const prompt = getGeminiPrompt('Test content')
      brandInfo.personality.primary.forEach(trait => {
        expect(prompt).toContain(trait)
      })
    })

    it('should include writing style guidelines', () => {
      const prompt = getGeminiPrompt('Test content')
      brandInfo.writingStyle.forEach(guideline => {
        expect(prompt).toContain(guideline)
      })
    })

    it('should include phrases to avoid', () => {
      const prompt = getGeminiPrompt('Test content')
      brandInfo.avoidPhrases.forEach(phrase => {
        expect(prompt).toContain(phrase)
      })
    })

    it('should include the provided content context', () => {
      const testContent = 'Write a blog post about AI'
      const prompt = getGeminiPrompt(testContent)
      expect(prompt).toContain(testContent)
    })
  })

  describe('validateContent', () => {
    it('should return true for valid content', () => {
      const validContent = 'This is a great article about AI-first approach and human-centric AI'
      expect(validateContent(validContent)).toBe(true)
    })

    it('should return false when content contains avoided phrases', () => {
      brandInfo.avoidPhrases.forEach(phrase => {
        const invalidContent = `This article talks about ${phrase} in technology`
        expect(validateContent(invalidContent)).toBe(false)
      })
    })

    it('should be case insensitive', () => {
      const phrase = brandInfo.avoidPhrases[0]
      const invalidContent = `This article talks about ${phrase.toUpperCase()} in technology`
      expect(validateContent(invalidContent)).toBe(false)
    })

    it('should handle empty content', () => {
      expect(validateContent('')).toBe(true)
    })
  })
})

describe('Blog Content Generation with Brand Voice', () => {
  const mockBlogPrompt = 'Write about AI in customer service'
  let generatedPrompt: string

  beforeEach(() => {
    generatedPrompt = getGeminiPrompt(`Generate a blog post based on this topic: "${mockBlogPrompt}"

Instructions:
1. Title should be compelling, SEO-friendly, and under 60 characters
2. Content should use proper markdown headings (##, ###), include bullet points, code blocks if relevant, and have a clear structure with introduction and conclusion
3. Excerpt should capture the essence of the post in 2-3 sentences
4. Meta description should be optimized for search and under 160 characters
5. Include 3-5 relevant tags
6. Create a detailed image prompt that will generate an engaging featured image`)
  })

  it('should include blog-specific instructions', () => {
    expect(generatedPrompt).toContain('Title should be compelling')
    expect(generatedPrompt).toContain('Content should use proper markdown headings')
    expect(generatedPrompt).toContain('Excerpt should capture')
    expect(generatedPrompt).toContain('Meta description')
    expect(generatedPrompt).toContain('relevant tags')
    expect(generatedPrompt).toContain('image prompt')
  })

  it('should combine brand voice with blog instructions', () => {
    // Brand elements
    expect(generatedPrompt).toContain(brandInfo.name)
    expect(generatedPrompt).toContain(brandInfo.description)
    
    // Blog elements
    expect(generatedPrompt).toContain('Generate a blog post')
    expect(generatedPrompt).toContain(mockBlogPrompt)
  })

  it('should maintain brand voice guidelines in blog context', () => {
    // Tone
    Object.entries(brandInfo.tone).forEach(([key, value]) => {
      expect(generatedPrompt).toContain(`${key}: ${value}/10`)
    })

    // Writing style
    brandInfo.writingStyle.forEach(guideline => {
      expect(generatedPrompt).toContain(guideline)
    })

    // Phrases to avoid
    brandInfo.avoidPhrases.forEach(phrase => {
      expect(generatedPrompt).toContain(phrase)
    })
  })
}) 
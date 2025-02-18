/**
 * @jest-environment jsdom
 */
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import { expect } from '@jest/globals'
import userEvent from '@testing-library/user-event'
import PostEditor from '@/components/blog/PostEditor'
import { NextIntlClientProvider } from 'next-intl'
import { createClient } from '@/utils/supabase/client'
import type { Database } from '@/types/database'

// Extend Jest matchers
declare global {
  namespace jest {
    interface Matchers<R> {
      toBeInTheDocument(): R
      toBeDisabled(): R
      toHaveValue(value: string | number): R
      toHaveBeenCalled(): R
      toHaveBeenCalledWith(...args: any[]): R
    }
  }
}

// Set longer timeout for all tests in this file
jest.setTimeout(30000)

// Mock translations
const messages = {
  Blog: {
    admin: {
      fields: {
        title: 'Title',
        content: 'Content',
        excerpt: 'Excerpt',
        metaDescription: 'Meta Description',
        tags: 'Tags',
        featuredImage: 'Featured Image',
        published: 'Published',
        prompt: 'Blog Post Prompt',
        promptPlaceholder: 'Enter a prompt to generate blog post content',
        locale: 'Language',
        targetLanguages: 'Target Languages',
        targetLanguagesHelp: 'Select languages for automatic translation',
        targetLanguagesOptional: '(optional)',
        slug: 'URL Slug',
        detectedLanguage: '(detected)'
      },
      buttons: {
        save: 'Save',
        generateWithAI: 'Generate with AI',
        generateImage: 'Generate Image',
        cancel: 'Cancel'
      },
      errors: {
        titleRequired: 'Title is required',
        contentRequired: 'Content is required'
      },
      save: 'Save',
      saving: 'Saving...',
      cancel: 'Cancel',
      publishPost: 'Publish',
      unpublishPost: 'Unpublish'
    }
  }
}

// Mock Supabase client
jest.mock('@/utils/supabase/client', () => ({
  createClient: jest.fn(() => ({
    auth: {
      getSession: jest.fn(() => Promise.resolve({
        data: {
          session: {
            access_token: 'test-token',
            user: { id: 'test-user' }
          }
        },
        error: null
      }))
    }
  }))
}))

// Mock RichTextEditor component
jest.mock('@/components/blog/RichTextEditorWrapper', () => {
  return function MockEditor({ content, onChange }: { content: string; onChange: (content: string) => void }) {
    return (
      <div data-testid="rich-text-editor">
        <textarea
          aria-label="Content"
          value={content}
          onChange={(e) => onChange(e.target.value)}
        />
      </div>
    )
  }
})

// Mock ResearchPanel component
jest.mock('@/components/blog/ResearchPanel', () => {
  return function MockResearchPanel() {
    return <div data-testid="research-panel">Research Panel</div>
  }
})

// Helper function to render with translations
const renderWithProvider = (component: React.ReactNode) => {
  return render(
    <NextIntlClientProvider messages={messages} locale="en">
      {component}
    </NextIntlClientProvider>
  )
}

describe('PostEditor', () => {
  const mockOnSave = jest.fn()
  const mockOnCancel = jest.fn()
  
  beforeEach(() => {
    jest.clearAllMocks()
    global.fetch = jest.fn((url) => {
      if (url === '/api/languages') {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            data: [
              { code: 'en', name: 'English', enabled: true },
              { code: 'fi', name: 'Finnish', enabled: true }
            ]
          })
        })
      }
      if (url === '/api/blog') {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            data: {
              id: '1',
              title: 'Test Post',
              content: 'Test Content'
            }
          })
        })
      }
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({})
      })
    }) as jest.Mock
  })

  it('renders form fields correctly', async () => {
    renderWithProvider(<PostEditor onSave={mockOnSave} onCancel={mockOnCancel} />)

    // Check for required form fields
    expect(screen.getByLabelText(/Title/i)).toBeInTheDocument()
    expect(screen.getByTestId('rich-text-editor')).toBeInTheDocument()
    expect(screen.getByLabelText(/Excerpt/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/Meta Description/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/Tags/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/Featured Image/i)).toBeInTheDocument()
    expect(screen.getByRole('combobox', { name: /Language/i })).toBeInTheDocument()

    // Wait for languages to load
    await waitFor(() => {
      expect(screen.getByRole('combobox', { name: /Language/i })).not.toBeDisabled()
    })
  })

  it('loads existing post data correctly', () => {
    const existingPost: Database['public']['Tables']['posts']['Row'] = {
      id: '1',
      title: 'Test Post',
      content: 'Test Content',
      excerpt: 'Test Excerpt',
      meta_description: 'Test Meta',
      tags: ['test'],
      featured_image: '/images/test.jpg',
      locale: 'en',
      published: true,
      author_id: 'test-user',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      slug: 'test-post',
      embedding: null
    }

    renderWithProvider(
      <PostEditor 
        post={existingPost}
        onSave={mockOnSave}
        onCancel={mockOnCancel}
      />
    )

    expect(screen.getByLabelText(/Title/i)).toHaveValue('Test Post')
    expect(screen.getByLabelText(/Excerpt/i)).toHaveValue('Test Excerpt')
    expect(screen.getByLabelText(/Meta Description/i)).toHaveValue('Test Meta')
    expect(screen.getByLabelText(/Featured Image/i)).toHaveValue('/images/test.jpg')
  })

  it('handles form submission correctly', async () => {
    const user = userEvent.setup()
    renderWithProvider(<PostEditor onSave={mockOnSave} onCancel={mockOnCancel} />)

    // Wait for languages to load
    await waitFor(() => {
      expect(screen.getByRole('combobox', { name: /Language/i })).not.toBeDisabled()
    })

    // Fill form with all required fields
    await user.type(screen.getByLabelText(/Title/i), 'New Post')
    await user.type(screen.getByLabelText(/Content/i), 'New Content')
    await user.type(screen.getByLabelText(/Excerpt/i), 'New Excerpt')
    await user.type(screen.getByLabelText(/URL Slug/i), 'new-post')
    
    // Submit form
    const form = screen.getByRole('form')
    await user.click(screen.getByRole('button', { name: /Save/i }))
    fireEvent.submit(form, { preventDefault: () => {} })

    // Verify API call
    await waitFor(() => {
      const fetchCalls = (global.fetch as jest.Mock).mock.calls
      const blogApiCall = fetchCalls.find(call => call[0] === '/api/blog')
      expect(blogApiCall).toBeTruthy()
      expect(blogApiCall[1].method).toBe('POST')
      expect(JSON.parse(blogApiCall[1].body)).toMatchObject({
        title: 'New Post',
        content: 'New Content',
        excerpt: 'New Excerpt',
        slug: 'new-post'
      })
    }, { timeout: 3000 })
    
    // Verify onSave callback
    await waitFor(() => {
      expect(mockOnSave).toHaveBeenCalled()
    })
  })

  it('handles AI content generation', async () => {
    const user = userEvent.setup()
    global.fetch = jest.fn().mockImplementation((url) => {
      if (url === '/api/gemini') {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            title: 'Generated Title',
            content: 'Generated Content',
            excerpt: 'Generated Excerpt',
            meta_description: 'Generated Meta',
            tags: ['generated'],
            slug: 'generated-title',
            detectedLanguage: 'en'
          })
        })
      }
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({})
      })
    }) as jest.Mock

    renderWithProvider(<PostEditor onSave={mockOnSave} onCancel={mockOnCancel} />)

    // Fill prompt
    await user.type(screen.getByLabelText(/Blog Post Prompt/i), 'Generate a blog post about testing')
    
    // Click generate button
    const generateButton = screen.getByRole('button', { name: /Generate with AI/i })
    await user.click(generateButton)

    // Verify content is updated
    await waitFor(() => {
      expect(screen.getByLabelText(/Title/i)).toHaveValue('Generated Title')
      expect(screen.getByLabelText(/Excerpt/i)).toHaveValue('Generated Excerpt')
    })
  })

  it('handles errors during save', async () => {
    const user = userEvent.setup()
    global.fetch = jest.fn().mockImplementation((url) => {
      if (url === '/api/languages') {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            data: [
              { code: 'en', name: 'English', enabled: true }
            ]
          })
        })
      }
      return Promise.resolve({
        ok: false,
        status: 500,
        json: () => Promise.resolve({ error: 'An error occurred' })
      })
    }) as jest.Mock

    renderWithProvider(<PostEditor onSave={mockOnSave} onCancel={mockOnCancel} />)

    // Wait for languages to load
    await waitFor(() => {
      expect(screen.getByRole('combobox', { name: /Language/i })).not.toBeDisabled()
    })

    // Fill required fields
    await user.type(screen.getByLabelText(/Title/i), 'Test Post')
    await user.type(screen.getByLabelText(/Content/i), 'Test Content')
    await user.type(screen.getByLabelText(/URL Slug/i), 'test-post')

    // Submit form
    const form = screen.getByRole('form')
    await user.click(screen.getByRole('button', { name: /Save/i }))
    fireEvent.submit(form, { preventDefault: () => {} })

    // Verify error is shown with longer timeout
    await waitFor(() => {
      const alert = screen.getByRole('alert')
      expect(alert).toBeInTheDocument()
      expect(alert).toHaveTextContent('An error occurred')
    }, { timeout: 3000 })
  })

  it('handles cancel action', async () => {
    const user = userEvent.setup()
    renderWithProvider(<PostEditor onSave={mockOnSave} onCancel={mockOnCancel} />)

    const cancelButton = screen.getByRole('button', { name: /Cancel/i })
    await user.click(cancelButton)

    expect(mockOnCancel).toHaveBeenCalled()
  })
}) 
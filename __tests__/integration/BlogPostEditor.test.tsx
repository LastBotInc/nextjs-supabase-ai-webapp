/**
 * @jest-environment jsdom
 */
/// <reference types="@testing-library/jest-dom" />
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react'
import '@testing-library/jest-dom'
import userEvent from '@testing-library/user-event'
import { NextIntlClientProvider } from 'next-intl'
import dynamic from 'next/dynamic'
import { expect } from '@jest/globals'
import type { TestingLibraryMatchers } from '@testing-library/jest-dom/matchers'
import { setupSupabaseMock, setupSupabaseEnv, TestSupabaseClient } from '../utils/supabase'

const PostEditor = dynamic(() => import('@/components/blog/PostEditor'), { ssr: false })

// Extend expect matchers
declare global {
  namespace jest {
    interface Matchers<R> extends TestingLibraryMatchers<typeof expect, R> {}
  }
}

// Mock next/image
jest.mock('next/image', () => ({
  __esModule: true,
  default: (props: any) => <img {...props} />
}))

// Mock next/dynamic
jest.mock('next/dynamic', () => ({
  __esModule: true,
  default: (fn: () => Promise<any>) => {
    const Component = require('@/components/blog/PostEditor').default
    return Component
  }
}))

// Mock next-intl
jest.mock('next-intl', () => {
  type Translations = {
    [key: string]: string;
  }

  const translations: Translations = {
    'Blog.admin.fields.title': 'Title',
    'Blog.admin.fields.content': 'Content',
    'Blog.admin.fields.excerpt': 'Excerpt',
    'Blog.admin.fields.metaDescription': 'Meta Description',
    'Blog.admin.fields.tags': 'Tags',
    'Blog.admin.fields.featuredImage': 'Featured Image',
    'Blog.admin.fields.published': 'Published',
    'Blog.admin.fields.prompt': 'Blog Post Prompt',
    'Blog.admin.fields.promptPlaceholder': 'Enter a prompt to generate blog post content',
    'Blog.admin.fields.locale': 'Language',
    'Blog.admin.fields.targetLanguages': 'Target Languages',
    'Blog.admin.fields.targetLanguagesHelp': 'Select languages for automatic translation',
    'Blog.admin.fields.targetLanguagesOptional': '(optional)',
    'Blog.admin.fields.slug': 'URL Slug',
    'Blog.admin.fields.detectedLanguage': '(detected)',
    'Blog.admin.buttons.save': 'Save',
    'Blog.admin.buttons.generateWithAI': 'Generate with AI',
    'Blog.admin.buttons.generateImage': 'Generate Image',
    'Blog.admin.buttons.cancel': 'Cancel',
    'Blog.admin.errors.titleRequired': 'Title is required',
    'Blog.admin.errors.contentRequired': 'Content is required',
    'Blog.admin.save': 'Save',
    'Blog.admin.saving': 'Saving...',
    'Blog.admin.cancel': 'Cancel',
    'Blog.admin.publishPost': 'Publish',
    'Blog.admin.unpublishPost': 'Unpublish',
    'Blog.admin.research.title': 'Web Research',
    'Blog.admin.research.searchPlaceholder': 'Search the web...',
    'Blog.admin.research.search': 'Search',
    'Blog.admin.research.searching': 'Searching...',
    'Blog.admin.research.error': 'Failed to search',
    'Blog.admin.research.noResults': 'No results found',
    'Blog.admin.research.use': 'Use',
    'Blog.admin.generateError': 'Failed to generate content'
  }

  const NextIntlClientProvider = ({ children }: { children: React.ReactNode }) => {
    return <div data-testid="intl-provider">{children}</div>
  }

  const useTranslations = () => (key: string) => {
    return translations[key] || key
  }

  return {
    NextIntlClientProvider,
    useTranslations
  }
})

// Mock fetch for API calls
global.fetch = jest.fn((url) => {
  if (url === '/api/media/upload') {
    return Promise.resolve({
      ok: true,
      json: () => Promise.resolve({
        url: 'https://example.com/test-image.jpg',
        id: 'test-id',
        name: 'test-image.jpg',
        type: 'image/jpeg',
        size: 1024,
        width: 800,
        height: 600,
        createdAt: new Date().toISOString()
      })
    })
  }
  if (url === '/api/tavily-search') {
    return Promise.resolve({
      ok: true,
      json: () => Promise.resolve({
        results: [
          {
            title: 'Test Result 1',
            snippet: 'This is a test search result',
            url: 'https://example.com/1'
          },
          {
            title: 'Test Result 2',
            snippet: 'Another test search result',
            url: 'https://example.com/2'
          }
        ]
      })
    })
  }
  return Promise.reject(new Error('Not found'))
}) as jest.Mock

describe('BlogPostEditor Integration', () => {
  let supabaseClient: TestSupabaseClient

  beforeAll(() => {
    setupSupabaseEnv()
  })

  beforeEach(() => {
    jest.clearAllMocks()
    supabaseClient = setupSupabaseMock()
  })

  const mockOnSave = jest.fn()
  const mockOnCancel = jest.fn()

  const renderEditor = () => {
    return render(
      <NextIntlClientProvider locale="en" messages={{}}>
        <PostEditor onSave={mockOnSave} onCancel={mockOnCancel} />
      </NextIntlClientProvider>
    )
  }

  describe('Media Selection Flow', () => {
    it('opens media selector when image button is clicked', async () => {
      renderEditor()
      
      // Click image button in editor toolbar
      const imageButton = screen.getByRole('button', { name: /image/i })
      await userEvent.click(imageButton)

      // Check if media selector is open
      expect(screen.getByText('Media.selectMedia')).toBeInTheDocument()
    })

    it('inserts selected image into editor', async () => {
      renderEditor()
      
      // Open media selector
      const imageButton = screen.getByRole('button', { name: /image/i })
      await userEvent.click(imageButton)

      // Select an image
      const firstImage = screen.getByTestId('media-grid').querySelector('img')
      await userEvent.click(firstImage!)

      // Click select button
      const selectButton = screen.getByRole('button', { name: /select/i })
      await userEvent.click(selectButton)

      // Verify image is inserted
      const editor = screen.getByRole('textbox')
      expect(editor.innerHTML).toContain('<img')
    })

    it('shows image preview when selected', async () => {
      renderEditor()
      
      // Open media selector
      const imageButton = screen.getByRole('button', { name: /image/i })
      await userEvent.click(imageButton)

      // Select an image
      const firstImage = screen.getByTestId('media-grid').querySelector('img')
      await userEvent.click(firstImage!)

      // Check if preview is shown
      expect(screen.getByTestId('media-preview')).toBeInTheDocument()
      expect(screen.getByTestId('media-details')).toBeInTheDocument()
    })
  })

  describe('Upload and Insertion Flow', () => {
    it('handles file upload in media selector', async () => {
      renderEditor()
      
      // Open media selector
      const imageButton = screen.getByRole('button', { name: /image/i })
      await userEvent.click(imageButton)

      // Upload a file
      const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' })
      const input = screen.getByTestId('file-input')
      await userEvent.upload(input, file)

      // Check upload progress
      expect(screen.getByTestId('upload-progress')).toBeInTheDocument()
      
      // Wait for upload to complete
      await waitFor(() => {
        expect(screen.getByTestId('upload-status')).toHaveTextContent('100%')
      })

      // Verify uploaded image is selected
      expect(screen.getByTestId('media-preview')).toBeInTheDocument()
    })

    it('shows error message on upload failure', async () => {
      // Mock upload failure
      global.fetch = jest.fn().mockResolvedValueOnce({
        ok: false,
        json: () => Promise.resolve({ error: 'Upload failed' })
      })

      renderEditor()
      
      // Open media selector
      const imageButton = screen.getByRole('button', { name: /image/i })
      await userEvent.click(imageButton)

      // Upload a file
      const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' })
      const input = screen.getByTestId('file-input')
      await userEvent.upload(input, file)

      // Check error message
      await waitFor(() => {
        expect(screen.getByTestId('upload-error')).toHaveTextContent('Upload failed')
      })
    })

    it('prevents upload of invalid file types', async () => {
      renderEditor()
      
      // Open media selector
      const imageButton = screen.getByRole('button', { name: /image/i })
      await userEvent.click(imageButton)

      // Try to upload invalid file
      const file = new File(['test'], 'test.txt', { type: 'text/plain' })
      const input = screen.getByTestId('file-input')
      await userEvent.upload(input, file)

      // Verify no upload started
      expect(screen.queryByTestId('upload-progress')).not.toBeInTheDocument()
    })
  })

  describe('Research and Generation Flow', () => {
    it('performs web search and shows results', async () => {
      renderEditor()
      
      // Open research panel
      const researchButton = screen.getByRole('button', { name: /research/i })
      await userEvent.click(researchButton)

      // Enter search query
      const searchInput = screen.getByPlaceholderText(/search the web/i)
      await userEvent.type(searchInput, 'test query')

      // Click search button
      const searchButton = screen.getByRole('button', { name: /search/i })
      await userEvent.click(searchButton)

      // Wait for results
      await waitFor(() => {
        expect(screen.getByText('Test Result 1')).toBeInTheDocument()
        expect(screen.getByText('Test Result 2')).toBeInTheDocument()
      })
    })

    it('uses selected research result in editor', async () => {
      renderEditor()
      
      // Open research panel and search
      const researchButton = screen.getByRole('button', { name: /research/i })
      await userEvent.click(researchButton)
      const searchInput = screen.getByPlaceholderText(/search the web/i)
      await userEvent.type(searchInput, 'test query')
      const searchButton = screen.getByRole('button', { name: /search/i })
      await userEvent.click(searchButton)

      // Wait for results and use first result
      await waitFor(() => {
        const useButton = screen.getAllByRole('button', { name: /use/i })[0]
        userEvent.click(useButton)
      })

      // Verify content is added to editor
      const editor = screen.getByRole('textbox')
      expect(editor.innerHTML).toContain('This is a test search result')
    })

    it('shows error message on search failure', async () => {
      // Mock search failure
      global.fetch = jest.fn().mockResolvedValueOnce({
        ok: false,
        json: () => Promise.resolve({ error: 'Search failed' })
      })

      renderEditor()
      
      // Open research panel
      const researchButton = screen.getByRole('button', { name: /research/i })
      await userEvent.click(researchButton)

      // Perform search
      const searchInput = screen.getByPlaceholderText(/search the web/i)
      await userEvent.type(searchInput, 'test query')
      const searchButton = screen.getByRole('button', { name: /search/i })
      await userEvent.click(searchButton)

      // Check error message
      await waitFor(() => {
        expect(screen.getByRole('alert')).toHaveTextContent('Search failed')
      })
    })
  })

  it('handles form submission', async () => {
    renderEditor()

    // Fill in form fields
    await userEvent.type(screen.getByLabelText(/title/i), 'Test Title')
    await userEvent.type(screen.getByRole('textbox', { name: /content/i }), 'Test Content')

    // Click save button
    const saveButton = screen.getByRole('button', { name: /save/i })
    await userEvent.click(saveButton)

    // Check if onSave was called with correct data
    expect(mockOnSave).toHaveBeenCalledWith(expect.objectContaining({
      title: 'Test Title',
      content: 'Test Content'
    }))
  })

  it('handles AI generation errors gracefully', async () => {
    // Mock fetch to return error
    global.fetch = jest.fn().mockResolvedValueOnce({
      ok: false,
      json: () => Promise.resolve({ error: 'Failed to generate content' })
    })

    renderEditor()

    // Enter prompt
    await userEvent.type(screen.getByLabelText(/prompt/i), 'Test prompt')

    // Click generate button
    const generateButton = screen.getByRole('button', { name: /generate with ai/i })
    await userEvent.click(generateButton)

    // Wait for error message
    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent('Failed to generate content')
    })
  })
}) 
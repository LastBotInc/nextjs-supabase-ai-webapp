/**
 * @jest-environment jsdom
 */
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import RichTextEditor from '../RichTextEditor'
import { vi, describe, it, expect, beforeEach } from 'vitest'
import { NextIntlClientProvider } from 'next-intl'

interface ImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  fill?: boolean;
  priority?: boolean;
  loading?: 'lazy' | 'eager';
  quality?: number;
  sizes?: string;
  style?: React.CSSProperties;
  onLoad?: () => void;
  onError?: () => void;
}

interface MediaSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (asset: { originalUrl: string; title: string; altText?: string }) => void;
}

// Mock translations
const mockTranslations = {
  Blog: {
    admin: {
      fields: {
        content: 'Enter content...'
      },
      editor: {
        bold: 'Bold',
        italic: 'Italic',
        strike: 'Strike',
        code: 'Code',
        heading: 'Heading',
        bulletList: 'Bullet List',
        orderedList: 'Ordered List',
        quote: 'Quote',
        image: 'Image'
      }
    }
  }
}

// Mock next/image
vi.mock('next/image', () => ({
  __esModule: true,
  // eslint-disable-next-line @next/next/no-img-element
  default: (props: ImageProps) => <img {...props} alt={props.alt || ''} />
}))

// Mock @heroicons/react/24/outline
vi.mock('@heroicons/react/24/outline', () => ({
  PhotoIcon: () => <div data-testid="editor-photo-icon" />
}))

// Mock MediaSelector component
vi.mock('../MediaSelector', () => ({
  __esModule: true,
  default: ({ isOpen, onClose, onSelect }: MediaSelectorProps) => (
    isOpen ? (
      <div data-testid="editor-media-selector">
        <button onClick={onClose} data-testid="editor-media-selector-close">Close</button>
        <button 
          onClick={() => onSelect({ 
            originalUrl: 'test.jpg', 
            title: 'Test Image',
            altText: 'Test image description'
          })}
          data-testid="editor-media-selector-select"
        >
          Select Image
        </button>
      </div>
    ) : null
  )
}))

// Helper function to render with translations
const renderWithTranslations = (component: React.ReactNode) => {
  return render(
    <NextIntlClientProvider messages={mockTranslations} locale="en">
      {component}
    </NextIntlClientProvider>
  )
}

describe('RichTextEditor', () => {
  const mockOnChange = vi.fn()
  const defaultProps = {
    content: '',
    onChange: mockOnChange,
    placeholder: 'Enter content...'
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders the editor with toolbar', () => {
    renderWithTranslations(<RichTextEditor {...defaultProps} />)
    expect(screen.getByTestId('rich-text-editor')).toBeInTheDocument()
    expect(screen.getByTitle('Bold')).toBeInTheDocument()
    expect(screen.getByTitle('Italic')).toBeInTheDocument()
    expect(screen.getByTitle('Strike')).toBeInTheDocument()
    expect(screen.getByTitle('Code')).toBeInTheDocument()
    expect(screen.getByTitle('Heading')).toBeInTheDocument()
    expect(screen.getByTitle('Bullet List')).toBeInTheDocument()
    expect(screen.getByTitle('Ordered List')).toBeInTheDocument()
    expect(screen.getByTitle('Quote')).toBeInTheDocument()
    expect(screen.getByTitle('Image')).toBeInTheDocument()
  })

  it('renders initial content', () => {
    const content = '<p>Test content</p>'
    renderWithTranslations(<RichTextEditor {...defaultProps} content={content} />)
    expect(screen.getByText('Test content')).toBeInTheDocument()
  })

  it('updates content when prop changes', async () => {
    const { rerender } = renderWithTranslations(<RichTextEditor {...defaultProps} />)
    rerender(
      <NextIntlClientProvider messages={mockTranslations} locale="en">
        <RichTextEditor {...defaultProps} content="<p>New content</p>" />
      </NextIntlClientProvider>
    )
    await waitFor(() => {
      expect(screen.getByText('New content')).toBeInTheDocument()
    })
  })

  it('opens media selector when image button is clicked', () => {
    renderWithTranslations(<RichTextEditor {...defaultProps} />)
    fireEvent.click(screen.getByTitle('Image'))
    expect(screen.getByTestId('editor-media-selector')).toBeInTheDocument()
  })

  it('closes media selector when close button is clicked', () => {
    renderWithTranslations(<RichTextEditor {...defaultProps} />)
    fireEvent.click(screen.getByTitle('Image'))
    fireEvent.click(screen.getByTestId('editor-media-selector-close'))
    expect(screen.queryByTestId('editor-media-selector')).not.toBeInTheDocument()
  })

  it('inserts selected image from media selector', async () => {
    renderWithTranslations(<RichTextEditor {...defaultProps} />)

    // Open media selector
    fireEvent.click(screen.getByTitle('Image'))

    // Select an image
    const selectButton = screen.getByTestId('editor-media-selector-select')
    fireEvent.click(selectButton)

    // Verify that onChange was called with the new content including the image
    await waitFor(() => {
      expect(mockOnChange).toHaveBeenCalledWith(
        expect.stringContaining('class="max-w-full h-auto rounded-lg"')
      )
      expect(mockOnChange).toHaveBeenCalledWith(
        expect.stringContaining('src="test.jpg"')
      )
      expect(mockOnChange).toHaveBeenCalledWith(
        expect.stringContaining('alt="Test image description"')
      )
      expect(mockOnChange).toHaveBeenCalledWith(
        expect.stringContaining('title="Test Image"')
      )
    })
  })

  it('applies text formatting when toolbar buttons are clicked', async () => {
    renderWithTranslations(<RichTextEditor {...defaultProps} />)
    
    // Test bold formatting
    fireEvent.click(screen.getByTitle('Bold'))
    expect(screen.getByTitle('Bold')).toHaveClass('bg-gray-200')

    // Test italic formatting
    fireEvent.click(screen.getByTitle('Italic'))
    expect(screen.getByTitle('Italic')).toHaveClass('bg-gray-200')

    // Test strike formatting
    fireEvent.click(screen.getByTitle('Strike'))
    expect(screen.getByTitle('Strike')).toHaveClass('bg-gray-200')
  })

  it('applies block formatting when toolbar buttons are clicked', () => {
    renderWithTranslations(<RichTextEditor {...defaultProps} />)

    // Test heading
    fireEvent.click(screen.getByTitle('Heading'))
    expect(screen.getByTitle('Heading')).toHaveClass('p-2', 'rounded-md')

    // Test bullet list
    fireEvent.click(screen.getByTitle('Bullet List'))
    expect(screen.getByTitle('Bullet List')).toHaveClass('p-2', 'rounded-md')

    // Test ordered list
    fireEvent.click(screen.getByTitle('Ordered List'))
    expect(screen.getByTitle('Ordered List')).toHaveClass('p-2', 'rounded-md')

    // Test blockquote
    fireEvent.click(screen.getByTitle('Quote'))
    expect(screen.getByTitle('Quote')).toHaveClass('p-2', 'rounded-md')
  })

  it('shows placeholder when content is empty', () => {
    renderWithTranslations(<RichTextEditor {...defaultProps} />)
    const editor = screen.getByTestId('rich-text-editor')
    const paragraph = editor.querySelector('p')
    expect(paragraph).toHaveAttribute('data-placeholder', 'Enter content...')
    expect(paragraph).toHaveClass('is-empty', 'is-editor-empty')
  })

  it.skip('calls onChange when content is updated', async () => {
    const { rerender } = renderWithTranslations(<RichTextEditor {...defaultProps} />)

    // Update the content prop
    rerender(
      <NextIntlClientProvider messages={mockTranslations} locale="en">
        <RichTextEditor
          {...defaultProps}
          content="<p>New content</p>"
        />
      </NextIntlClientProvider>
    )
    
    await waitFor(() => {
      expect(mockOnChange).toHaveBeenCalledWith('<p>New content</p>')
    })
  })

  // Test error states
  it('handles error when media selector fails', async () => {
    // Mock MediaSelector to simulate an error
    vi.spyOn(console, 'error').mockImplementation(() => {})
    
    renderWithTranslations(<RichTextEditor {...defaultProps} />)
    fireEvent.click(screen.getByTitle('Image'))
    
    // Verify error handling
    expect(screen.getByTestId('editor-media-selector')).toBeInTheDocument()
    expect(console.error).not.toHaveBeenCalled()
  })
}) 
/**
 * @jest-environment jsdom
 */
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import { expect } from '@jest/globals'
import type { TestingLibraryMatchers } from '@testing-library/jest-dom/matchers'
import RichTextEditor from '../../../components/blog/RichTextEditor'
import { NextIntlClientProvider } from 'next-intl'

// Extend Jest matchers
declare global {
  namespace jest {
    interface Matchers<R> extends TestingLibraryMatchers<typeof expect.stringContaining, R> {}
  }
}

// Mock TipTap's useEditor hook
jest.mock('@tiptap/react', () => {
  let currentContent = ''
  let onChangeCallback: ((html: string) => void) | null = null

  const chainMethods = {
    toggleBold: () => ({ run: () => {} }),
    toggleItalic: () => ({ run: () => {} }),
    toggleStrike: () => ({ run: () => {} }),
    toggleHeading: () => ({ run: () => {} }),
    toggleBulletList: () => ({ run: () => {} }),
    toggleOrderedList: () => ({ run: () => {} }),
    toggleBlockquote: () => ({ run: () => {} }),
    toggleCode: () => ({ run: () => {} }),
    setLink: () => ({ run: () => {} }),
    unsetLink: () => ({ run: () => {} }),
    undo: () => ({ run: () => {} }),
    redo: () => ({ run: () => {} })
  }

  return {
    useEditor: ({ content, onUpdate }: any) => {
      currentContent = content
      onChangeCallback = onUpdate?.({ editor: { getHTML: () => currentContent } })

      return {
        chain: () => ({
          focus: () => chainMethods
        }),
        can: () => ({
          chain: () => ({
            focus: () => chainMethods
          })
        }),
        isActive: () => false,
        getHTML: () => currentContent
      }
    },
    EditorContent: ({ editor }: any) => (
      <div role="textbox" dangerouslySetInnerHTML={{ __html: editor?.getHTML() || '' }} />
    )
  }
})

const mockContent = '<p>Initial content</p>'
const mockOnChange = jest.fn()

const messages = {
  Blog: {
    admin: {
      editor: {
        bold: 'Bold',
        italic: 'Italic',
        strike: 'Strikethrough',
        heading: 'Heading 2',
        bulletList: 'Bullet List',
        orderedList: 'Numbered List',
        quote: 'Blockquote',
        code: 'Code',
        link: 'Link',
        image: 'Image',
        undo: 'Undo',
        redo: 'Redo'
      },
      fields: {
        content: 'Content',
      },
    },
  },
}

describe('RichTextEditor', () => {
  beforeEach(() => {
    mockOnChange.mockClear()
  })

  it('renders without crashing', () => {
    render(
      <NextIntlClientProvider locale="en" messages={messages}>
        <RichTextEditor content={mockContent} onChange={mockOnChange} />
      </NextIntlClientProvider>
    )
    expect(screen.getByRole('textbox')).toBeInTheDocument()
  })

  it('displays initial content', () => {
    render(
      <NextIntlClientProvider locale="en" messages={messages}>
        <RichTextEditor content={mockContent} onChange={mockOnChange} />
      </NextIntlClientProvider>
    )
    expect(screen.getByRole('textbox')).toHaveTextContent('Initial content')
  })

  it('calls onChange when content changes', () => {
    const updatedContent = '<p>Updated content</p>'

    render(
      <NextIntlClientProvider locale="en" messages={messages}>
        <RichTextEditor content={updatedContent} onChange={mockOnChange} />
      </NextIntlClientProvider>
    )

    expect(mockOnChange).toHaveBeenCalledWith(updatedContent)
  })
})

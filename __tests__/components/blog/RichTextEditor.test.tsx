/**
 * @jest-environment jsdom
 */
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import { expect, describe, it, beforeEach, vi } from 'vitest'
import type { TestingLibraryMatchers } from '@testing-library/jest-dom/matchers'
import RichTextEditor from '../../../components/blog/RichTextEditor'
import { NextIntlClientProvider, useTranslations } from 'next-intl'

// Extend Jest matchers
declare global {
  namespace jest {
    interface Matchers<R> extends TestingLibraryMatchers<typeof expect.stringContaining, R> {}
  }
}

// Define richer mock messages including Media namespace
const mockMessages: Record<string, any> = {
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
        redo: 'Redo',
      },
      fields: {
        content: 'Content',
      },
    },
  },
  Media: {
    uploadError: 'Media upload failed',
    select: 'Select Media',
    title: 'Media Library',
  },
  Common: {
    loading: 'Loading...',
    error: 'An error occurred',
    save: 'Save',
    cancel: 'Cancel',
    delete: 'Delete',
    confirm: 'Confirm',
  },
}

// Mock next-intl useTranslations (Robust version)
vi.mock('next-intl', async (importOriginal) => {
  const mod = await importOriginal<typeof import('next-intl')>();
  return {
    ...mod,
    useTranslations: (namespace: string) => {
      return (key: string) => {
        let current = mockMessages;
        const namespaceParts = namespace ? namespace.split('.') : [];
        for (const part of namespaceParts) {
          if (current && typeof current === 'object' && part in current) {
            current = current[part];
          } else {
            return `${namespace}.${key}`;
          }
        }

        if (current && typeof current === 'object') {
          const keyParts = key ? key.split('.') : [];
          let value = current;
          for (const part of keyParts) {
            if (value && typeof value === 'object' && part in value) {
              value = value[part];
            } else {
              return `${namespace}.${key}`;
            }
          }
          return typeof value === 'string' ? value : `${namespace}.${key}`;
        }
        return `${namespace}.${key}`;
      };
    },
  };
});

// Mock TipTap's useEditor hook
vi.mock('@tiptap/react', () => {
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
      if (onUpdate) {
        onChangeCallback = onUpdate({ editor: { getHTML: () => currentContent } });
      }

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

// --- Mock MediaSelector ---
// Mock the MediaSelector component used within RichTextEditor
vi.mock('@/components/media/MediaSelector', () => ({
  __esModule: true,
  default: ({ onSelect, onClose }: { onSelect: (url: string) => void; onClose: () => void }) => (
    <div data-testid="mock-media-selector">
      <button onClick={() => { onSelect('https://example.com/selected-image.jpg'); onClose(); }}>
        Mock Select Image
      </button>
      <button onClick={onClose}>Mock Close Selector</button>
    </div>
  ),
}));

const mockContent = '<p>Initial content</p>'
const mockOnChange = vi.fn()

describe('RichTextEditor', () => {
  beforeEach(() => {
    mockOnChange.mockClear()
    vi.clearAllMocks();
  })

  const renderEditor = (content = mockContent) => {
     return render(
      <NextIntlClientProvider locale="en" messages={mockMessages}>
        <RichTextEditor content={content} onChange={mockOnChange} />
      </NextIntlClientProvider>
    )
  }

  it('renders without crashing', () => {
    renderEditor()
    expect(screen.getByRole('textbox')).toBeInTheDocument()
  })

  it('displays initial content', () => {
    renderEditor()
    expect(screen.getByRole('textbox')).toHaveTextContent('Initial content')
  })

  it('calls onChange when content changes (via mock setup)', () => {
    const updatedContent = '<p>Updated content</p>'
    renderEditor(updatedContent)
    expect(mockOnChange).toHaveBeenCalledWith(updatedContent)
  })
})

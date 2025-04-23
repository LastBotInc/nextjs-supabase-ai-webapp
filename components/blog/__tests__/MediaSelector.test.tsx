/**
 * @jest-environment jsdom
 */
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import MediaSelector from '../MediaSelector'
import { MediaAsset } from '@/types/media'
import { setupSupabaseEnv } from '@/__tests__/utils/supabase'

// Set up environment variables
setupSupabaseEnv()

// Mock next-intl
vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => {
    const translations: Record<string, string> = {
      'Media.title': 'selectMedia',
      'Media.close': 'close',
      'Media.cancel': 'cancel',
      'Media.select': 'select'
    }
    return translations[key] || key
  }
}))

// Mock Supabase client
vi.mock('@/utils/supabase/client', () => ({
  createClient: () => ({
    from: () => ({
      select: () => ({
        order: () => ({
          range: () => ({
            data: [],
            error: null
          })
        })
      })
    })
  })
}))

// Mock MediaGrid component
vi.mock('@/app/[locale]/admin/media/MediaGrid', () => ({
  MediaGrid: ({ onAssetSelect }: { onAssetSelect: (asset: MediaAsset) => void }) => {
    const mockAsset: MediaAsset = {
      id: '1',
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01'),
      title: 'Test 1',
      description: null,
      altText: 'Test 1',
      filename: 'test1.jpg',
      fileSize: 1024,
      mimeType: 'image/jpeg',
      width: 800,
      height: 600,
      originalUrl: 'test1.jpg',
      optimizedUrl: null,
      thumbnailUrl: null,
      metadata: {},
      userId: 'user1',
      isGenerated: false,
      generationPrompt: null,
      generationStyle: null
    }

    return (
      <div>
        <img 
          src={mockAsset.originalUrl} 
          alt={mockAsset.altText || ''} 
          onClick={() => onAssetSelect(mockAsset)}
        />
      </div>
    )
  }
}))

// Mock MediaDetails component
vi.mock('@/app/[locale]/admin/media/MediaDetails', () => ({
  MediaDetails: ({ asset }: { asset: MediaAsset | null }) => {
    if (!asset) return null
    return (
      <div>
        <h2>{asset.title}</h2>
        <p>{asset.description}</p>
      </div>
    )
  }
}))

// Mock UploadZone component
vi.mock('@/app/[locale]/admin/media/UploadZone', () => ({
  UploadZone: () => <div>Upload Zone</div>
}))

// Mock SearchFilter component
vi.mock('@/app/[locale]/admin/media/SearchFilter', () => ({
  SearchFilter: () => <div>Search Filter</div>
}))

describe('MediaSelector', () => {
  const mockOnSelect = vi.fn()
  const mockOnClose = vi.fn()
  const defaultProps = {
    onSelect: mockOnSelect,
    onClose: mockOnClose,
    isOpen: true
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders media selector', () => {
    render(<MediaSelector {...defaultProps} />)
    expect(screen.getByText('selectMedia')).toBeInTheDocument()
  })

  it('handles image selection', async () => {
    render(<MediaSelector {...defaultProps} />)
    
    await waitFor(() => {
      expect(screen.getByAltText('Test 1')).toBeInTheDocument()
    })

    // Click the image to select it
    fireEvent.click(screen.getByAltText('Test 1'))
    
    // Click the select button
    const selectButton = screen.getByRole('button', { name: 'select' })
    expect(selectButton).not.toBeDisabled()
    fireEvent.click(selectButton)

    expect(mockOnSelect).toHaveBeenCalledWith(expect.objectContaining({
      id: '1',
      title: 'Test 1'
    }))
  })

  it('handles close', () => {
    render(<MediaSelector {...defaultProps} />)
    const closeButton = screen.getByRole('button', { name: 'close' })
    fireEvent.click(closeButton)
    expect(mockOnClose).toHaveBeenCalled()
  })
}) 
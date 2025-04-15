/**
 * @jest-environment jsdom
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { UploadZone } from '../UploadZone'

// Mock next-intl using vi
vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key
}))

// Mock @heroicons/react/24/outline using vi
vi.mock('@heroicons/react/24/outline', () => ({
  ArrowUpTrayIcon: () => <div data-testid="upload-icon" />
}))

// Mock fetch using vi
global.fetch = vi.fn()

// Mock FormData
class MockFormData {
  data: Map<string, string | Blob>
  constructor() {
    this.data = new Map()
  }
  append(key: string, value: string | Blob) {
    this.data.set(key, value)
  }
  get(key: string) {
    return this.data.get(key)
  }
  getAll(key: string) {
    return [this.data.get(key)]
  }
  has(key: string) {
    return this.data.has(key)
  }
  delete(key: string) {
    this.data.delete(key)
  }
  forEach(callback: (value: string | Blob, key: string) => void) {
    this.data.forEach((value, key) => callback(value, key))
  }
  *entries() {
    yield* this.data.entries()
  }
  *keys() {
    yield* this.data.keys()
  }
  *values() {
    yield* this.data.values()
  }
}

// @ts-expect-error Mock FormData for testing purposes
global.FormData = MockFormData

// Mock file input using vi
window.URL.createObjectURL = vi.fn()

describe('UploadZone', () => {
  const mockOnFilesSelected = vi.fn()
  const defaultProps = {
    onFilesSelected: mockOnFilesSelected,
    uploads: []
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders upload zone', () => {
    render(<UploadZone {...defaultProps} />)
    expect(screen.getByText('dropzoneText')).toBeInTheDocument()
  })

  it('handles file upload', async () => {
    render(<UploadZone {...defaultProps} />)

    const file = new File(['test'], 'test.png', { type: 'image/png' })
    const input = screen.getByTestId('file-input')
    
    fireEvent.change(input, { target: { files: [file] } })
    
    await waitFor(() => {
      expect(mockOnFilesSelected).toHaveBeenCalledWith([file])
    })
  })
}) 
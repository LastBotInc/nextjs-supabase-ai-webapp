/**
 * @jest-environment jsdom
 */
import { describe, it, expect } from '@jest/globals'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import { UploadZone } from '../UploadZone'

// Mock next-intl
jest.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key
}))

// Mock @heroicons/react/24/outline
jest.mock('@heroicons/react/24/outline', () => ({
  ArrowUpTrayIcon: () => <div data-testid="upload-icon" />
}))

// Mock fetch
global.fetch = jest.fn()

// Mock FormData
class MockFormData {
  data: Map<string, unknown>
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

// Mock file input
window.URL.createObjectURL = jest.fn()

describe('UploadZone', () => {
  const mockOnFilesSelected = jest.fn()
  const defaultProps = {
    onFilesSelected: mockOnFilesSelected,
    uploads: []
  }

  beforeEach(() => {
    jest.clearAllMocks()
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
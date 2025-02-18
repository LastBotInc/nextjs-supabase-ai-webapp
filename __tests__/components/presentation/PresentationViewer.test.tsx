import { render, screen, fireEvent } from '@testing-library/react'
import { vi } from 'vitest'
import PresentationViewer from '@/app/components/presentation/PresentationViewer'

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    back: vi.fn(),
  }),
}))

// Mock next-intl
vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
}))

describe('PresentationViewer', () => {
  const mockPresentation = {
    id: 'test-presentation',
    title: 'Test Presentation',
    description: 'Test Description',
    preview_image: '/test.jpg',
    slides: [
      {
        id: '1',
        title: 'Slide 1',
        content: '<p>Content 1</p>',
        background_image: '/test1.jpg',
        transition: 'fade' as const,
      },
      {
        id: '2',
        title: 'Slide 2',
        content: '<p>Content 2</p>',
        background_image: '/test2.jpg',
        transition: 'slide' as const,
      },
    ],
    created_at: '2024-01-27T00:00:00Z',
    updated_at: '2024-01-27T00:00:00Z',
    locale: 'en'
  }

  it('renders the first slide by default', () => {
    render(<PresentationViewer presentation={mockPresentation} locale="en" />)
    expect(screen.getByText('Slide 1')).toBeInTheDocument()
    expect(screen.getByText('Content 1')).toBeInTheDocument()
  })

  it('navigates to next slide when clicking next button', () => {
    render(<PresentationViewer presentation={mockPresentation} locale="en" />)
    const nextButton = screen.getByRole('button', { name: /next/i })
    fireEvent.click(nextButton)
    expect(screen.getByText('Slide 2')).toBeInTheDocument()
    expect(screen.getByText('Content 2')).toBeInTheDocument()
  })

  it('navigates to previous slide when clicking previous button', () => {
    render(<PresentationViewer presentation={mockPresentation} locale="en" />)
    // Go to second slide first
    const nextButton = screen.getByRole('button', { name: /next/i })
    fireEvent.click(nextButton)
    // Then go back
    const prevButton = screen.getByRole('button', { name: /previous/i })
    fireEvent.click(prevButton)
    expect(screen.getByText('Slide 1')).toBeInTheDocument()
    expect(screen.getByText('Content 1')).toBeInTheDocument()
  })

  it('navigates slides with keyboard arrows', () => {
    render(<PresentationViewer presentation={mockPresentation} locale="en" />)
    // Press right arrow
    fireEvent.keyDown(window, { key: 'ArrowRight' })
    expect(screen.getByText('Slide 2')).toBeInTheDocument()
    // Press left arrow
    fireEvent.keyDown(window, { key: 'ArrowLeft' })
    expect(screen.getByText('Slide 1')).toBeInTheDocument()
  })

  it('shows progress indicators', () => {
    render(<PresentationViewer presentation={mockPresentation} locale="en" />)
    const indicators = screen.getAllByRole('button')
    expect(indicators).toHaveLength(4) // 2 navigation buttons + 2 slide indicators
  })

  it('handles empty slides gracefully', () => {
    const emptyPresentation = {
      ...mockPresentation,
      slides: [],
    }
    render(<PresentationViewer presentation={emptyPresentation} locale="en" />)
    expect(screen.getByText('noPresentations')).toBeInTheDocument()
  })
}) 
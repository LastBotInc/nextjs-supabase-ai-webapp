import { render, screen } from '@testing-library/react'
import ImagePlaceholder from '../ImagePlaceholder'

describe('ImagePlaceholder', () => {
  it('renders title and subtitle correctly', () => {
    render(
      <ImagePlaceholder
        title="Test Title"
        subtitle="Test Subtitle"
      />
    )

    expect(screen.getByText('Test Title')).toBeInTheDocument()
    expect(screen.getByText('Test Subtitle')).toBeInTheDocument()
  })

  it('renders only title when subtitle is not provided', () => {
    render(
      <ImagePlaceholder
        title="Test Title"
      />
    )

    expect(screen.getByText('Test Title')).toBeInTheDocument()
    expect(screen.queryByText('Test Subtitle')).not.toBeInTheDocument()
  })

  it('applies custom className correctly', () => {
    const { container } = render(
      <ImagePlaceholder
        title="Test Title"
        className="custom-class"
      />
    )

    expect(container.firstChild).toHaveClass('custom-class')
  })
}) 
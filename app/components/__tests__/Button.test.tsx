/**
 * @jest-environment jsdom
 */
import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import { Button } from '../Button'

// Mock next-intl navigation
jest.mock('@/app/i18n/navigation', () => ({
  Link: ({ href, children, className }: any) => (
    <a href={href} className={className}>{children}</a>
  )
}));

describe('Button', () => {
  it('renders children correctly', () => {
    render(<Button>Click me</Button>)
    expect(screen.getByRole('button', { name: 'Click me' })).toBeInTheDocument()
  })

  it('applies correct size classes', () => {
    const { rerender } = render(<Button size="sm">Small</Button>)
    const smallButton = screen.getByRole('button', { name: 'Small' })
    expect(smallButton).toHaveClass('text-sm h-8 px-3')

    rerender(<Button size="md">Medium</Button>)
    const mediumButton = screen.getByRole('button', { name: 'Medium' })
    expect(mediumButton).toHaveClass('text-base h-10 px-4')

    rerender(<Button size="lg">Large</Button>)
    const largeButton = screen.getByRole('button', { name: 'Large' })
    expect(largeButton).toHaveClass('text-lg h-12 px-6')
  })

  it('applies correct variant classes', () => {
    const { rerender } = render(<Button variant="primary">Primary</Button>)
    const primaryButton = screen.getByRole('button', { name: 'Primary' })
    expect(primaryButton).toHaveClass('bg-foreground text-background hover:bg-[#383838] dark:hover:bg-[#ccc]')

    rerender(<Button variant="secondary">Secondary</Button>)
    const secondaryButton = screen.getByRole('button', { name: 'Secondary' })
    expect(secondaryButton).toHaveClass('bg-black/[.05] dark:bg-white/[.06] hover:bg-black/[.1] dark:hover:bg-white/[.1]')

    rerender(<Button variant="outline">Outline</Button>)
    const outlineButton = screen.getByRole('button', { name: 'Outline' })
    expect(outlineButton).toHaveClass('border border-solid border-black/[.1] dark:border-white/[.1] hover:bg-black/[.05] dark:hover:bg-white/[.05]')
  })

  it('handles click events', () => {
    const handleClick = jest.fn()
    render(<Button onClick={handleClick}>Click me</Button>)

    const button = screen.getByRole('button', { name: 'Click me' })
    fireEvent.click(button)
    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  it('merges custom className with default classes', () => {
    render(<Button className="custom-class">Custom</Button>)
    const button = screen.getByRole('button', { name: 'Custom' })

    expect(button).toHaveClass('custom-class')
    expect(button).toHaveClass('rounded-full') // Base class
    expect(button).toHaveClass('font-medium') // Base class
    expect(button).toHaveClass('transition-colors') // Base class
  })

  it('renders as a localized link when href is provided', () => {
    render(<Button href="/test">Link Button</Button>)
    const link = screen.getByRole('link', { name: 'Link Button' })
    expect(link).toHaveAttribute('href', '/test')
  })

  it('is keyboard accessible', () => {
    const handleClick = jest.fn()
    render(<Button onClick={handleClick}>Press me</Button>)
    
    const button = screen.getByRole('button', { name: 'Press me' })
    button.focus()
    expect(button).toHaveFocus()
    
    fireEvent.keyDown(button, { key: 'Enter', code: 'Enter' })
    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  it('applies base styles consistently', () => {
    render(<Button>Test Button</Button>)
    const button = screen.getByRole('button', { name: 'Test Button' })
    
    // Check all base styles are applied
    expect(button).toHaveClass('rounded-full')
    expect(button).toHaveClass('font-medium')
    expect(button).toHaveClass('transition-colors')
    expect(button).toHaveClass('flex')
    expect(button).toHaveClass('items-center')
    expect(button).toHaveClass('justify-center')
    expect(button).toHaveClass('gap-2')
  })
})

import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import '@testing-library/jest-dom'
import ContactForm from '@/components/contact/ContactForm'
import { createClient } from '@/utils/supabase/client'

// Mock next-intl
jest.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
}))

// Mock Supabase client
const mockInsert = jest.fn()
const mockFrom = jest.fn(() => ({
  insert: mockInsert
}))

jest.mock('@/utils/supabase/client', () => ({
  createClient: jest.fn(() => ({
    from: mockFrom
  }))
}))

describe('ContactForm', () => {
  beforeEach(() => {
    mockInsert.mockClear()
    mockFrom.mockClear()
    mockInsert.mockResolvedValue({ error: null })
  })

  it('renders all form fields', () => {
    render(<ContactForm />)
    
    expect(screen.getByLabelText(/form.name/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/form.company/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/form.email/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/form.description/i)).toBeInTheDocument()
  })

  it('validates required fields', async () => {
    render(<ContactForm />)
    
    // Try to submit empty form
    const form = screen.getByTestId('contact-form')
    fireEvent.submit(form)

    // Wait for validation attributes to be set
    await waitFor(() => {
      expect(screen.getByLabelText(/form.name/i)).toHaveAttribute('required')
      expect(screen.getByLabelText(/form.email/i)).toHaveAttribute('required')
      expect(screen.getByLabelText(/form.description/i)).toHaveAttribute('required')
    })
  })

  it('validates email format', async () => {
    const user = userEvent.setup()
    render(<ContactForm />)
    
    const emailInput = screen.getByLabelText(/form.email/i)
    await user.type(emailInput, 'invalid-email')
    
    // Wait for aria-invalid to be set
    await waitFor(() => {
      expect(emailInput).toHaveAttribute('aria-invalid', 'true')
    })
    
    // Fix the email
    await user.clear(emailInput)
    await user.type(emailInput, 'valid@email.com')
    
    await waitFor(() => {
      expect(emailInput).not.toHaveAttribute('aria-invalid', 'true')
    })
  })

  it('submits form data successfully', async () => {
    const user = userEvent.setup()
    render(<ContactForm />)
    
    // Fill in the form
    await user.type(screen.getByLabelText(/form.name/i), 'John Doe')
    await user.type(screen.getByLabelText(/form.company/i), 'ACME Inc')
    await user.type(screen.getByLabelText(/form.email/i), 'john@example.com')
    await user.type(screen.getByLabelText(/form.description/i), 'Test message content')
    
    // Submit the form
    await user.click(screen.getByRole('button', { name: /form.submit/i }))
    
    // Verify Supabase was called with correct data
    await waitFor(() => {
      expect(mockFrom).toHaveBeenCalledWith('contacts')
      expect(mockInsert).toHaveBeenCalledWith({
        name: 'John Doe',
        company: 'ACME Inc',
        email: 'john@example.com',
        description: 'Test message content'
      })
    })
    
    // Verify success message is shown
    expect(await screen.findByText(/form.success.title/i)).toBeInTheDocument()
  })

  it('handles submission error', async () => {
    const errorMessage = 'Test error message'
    mockInsert.mockResolvedValueOnce({ error: { message: errorMessage } })
    
    const user = userEvent.setup()
    render(<ContactForm />)
    
    // Fill in the form
    await user.type(screen.getByLabelText(/form.name/i), 'John Doe')
    await user.type(screen.getByLabelText(/form.email/i), 'john@example.com')
    await user.type(screen.getByLabelText(/form.description/i), 'Test message')
    
    // Submit the form
    await user.click(screen.getByRole('button', { name: /form.submit/i }))
    
    // Verify error message is shown
    expect(await screen.findByText(errorMessage)).toBeInTheDocument()
  })
}) 
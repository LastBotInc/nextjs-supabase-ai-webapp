import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import '@testing-library/jest-dom'
import { expect, vi } from 'vitest'
import { useState } from 'react'
import type { TestingLibraryMatchers } from '@testing-library/jest-dom/matchers'

// Declare variables in the outer scope
let mockInsert: ReturnType<typeof vi.fn>;
let mockFrom: ReturnType<typeof vi.fn>;
let mockCreateClientInternal: ReturnType<typeof vi.fn>;

// Extend expect matchers for Vitest
declare global {
  namespace Vi {
    interface Assertion<T = any> extends TestingLibraryMatchers<typeof expect.stringContaining, T> {}
    interface AsymmetricMatchersContaining extends TestingLibraryMatchers<typeof expect.stringContaining, unknown> {}
  }
}

// Mock next-intl using vi
vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
}))

// Define an interface for the mocked module structure
interface MockedSupabaseClientModule {
  createClient: ReturnType<typeof vi.fn>;
  __mocks__: { 
    mockInsert: ReturnType<typeof vi.fn>;
  };
}

// Explicitly mock the aliased path first
vi.mock('@/utils/supabase/client', () => {
  // Define the entire mock structure directly
  const mockInsert = vi.fn();
  return {
    createClient: vi.fn(() => ({
      from: vi.fn(() => ({ insert: mockInsert }))
    })),
    // Expose the inner mock function for testing/resetting
    __mocks__: { mockInsert }
  };
});

// Mock TurnstileWidget as it relies on external scripts/API
vi.mock('@/components/ui/turnstile', () => ({
  TurnstileWidget: ({ onVerify }: { onVerify: (token: string) => void }) => {
    // Immediately call onVerify with a dummy token for testing
    useState(() => {
      onVerify('mock-turnstile-token');
    });
    return <div data-testid="mock-turnstile">Mock Turnstile</div>;
  }
}));

// Mock fetch for API calls using vi
global.fetch = vi.fn(async (url: string | URL | Request): Promise<Response> => {
  const urlString = url.toString();
  
  // Mock successful Turnstile validation
  if (urlString.endsWith('/api/auth/validate-turnstile')) { 
    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  // Handle other URLs (e.g., for potential future fetch calls)
  // You might want to add more specific mocks if needed
  return new Response(null, { status: 404, statusText: 'Not Found' }); 
});

// Now import the component that uses the mocked client
import ContactForm from '@/components/contact/ContactForm'

describe('ContactForm', () => {
  let mockInsert: ReturnType<typeof vi.fn>; // Variable to hold the reference

  beforeEach(async () => { // Make beforeEach async
    // Import the mock *after* vi.mock has run and assert its type
    const mockedModule = await import('@/utils/supabase/client') as unknown as MockedSupabaseClientModule;
    mockInsert = mockedModule.__mocks__.mockInsert; // Assign the inner mock
    
    vi.clearAllMocks(); 
    mockInsert.mockResolvedValue({ error: null }); 
  })

  it('renders all form fields and mock turnstile', () => {
    render(<ContactForm />)
    expect(screen.getByLabelText(/form.name/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/form.company/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/form.email/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/form.description/i)).toBeInTheDocument()
    expect(screen.getByTestId('mock-turnstile')).toBeInTheDocument()
  })

  it('validates required fields', async () => {
    render(<ContactForm />)
    const form = screen.getByTestId('contact-form')
    fireEvent.submit(form)
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
    await waitFor(() => {
      // Check aria-invalid based on component logic
      expect(emailInput).toHaveAttribute('aria-invalid', 'true') 
    })
    await user.clear(emailInput)
    await user.type(emailInput, 'valid@email.com')
    await waitFor(() => {
      expect(emailInput).toHaveAttribute('aria-invalid', 'false')
    })
  })

  it('submits form data successfully', async () => {
    const user = userEvent.setup()
    render(<ContactForm />)
    
    await user.type(screen.getByLabelText(/form.name/i), 'John Doe')
    await user.type(screen.getByLabelText(/form.company/i), 'ACME Inc')
    await user.type(screen.getByLabelText(/form.email/i), 'john@example.com')
    await user.type(screen.getByLabelText(/form.description/i), 'Test message content')
    
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /form.submit/i })).not.toBeDisabled();
    });

    await user.click(screen.getByRole('button', { name: /form.submit/i }))
    
    await waitFor(() => {
      // Check the mockInsert directly
      expect(mockInsert).toHaveBeenCalledWith({
        name: 'John Doe',
        company: 'ACME Inc',
        email: 'john@example.com',
        description: 'Test message content'
      })
    })
    
    expect(await screen.findByText(/form.success.title/i)).toBeInTheDocument()
  })

  it('handles submission error', async () => {
    const errorMessage = 'Test error message'
    // Reset mockInsert for this test
    mockInsert.mockResolvedValueOnce({ error: { message: errorMessage } });
    
    const user = userEvent.setup()
    render(<ContactForm />)
    
    await user.type(screen.getByLabelText(/form.name/i), 'John Doe')
    await user.type(screen.getByLabelText(/form.email/i), 'john@example.com')
    await user.type(screen.getByLabelText(/form.description/i), 'Test message for error')
    
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /form.submit/i })).not.toBeDisabled();
    });

    await user.click(screen.getByRole('button', { name: /form.submit/i }))
    
    await waitFor(() => {
      expect(screen.getByText(errorMessage)).toBeInTheDocument()
    })
  })
}) 
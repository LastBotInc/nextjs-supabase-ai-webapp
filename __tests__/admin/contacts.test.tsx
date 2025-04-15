import '@testing-library/jest-dom'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { vi, expect, describe, it, beforeEach } from 'vitest'
import { createClient } from '@/utils/supabase/client'
import AdminContactsPage from '@/app/[locale]/admin/contacts/page'
import { useAuth } from '@/components/auth/AuthProvider'

// Mock next-intl
vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
}))

// Mock Supabase client
vi.mock('@/utils/supabase/client', () => ({
  createClient: vi.fn(),
}))

// Mock useAuth hook
vi.mock('@/components/auth/AuthProvider', () => ({
  useAuth: () => ({
    session: { user: { id: 'test-admin-id' }, access_token: 'test-token' },
    user: { id: 'test-admin-id' },
    isAdmin: true,
    loading: false,
    isAuthenticated: true,
    error: null,
  }),
}))

describe('AdminContactsPage', () => {
  const mockContacts = [
    {
      id: '1',
      created_at: '2024-01-01T12:00:00Z',
      name: 'John Doe',
      company: 'Test Company',
      email: 'john@example.com',
      description: 'Test message',
      status: 'new'
    }
  ]

  // Define types for mocks
  type MockSupabaseClient = {
    from: any;
  };
  
  let mockSupabase: MockSupabaseClient;
  let mockErrorSupabase: MockSupabaseClient;

  beforeEach(() => {
    vi.clearAllMocks();

    mockSupabase = {
      from: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          order: vi.fn().mockResolvedValue({ data: mockContacts, error: null })
        }),
        update: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({ error: null })
        }),
        delete: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({ error: null })
        })
      })
    };
    mockErrorSupabase = {
      from: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          order: vi.fn().mockResolvedValue({ data: mockContacts, error: null })
        }),
        delete: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({ error: new Error('Delete failed') })
        })
      })
    };
    (createClient as any).mockReturnValue(mockSupabase);

    window.confirm = vi.fn(() => true);
  })

  it('renders contacts table', async () => {
    render(<AdminContactsPage />)
    
    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument()
      expect(screen.getByText('Test Company')).toBeInTheDocument()
      expect(screen.getByText('john@example.com')).toBeInTheDocument()
    })
  })

  it('updates contact status', async () => {
    render(<AdminContactsPage />)
    
    await screen.findByText('John Doe')

    const statusSelect = screen.getByRole('combobox')
    fireEvent.change(statusSelect, { target: { value: 'in_progress' } })

    await waitFor(() => {
      expect(mockSupabase.from).toHaveBeenCalledWith('contacts');
    })
  })

  it('deletes contact after confirmation', async () => {
    render(<AdminContactsPage />)
    
    await screen.findByText('John Doe')

    const deleteButton = screen.getByText('delete')
    fireEvent.click(deleteButton)

    expect(window.confirm).toHaveBeenCalledWith('deleteConfirmation')
    
    await waitFor(() => {
        expect(mockSupabase.from).toHaveBeenCalledWith('contacts');
    })
  })

  it('shows error message when delete fails', async () => {
    (createClient as any).mockReturnValue(mockErrorSupabase);

    render(<AdminContactsPage />);
    
    await screen.findByText('John Doe')

    const deleteButton = screen.getByText('delete')
    fireEvent.click(deleteButton)

    expect(window.confirm).toHaveBeenCalledWith('deleteConfirmation')

    expect(await screen.findByText('Delete failed')).toBeInTheDocument()
  })
}) 
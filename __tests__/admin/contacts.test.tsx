import '@testing-library/jest-dom'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { jest, expect, describe, it, beforeEach } from '@jest/globals'
import { createClient } from '@/utils/supabase/client'
import AdminContactsPage from '@/app/[locale]/admin/contacts/page'

// Mock next-intl
jest.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
}))

// Mock Supabase client
jest.mock('@/utils/supabase/client', () => ({
  createClient: jest.fn(),
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

  const mockSupabase = {
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        order: jest.fn(() => Promise.resolve({ data: mockContacts, error: null }))
      })),
      update: jest.fn(() => ({
        eq: jest.fn(() => Promise.resolve({ error: null }))
      })),
      delete: jest.fn(() => ({
        eq: jest.fn(() => Promise.resolve({ error: null }))
      }))
    }))
  }

  beforeEach(() => {
    ;(createClient as jest.Mock).mockReturnValue(mockSupabase)
    // Mock window.confirm
    window.confirm = jest.fn(() => true)
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
    
    await waitFor(() => {
      const statusSelect = screen.getByRole('combobox')
      fireEvent.change(statusSelect, { target: { value: 'in_progress' } })
    })

    expect(mockSupabase.from).toHaveBeenCalledWith('contacts')
  })

  it('deletes contact after confirmation', async () => {
    render(<AdminContactsPage />)
    
    await waitFor(() => {
      const deleteButton = screen.getByText('Admin.contacts.delete')
      fireEvent.click(deleteButton)
    })

    expect(window.confirm).toHaveBeenCalled()
    expect(mockSupabase.from).toHaveBeenCalledWith('contacts')
  })

  it('shows error message when delete fails', async () => {
    const mockErrorSupabase = {
      from: jest.fn(() => ({
        select: jest.fn(() => ({
          order: jest.fn(() => Promise.resolve({ data: mockContacts, error: null }))
        })),
        delete: jest.fn(() => ({
          eq: jest.fn(() => Promise.resolve({ error: new Error('Delete failed') }))
        }))
      }))
    }
    ;(createClient as jest.Mock).mockReturnValue(mockErrorSupabase)

    render(<AdminContactsPage />)
    
    await waitFor(() => {
      const deleteButton = screen.getByText('Admin.contacts.delete')
      fireEvent.click(deleteButton)
    })

    expect(await screen.findByText('Delete failed')).toBeInTheDocument()
  })
}) 
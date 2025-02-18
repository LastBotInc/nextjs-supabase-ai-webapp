/**
 * @jest-environment jsdom
 */
/// <reference types="@testing-library/jest-dom" />
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { expect } from '@jest/globals';
import { MediaDashboard } from '@/app/[locale]/admin/media/MediaDashboard';
import { MediaFilter } from '@/types/media';
import { NextIntlClientProvider } from 'next-intl';

// Extend expect matchers
declare global {
  namespace jest {
    interface Matchers<R> extends TestingLibraryMatchers<typeof expect.stringContaining, R> {}
  }
}

// Mock translations
const messages: Record<string, string> = {
  'Media.noMedia': 'No media files',
  'Media.uploadPrompt': 'Get started by uploading a file',
  'Media.searchPlaceholder': 'Search media...',
  'Media.sortNewest': 'Newest first',
  'Media.sortOldest': 'Oldest first',
  'Media.sortNameAZ': 'Name A-Z',
  'Media.sortNameZA': 'Name Z-A',
  'Media.sortSizeLarge': 'Largest first',
  'Media.sortSizeSmall': 'Smallest first',
  loadError: 'Failed to load media',
  retry: 'Retry'
};

// Mock fetch globally
global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve({ url: 'https://example.com/test.jpg' })
  })
) as jest.Mock;

// Mock Supabase client
const mockUpload = jest.fn().mockResolvedValue({ data: { path: 'test.jpg' }, error: null });
const mockFrom = jest.fn().mockReturnValue({
  upload: mockUpload,
  select: jest.fn().mockResolvedValue({ data: [], error: null })
});

const supabase = {
  storage: {
    from: mockFrom
  },
  from: jest.fn().mockReturnValue({
    select: jest.fn().mockResolvedValue({ data: [], error: null }),
    insert: jest.fn().mockResolvedValue({ data: [{ id: 1 }], error: null })
  })
} as any;

// Mock useAuth hook
jest.mock('@/components/auth/AuthProvider', () => ({
  useAuth: () => ({
    session: { user: { id: 'test-user-id' } },
    isAdmin: true
  })
}));

// Mock useParams hook
jest.mock('next/navigation', () => ({
  useParams: () => ({ locale: 'en' })
}));

// Mock useTranslations hook
jest.mock('next-intl', () => ({
  useTranslations: () => (key: string) => messages[key] || key
}));

describe('MediaDashboard', () => {
  const mockFilter: MediaFilter = {
    sortBy: 'createdAt',
    sortOrder: 'desc',
    search: '',
    type: []
  };

  const mockOnFilterChange = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  const renderDashboard = () => {
    return render(
      <NextIntlClientProvider locale="en" messages={messages}>
        <MediaDashboard 
          filter={mockFilter} 
          onFilterChange={mockOnFilterChange} 
        />
      </NextIntlClientProvider>
    );
  };

  it('handles successful file upload', async () => {
    renderDashboard();

    // Trigger file upload
    const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
    const input = screen.getByTestId('file-input');
    fireEvent.change(input, { target: { files: [file] } });

    // Wait for upload to complete
    await waitFor(() => {
      const statusElement = screen.getByTestId('upload-status');
      expect(statusElement).toHaveTextContent('100%');
    });

    // Verify Supabase calls
    expect(supabase.storage.from).toHaveBeenCalledWith('media');
    expect(mockUpload).toHaveBeenCalled();
    expect(supabase.from).toHaveBeenCalledWith('media');
    expect(supabase.from().insert).toHaveBeenCalledWith(expect.any(Object));
  });

  it('handles upload error from storage', async () => {
    // Mock storage error
    mockUpload.mockRejectedValueOnce(new Error('upload failed: new row violates row-level security policy'));

    renderDashboard();

    // Trigger file upload
    const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
    const input = screen.getByTestId('file-input');
    fireEvent.change(input, { target: { files: [file] } });

    // Wait for error message
    await waitFor(() => {
      const errorElement = screen.getByTestId('upload-error');
      expect(errorElement).toHaveTextContent(/upload failed: new row violates row-level security policy/i);
    });
  });

  it('handles database error', async () => {
    // Mock database error
    supabase.from().insert.mockRejectedValueOnce(
      new Error('database error: new row violates row-level security policy')
    );

    renderDashboard();

    // Trigger file upload
    const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
    const input = screen.getByTestId('file-input');
    fireEvent.change(input, { target: { files: [file] } });

    // Wait for error message
    await waitFor(() => {
      const errorElement = screen.getByTestId('upload-error');
      expect(errorElement).toHaveTextContent(/database error: new row violates row-level security policy/i);
    });
  });
}); 
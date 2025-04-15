import { SupabaseClient } from '@supabase/supabase-js'
import { PostgrestQueryBuilder } from '@supabase/postgrest-js'
import { vi } from 'vitest'
import { Database } from '@/types/database'

export interface MockSupabaseResponse<T> {
  data: T | null
  error: Error | null
}

export class TestSupabaseClient {
  private mockData: Record<string, any[]> = {}
  private mockErrors: Record<string, Error | null> = {}
  private mockResponses: Record<string, MockSupabaseResponse<any>> = {}

  setTableData(table: string, data: any[]) {
    this.mockData[table] = data
  }

  setTableError(table: string, error: Error | null) {
    this.mockErrors[table] = error
  }

  setMockResponse<T>(operation: string, response: MockSupabaseResponse<T>) {
    this.mockResponses[operation] = response
  }

  getMockInstance(): vi.Mocked<Partial<SupabaseClient>> {
    const mockFrom = vi.fn((table: string) => {
      const builder = {
        select: vi.fn(() => ({
          data: this.mockData[table] || [],
          error: this.mockErrors[table] || null,
          single: vi.fn(() => this.mockResponses[`${table}.select.single`] || { data: null, error: null }),
          eq: vi.fn(() => this.mockResponses[`${table}.select.eq`] || { data: [], error: null }),
          order: vi.fn(() => this.mockResponses[`${table}.select.order`] || { data: [], error: null })
        })),
        insert: vi.fn((data: any) => 
          this.mockResponses[`${table}.insert`] || { data, error: this.mockErrors[table] || null }
        ),
        update: vi.fn((data: any) => 
          this.mockResponses[`${table}.update`] || { data, error: this.mockErrors[table] || null }
        ),
        delete: vi.fn(() => 
          this.mockResponses[`${table}.delete`] || { data: null, error: this.mockErrors[table] || null }
        ),
        upsert: vi.fn((data: any) => 
          this.mockResponses[`${table}.upsert`] || { data, error: this.mockErrors[table] || null }
        ),
        // Add required properties from PostgrestQueryBuilder
        url: '',
        headers: {},
      } as unknown as PostgrestQueryBuilder<any, any, any>

      return builder
    })

    // --- Add mock for auth.getSession --- 
    const mockGetSession = vi.fn().mockResolvedValue({
      data: { session: { user: { id: 'test-user-id', email: 'test@example.com' } } },
      error: null
    });
    // --------------------------------------

    return {
      from: mockFrom,
      // Add the mocked auth object
      auth: {
        getSession: mockGetSession,
        // Add other auth methods if needed by tests later
      }
    } as unknown as vi.Mocked<Partial<SupabaseClient>>
  }

  // Helper methods for common test scenarios
  mockSelectSingle<T>(table: string, data: T | null, error: Error | null = null) {
    this.setMockResponse(`${table}.select.single`, { data, error })
  }

  mockSelectByEquals<T>(table: string, data: T[], error: Error | null = null) {
    this.setMockResponse(`${table}.select.eq`, { data, error })
  }

  mockOrderedSelect<T>(table: string, data: T[], error: Error | null = null) {
    this.setMockResponse(`${table}.select.order`, { data, error })
  }

  mockInsert<T>(table: string, response: T | null, error: Error | null = null) {
    this.setMockResponse(`${table}.insert`, { data: response, error })
  }

  mockUpdate<T>(table: string, response: T | null, error: Error | null = null) {
    this.setMockResponse(`${table}.update`, { data: response, error })
  }

  mockDelete(table: string, error: Error | null = null) {
    this.setMockResponse(`${table}.delete`, { data: null, error })
  }

  mockUpsert<T>(table: string, response: T | null, error: Error | null = null) {
    this.setMockResponse(`${table}.upsert`, { data: response, error })
  }
}

// Export the setupSupabaseMock function that's used in the tests
export function setupSupabaseMock(): TestSupabaseClient {
  return new TestSupabaseClient();
}

// Default test data
export const defaultLanguages = [
  { code: 'en', name: 'English', enabled: true },
  { code: 'es', name: 'Spanish', enabled: true },
  { code: 'fr', name: 'French', enabled: true }
]

// Default mock user and session
const mockUser = { id: 'test-user-id', email: 'test@example.com' }
const mockSession = { access_token: 'test-access-token', user: mockUser }

// Function to create a configurable mock Supabase client
export function createMockSupabaseClient(initialData: Record<string, any[]> = {}) {
  let tableData: Record<string, any[]> = { ...initialData }
  let error: any = null
  let singleRow: any = null
  let rpcError: any = null
  let rpcData: any = null
  let sessionData: any = mockSession // Default session

  const mockClient = {
    from: vi.fn().mockImplementation((tableName: string) => {
      const queryBuilder = {
        select: vi.fn().mockReturnThis(),
        insert: vi.fn().mockReturnThis(),
        update: vi.fn().mockReturnThis(),
        delete: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        neq: vi.fn().mockReturnThis(),
        gt: vi.fn().mockReturnThis(),
        gte: vi.fn().mockReturnThis(),
        lt: vi.fn().mockReturnThis(),
        lte: vi.fn().mockReturnThis(),
        in: vi.fn().mockReturnThis(),
        is: vi.fn().mockReturnThis(),
        like: vi.fn().mockReturnThis(),
        ilike: vi.fn().mockReturnThis(),
        or: vi.fn().mockReturnThis(),
        filter: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        range: vi.fn().mockReturnThis(),
        limit: vi.fn().mockReturnThis(),
        single: vi.fn(() => {
          if (error) return Promise.resolve({ data: null, error })
          const data = tableData[tableName]?.[0] || singleRow || null
          return Promise.resolve({ data, error: null })
        }),
        // Mock the promise resolution for query chains
        then: vi.fn((resolve) => {
          if (error) {
            resolve({ data: null, error })
          } else {
            resolve({ data: tableData[tableName] || [], error: null })
          }
        }),
      }
      // Add common query methods that return the query builder
      ;['select', 'insert', 'update', 'delete', 'eq', 'neq', 'gt', 'gte', 'lt', 'lte', 'in', 'is', 'like', 'ilike', 'or', 'filter', 'order', 'range', 'limit'].forEach(method => {
        // @ts-expect-error Dynamic assignment
        queryBuilder[method] = vi.fn().mockReturnThis()
      })

      return queryBuilder
    }),
    rpc: vi.fn().mockImplementation(() => {
      if (rpcError) return Promise.resolve({ data: null, error: rpcError })
      return Promise.resolve({ data: rpcData, error: null })
    }),
    auth: {
      getSession: vi.fn(() => {
        return Promise.resolve({ data: { session: sessionData }, error: null })
      }),
      // Add other auth methods if needed, e.g., signInWithPassword, signOut
      signInWithPassword: vi.fn().mockResolvedValue({ data: { session: sessionData, user: mockUser }, error: null }),
      signOut: vi.fn().mockResolvedValue({ error: null }),
    },
    storage: {
      from: vi.fn().mockReturnThis(),
      upload: vi.fn().mockResolvedValue({ data: { path: 'mock/path/to/file.png' }, error: null }),
      getPublicUrl: vi.fn().mockReturnValue({ data: { publicUrl: 'http://mock.supabase.co/storage/v1/object/public/mock/path/to/file.png' } }),
      // Add other storage methods if needed
    },

    // Helper methods for test setup (can be called on the instance)
    setTableData: (tableName: string, data: any[]) => {
      tableData[tableName] = data
    },
    setError: (err: any) => {
      error = err
    },
    setRpcError: (err: any) => {
      rpcError = err
    },
    setRpcData: (data: any) => {
      rpcData = data
    },
    setSingleRow: (data: any) => {
      singleRow = data
    },
    setSessionData: (data: any) => {
      sessionData = data
    },
    clearTestData: () => {
      tableData = { ...initialData }
      error = null
      singleRow = null
      rpcError = null
      rpcData = null
      sessionData = mockSession
    },
    // Expose mocks for assertion
    mocks: {
      from: vi.fn(), // Re-assign in implementation
      rpc: vi.fn(),  // Re-assign in implementation
      getSession: vi.fn(), // Re-assign in implementation
      // Add other specific mocks if needed
    }
  }

  // Assign mocks for assertion purposes
  mockClient.mocks.from = mockClient.from
  mockClient.mocks.rpc = mockClient.rpc
  mockClient.mocks.getSession = mockClient.auth.getSession


  return mockClient as unknown as SupabaseClient<Database> & {
    setTableData: (tableName: string, data: any[]) => void
    setError: (err: any) => void
    setRpcError: (err: any) => void
    setRpcData: (data: any) => void
    setSingleRow: (data: any) => void
    setSessionData: (data: any) => void
    clearTestData: () => void
    mocks: {
      from: vi.Mock
      rpc: vi.Mock
      getSession: vi.Mock
    }
  }
}

// Helper to set required environment variables
export const setupSupabaseEnv = () => {
  process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co'
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-key'
} 
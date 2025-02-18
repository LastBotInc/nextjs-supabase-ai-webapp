import { SupabaseClient } from '@supabase/supabase-js'
import { PostgrestQueryBuilder } from '@supabase/postgrest-js'

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

  getMockInstance(): jest.Mocked<Partial<SupabaseClient>> {
    const mockFrom = jest.fn((table: string) => {
      const builder = {
        select: jest.fn(() => ({
          data: this.mockData[table] || [],
          error: this.mockErrors[table] || null,
          single: jest.fn(() => this.mockResponses[`${table}.select.single`] || { data: null, error: null }),
          eq: jest.fn(() => this.mockResponses[`${table}.select.eq`] || { data: [], error: null }),
          order: jest.fn(() => this.mockResponses[`${table}.select.order`] || { data: [], error: null })
        })),
        insert: jest.fn((data: any) => 
          this.mockResponses[`${table}.insert`] || { data, error: this.mockErrors[table] || null }
        ),
        update: jest.fn((data: any) => 
          this.mockResponses[`${table}.update`] || { data, error: this.mockErrors[table] || null }
        ),
        delete: jest.fn(() => 
          this.mockResponses[`${table}.delete`] || { data: null, error: this.mockErrors[table] || null }
        ),
        upsert: jest.fn((data: any) => 
          this.mockResponses[`${table}.upsert`] || { data, error: this.mockErrors[table] || null }
        ),
        // Add required properties from PostgrestQueryBuilder
        url: '',
        headers: {},
      } as unknown as PostgrestQueryBuilder<any, any, any>

      return builder
    })

    return {
      from: mockFrom,
    } as unknown as jest.Mocked<Partial<SupabaseClient>>
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

// Default test data
export const defaultLanguages = [
  { code: 'en', name: 'English', enabled: true },
  { code: 'es', name: 'Spanish', enabled: true },
  { code: 'fr', name: 'French', enabled: true }
]

// Helper function to setup Supabase mock
export const setupSupabaseMock = () => {
  const supabaseClient = new TestSupabaseClient()
  
  // Set default test data
  supabaseClient.setTableData('languages', defaultLanguages)
  
  // Mock the createClient function
  jest.mock('@/utils/supabase/client', () => ({
    createClient: jest.fn(() => supabaseClient.getMockInstance())
  }))

  return supabaseClient
}

// Helper to set required environment variables
export const setupSupabaseEnv = () => {
  process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co'
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-key'
} 
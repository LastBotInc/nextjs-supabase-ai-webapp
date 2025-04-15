import { TestSupabaseClient, setupSupabaseMock, setupSupabaseEnv } from './supabase'
import { expect, describe, it, beforeAll, beforeEach } from 'vitest'
import '@testing-library/jest-dom'

describe('Supabase Test Utilities', () => {
  let supabaseClient: TestSupabaseClient

  beforeAll(() => {
    setupSupabaseEnv()
  })

  beforeEach(() => {
    supabaseClient = setupSupabaseMock()
  })

  describe('Basic Table Operations', () => {
    it('should handle basic select query', async () => {
      const testData = [{ id: 1, name: 'Test' }]
      supabaseClient.setTableData('test_table', testData)

      const client = supabaseClient.getMockInstance()
      const result = await client.from!('test_table').select()

      expect(result.data).toEqual(testData)
      expect(result.error).toBeNull()
    })

    it('should handle select with error', async () => {
      const testError = new Error('Test error')
      supabaseClient.setTableError('test_table', testError)

      const client = supabaseClient.getMockInstance()
      const result = await client.from!('test_table').select()

      expect(result.data).toEqual([])
      expect(result.error).toBe(testError)
    })
  })

  describe('Advanced Query Operations', () => {
    it('should handle single row select', async () => {
      const testData = { id: 1, name: 'Test' }
      supabaseClient.mockSelectSingle('test_table', testData)

      const client = supabaseClient.getMockInstance()
      const result = await client.from!('test_table').select().single()

      expect(result.data).toEqual(testData)
      expect(result.error).toBeNull()
    })

    it('should handle filtered select', async () => {
      const testData = [{ id: 1, name: 'Test' }]
      supabaseClient.mockSelectByEquals('test_table', testData)

      const client = supabaseClient.getMockInstance()
      const result = await client.from!('test_table').select().eq('name', 'Test')

      expect(result.data).toEqual(testData)
      expect(result.error).toBeNull()
    })

    it('should handle ordered select', async () => {
      const testData = [
        { id: 1, name: 'A' },
        { id: 2, name: 'B' }
      ]
      supabaseClient.mockOrderedSelect('test_table', testData)

      const client = supabaseClient.getMockInstance()
      const result = await client.from!('test_table').select().order('name')

      expect(result.data).toEqual(testData)
      expect(result.error).toBeNull()
    })
  })

  describe('Mutation Operations', () => {
    it('should handle insert', async () => {
      const testData = { id: 1, name: 'Test' }
      supabaseClient.mockInsert('test_table', testData)

      const client = supabaseClient.getMockInstance()
      const result = await client.from!('test_table').insert({ name: 'Test' })

      expect(result.data).toEqual(testData)
      expect(result.error).toBeNull()
    })

    it('should handle update', async () => {
      const testData = { id: 1, name: 'Updated' }
      supabaseClient.mockUpdate('test_table', testData)

      const client = supabaseClient.getMockInstance()
      const result = await client.from!('test_table').update({ name: 'Updated' })

      expect(result.data).toEqual(testData)
      expect(result.error).toBeNull()
    })

    it('should handle delete', async () => {
      supabaseClient.mockDelete('test_table')

      const client = supabaseClient.getMockInstance()
      const result = await client.from!('test_table').delete()

      expect(result.data).toBeNull()
      expect(result.error).toBeNull()
    })

    it('should handle upsert', async () => {
      const testData = { id: 1, name: 'Upserted' }
      supabaseClient.mockUpsert('test_table', testData)

      const client = supabaseClient.getMockInstance()
      const result = await client.from!('test_table').upsert({ name: 'Upserted' })

      expect(result.data).toEqual(testData)
      expect(result.error).toBeNull()
    })
  })
}) 
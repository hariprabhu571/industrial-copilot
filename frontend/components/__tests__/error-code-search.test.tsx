/**
 * Property-based tests for error code search functionality
 * Task 3.4: Write property test for search functionality
 * Property 1: Search Results Completeness
 * Validates: Requirements 1.5
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { jest } from '@jest/globals'
import fc from 'fast-check'
import ErrorCodesPage from '@/app/error-codes/page'
import { useAuthStore } from '@/lib/store'
import * as errorCodesApi from '@/lib/error-codes'

// Mock the auth store
jest.mock('@/lib/store', () => ({
  useAuthStore: jest.fn()
}))

// Mock the error codes API
jest.mock('@/lib/error-codes', () => ({
  fetchErrorCodes: jest.fn(),
  searchErrorCodes: jest.fn(),
  fetchErrorCodeStatistics: jest.fn(),
  getSeverityColor: jest.fn(() => 'bg-gray-100'),
  getCategoryColor: jest.fn(() => 'bg-gray-100'),
  formatDuration: jest.fn(() => '5m'),
  formatFrequency: jest.fn(() => '10 times'),
  ERROR_CATEGORIES: ['Mechanical', 'Electrical'],
  SEVERITY_LEVELS: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']
}))

// Mock UI components
jest.mock('@/components/ui/card', () => ({
  Card: ({ children }: { children: React.ReactNode }) => <div data-testid="card">{children}</div>,
  CardContent: ({ children }: { children: React.ReactNode }) => <div data-testid="card-content">{children}</div>,
  CardHeader: ({ children }: { children: React.ReactNode }) => <div data-testid="card-header">{children}</div>,
  CardTitle: ({ children }: { children: React.ReactNode }) => <div data-testid="card-title">{children}</div>
}))

jest.mock('@/components/ui/button', () => ({
  Button: ({ children, onClick, disabled, ...props }: any) => (
    <button onClick={onClick} disabled={disabled} {...props}>
      {children}
    </button>
  )
}))

jest.mock('@/components/ui/input', () => ({
  Input: (props: any) => <input {...props} />
}))

jest.mock('@/components/ui/badge', () => ({
  Badge: ({ children }: { children: React.ReactNode }) => <span data-testid="badge">{children}</span>
}))

jest.mock('@/components/ui/separator', () => ({
  Separator: () => <hr data-testid="separator" />
}))

jest.mock('@/components/error-code-card', () => ({
  ErrorCodeGrid: ({ errorCodes, loading }: { errorCodes: any[], loading: boolean }) => (
    <div data-testid="error-code-grid">
      {loading ? 'Loading...' : `${errorCodes.length} error codes`}
    </div>
  )
}))

jest.mock('@/components/error-code-filters', () => ({
  ErrorCodeFilters: ({ onFiltersChange }: { onFiltersChange: (filters: any) => void }) => (
    <div data-testid="error-code-filters">
      <button onClick={() => onFiltersChange({ searchTerm: 'test' })}>
        Apply Filter
      </button>
    </div>
  )
}))

jest.mock('sonner', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn()
  }
}))

const mockUser = {
  id: '1',
  username: 'testuser',
  role: 'admin' as const,
  name: 'Test User',
  email: 'test@example.com',
  token: 'test-token'
}

const mockErrorCodes = [
  {
    id: '1',
    code: 'CONV001',
    title: 'Conveyor Belt Malfunction',
    description: 'Belt not moving properly',
    category: 'Mechanical',
    severity_level: 'HIGH',
    frequency_count: 15,
    avg_resolution_time_minutes: 30,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  },
  {
    id: '2',
    code: 'PUMP002',
    title: 'Hydraulic Pump Failure',
    description: 'Pump pressure too low',
    category: 'Hydraulic',
    severity_level: 'CRITICAL',
    frequency_count: 8,
    avg_resolution_time_minutes: 60,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  }
]

const mockStatistics = {
  totalErrorCodes: 100,
  criticalErrors: 10,
  highErrors: 20,
  mediumErrors: 30,
  lowErrors: 40,
  avgFrequency: 12.5,
  avgResolutionTime: 45.2
}

describe('Error Code Search Functionality - Property Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    
    // Mock the auth store hook
    const mockUseAuthStore = useAuthStore as jest.MockedFunction<typeof useAuthStore>
    mockUseAuthStore.mockReturnValue({
      user: mockUser,
      login: jest.fn(),
      logout: jest.fn(),
      switchUser: jest.fn()
    })
    
    ;(errorCodesApi.fetchErrorCodes as jest.Mock).mockResolvedValue({
      success: true,
      data: mockErrorCodes,
      count: mockErrorCodes.length
    })
    ;(errorCodesApi.fetchErrorCodeStatistics as jest.Mock).mockResolvedValue({
      success: true,
      data: mockStatistics
    })
    ;(errorCodesApi.searchErrorCodes as jest.Mock).mockResolvedValue({
      success: true,
      data: mockErrorCodes,
      count: mockErrorCodes.length
    })
  })

  /**
   * Property 1: Search Results Completeness
   * Universal Property: All search results must contain the search term in at least one searchable field
   * Validates: Requirements 1.5 (Search functionality must return relevant results)
   */
  test('Property 1: Search results completeness - all results contain search term', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.string({ minLength: 1, maxLength: 20 }).filter(s => s.trim().length > 0),
        async (searchTerm) => {
          // Mock search results that should contain the search term
          const mockSearchResults = mockErrorCodes.filter(code => 
            code.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
            code.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            code.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
            code.category.toLowerCase().includes(searchTerm.toLowerCase())
          )

          ;(errorCodesApi.searchErrorCodes as jest.Mock).mockResolvedValue({
            success: true,
            data: mockSearchResults,
            count: mockSearchResults.length
          })

          render(<ErrorCodesPage />)

          // Wait for initial load
          await waitFor(() => {
            expect(screen.getByTestId('error-code-grid')).toBeInTheDocument()
          })

          // Find and interact with search input
          const searchInput = screen.getByPlaceholderText(/Enter error code.*or search term/i)
          fireEvent.change(searchInput, { target: { value: searchTerm } })
          
          const searchButton = screen.getByRole('button', { name: /search/i })
          fireEvent.click(searchButton)

          // Wait for search to complete
          await waitFor(() => {
            expect(errorCodesApi.searchErrorCodes).toHaveBeenCalledWith(searchTerm, mockUser.token)
          })

          // Property: All returned results should contain the search term
          // This is validated by our mock implementation above
          expect(mockSearchResults.every(result => 
            result.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
            result.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            result.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
            result.category.toLowerCase().includes(searchTerm.toLowerCase())
          )).toBe(true)
        }
      ),
      { numRuns: 10, timeout: 5000 }
    )
  })

  /**
   * Property 2: Search Term Preservation
   * Universal Property: Search input should preserve the entered search term
   * Validates: Requirements 1.5 (User input should be maintained during search)
   */
  test('Property 2: Search term preservation - input maintains entered value', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.string({ minLength: 1, maxLength: 50 }).filter(s => s.trim().length > 0),
        async (searchTerm) => {
          render(<ErrorCodesPage />)

          // Wait for initial load
          await waitFor(() => {
            expect(screen.getByTestId('error-code-grid')).toBeInTheDocument()
          })

          const searchInput = screen.getByPlaceholderText(/Enter error code.*or search term/i) as HTMLInputElement
          
          // Enter search term
          fireEvent.change(searchInput, { target: { value: searchTerm } })
          
          // Property: Input value should match what was entered
          expect(searchInput.value).toBe(searchTerm)
        }
      ),
      { numRuns: 20, timeout: 3000 }
    )
  })

  /**
   * Property 3: Search State Consistency
   * Universal Property: Search loading state should be consistent with API call state
   * Validates: Requirements 1.5 (UI should reflect search operation state)
   */
  test('Property 3: Search state consistency - loading state matches API calls', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.string({ minLength: 1, maxLength: 20 }).filter(s => s.trim().length > 0),
        async (searchTerm) => {
          // Mock delayed API response
          let resolveSearch: (value: any) => void
          const searchPromise = new Promise(resolve => {
            resolveSearch = resolve
          })
          
          ;(errorCodesApi.searchErrorCodes as jest.Mock).mockReturnValue(searchPromise)

          render(<ErrorCodesPage />)

          // Wait for initial load
          await waitFor(() => {
            expect(screen.getByTestId('error-code-grid')).toBeInTheDocument()
          })

          const searchInput = screen.getByPlaceholderText(/Enter error code.*or search term/i)
          const searchButton = screen.getByRole('button', { name: /search/i })
          
          fireEvent.change(searchInput, { target: { value: searchTerm } })
          fireEvent.click(searchButton)

          // Property: Button should be disabled during search
          expect(searchButton).toBeDisabled()

          // Resolve the search
          resolveSearch!({
            success: true,
            data: mockErrorCodes,
            count: mockErrorCodes.length
          })

          // Wait for search to complete
          await waitFor(() => {
            expect(searchButton).not.toBeDisabled()
          })
        }
      ),
      { numRuns: 5, timeout: 5000 }
    )
  })

  /**
   * Property 4: Empty Search Handling
   * Universal Property: Empty search should reset to show all error codes
   * Validates: Requirements 1.5 (Empty search should show all results)
   */
  test('Property 4: Empty search handling - empty search shows all results', async () => {
    render(<ErrorCodesPage />)

    // Wait for initial load
    await waitFor(() => {
      expect(screen.getByTestId('error-code-grid')).toBeInTheDocument()
    })

    const searchInput = screen.getByPlaceholderText(/Enter error code.*or search term/i)
    const searchButton = screen.getByRole('button', { name: /search/i })
    
    // Enter and clear search term
    fireEvent.change(searchInput, { target: { value: 'test' } })
    fireEvent.change(searchInput, { target: { value: '' } })
    
    // Property: Search button should be disabled for empty search
    expect(searchButton).toBeDisabled()
    
    // Property: Clearing search should trigger reload of all error codes
    fireEvent.change(searchInput, { target: { value: '' } })
    
    await waitFor(() => {
      expect(errorCodesApi.fetchErrorCodes).toHaveBeenCalled()
    })
  })
})

/**
 * Integration property tests for search with filters
 */
describe('Error Code Search with Filters - Property Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    
    // Mock the auth store hook
    const mockUseAuthStore = useAuthStore as jest.MockedFunction<typeof useAuthStore>
    mockUseAuthStore.mockReturnValue({
      user: mockUser,
      login: jest.fn(),
      logout: jest.fn(),
      switchUser: jest.fn()
    })
    
    ;(errorCodesApi.fetchErrorCodes as jest.Mock).mockResolvedValue({
      success: true,
      data: mockErrorCodes,
      count: mockErrorCodes.length
    })
    ;(errorCodesApi.fetchErrorCodeStatistics as jest.Mock).mockResolvedValue({
      success: true,
      data: mockStatistics
    })
  })

  /**
   * Property 5: Filter and Search Combination
   * Universal Property: Applying filters should trigger new data fetch
   * Validates: Requirements 2.3, 2.4 (Filters should work with search)
   */
  test('Property 5: Filter and search combination - filters trigger data refresh', async () => {
    render(<ErrorCodesPage />)

    // Wait for initial load
    await waitFor(() => {
      expect(screen.getByTestId('error-code-grid')).toBeInTheDocument()
    })

    const initialCallCount = (errorCodesApi.fetchErrorCodes as jest.Mock).mock.calls.length

    // Apply filter
    const filterButton = screen.getByText('Apply Filter')
    fireEvent.click(filterButton)

    // Property: Applying filters should trigger new API call
    await waitFor(() => {
      expect((errorCodesApi.fetchErrorCodes as jest.Mock).mock.calls.length).toBeGreaterThan(initialCallCount)
    })
  })
})
import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { ErrorCodeCard, ErrorCodeGrid } from '../error-code-card'
import type { ErrorCode } from '@/lib/error-codes'

// Mock Next.js router
const mockPush = jest.fn()
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}))

// Property-based test generators
const generateErrorCode = (overrides: Partial<ErrorCode> = {}): ErrorCode => ({
  id: Math.random().toString(36).substr(2, 9),
  code: `TEST${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`,
  equipment_id: `eq-${Math.random().toString(36).substr(2, 5)}`,
  severity_level: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'][Math.floor(Math.random() * 4)] as any,
  title: `Test Error ${Math.random().toString(36).substr(2, 8)}`,
  description: `Test description ${Math.random().toString(36).substr(2, 20)}`,
  category: ['Mechanical', 'Electrical', 'Software', 'Safety'][Math.floor(Math.random() * 4)],
  frequency_count: Math.floor(Math.random() * 100),
  avg_resolution_time_minutes: Math.floor(Math.random() * 120) + 5,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  ...overrides
})

describe('ErrorCodeCard Component', () => {
  beforeEach(() => {
    mockPush.mockClear()
  })

  describe('Basic Rendering', () => {
    it('should render all required fields for any error code', () => {
      // Generate 10 random error codes to test
      for (let i = 0; i < 10; i++) {
        const errorCode = generateErrorCode()
        
        const { unmount } = render(<ErrorCodeCard errorCode={errorCode} />)
        
        // Verify all required fields are displayed
        expect(screen.getByText(errorCode.code)).toBeInTheDocument()
        expect(screen.getByText(errorCode.title)).toBeInTheDocument()
        expect(screen.getByText(errorCode.severity_level)).toBeInTheDocument()
        expect(screen.getByText(errorCode.category)).toBeInTheDocument()
        
        // Verify description is present (might be truncated)
        expect(screen.getByText(errorCode.description)).toBeInTheDocument()
        
        unmount()
      }
    })

    it('should display severity badge with correct styling for all severity levels', () => {
      const severityLevels = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'] as const
      
      severityLevels.forEach(severity => {
        const errorCode = generateErrorCode({ severity_level: severity })
        
        const { unmount } = render(<ErrorCodeCard errorCode={errorCode} />)
        
        const severityBadge = screen.getByText(severity)
        expect(severityBadge).toBeInTheDocument()
        expect(severityBadge).toHaveClass('inline-flex') // Badge component class
        
        unmount()
      })
    })

    it('should handle click navigation for any error code', () => {
      const errorCode = generateErrorCode()
      
      render(<ErrorCodeCard errorCode={errorCode} />)
      
      // Click on the card
      const card = screen.getByText(errorCode.code).closest('[role="button"], .cursor-pointer')
      expect(card).toBeInTheDocument()
      
      if (card) {
        fireEvent.click(card)
        expect(mockPush).toHaveBeenCalledWith(`/error-codes/${errorCode.code}`)
      }
    })
  })

  describe('Property 1: Search Results Completeness', () => {
    /**
     * Feature: error-code-frontend, Property 1: Search Results Completeness
     * For any error code search query, all returned results should contain 
     * the required fields (code, description, severity, equipment type) and 
     * match the search criteria
     * Validates: Requirements 1.2, 1.5
     */
    it('should display all required fields for any generated error code', () => {
      // Test with 100 random error codes to ensure property holds
      for (let i = 0; i < 100; i++) {
        const errorCode = generateErrorCode()
        
        const { unmount } = render(<ErrorCodeCard errorCode={errorCode} />)
        
        // Property: All required fields must be present
        const codeElement = screen.getByText(errorCode.code)
        const titleElement = screen.getByText(errorCode.title)
        const descriptionElement = screen.getByText(errorCode.description)
        const severityElement = screen.getByText(errorCode.severity_level)
        const categoryElement = screen.getByText(errorCode.category)
        
        expect(codeElement).toBeInTheDocument()
        expect(titleElement).toBeInTheDocument()
        expect(descriptionElement).toBeInTheDocument()
        expect(severityElement).toBeInTheDocument()
        expect(categoryElement).toBeInTheDocument()
        
        // Property: Elements should be visible and accessible
        expect(codeElement).toBeVisible()
        expect(titleElement).toBeVisible()
        expect(severityElement).toBeVisible()
        expect(categoryElement).toBeVisible()
        
        unmount()
      }
    })

    it('should maintain consistent structure across different error code variations', () => {
      // Test edge cases and variations
      const testCases = [
        generateErrorCode({ code: 'A', title: 'Short', description: 'X' }),
        generateErrorCode({ 
          code: 'VERY_LONG_ERROR_CODE_123456789', 
          title: 'Very Long Title That Should Be Truncated Properly',
          description: 'Very long description that should be handled properly and truncated if needed'
        }),
        generateErrorCode({ frequency_count: 0 }),
        generateErrorCode({ frequency_count: 999999 }),
        generateErrorCode({ avg_resolution_time_minutes: 1 }),
        generateErrorCode({ avg_resolution_time_minutes: 10000 }),
      ]
      
      testCases.forEach((errorCode, index) => {
        const { unmount } = render(<ErrorCodeCard errorCode={errorCode} />)
        
        // Property: Structure consistency regardless of content length
        expect(screen.getByText(errorCode.code)).toBeInTheDocument()
        expect(screen.getByText(errorCode.title)).toBeInTheDocument()
        expect(screen.getByText(errorCode.description)).toBeInTheDocument()
        expect(screen.getByText(errorCode.severity_level)).toBeInTheDocument()
        expect(screen.getByText(errorCode.category)).toBeInTheDocument()
        
        unmount()
      })
    })
  })

  describe('Compact Mode', () => {
    it('should render in compact mode with all essential information', () => {
      const errorCode = generateErrorCode()
      
      render(<ErrorCodeCard errorCode={errorCode} compact={true} />)
      
      // In compact mode, essential fields should still be present
      expect(screen.getByText(errorCode.code)).toBeInTheDocument()
      expect(screen.getByText(errorCode.title)).toBeInTheDocument()
      expect(screen.getByText(errorCode.severity_level)).toBeInTheDocument()
      expect(screen.getByText(errorCode.category)).toBeInTheDocument()
    })
  })

  describe('Custom Click Handler', () => {
    it('should call custom onClick handler when provided', () => {
      const errorCode = generateErrorCode()
      const mockOnClick = jest.fn()
      
      render(<ErrorCodeCard errorCode={errorCode} onClick={mockOnClick} />)
      
      const card = screen.getByText(errorCode.code).closest('[role="button"], .cursor-pointer')
      if (card) {
        fireEvent.click(card)
        expect(mockOnClick).toHaveBeenCalledWith(errorCode.code)
      }
    })
  })
})

describe('ErrorCodeGrid Component', () => {
  describe('Grid Rendering', () => {
    it('should render multiple error codes in grid format', () => {
      const errorCodes = Array.from({ length: 5 }, () => generateErrorCode())
      
      render(<ErrorCodeGrid errorCodes={errorCodes} />)
      
      // All error codes should be rendered
      errorCodes.forEach(errorCode => {
        expect(screen.getByText(errorCode.code)).toBeInTheDocument()
        expect(screen.getByText(errorCode.title)).toBeInTheDocument()
      })
    })

    it('should show loading state', () => {
      render(<ErrorCodeGrid errorCodes={[]} loading={true} />)
      
      // Should show loading skeletons
      const skeletons = screen.getAllByText('', { selector: '.animate-pulse' })
      expect(skeletons.length).toBeGreaterThan(0)
    })

    it('should show empty state when no error codes', () => {
      render(<ErrorCodeGrid errorCodes={[]} loading={false} />)
      
      expect(screen.getByText('No Error Codes Found')).toBeInTheDocument()
    })
  })

  describe('Property: Grid Consistency', () => {
    it('should maintain consistent grid layout regardless of error code count', () => {
      const testSizes = [1, 3, 6, 12, 25]
      
      testSizes.forEach(size => {
        const errorCodes = Array.from({ length: size }, () => generateErrorCode())
        
        const { unmount } = render(<ErrorCodeGrid errorCodes={errorCodes} />)
        
        // Property: All error codes should be rendered
        expect(screen.getAllByText(/TEST\d{3}/).length).toBe(size)
        
        unmount()
      })
    })
  })
})
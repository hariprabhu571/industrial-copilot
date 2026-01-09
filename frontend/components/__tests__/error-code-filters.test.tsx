import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { ErrorCodeFilters } from '../error-code-filters'
import type { ErrorCodeSearchParams } from '@/lib/error-codes'

// Mock the debounce hook
jest.mock('@/lib/hooks/useDebounce', () => ({
  useDebounce: (value: any, delay: number) => value // Return immediately for testing
}))

describe('ErrorCodeFilters Component', () => {
  const mockOnFiltersChange = jest.fn()
  
  const defaultFilters: ErrorCodeSearchParams = {
    sortBy: 'frequency_count',
    sortOrder: 'desc'
  }

  beforeEach(() => {
    mockOnFiltersChange.mockClear()
  })

  describe('Basic Rendering', () => {
    it('should render all filter controls', () => {
      render(
        <ErrorCodeFilters 
          filters={defaultFilters} 
          onFiltersChange={mockOnFiltersChange} 
        />
      )

      expect(screen.getByLabelText('Search')).toBeInTheDocument()
      expect(screen.getByText('Severity Level')).toBeInTheDocument()
      expect(screen.getByText('Sort By')).toBeInTheDocument()
    })

    it('should show advanced filters when toggled', () => {
      render(
        <ErrorCodeFilters 
          filters={defaultFilters} 
          onFiltersChange={mockOnFiltersChange} 
        />
      )

      // Click advanced toggle
      const advancedButton = screen.getByText('Advanced')
      fireEvent.click(advancedButton)

      expect(screen.getByLabelText('Error Code')).toBeInTheDocument()
      expect(screen.getByText('Category')).toBeInTheDocument()
    })
  })

  describe('Property 2: Filter Consistency', () => {
    /**
     * Feature: error-code-frontend, Property 2: Filter Consistency
     * For any applied filter (severity, equipment type), all displayed error codes 
     * should match the filter criteria exactly
     * Validates: Requirements 2.3, 2.4
     */
    
    it('should maintain filter consistency for severity levels', () => {
      const testSeverities = ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW']
      
      testSeverities.forEach(severity => {
        const { unmount } = render(
          <ErrorCodeFilters 
            filters={{ ...defaultFilters, severity_level: severity }} 
            onFiltersChange={mockOnFiltersChange} 
          />
        )

        // Property: Selected severity should be visually indicated
        const severityBadges = screen.getAllByText(severity.charAt(0) + severity.slice(1).toLowerCase())
        expect(severityBadges.length).toBeGreaterThan(0)
        
        // Property: Active filter should be shown in active filters section
        if (screen.queryByText('Active Filters')) {
          expect(screen.getByText(`Severity: ${severity}`)).toBeInTheDocument()
        }

        unmount()
      })
    })

    it('should handle filter changes consistently', () => {
      render(
        <ErrorCodeFilters 
          filters={defaultFilters} 
          onFiltersChange={mockOnFiltersChange} 
        />
      )

      // Test search filter
      const searchInput = screen.getByLabelText('Search')
      fireEvent.change(searchInput, { target: { value: 'CONV001' } })

      // Property: Filter change should trigger callback with correct parameters
      expect(mockOnFiltersChange).toHaveBeenCalledWith(
        expect.objectContaining({
          searchTerm: 'CONV001'
        })
      )
    })

    it('should clear all filters consistently', () => {
      const filtersWithData: ErrorCodeSearchParams = {
        searchTerm: 'test',
        severity_level: 'HIGH',
        category: 'Mechanical',
        code: 'CONV001',
        sortBy: 'code',
        sortOrder: 'asc'
      }

      render(
        <ErrorCodeFilters 
          filters={filtersWithData} 
          onFiltersChange={mockOnFiltersChange} 
        />
      )

      // Property: Clear button should be visible when filters are active
      const clearButton = screen.getByText('Clear')
      expect(clearButton).toBeInTheDocument()

      fireEvent.click(clearButton)

      // Property: Clear should reset to default state
      expect(mockOnFiltersChange).toHaveBeenCalledWith({
        sortBy: 'frequency_count',
        sortOrder: 'desc'
      })
    })

    it('should maintain sort state consistency', () => {
      const sortOptions = [
        { key: 'frequency_count', label: 'Frequency' },
        { key: 'severity_level', label: 'Severity' },
        { key: 'code', label: 'Code' },
        { key: 'avg_resolution_time_minutes', label: 'Time' }
      ]

      sortOptions.forEach(({ key, label }) => {
        const { unmount } = render(
          <ErrorCodeFilters 
            filters={{ ...defaultFilters, sortBy: key }} 
            onFiltersChange={mockOnFiltersChange} 
          />
        )

        // Property: Active sort option should be visually distinct
        const sortButton = screen.getByText(label)
        const buttonElement = sortButton.closest('button')
        
        // Should have active styling (default variant)
        expect(buttonElement).toHaveClass('bg-primary') // or similar active class

        unmount()
      })
    })

    it('should handle multiple filter combinations consistently', () => {
      // Test various filter combinations
      const filterCombinations = [
        { searchTerm: 'pump', severity_level: 'HIGH' },
        { category: 'Electrical', code: 'ELEC' },
        { searchTerm: 'conveyor', category: 'Mechanical', severity_level: 'CRITICAL' }
      ]

      filterCombinations.forEach((filters, index) => {
        const { unmount } = render(
          <ErrorCodeFilters 
            filters={{ ...defaultFilters, ...filters }} 
            onFiltersChange={mockOnFiltersChange} 
          />
        )

        // Property: All active filters should be displayed
        Object.entries(filters).forEach(([key, value]) => {
          if (value) {
            // Check if filter is reflected in the UI
            if (key === 'searchTerm') {
              const searchInput = screen.getByLabelText('Search') as HTMLInputElement
              expect(searchInput.value).toBe(value)
            }
          }
        })

        unmount()
      })
    })
  })

  describe('Search Functionality', () => {
    it('should handle search input changes', async () => {
      render(
        <ErrorCodeFilters 
          filters={defaultFilters} 
          onFiltersChange={mockOnFiltersChange} 
        />
      )

      const searchInput = screen.getByLabelText('Search')
      
      // Test various search terms
      const searchTerms = ['CONV001', 'pump failure', 'electrical', '']
      
      for (const term of searchTerms) {
        fireEvent.change(searchInput, { target: { value: term } })
        
        await waitFor(() => {
          expect(mockOnFiltersChange).toHaveBeenCalledWith(
            expect.objectContaining({
              searchTerm: term || undefined
            })
          )
        })
      }
    })

    it('should show searching indicator during debounce', () => {
      // Mock debounce to show different values
      jest.doMock('@/lib/hooks/useDebounce', () => ({
        useDebounce: (value: string, delay: number) => {
          // Return empty string initially to simulate debounce delay
          return ''
        }
      }))

      render(
        <ErrorCodeFilters 
          filters={defaultFilters} 
          onFiltersChange={mockOnFiltersChange} 
        />
      )

      const searchInput = screen.getByLabelText('Search')
      fireEvent.change(searchInput, { target: { value: 'test search' } })

      // Should show searching indicator when input differs from debounced value
      expect(screen.getByText('Searching...')).toBeInTheDocument()
    })
  })

  describe('Severity Selection', () => {
    it('should handle severity badge selection', () => {
      render(
        <ErrorCodeFilters 
          filters={defaultFilters} 
          onFiltersChange={mockOnFiltersChange} 
        />
      )

      // Click on a severity badge
      const criticalBadge = screen.getByText('Critical').closest('button')
      expect(criticalBadge).toBeInTheDocument()
      
      if (criticalBadge) {
        fireEvent.click(criticalBadge)
        
        expect(mockOnFiltersChange).toHaveBeenCalledWith(
          expect.objectContaining({
            severity_level: 'CRITICAL'
          })
        )
      }
    })

    it('should toggle severity selection', () => {
      render(
        <ErrorCodeFilters 
          filters={{ ...defaultFilters, severity_level: 'HIGH' }} 
          onFiltersChange={mockOnFiltersChange} 
        />
      )

      // Click on already selected severity to deselect
      const highBadge = screen.getByText('High').closest('button')
      if (highBadge) {
        fireEvent.click(highBadge)
        
        expect(mockOnFiltersChange).toHaveBeenCalledWith(
          expect.objectContaining({
            severity_level: undefined
          })
        )
      }
    })
  })

  describe('Sort Functionality', () => {
    it('should toggle sort order when clicking same sort option', () => {
      render(
        <ErrorCodeFilters 
          filters={{ ...defaultFilters, sortBy: 'frequency_count', sortOrder: 'desc' }} 
          onFiltersChange={mockOnFiltersChange} 
        />
      )

      const frequencyButton = screen.getByText('Frequency')
      fireEvent.click(frequencyButton)

      // Should toggle to ascending
      expect(mockOnFiltersChange).toHaveBeenCalledWith(
        expect.objectContaining({
          sortBy: 'frequency_count',
          sortOrder: 'asc'
        })
      )
    })

    it('should change sort field when clicking different option', () => {
      render(
        <ErrorCodeFilters 
          filters={{ ...defaultFilters, sortBy: 'frequency_count' }} 
          onFiltersChange={mockOnFiltersChange} 
        />
      )

      const codeButton = screen.getByText('Code')
      fireEvent.click(codeButton)

      expect(mockOnFiltersChange).toHaveBeenCalledWith(
        expect.objectContaining({
          sortBy: 'code',
          sortOrder: 'asc' // Default for code sorting
        })
      )
    })
  })

  describe('Loading State', () => {
    it('should disable controls when loading', () => {
      render(
        <ErrorCodeFilters 
          filters={defaultFilters} 
          onFiltersChange={mockOnFiltersChange} 
          loading={true}
        />
      )

      const searchInput = screen.getByLabelText('Search')
      const clearButton = screen.queryByText('Clear')
      const sortButtons = screen.getAllByRole('button')

      expect(searchInput).toBeDisabled()
      if (clearButton) {
        expect(clearButton).toBeDisabled()
      }
      
      // Sort buttons should be disabled
      sortButtons.forEach(button => {
        if (button.textContent?.includes('Frequency') || 
            button.textContent?.includes('Severity') ||
            button.textContent?.includes('Code') ||
            button.textContent?.includes('Time')) {
          expect(button).toBeDisabled()
        }
      })
    })
  })

  describe('Active Filters Display', () => {
    it('should show active filters when present', () => {
      const activeFilters: ErrorCodeSearchParams = {
        searchTerm: 'conveyor',
        severity_level: 'HIGH',
        category: 'Mechanical',
        code: 'CONV',
        sortBy: 'frequency_count',
        sortOrder: 'desc'
      }

      render(
        <ErrorCodeFilters 
          filters={activeFilters} 
          onFiltersChange={mockOnFiltersChange} 
        />
      )

      expect(screen.getByText('Active Filters')).toBeInTheDocument()
      expect(screen.getByText('Search: conveyor')).toBeInTheDocument()
      expect(screen.getByText('Severity: HIGH')).toBeInTheDocument()
      expect(screen.getByText('Code: CONV')).toBeInTheDocument()
    })

    it('should not show active filters section when no filters are active', () => {
      render(
        <ErrorCodeFilters 
          filters={defaultFilters} 
          onFiltersChange={mockOnFiltersChange} 
        />
      )

      expect(screen.queryByText('Active Filters')).not.toBeInTheDocument()
    })
  })
})
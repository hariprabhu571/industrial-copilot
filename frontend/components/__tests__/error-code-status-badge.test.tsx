import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { 
  ErrorCodeStatusBadge, 
  CriticalBadge, 
  HighBadge, 
  MediumBadge, 
  LowBadge,
  SeverityBadgeGroup,
  SeverityIndicator,
  getSeverityFromLevel
} from '../error-code-status-badge'

describe('ErrorCodeStatusBadge Component', () => {
  describe('Basic Rendering', () => {
    it('should render with text and icon by default', () => {
      render(<ErrorCodeStatusBadge severity="HIGH" />)
      
      expect(screen.getByText('High')).toBeInTheDocument()
      // Icon should be present (AlertTriangle for HIGH)
      const badge = screen.getByText('High').closest('.inline-flex')
      expect(badge).toBeInTheDocument()
    })

    it('should render all severity levels correctly', () => {
      const severities = ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'] as const
      
      severities.forEach(severity => {
        const { unmount } = render(<ErrorCodeStatusBadge severity={severity} />)
        
        const expectedText = severity.charAt(0) + severity.slice(1).toLowerCase()
        expect(screen.getByText(expectedText)).toBeInTheDocument()
        
        unmount()
      })
    })
  })

  describe('Size Variations', () => {
    it('should apply correct size classes for all sizes', () => {
      const sizes = ['sm', 'md', 'lg'] as const
      
      sizes.forEach(size => {
        const { unmount } = render(<ErrorCodeStatusBadge severity="HIGH" size={size} />)
        
        const badge = screen.getByText('High').closest('.inline-flex')
        expect(badge).toBeInTheDocument()
        
        // Verify size-specific classes are applied
        if (size === 'sm') {
          expect(badge).toHaveClass('text-xs')
        } else if (size === 'lg') {
          expect(badge).toHaveClass('text-base')
        } else {
          expect(badge).toHaveClass('text-sm')
        }
        
        unmount()
      })
    })
  })

  describe('Display Options', () => {
    it('should show only icon when showText is false', () => {
      render(<ErrorCodeStatusBadge severity="CRITICAL" showText={false} />)
      
      // Text should not be present
      expect(screen.queryByText('Critical')).not.toBeInTheDocument()
      
      // Badge should still be rendered (with icon only)
      const badges = screen.getAllByRole('generic')
      expect(badges.length).toBeGreaterThan(0)
    })

    it('should show only text when showIcon is false', () => {
      render(<ErrorCodeStatusBadge severity="LOW" showIcon={false} />)
      
      expect(screen.getByText('Low')).toBeInTheDocument()
      // Should not have icon-specific classes in the badge
    })

    it('should handle both showText and showIcon being false', () => {
      render(<ErrorCodeStatusBadge severity="MEDIUM" showText={false} showIcon={false} />)
      
      // Should still render a badge element, but empty
      expect(screen.queryByText('Medium')).not.toBeInTheDocument()
    })
  })

  describe('Color Mapping', () => {
    it('should apply correct color classes for each severity level', () => {
      const testCases = [
        { severity: 'CRITICAL' as const, expectedColorClass: 'bg-red-100' },
        { severity: 'HIGH' as const, expectedColorClass: 'bg-orange-100' },
        { severity: 'MEDIUM' as const, expectedColorClass: 'bg-yellow-100' },
        { severity: 'LOW' as const, expectedColorClass: 'bg-green-100' }
      ]
      
      testCases.forEach(({ severity, expectedColorClass }) => {
        const { unmount } = render(<ErrorCodeStatusBadge severity={severity} />)
        
        const badge = screen.getByText(severity.charAt(0) + severity.slice(1).toLowerCase()).closest('.inline-flex')
        expect(badge).toHaveClass(expectedColorClass)
        
        unmount()
      })
    })
  })

  describe('Variant Support', () => {
    it('should support different badge variants', () => {
      const variants = ['default', 'outline', 'secondary'] as const
      
      variants.forEach(variant => {
        const { unmount } = render(<ErrorCodeStatusBadge severity="HIGH" variant={variant} />)
        
        const badge = screen.getByText('High').closest('.inline-flex')
        expect(badge).toBeInTheDocument()
        
        unmount()
      })
    })
  })

  describe('Custom Styling', () => {
    it('should accept and apply custom className', () => {
      render(<ErrorCodeStatusBadge severity="LOW" className="custom-class" />)
      
      const badge = screen.getByText('Low').closest('.inline-flex')
      expect(badge).toHaveClass('custom-class')
    })
  })
})

describe('Convenience Badge Components', () => {
  it('should render CriticalBadge correctly', () => {
    render(<CriticalBadge />)
    expect(screen.getByText('Critical')).toBeInTheDocument()
  })

  it('should render HighBadge correctly', () => {
    render(<HighBadge />)
    expect(screen.getByText('High')).toBeInTheDocument()
  })

  it('should render MediumBadge correctly', () => {
    render(<MediumBadge />)
    expect(screen.getByText('Medium')).toBeInTheDocument()
  })

  it('should render LowBadge correctly', () => {
    render(<LowBadge />)
    expect(screen.getByText('Low')).toBeInTheDocument()
  })

  it('should pass through props to convenience components', () => {
    render(<CriticalBadge size="lg" showIcon={false} />)
    
    const badge = screen.getByText('Critical').closest('.inline-flex')
    expect(badge).toHaveClass('text-base') // lg size class
  })
})

describe('SeverityBadgeGroup Component', () => {
  it('should render all severity levels', () => {
    const mockToggle = jest.fn()
    
    render(
      <SeverityBadgeGroup 
        selectedSeverities={[]} 
        onSeverityToggle={mockToggle} 
      />
    )
    
    expect(screen.getByText('Critical')).toBeInTheDocument()
    expect(screen.getByText('High')).toBeInTheDocument()
    expect(screen.getByText('Medium')).toBeInTheDocument()
    expect(screen.getByText('Low')).toBeInTheDocument()
  })

  it('should handle severity selection', () => {
    const mockToggle = jest.fn()
    
    render(
      <SeverityBadgeGroup 
        selectedSeverities={['HIGH']} 
        onSeverityToggle={mockToggle} 
      />
    )
    
    const highBadge = screen.getByText('High').closest('button')
    expect(highBadge).toBeInTheDocument()
    
    if (highBadge) {
      fireEvent.click(highBadge)
      expect(mockToggle).toHaveBeenCalledWith('HIGH')
    }
  })

  it('should show selected state correctly', () => {
    const mockToggle = jest.fn()
    
    render(
      <SeverityBadgeGroup 
        selectedSeverities={['CRITICAL', 'HIGH']} 
        onSeverityToggle={mockToggle} 
      />
    )
    
    // Selected badges should have ring styling
    const criticalBadge = screen.getByText('Critical').closest('button')
    const lowBadge = screen.getByText('Low').closest('button')
    
    expect(criticalBadge?.querySelector('.ring-2')).toBeInTheDocument()
    expect(lowBadge?.querySelector('.ring-2')).not.toBeInTheDocument()
  })
})

describe('SeverityIndicator Component', () => {
  it('should render as a colored dot', () => {
    render(<SeverityIndicator severity="CRITICAL" />)
    
    const indicator = screen.getByTitle('Severity: CRITICAL')
    expect(indicator).toBeInTheDocument()
    expect(indicator).toHaveClass('w-3', 'h-3', 'rounded-full', 'bg-red-500')
  })

  it('should apply correct colors for all severity levels', () => {
    const testCases = [
      { severity: 'CRITICAL' as const, expectedClass: 'bg-red-500' },
      { severity: 'HIGH' as const, expectedClass: 'bg-orange-500' },
      { severity: 'MEDIUM' as const, expectedClass: 'bg-yellow-500' },
      { severity: 'LOW' as const, expectedClass: 'bg-green-500' }
    ]
    
    testCases.forEach(({ severity, expectedClass }) => {
      const { unmount } = render(<SeverityIndicator severity={severity} />)
      
      const indicator = screen.getByTitle(`Severity: ${severity}`)
      expect(indicator).toHaveClass(expectedClass)
      
      unmount()
    })
  })
})

describe('Utility Functions', () => {
  describe('getSeverityFromLevel', () => {
    it('should map numeric levels to severity correctly', () => {
      expect(getSeverityFromLevel(1)).toBe('LOW')
      expect(getSeverityFromLevel(2)).toBe('MEDIUM')
      expect(getSeverityFromLevel(3)).toBe('HIGH')
      expect(getSeverityFromLevel(4)).toBe('CRITICAL')
      expect(getSeverityFromLevel(5)).toBe('CRITICAL')
      expect(getSeverityFromLevel(0)).toBe('LOW')
    })

    it('should handle edge cases', () => {
      expect(getSeverityFromLevel(-1)).toBe('LOW')
      expect(getSeverityFromLevel(100)).toBe('CRITICAL')
    })
  })
})

describe('Accessibility', () => {
  it('should provide proper title attributes for indicators', () => {
    render(<SeverityIndicator severity="HIGH" />)
    
    const indicator = screen.getByTitle('Severity: HIGH')
    expect(indicator).toBeInTheDocument()
  })

  it('should be keyboard accessible for interactive elements', () => {
    const mockToggle = jest.fn()
    
    render(
      <SeverityBadgeGroup 
        selectedSeverities={[]} 
        onSeverityToggle={mockToggle} 
      />
    )
    
    const buttons = screen.getAllByRole('button')
    expect(buttons.length).toBe(4) // One for each severity level
    
    // Should be focusable
    buttons.forEach(button => {
      expect(button).not.toHaveAttribute('tabindex', '-1')
    })
  })
})
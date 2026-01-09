import { Badge } from "@/components/ui/badge"
import { AlertTriangle, AlertCircle, CheckCircle, Info } from "lucide-react"
import { cn } from "@/lib/utils"
import { getSeverityColor } from "@/lib/error-codes"

interface ErrorCodeStatusBadgeProps {
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW'
  size?: 'sm' | 'md' | 'lg'
  showText?: boolean
  showIcon?: boolean
  variant?: 'default' | 'outline' | 'secondary'
  className?: string
}

export function ErrorCodeStatusBadge({ 
  severity, 
  size = 'md', 
  showText = true, 
  showIcon = true,
  variant = 'default',
  className 
}: ErrorCodeStatusBadgeProps) {
  
  const getSeverityIcon = (severity: string, iconSize: string) => {
    const sizeClasses = {
      sm: 'w-3 h-3',
      md: 'w-4 h-4', 
      lg: 'w-5 h-5'
    }
    
    const iconClass = sizeClasses[size as keyof typeof sizeClasses]
    
    switch (severity) {
      case 'CRITICAL':
        return <AlertCircle className={cn(iconClass, 'text-red-500')} />
      case 'HIGH':
        return <AlertTriangle className={cn(iconClass, 'text-orange-500')} />
      case 'MEDIUM':
        return <AlertTriangle className={cn(iconClass, 'text-yellow-500')} />
      case 'LOW':
        return <CheckCircle className={cn(iconClass, 'text-green-500')} />
      default:
        return <Info className={cn(iconClass, 'text-gray-500')} />
    }
  }

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'text-xs px-2 py-0.5 gap-1'
      case 'lg':
        return 'text-base px-3 py-1.5 gap-2'
      case 'md':
      default:
        return 'text-sm px-2.5 py-1 gap-1.5'
    }
  }

  const getSeverityText = (severity: string) => {
    return severity.charAt(0).toUpperCase() + severity.slice(1).toLowerCase()
  }

  const badgeContent = (
    <>
      {showIcon && getSeverityIcon(severity, size)}
      {showText && <span>{getSeverityText(severity)}</span>}
    </>
  )

  // If only icon is shown, make it a more compact badge
  if (showIcon && !showText) {
    return (
      <Badge 
        variant={variant}
        className={cn(
          'inline-flex items-center justify-center rounded-full',
          size === 'sm' ? 'w-5 h-5' : size === 'lg' ? 'w-8 h-8' : 'w-6 h-6',
          getSeverityColor(severity),
          className
        )}
      >
        {getSeverityIcon(severity, size)}
      </Badge>
    )
  }

  return (
    <Badge 
      variant={variant}
      className={cn(
        'inline-flex items-center font-medium',
        getSizeClasses(),
        getSeverityColor(severity),
        className
      )}
    >
      {badgeContent}
    </Badge>
  )
}

// Convenience components for specific use cases
export function CriticalBadge(props: Omit<ErrorCodeStatusBadgeProps, 'severity'>) {
  return <ErrorCodeStatusBadge severity="CRITICAL" {...props} />
}

export function HighBadge(props: Omit<ErrorCodeStatusBadgeProps, 'severity'>) {
  return <ErrorCodeStatusBadge severity="HIGH" {...props} />
}

export function MediumBadge(props: Omit<ErrorCodeStatusBadgeProps, 'severity'>) {
  return <ErrorCodeStatusBadge severity="MEDIUM" {...props} />
}

export function LowBadge(props: Omit<ErrorCodeStatusBadgeProps, 'severity'>) {
  return <ErrorCodeStatusBadge severity="LOW" {...props} />
}

// Utility function to get severity level from number (for dynamic usage)
export function getSeverityFromLevel(level: number): 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' {
  if (level >= 4) return 'CRITICAL'
  if (level >= 3) return 'HIGH'
  if (level >= 2) return 'MEDIUM'
  return 'LOW'
}

// Component for displaying multiple severity badges (e.g., in filters)
interface SeverityBadgeGroupProps {
  selectedSeverities: string[]
  onSeverityToggle: (severity: string) => void
  size?: 'sm' | 'md' | 'lg'
  allowMultiple?: boolean
}

export function SeverityBadgeGroup({ 
  selectedSeverities, 
  onSeverityToggle, 
  size = 'md',
  allowMultiple = true 
}: SeverityBadgeGroupProps) {
  const severities: Array<'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW'> = ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW']
  
  return (
    <div className="flex flex-wrap gap-2">
      {severities.map((severity) => {
        const isSelected = selectedSeverities.includes(severity)
        
        return (
          <button
            key={severity}
            onClick={() => onSeverityToggle(severity)}
            className="transition-all duration-200 hover:scale-105"
          >
            <ErrorCodeStatusBadge
              severity={severity}
              size={size}
              variant={isSelected ? 'default' : 'outline'}
              className={cn(
                'cursor-pointer transition-all duration-200',
                isSelected ? 'ring-2 ring-primary ring-offset-2' : 'hover:bg-muted'
              )}
            />
          </button>
        )
      })}
    </div>
  )
}

// Severity indicator for compact displays
export function SeverityIndicator({ 
  severity, 
  className 
}: { 
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW'
  className?: string 
}) {
  const getIndicatorColor = (severity: string) => {
    switch (severity) {
      case 'CRITICAL':
        return 'bg-red-500'
      case 'HIGH':
        return 'bg-orange-500'
      case 'MEDIUM':
        return 'bg-yellow-500'
      case 'LOW':
        return 'bg-green-500'
      default:
        return 'bg-gray-500'
    }
  }

  return (
    <div 
      className={cn(
        'w-3 h-3 rounded-full',
        getIndicatorColor(severity),
        className
      )}
      title={`Severity: ${severity}`}
    />
  )
}
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { 
  CheckCircle, 
  AlertTriangle, 
  XCircle, 
  AlertCircle, 
  Minus,
  Flame,
  Zap,
  Activity
} from "lucide-react"

interface EquipmentStatusBadgeProps {
  status: string
  variant?: 'default' | 'compact'
  showIcon?: boolean
  className?: string
}

export function EquipmentStatusBadge({ 
  status, 
  variant = 'default',
  showIcon = true,
  className 
}: EquipmentStatusBadgeProps) {
  const getStatusConfig = (status: string) => {
    switch (status.toUpperCase()) {
      case 'OPERATIONAL':
        return {
          label: 'Operational',
          icon: CheckCircle,
          className: 'bg-green-100 text-green-800 border-green-200 hover:bg-green-200'
        }
      case 'MAINTENANCE':
        return {
          label: 'Maintenance',
          icon: AlertTriangle,
          className: 'bg-yellow-100 text-yellow-800 border-yellow-200 hover:bg-yellow-200'
        }
      case 'OFFLINE':
        return {
          label: 'Offline',
          icon: XCircle,
          className: 'bg-gray-100 text-gray-800 border-gray-200 hover:bg-gray-200'
        }
      case 'ALARM':
        return {
          label: 'Alarm',
          icon: AlertCircle,
          className: 'bg-red-100 text-red-800 border-red-200 hover:bg-red-200'
        }
      case 'DECOMMISSIONED':
        return {
          label: 'Decommissioned',
          icon: Minus,
          className: 'bg-gray-100 text-gray-600 border-gray-200 hover:bg-gray-200'
        }
      default:
        return {
          label: status,
          icon: Activity,
          className: 'bg-gray-100 text-gray-800 border-gray-200 hover:bg-gray-200'
        }
    }
  }

  const config = getStatusConfig(status)
  const Icon = config.icon

  if (variant === 'compact') {
    return (
      <Badge 
        variant="outline" 
        className={cn(
          "text-xs font-medium border transition-colors",
          config.className,
          className
        )}
      >
        {showIcon && <Icon className="w-3 h-3 mr-1" />}
        {config.label}
      </Badge>
    )
  }

  return (
    <Badge 
      variant="outline" 
      className={cn(
        "font-medium border transition-colors",
        config.className,
        className
      )}
    >
      {showIcon && <Icon className="w-4 h-4 mr-1.5" />}
      {config.label}
    </Badge>
  )
}

interface CriticalityBadgeProps {
  criticality: string
  variant?: 'default' | 'compact'
  showIcon?: boolean
  className?: string
}

export function CriticalityBadge({ 
  criticality, 
  variant = 'default',
  showIcon = true,
  className 
}: CriticalityBadgeProps) {
  const getCriticalityConfig = (criticality: string) => {
    switch (criticality.toUpperCase()) {
      case 'CRITICAL':
        return {
          label: 'Critical',
          icon: Flame,
          className: 'bg-red-100 text-red-800 border-red-200 hover:bg-red-200'
        }
      case 'HIGH':
        return {
          label: 'High',
          icon: Zap,
          className: 'bg-orange-100 text-orange-800 border-orange-200 hover:bg-orange-200'
        }
      case 'MEDIUM':
        return {
          label: 'Medium',
          icon: AlertTriangle,
          className: 'bg-yellow-100 text-yellow-800 border-yellow-200 hover:bg-yellow-200'
        }
      case 'LOW':
        return {
          label: 'Low',
          icon: CheckCircle,
          className: 'bg-green-100 text-green-800 border-green-200 hover:bg-green-200'
        }
      default:
        return {
          label: criticality,
          icon: Activity,
          className: 'bg-gray-100 text-gray-800 border-gray-200 hover:bg-gray-200'
        }
    }
  }

  const config = getCriticalityConfig(criticality)
  const Icon = config.icon

  if (variant === 'compact') {
    return (
      <Badge 
        variant="outline" 
        className={cn(
          "text-xs font-medium border transition-colors",
          config.className,
          className
        )}
      >
        {showIcon && <Icon className="w-3 h-3 mr-1" />}
        {config.label}
      </Badge>
    )
  }

  return (
    <Badge 
      variant="outline" 
      className={cn(
        "font-medium border transition-colors",
        config.className,
        className
      )}
    >
      {showIcon && <Icon className="w-4 h-4 mr-1.5" />}
      {config.label}
    </Badge>
  )
}

interface AlarmBadgeProps {
  type: string
  count?: number
  variant?: 'default' | 'compact'
  showIcon?: boolean
  className?: string
}

export function AlarmBadge({ 
  type, 
  count,
  variant = 'default',
  showIcon = true,
  className 
}: AlarmBadgeProps) {
  const getAlarmConfig = (type: string) => {
    switch (type.toUpperCase()) {
      case 'CRITICAL':
        return {
          label: 'Critical',
          icon: AlertCircle,
          className: 'bg-red-100 text-red-800 border-red-200 hover:bg-red-200'
        }
      case 'WARNING':
        return {
          label: 'Warning',
          icon: AlertTriangle,
          className: 'bg-yellow-100 text-yellow-800 border-yellow-200 hover:bg-yellow-200'
        }
      case 'INFO':
        return {
          label: 'Info',
          icon: Activity,
          className: 'bg-blue-100 text-blue-800 border-blue-200 hover:bg-blue-200'
        }
      default:
        return {
          label: type,
          icon: Activity,
          className: 'bg-gray-100 text-gray-800 border-gray-200 hover:bg-gray-200'
        }
    }
  }

  const config = getAlarmConfig(type)
  const Icon = config.icon
  const displayText = count !== undefined ? `${config.label} (${count})` : config.label

  if (variant === 'compact') {
    return (
      <Badge 
        variant="outline" 
        className={cn(
          "text-xs font-medium border transition-colors",
          config.className,
          className
        )}
      >
        {showIcon && <Icon className="w-3 h-3 mr-1" />}
        {displayText}
      </Badge>
    )
  }

  return (
    <Badge 
      variant="outline" 
      className={cn(
        "font-medium border transition-colors",
        config.className,
        className
      )}
    >
      {showIcon && <Icon className="w-4 h-4 mr-1.5" />}
      {displayText}
    </Badge>
  )
}
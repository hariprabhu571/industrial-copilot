import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { 
  AlertTriangle,
  AlertCircle,
  Clock,
  Eye,
  Wrench,
  TrendingUp,
  CheckCircle
} from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import type { ErrorCode } from "@/lib/error-codes"
import { getSeverityColor, getCategoryColor, formatDuration, formatFrequency } from "@/lib/error-codes"
import { ErrorCodeStatusBadge } from "./error-code-status-badge"

interface ErrorCodeCardProps {
  errorCode: ErrorCode
  showActions?: boolean
  compact?: boolean
  onClick?: (code: string) => void
}

export function ErrorCodeCard({ 
  errorCode, 
  showActions = true, 
  compact = false,
  onClick 
}: ErrorCodeCardProps) {
  const router = useRouter()

  const handleCardClick = () => {
    if (onClick) {
      onClick(errorCode.code)
    } else {
      router.push(`/error-codes/${errorCode.code}`)
    }
  }

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'CRITICAL':
        return <AlertCircle className="w-4 h-4 text-red-500" />
      case 'HIGH':
        return <AlertTriangle className="w-4 h-4 text-orange-500" />
      case 'MEDIUM':
        return <AlertTriangle className="w-4 h-4 text-yellow-500" />
      case 'LOW':
        return <CheckCircle className="w-4 h-4 text-green-500" />
      default:
        return <AlertTriangle className="w-4 h-4 text-gray-500" />
    }
  }

  if (compact) {
    return (
      <Card 
        className="border-border/50 hover:border-border transition-colors cursor-pointer hover:shadow-sm"
        onClick={handleCardClick}
      >
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-mono text-sm font-semibold">{errorCode.code}</span>
                <ErrorCodeStatusBadge 
                  severity={errorCode.severity_level} 
                  size="sm" 
                  showIcon={false}
                />
              </div>
              <p className="text-sm font-medium truncate">{errorCode.title}</p>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="outline" className={`text-xs ${getCategoryColor(errorCode.category)}`}>
                  {errorCode.category}
                </Badge>
                <span className="text-xs text-muted-foreground">
                  {formatFrequency(errorCode.frequency_count)}
                </span>
              </div>
            </div>
            {showActions && (
              <Button 
                variant="ghost" 
                size="sm"
                onClick={(e) => {
                  e.stopPropagation()
                  handleCardClick()
                }}
              >
                <Eye className="w-4 h-4" />
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card 
      className="border-border/50 hover:border-border transition-all duration-200 hover:shadow-md cursor-pointer group"
      onClick={handleCardClick}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <span className="font-mono text-lg font-bold group-hover:text-primary transition-colors">
                {errorCode.code}
              </span>
              <ErrorCodeStatusBadge 
                severity={errorCode.severity_level} 
                size="md"
              />
            </div>
            <h3 className="font-semibold text-base mb-2 line-clamp-2 group-hover:text-primary transition-colors">
              {errorCode.title}
            </h3>
            <p className="text-sm text-muted-foreground line-clamp-2">{errorCode.description}</p>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Badge variant="outline" className={`${getCategoryColor(errorCode.category)}`}>
              {errorCode.category}
            </Badge>
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <TrendingUp className="w-4 h-4" />
              <span>{formatFrequency(errorCode.frequency_count)}</span>
            </div>
          </div>

          <div className="flex items-center gap-2 text-sm">
            <div className="flex items-center gap-1 text-muted-foreground">
              <Clock className="w-4 h-4" />
              <span>Avg Resolution:</span>
            </div>
            <span className="font-medium">{formatDuration(errorCode.avg_resolution_time_minutes)}</span>
          </div>

          {showActions && (
            <div className="flex gap-2 pt-2 border-t border-border/50">
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors"
                onClick={(e) => {
                  e.stopPropagation()
                  handleCardClick()
                }}
              >
                <Wrench className="w-4 h-4 mr-2" />
                View Procedures
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

interface ErrorCodeGridProps {
  errorCodes: ErrorCode[]
  loading?: boolean
  compact?: boolean
  showActions?: boolean
  onErrorCodeClick?: (code: string) => void
}

export function ErrorCodeGrid({ 
  errorCodes, 
  loading = false, 
  compact = false,
  showActions = true,
  onErrorCodeClick
}: ErrorCodeGridProps) {
  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i} className="border-border/50">
            <CardHeader className="pb-3">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="h-4 bg-muted rounded animate-pulse w-16" />
                  <div className="h-5 bg-muted rounded animate-pulse w-20" />
                </div>
                <div className="h-4 bg-muted rounded animate-pulse w-3/4" />
                <div className="h-3 bg-muted rounded animate-pulse w-full" />
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <div className="h-5 bg-muted rounded animate-pulse w-20" />
                  <div className="h-3 bg-muted rounded animate-pulse w-16" />
                </div>
                <div className="h-3 bg-muted rounded animate-pulse w-2/3" />
                <div className="h-8 bg-muted rounded animate-pulse w-full" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (errorCodes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="rounded-lg bg-muted/50 p-6 ring-1 ring-border/50">
          <AlertTriangle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="font-semibold text-lg mb-2">No Error Codes Found</h3>
          <p className="text-sm text-muted-foreground max-w-sm">
            No error codes match your current search criteria. Try adjusting your filters or search terms.
          </p>
        </div>
      </div>
    )
  }

  const gridClass = compact 
    ? "grid gap-3 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
    : "grid gap-4 md:grid-cols-2 lg:grid-cols-3"

  return (
    <div className={gridClass}>
      {errorCodes.map((errorCode) => (
        <ErrorCodeCard 
          key={errorCode.id} 
          errorCode={errorCode} 
          compact={compact}
          showActions={showActions}
          onClick={onErrorCodeClick}
        />
      ))}
    </div>
  )
}

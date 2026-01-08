import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { EquipmentStatusBadge, CriticalityBadge, AlarmBadge } from "@/components/equipment-status-badge"
import { 
  MapPin, 
  Calendar, 
  Settings, 
  AlertTriangle,
  Eye,
  Wrench,
  Building,
  Factory
} from "lucide-react"
import Link from "next/link"
import type { Equipment } from "@/lib/equipment"

interface EquipmentCardProps {
  equipment: Equipment
  showActions?: boolean
  compact?: boolean
}

export function EquipmentCard({ equipment, showActions = true, compact = false }: EquipmentCardProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString()
  }

  const getLocationDisplay = () => {
    if (!equipment.location) return 'Unknown Location'
    
    const { plant, area, line, station } = equipment.location
    let location = `${plant} / ${area}`
    
    if (line) location += ` / ${line}`
    if (station) location += ` / ${station}`
    
    return location
  }

  if (compact) {
    return (
      <Card className="border-border/50 hover:border-border transition-colors">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-semibold text-sm truncate">{equipment.equipmentNumber}</h3>
                <EquipmentStatusBadge status={equipment.operationalState} variant="compact" />
              </div>
              <p className="text-xs text-muted-foreground truncate">{equipment.name}</p>
              <div className="flex items-center gap-1 mt-1">
                <MapPin className="w-3 h-3 text-muted-foreground" />
                <span className="text-xs text-muted-foreground truncate">{getLocationDisplay()}</span>
              </div>
            </div>
            {showActions && (
              <Link href={`/equipment/${equipment.id}`}>
                <Button variant="ghost" size="sm">
                  <Eye className="w-4 h-4" />
                </Button>
              </Link>
            )}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-border/50 hover:border-border transition-all duration-200 hover:shadow-md">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="font-semibold text-lg truncate">{equipment.equipmentNumber}</h3>
              <EquipmentStatusBadge status={equipment.operationalState} />
            </div>
            <p className="text-sm text-muted-foreground mb-2 line-clamp-2">{equipment.name}</p>
            <div className="flex items-center gap-2">
              <CriticalityBadge criticality={equipment.criticality} variant="compact" />
              {equipment.category && (
                <Badge variant="outline" className="text-xs">
                  {equipment.category.name}
                </Badge>
              )}
            </div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        <div className="space-y-3">
          {/* Equipment Details */}
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <span className="text-muted-foreground">Manufacturer:</span>
              <p className="font-medium truncate">{equipment.manufacturer}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Model:</span>
              <p className="font-medium truncate">{equipment.model}</p>
            </div>
          </div>

          {/* Location */}
          <div className="flex items-center gap-2 text-sm">
            <div className="flex items-center gap-1 text-muted-foreground">
              <Building className="w-4 h-4" />
              <span>Location:</span>
            </div>
            <span className="font-medium truncate">{getLocationDisplay()}</span>
          </div>

          {/* Installation Date */}
          <div className="flex items-center gap-2 text-sm">
            <div className="flex items-center gap-1 text-muted-foreground">
              <Calendar className="w-4 h-4" />
              <span>Installed:</span>
            </div>
            <span className="font-medium">{formatDate(equipment.installationDate)}</span>
          </div>

          {/* Serial Number */}
          {equipment.serialNumber && (
            <div className="text-sm">
              <span className="text-muted-foreground">Serial: </span>
              <span className="font-mono text-xs bg-muted px-2 py-1 rounded">
                {equipment.serialNumber}
              </span>
            </div>
          )}

          {/* Actions */}
          {showActions && (
            <div className="flex gap-2 pt-2 border-t border-border/50">
              <Link href={`/equipment/${equipment.id}`} className="flex-1">
                <Button variant="outline" size="sm" className="w-full">
                  <Eye className="w-4 h-4 mr-2" />
                  View Details
                </Button>
              </Link>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

interface EquipmentGridProps {
  equipment: Equipment[]
  loading?: boolean
  compact?: boolean
  showActions?: boolean
}

export function EquipmentGrid({ 
  equipment, 
  loading = false, 
  compact = false,
  showActions = true 
}: EquipmentGridProps) {
  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i} className="border-border/50">
            <CardHeader className="pb-3">
              <div className="space-y-2">
                <div className="h-4 bg-muted rounded animate-pulse" />
                <div className="h-3 bg-muted rounded animate-pulse w-3/4" />
                <div className="flex gap-2">
                  <div className="h-5 bg-muted rounded animate-pulse w-16" />
                  <div className="h-5 bg-muted rounded animate-pulse w-20" />
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-2">
                <div className="h-3 bg-muted rounded animate-pulse" />
                <div className="h-3 bg-muted rounded animate-pulse w-2/3" />
                <div className="h-3 bg-muted rounded animate-pulse w-1/2" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (equipment.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="rounded-lg bg-muted/50 p-6 ring-1 ring-border/50">
          <Factory className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="font-semibold text-lg mb-2">No Equipment Found</h3>
          <p className="text-sm text-muted-foreground max-w-sm">
            No equipment matches your current search criteria. Try adjusting your filters or search terms.
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
      {equipment.map((item) => (
        <EquipmentCard 
          key={item.id} 
          equipment={item} 
          compact={compact}
          showActions={showActions}
        />
      ))}
    </div>
  )
}
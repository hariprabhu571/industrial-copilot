import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { 
  Search, 
  Filter, 
  X, 
  RotateCcw,
  ChevronDown,
  ChevronUp
} from "lucide-react"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import type { EquipmentSearchParams } from "@/lib/equipment"

interface EquipmentFiltersProps {
  filters: EquipmentSearchParams
  onFiltersChange: (filters: EquipmentSearchParams) => void
  categories?: Array<{ id: string; name: string }>
  locations?: Record<string, Record<string, Array<{ line: string; equipmentCount: number }>>>
  loading?: boolean
}

export function EquipmentFilters({ 
  filters, 
  onFiltersChange, 
  categories = [],
  locations = {},
  loading = false 
}: EquipmentFiltersProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [localFilters, setLocalFilters] = useState<EquipmentSearchParams>(filters)

  useEffect(() => {
    setLocalFilters(filters)
  }, [filters])

  const handleFilterChange = (key: keyof EquipmentSearchParams, value: any) => {
    const newFilters = { ...localFilters, [key]: value }
    setLocalFilters(newFilters)
    onFiltersChange(newFilters)
  }

  const handleClearFilters = () => {
    const clearedFilters: EquipmentSearchParams = {
      page: 1,
      limit: 20,
      sortBy: 'equipment_number',
      sortOrder: 'asc'
    }
    setLocalFilters(clearedFilters)
    onFiltersChange(clearedFilters)
  }

  const getActiveFilterCount = () => {
    const filterKeys = [
      'equipmentNumber', 'name', 'manufacturer', 'model', 'category',
      'plant', 'area', 'line', 'operationalState', 'criticality',
      'hasAlarms', 'maintenanceDue'
    ]
    
    return filterKeys.filter(key => {
      const value = localFilters[key as keyof EquipmentSearchParams]
      return value !== undefined && value !== null && value !== ''
    }).length
  }

  const activeFilterCount = getActiveFilterCount()

  return (
    <Card className="border-border/50">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-primary" />
            <CardTitle className="text-base">Filters</CardTitle>
            {activeFilterCount > 0 && (
              <Badge variant="secondary" className="text-xs">
                {activeFilterCount} active
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-2">
            {activeFilterCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearFilters}
                className="text-xs"
              >
                <RotateCcw className="w-3 h-3 mr-1" />
                Clear
              </Button>
            )}
            <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
              <CollapsibleTrigger asChild>
                <Button variant="ghost" size="sm">
                  {isExpanded ? (
                    <ChevronUp className="w-4 h-4" />
                  ) : (
                    <ChevronDown className="w-4 h-4" />
                  )}
                </Button>
              </CollapsibleTrigger>
            </Collapsible>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        {/* Quick Search - Always Visible */}
        <div className="space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search equipment..."
              value={localFilters.name || ''}
              onChange={(e) => handleFilterChange('name', e.target.value)}
              className="pl-10"
              disabled={loading}
            />
          </div>

          {/* Quick Status Filters */}
          <div className="flex flex-wrap gap-2">
            <Button
              variant={localFilters.operationalState === 'OPERATIONAL' ? 'default' : 'outline'}
              size="sm"
              onClick={() => handleFilterChange('operationalState', 
                localFilters.operationalState === 'OPERATIONAL' ? '' : 'OPERATIONAL'
              )}
              disabled={loading}
            >
              Operational
            </Button>
            <Button
              variant={localFilters.operationalState === 'MAINTENANCE' ? 'default' : 'outline'}
              size="sm"
              onClick={() => handleFilterChange('operationalState', 
                localFilters.operationalState === 'MAINTENANCE' ? '' : 'MAINTENANCE'
              )}
              disabled={loading}
            >
              Maintenance
            </Button>
            <Button
              variant={localFilters.operationalState === 'ALARM' ? 'default' : 'outline'}
              size="sm"
              onClick={() => handleFilterChange('operationalState', 
                localFilters.operationalState === 'ALARM' ? '' : 'ALARM'
              )}
              disabled={loading}
            >
              Alarm
            </Button>
            <Button
              variant={localFilters.hasAlarms ? 'default' : 'outline'}
              size="sm"
              onClick={() => handleFilterChange('hasAlarms', !localFilters.hasAlarms)}
              disabled={loading}
            >
              Has Alarms
            </Button>
          </div>
        </div>

        {/* Advanced Filters - Collapsible */}
        <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
          <CollapsibleContent className="space-y-4 mt-4">
            <Separator />
            
            {/* Equipment Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="equipmentNumber">Equipment Number</Label>
                <Input
                  id="equipmentNumber"
                  placeholder="EQ-PMP-001"
                  value={localFilters.equipmentNumber || ''}
                  onChange={(e) => handleFilterChange('equipmentNumber', e.target.value)}
                  disabled={loading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="manufacturer">Manufacturer</Label>
                <Input
                  id="manufacturer"
                  placeholder="Grundfos, Siemens..."
                  value={localFilters.manufacturer || ''}
                  onChange={(e) => handleFilterChange('manufacturer', e.target.value)}
                  disabled={loading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="model">Model</Label>
                <Input
                  id="model"
                  placeholder="CR64-2-2"
                  value={localFilters.model || ''}
                  onChange={(e) => handleFilterChange('model', e.target.value)}
                  disabled={loading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select
                  value={localFilters.category || ''}
                  onValueChange={(value) => handleFilterChange('category', value)}
                  disabled={loading}
                >
                  <SelectTrigger id="category">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Categories</SelectItem>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.name}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Location Filters */}
            <div className="space-y-3">
              <Label className="text-sm font-medium">Location</Label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="plant" className="text-xs text-muted-foreground">Plant</Label>
                  <Select
                    value={localFilters.plant || ''}
                    onValueChange={(value) => {
                      handleFilterChange('plant', value)
                      // Clear area and line when plant changes
                      if (value !== localFilters.plant) {
                        handleFilterChange('area', '')
                        handleFilterChange('line', '')
                      }
                    }}
                    disabled={loading}
                  >
                    <SelectTrigger id="plant">
                      <SelectValue placeholder="All Plants" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All Plants</SelectItem>
                      {Object.keys(locations).map((plant) => (
                        <SelectItem key={plant} value={plant}>
                          {plant}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="area" className="text-xs text-muted-foreground">Area</Label>
                  <Select
                    value={localFilters.area || ''}
                    onValueChange={(value) => {
                      handleFilterChange('area', value)
                      // Clear line when area changes
                      if (value !== localFilters.area) {
                        handleFilterChange('line', '')
                      }
                    }}
                    disabled={loading || !localFilters.plant}
                  >
                    <SelectTrigger id="area">
                      <SelectValue placeholder="All Areas" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All Areas</SelectItem>
                      {localFilters.plant && locations[localFilters.plant] && 
                        Object.keys(locations[localFilters.plant]).map((area) => (
                          <SelectItem key={area} value={area}>
                            {area}
                          </SelectItem>
                        ))
                      }
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="line" className="text-xs text-muted-foreground">Line</Label>
                  <Select
                    value={localFilters.line || ''}
                    onValueChange={(value) => handleFilterChange('line', value)}
                    disabled={loading || !localFilters.plant || !localFilters.area}
                  >
                    <SelectTrigger id="line">
                      <SelectValue placeholder="All Lines" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All Lines</SelectItem>
                      {localFilters.plant && localFilters.area && 
                        locations[localFilters.plant]?.[localFilters.area]?.map((lineInfo) => (
                          <SelectItem key={lineInfo.line} value={lineInfo.line}>
                            {lineInfo.line} ({lineInfo.equipmentCount})
                          </SelectItem>
                        ))
                      }
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Status and Criticality */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="operationalState">Operational State</Label>
                <Select
                  value={localFilters.operationalState || ''}
                  onValueChange={(value) => handleFilterChange('operationalState', value)}
                  disabled={loading}
                >
                  <SelectTrigger id="operationalState">
                    <SelectValue placeholder="All States" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All States</SelectItem>
                    <SelectItem value="OPERATIONAL">Operational</SelectItem>
                    <SelectItem value="MAINTENANCE">Maintenance</SelectItem>
                    <SelectItem value="OFFLINE">Offline</SelectItem>
                    <SelectItem value="ALARM">Alarm</SelectItem>
                    <SelectItem value="DECOMMISSIONED">Decommissioned</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="criticality">Criticality</Label>
                <Select
                  value={localFilters.criticality || ''}
                  onValueChange={(value) => handleFilterChange('criticality', value)}
                  disabled={loading}
                >
                  <SelectTrigger id="criticality">
                    <SelectValue placeholder="All Levels" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Levels</SelectItem>
                    <SelectItem value="CRITICAL">Critical</SelectItem>
                    <SelectItem value="HIGH">High</SelectItem>
                    <SelectItem value="MEDIUM">Medium</SelectItem>
                    <SelectItem value="LOW">Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Additional Filters */}
            <div className="flex flex-wrap gap-4">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={localFilters.maintenanceDue || false}
                  onChange={(e) => handleFilterChange('maintenanceDue', e.target.checked)}
                  disabled={loading}
                  className="rounded border-border"
                />
                <span className="text-sm">Maintenance Due</span>
              </label>
            </div>

            {/* Sort Options */}
            <Separator />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="sortBy">Sort By</Label>
                <Select
                  value={localFilters.sortBy || 'equipment_number'}
                  onValueChange={(value) => handleFilterChange('sortBy', value)}
                  disabled={loading}
                >
                  <SelectTrigger id="sortBy">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="equipment_number">Equipment Number</SelectItem>
                    <SelectItem value="name">Name</SelectItem>
                    <SelectItem value="manufacturer">Manufacturer</SelectItem>
                    <SelectItem value="criticality">Criticality</SelectItem>
                    <SelectItem value="operational_state">Status</SelectItem>
                    <SelectItem value="installation_date">Installation Date</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="sortOrder">Sort Order</Label>
                <Select
                  value={localFilters.sortOrder || 'asc'}
                  onValueChange={(value) => handleFilterChange('sortOrder', value as 'asc' | 'desc')}
                  disabled={loading}
                >
                  <SelectTrigger id="sortOrder">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="asc">Ascending</SelectItem>
                    <SelectItem value="desc">Descending</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CollapsibleContent>
        </Collapsible>
      </CardContent>
    </Card>
  )
}
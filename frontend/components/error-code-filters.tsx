import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Search, Filter, X, SortAsc, SortDesc } from "lucide-react"
import { useState, useEffect, useCallback } from "react"
import { useDebounce } from "@/lib/hooks/useDebounce"
import type { ErrorCodeSearchParams } from "@/lib/error-codes"
import { ERROR_CATEGORIES, SEVERITY_LEVELS } from "@/lib/error-codes"
import { SeverityBadgeGroup } from "./error-code-status-badge"

interface ErrorCodeFiltersProps {
  filters: ErrorCodeSearchParams
  onFiltersChange: (filters: ErrorCodeSearchParams) => void
  loading?: boolean
  showAdvanced?: boolean
}

export function ErrorCodeFilters({ 
  filters, 
  onFiltersChange, 
  loading = false,
  showAdvanced = true 
}: ErrorCodeFiltersProps) {
  const [searchTerm, setSearchTerm] = useState(filters.searchTerm || "")
  const [localFilters, setLocalFilters] = useState<ErrorCodeSearchParams>(filters)
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false)
  
  // Debounce search term to avoid excessive API calls
  const debouncedSearchTerm = useDebounce(searchTerm, 300)

  // Update local state when filters prop changes
  useEffect(() => {
    setLocalFilters(filters)
    setSearchTerm(filters.searchTerm || "")
  }, [filters])

  // Handle debounced search term changes
  useEffect(() => {
    if (debouncedSearchTerm !== (localFilters.searchTerm || "")) {
      const newFilters = { ...localFilters, searchTerm: debouncedSearchTerm || undefined }
      setLocalFilters(newFilters)
      onFiltersChange(newFilters)
    }
  }, [debouncedSearchTerm, localFilters.searchTerm, onFiltersChange]) // Only depend on searchTerm, not entire localFilters

  const handleSearchChange = useCallback((value: string) => {
    setSearchTerm(value)
  }, [])

  const handleFilterChange = useCallback((key: keyof ErrorCodeSearchParams, value: string | undefined) => {
    const newFilters = { ...localFilters, [key]: value || undefined }
    setLocalFilters(newFilters)
    onFiltersChange(newFilters)
  }, [localFilters, onFiltersChange])

  const handleSortChange = useCallback((sortBy: string, sortOrder: 'asc' | 'desc') => {
    const newFilters = { ...localFilters, sortBy, sortOrder }
    setLocalFilters(newFilters)
    onFiltersChange(newFilters)
  }, [localFilters, onFiltersChange])

  const handleSeverityToggle = useCallback((severity: string) => {
    const currentSeverities = localFilters.severity_level ? [localFilters.severity_level] : []
    const newSeverity = currentSeverities.includes(severity) ? undefined : severity
    handleFilterChange('severity_level', newSeverity)
  }, [localFilters.severity_level, handleFilterChange])

  const clearFilters = useCallback(() => {
    const clearedFilters: ErrorCodeSearchParams = {
      sortBy: 'frequency_count',
      sortOrder: 'desc'
    }
    setLocalFilters(clearedFilters)
    setSearchTerm("")
    onFiltersChange(clearedFilters)
  }, [onFiltersChange])

  const hasActiveFilters = useCallback(() => {
    return !!(
      localFilters.searchTerm ||
      localFilters.category ||
      localFilters.severity_level ||
      localFilters.code ||
      localFilters.title
    )
  }, [localFilters])

  const getSortIcon = (currentSort: string, targetSort: string) => {
    if (currentSort === targetSort) {
      return localFilters.sortOrder === 'asc' ? <SortAsc className="w-3 h-3" /> : <SortDesc className="w-3 h-3" />
    }
    return null
  }

  return (
    <Card className="border-border/50">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <Filter className="w-4 h-4" />
            Filters
          </CardTitle>
          <div className="flex items-center gap-2">
            {showAdvanced && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
              >
                {showAdvancedFilters ? 'Simple' : 'Advanced'}
              </Button>
            )}
            {hasActiveFilters() && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                disabled={loading}
              >
                <X className="w-4 h-4 mr-1" />
                Clear
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Search */}
        <div className="space-y-2">
          <Label htmlFor="search">Search</Label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              id="search"
              placeholder="Search error codes, titles, descriptions..."
              value={searchTerm}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="pl-10"
              disabled={loading}
            />
          </div>
          {debouncedSearchTerm !== searchTerm && (
            <p className="text-xs text-muted-foreground">Searching...</p>
          )}
        </div>

        {/* Severity Level - Visual Selection */}
        <div className="space-y-2">
          <Label>Severity Level</Label>
          <SeverityBadgeGroup
            selectedSeverities={localFilters.severity_level ? [localFilters.severity_level] : []}
            onSeverityToggle={handleSeverityToggle}
            size="sm"
            allowMultiple={false}
          />
        </div>

        {/* Advanced Filters */}
        {showAdvancedFilters && (
          <>
            {/* Error Code */}
            <div className="space-y-2">
              <Label htmlFor="code">Error Code</Label>
              <Input
                id="code"
                placeholder="e.g., CONV001, PUMP002"
                value={localFilters.code || ""}
                onChange={(e) => handleFilterChange('code', e.target.value)}
                disabled={loading}
              />
            </div>

            {/* Category */}
            <div className="space-y-2">
              <Label>Category</Label>
              <Select
                value={localFilters.category || ""}
                onValueChange={(value) => handleFilterChange('category', value === "all" ? undefined : value)}
                disabled={loading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {ERROR_CATEGORIES.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </>
        )}

        {/* Sort Options */}
        <div className="space-y-2">
          <Label>Sort By</Label>
          <div className="grid grid-cols-2 gap-2">
            <Button
              variant={localFilters.sortBy === 'frequency_count' ? 'default' : 'outline'}
              size="sm"
              onClick={() => handleSortChange('frequency_count', 
                localFilters.sortBy === 'frequency_count' && localFilters.sortOrder === 'desc' ? 'asc' : 'desc'
              )}
              disabled={loading}
              className="justify-between"
            >
              <span>Frequency</span>
              {getSortIcon(localFilters.sortBy || '', 'frequency_count')}
            </Button>
            <Button
              variant={localFilters.sortBy === 'severity_level' ? 'default' : 'outline'}
              size="sm"
              onClick={() => handleSortChange('severity_level', 
                localFilters.sortBy === 'severity_level' && localFilters.sortOrder === 'desc' ? 'asc' : 'desc'
              )}
              disabled={loading}
              className="justify-between"
            >
              <span>Severity</span>
              {getSortIcon(localFilters.sortBy || '', 'severity_level')}
            </Button>
            <Button
              variant={localFilters.sortBy === 'code' ? 'default' : 'outline'}
              size="sm"
              onClick={() => handleSortChange('code', 
                localFilters.sortBy === 'code' && localFilters.sortOrder === 'asc' ? 'desc' : 'asc'
              )}
              disabled={loading}
              className="justify-between"
            >
              <span>Code</span>
              {getSortIcon(localFilters.sortBy || '', 'code')}
            </Button>
            <Button
              variant={localFilters.sortBy === 'avg_resolution_time_minutes' ? 'default' : 'outline'}
              size="sm"
              onClick={() => handleSortChange('avg_resolution_time_minutes', 
                localFilters.sortBy === 'avg_resolution_time_minutes' && localFilters.sortOrder === 'asc' ? 'desc' : 'asc'
              )}
              disabled={loading}
              className="justify-between"
            >
              <span>Time</span>
              {getSortIcon(localFilters.sortBy || '', 'avg_resolution_time_minutes')}
            </Button>
          </div>
        </div>

        {/* Active Filters */}
        {hasActiveFilters() && (
          <div className="space-y-2">
            <Label>Active Filters</Label>
            <div className="flex flex-wrap gap-1">
              {localFilters.searchTerm && (
                <Badge variant="secondary" className="text-xs">
                  Search: {localFilters.searchTerm}
                </Badge>
              )}
              {localFilters.code && (
                <Badge variant="secondary" className="text-xs">
                  Code: {localFilters.code}
                </Badge>
              )}
              {localFilters.severity_level && (
                <Badge variant="secondary" className="text-xs">
                  Severity: {localFilters.severity_level}
                </Badge>
              )}
              {localFilters.category && (
                <Badge variant="secondary" className="text-xs">
                  Category: {localFilters.category}
                </Badge>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

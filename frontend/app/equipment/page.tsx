"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuthStore } from "@/lib/store"
import { AppHeader } from "@/components/app-header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { EquipmentGrid } from "@/components/equipment-card"
import { EquipmentFilters } from "@/components/equipment-filters"
import { 
  Factory, 
  AlertCircle, 
  Loader2,
  Grid3X3,
  List,
  Download,
  RefreshCw
} from "lucide-react"
import { 
  fetchEquipment, 
  fetchEquipmentCategories, 
  fetchEquipmentLocations,
  type Equipment, 
  type EquipmentSearchParams 
} from "@/lib/equipment"

interface EquipmentPageData {
  equipment: Equipment[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export default function EquipmentPage() {
  const router = useRouter()
  const { user } = useAuthStore()
  
  // State management
  const [data, setData] = useState<EquipmentPageData>({
    equipment: [],
    pagination: { page: 1, limit: 20, total: 0, totalPages: 0 }
  })
  const [categories, setCategories] = useState<Array<{ id: string; name: string }>>([])
  const [locations, setLocations] = useState<Record<string, Record<string, Array<{ line: string; equipmentCount: number }>>>>({})
  const [filters, setFilters] = useState<EquipmentSearchParams>({
    page: 1,
    limit: 20,
    sortBy: 'equipment_number',
    sortOrder: 'asc'
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')

  // Fetch equipment data
  const fetchEquipmentData = async (searchParams: EquipmentSearchParams) => {
    if (!user?.token) return

    try {
      setLoading(true)
      setError("")
      
      const response = await fetchEquipment(searchParams, user.token)
      
      if (response.success) {
        setData({
          equipment: response.data || [],
          pagination: response.pagination || { page: 1, limit: 20, total: 0, totalPages: 0 }
        })
      } else {
        setError(response.error || "Failed to fetch equipment")
      }
    } catch (err) {
      console.error('Error fetching equipment:', err)
      setError(err instanceof Error ? err.message : "Failed to fetch equipment")
    } finally {
      setLoading(false)
    }
  }

  // Fetch categories and locations
  const fetchMetadata = async () => {
    if (!user?.token) return

    try {
      const [categoriesResponse, locationsResponse] = await Promise.all([
        fetchEquipmentCategories(user.token),
        fetchEquipmentLocations(user.token)
      ])

      if (categoriesResponse.success) {
        setCategories(categoriesResponse.data || [])
      }

      if (locationsResponse.success) {
        setLocations(locationsResponse.data || {})
      }
    } catch (err) {
      console.error('Error fetching metadata:', err)
    }
  }

  // Handle filter changes
  const handleFiltersChange = (newFilters: EquipmentSearchParams) => {
    // Reset to page 1 when filters change (except for page changes)
    const updatedFilters = { 
      ...newFilters, 
      page: newFilters.page === filters.page ? 1 : newFilters.page 
    }
    setFilters(updatedFilters)
  }

  // Handle pagination
  const handlePageChange = (page: number) => {
    const newFilters = { ...filters, page }
    setFilters(newFilters)
  }

  // Handle refresh
  const handleRefresh = () => {
    fetchEquipmentData(filters)
  }

  // Initial data fetch
  useEffect(() => {
    if (user) {
      fetchMetadata()
      fetchEquipmentData(filters)
    }
  }, [user])

  // Fetch data when filters change
  useEffect(() => {
    if (user) {
      fetchEquipmentData(filters)
    }
  }, [filters, user])

  // Check permissions
  useEffect(() => {
    if (user && !['admin', 'editor', 'viewer'].includes(user.role)) {
      router.push("/dashboard")
    }
  }, [user, router])

  if (!user) return null

  return (
    <>
      <AppHeader />
      <main className="flex-1 overflow-y-auto p-6">
        <div className="mx-auto max-w-7xl space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h2 className="text-3xl font-bold tracking-tight text-balance bg-gradient-to-br from-foreground to-foreground/70 bg-clip-text text-transparent">
                Equipment Management
              </h2>
              <p className="text-muted-foreground">
                Monitor and manage industrial equipment across all facilities
              </p>
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefresh}
                disabled={loading}
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              
              <div className="flex items-center border border-border rounded-lg p-1">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                >
                  <Grid3X3 className="w-4 h-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                >
                  <List className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Error Alert */}
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="grid gap-6 lg:grid-cols-4">
            {/* Filters Sidebar */}
            <div className="lg:col-span-1">
              <EquipmentFilters
                filters={filters}
                onFiltersChange={handleFiltersChange}
                categories={categories}
                locations={locations}
                loading={loading}
              />
            </div>

            {/* Equipment List */}
            <div className="lg:col-span-3 space-y-4">
              {/* Results Header */}
              <Card className="border-border/50">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Factory className="w-5 h-5 text-primary" />
                        Equipment Catalog
                      </CardTitle>
                      <CardDescription>
                        {loading ? (
                          <span className="flex items-center gap-2">
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Loading equipment...
                          </span>
                        ) : (
                          `Showing ${data.equipment.length} of ${data.pagination.total} equipment items`
                        )}
                      </CardDescription>
                    </div>
                    
                    {data.equipment.length > 0 && (
                      <Button variant="outline" size="sm">
                        <Download className="w-4 h-4 mr-2" />
                        Export
                      </Button>
                    )}
                  </div>
                </CardHeader>
                
                <CardContent className="pt-0">
                  <EquipmentGrid 
                    equipment={data.equipment}
                    loading={loading}
                    compact={viewMode === 'list'}
                    showActions={true}
                  />
                </CardContent>
              </Card>

              {/* Pagination */}
              {data.pagination.totalPages > 1 && (
                <Card className="border-border/50">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-muted-foreground">
                        Page {data.pagination.page} of {data.pagination.totalPages}
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handlePageChange(data.pagination.page - 1)}
                          disabled={data.pagination.page <= 1 || loading}
                        >
                          Previous
                        </Button>
                        
                        {/* Page Numbers */}
                        <div className="flex items-center gap-1">
                          {Array.from({ length: Math.min(5, data.pagination.totalPages) }, (_, i) => {
                            const pageNum = Math.max(1, data.pagination.page - 2) + i
                            if (pageNum > data.pagination.totalPages) return null
                            
                            return (
                              <Button
                                key={pageNum}
                                variant={pageNum === data.pagination.page ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => handlePageChange(pageNum)}
                                disabled={loading}
                                className="w-8 h-8 p-0"
                              >
                                {pageNum}
                              </Button>
                            )
                          })}
                        </div>
                        
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handlePageChange(data.pagination.page + 1)}
                          disabled={data.pagination.page >= data.pagination.totalPages || loading}
                        >
                          Next
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </main>
    </>
  )
}
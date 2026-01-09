"use client"

import { useState, useEffect, useCallback } from "react"
import { useAuthStore } from "@/lib/store"
import { AppHeader } from "@/components/app-header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ErrorCodeGrid } from "@/components/error-code-card"
import { ErrorCodeFilters } from "@/components/error-code-filters"
import { 
  Search, 
  AlertTriangle, 
  TrendingUp, 
  Clock, 
  BarChart3,
  RefreshCw,
  Loader2,
  ChevronLeft,
  ChevronRight
} from "lucide-react"
import { 
  fetchErrorCodes, 
  searchErrorCodes, 
  fetchErrorCodeStatistics,
  type ErrorCode, 
  type ErrorCodeSearchParams, 
  type ErrorCodeStatistics 
} from "@/lib/error-codes"
import { toast } from "sonner"

const ITEMS_PER_PAGE = 12

export default function ErrorCodesPage() {
  const { user } = useAuthStore()
  const [errorCodes, setErrorCodes] = useState<ErrorCode[]>([])
  const [allErrorCodes, setAllErrorCodes] = useState<ErrorCode[]>([])
  const [statistics, setStatistics] = useState<ErrorCodeStatistics | null>(null)
  const [loading, setLoading] = useState(true)
  const [searchLoading, setSearchLoading] = useState(false)
  const [quickSearch, setQuickSearch] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  
  // Initialize filters with useMemo to prevent re-renders
  const [filters, setFilters] = useState<ErrorCodeSearchParams>(() => ({
    sortBy: 'frequency_count',
    sortOrder: 'desc'
  }))

  // Get token from user object
  const token = user?.token

  // Pagination calculations
  const totalPages = Math.ceil(allErrorCodes.length / ITEMS_PER_PAGE)
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
  const endIndex = startIndex + ITEMS_PER_PAGE
  const paginatedErrorCodes = allErrorCodes.slice(startIndex, endIndex)

  const loadErrorCodes = useCallback(async (searchParams?: ErrorCodeSearchParams) => {
    if (!token) return
    
    try {
      setLoading(true)
      const params = searchParams || filters
      const response = await fetchErrorCodes(params, token)
      
      if (response.success) {
        setAllErrorCodes(response.data || [])
        setCurrentPage(1) // Reset to first page on new search
      } else {
        toast.error("Failed to load error codes")
        setAllErrorCodes([])
      }
    } catch (error) {
      console.error('Error loading error codes:', error)
      toast.error("Failed to load error codes")
      setAllErrorCodes([])
    } finally {
      setLoading(false)
    }
  }, [token]) // Remove filters from dependency array

  const loadStatistics = useCallback(async () => {
    if (!token) return
    
    try {
      const response = await fetchErrorCodeStatistics(token)
      if (response.success) {
        setStatistics(response.data)
      }
    } catch (error) {
      console.error('Error loading statistics:', error)
    }
  }, [token])

  // Load initial data
  useEffect(() => {
    if (user && token) {
      loadErrorCodes()
      loadStatistics()
    }
  }, [user, token]) // Remove loadErrorCodes and loadStatistics from dependencies

  // Update pagination when error codes change
  useEffect(() => {
    setErrorCodes(paginatedErrorCodes)
    // Reset to first page if current page is beyond available pages
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(1)
    }
  }, [allErrorCodes, currentPage, totalPages]) // Remove paginatedErrorCodes from dependencies

  const handleQuickSearch = useCallback(async () => {
    if (!token || !quickSearch.trim()) {
      // If empty search, reload all error codes
      if (!quickSearch.trim()) {
        loadErrorCodes()
      }
      return
    }
    
    try {
      setSearchLoading(true)
      const response = await searchErrorCodes(quickSearch.trim(), token)
      
      if (response.success) {
        setAllErrorCodes(response.data || [])
        setCurrentPage(1)
        toast.success(`Found ${response.count || 0} error codes`)
      } else {
        toast.error("Search failed")
      }
    } catch (error) {
      console.error('Error searching error codes:', error)
      toast.error("Search failed")
    } finally {
      setSearchLoading(false)
    }
  }, [token, quickSearch, loadErrorCodes])

  const handleFiltersChange = useCallback((newFilters: ErrorCodeSearchParams) => {
    setFilters(newFilters)
    loadErrorCodes(newFilters)
  }, [loadErrorCodes])

  const handleRefresh = useCallback(() => {
    loadErrorCodes()
    loadStatistics()
  }, [loadErrorCodes, loadStatistics])

  const handlePageChange = useCallback((page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page)
      // Scroll to top of results
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }, [totalPages])

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <AlertTriangle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-lg font-semibold mb-2">Authentication Required</h2>
          <p className="text-muted-foreground">Please log in to access error codes.</p>
        </div>
      </div>
    )
  }

  return (
    <>
      <AppHeader />
      <main className="flex-1 overflow-y-auto p-6">
        <div className="mx-auto max-w-7xl space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h2 className="text-3xl font-bold tracking-tight text-balance bg-gradient-to-br from-foreground to-foreground/70 bg-clip-text text-transparent">
              Error Codes
            </h2>
            <p className="text-muted-foreground">
              Industrial error code lookup and troubleshooting system
            </p>
          </div>
          <Button onClick={handleRefresh} variant="outline" size="sm">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
              <p className="text-muted-foreground">Loading error codes...</p>
            </div>
          </div>
        )}

        {/* Content - only show when not loading */}
        {!loading && (
          <>
            {/* Statistics Cards */}
            {statistics && (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Error Codes</CardTitle>
                    <BarChart3 className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{statistics.totalErrorCodes}</div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Critical Errors</CardTitle>
                    <AlertTriangle className="h-4 w-4 text-red-500" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-red-600">{statistics.criticalErrors}</div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Avg Frequency</CardTitle>
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{Math.round(statistics.avgFrequency)}</div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Avg Resolution</CardTitle>
                    <Clock className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{Math.round(statistics.avgResolutionTime)}m</div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Quick Search */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Quick Lookup</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      placeholder="Enter error code (e.g., CONV001) or search term..."
                      value={quickSearch}
                      onChange={(e) => setQuickSearch(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleQuickSearch()}
                      className="pl-10"
                    />
                  </div>
                  <Button 
                    onClick={handleQuickSearch} 
                    disabled={searchLoading || !quickSearch.trim()}
                  >
                    {searchLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Search className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Main Content */}
            <div className="grid gap-6 lg:grid-cols-4">
              {/* Filters Sidebar */}
              <div className="lg:col-span-1">
                <ErrorCodeFilters
                  filters={filters}
                  onFiltersChange={handleFiltersChange}
                  loading={loading}
                />
              </div>

              {/* Error Codes Grid */}
              <div className="lg:col-span-3">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <h2 className="text-lg font-semibold">Error Codes</h2>
                      <Badge variant="secondary">
                        {allErrorCodes.length} {allErrorCodes.length === 1 ? 'code' : 'codes'}
                      </Badge>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <ErrorCodeGrid 
                    errorCodes={errorCodes} 
                    loading={false}
                    showActions={true}
                  />

                  {/* Pagination Controls */}
                  {totalPages > 1 && (
                    <div className="flex items-center justify-between pt-4 pb-8">
                      <div className="text-sm text-muted-foreground">
                        Showing {startIndex + 1}-{Math.min(endIndex, allErrorCodes.length)} of {allErrorCodes.length} error codes
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handlePageChange(currentPage - 1)}
                          disabled={currentPage === 1 || loading}
                        >
                          <ChevronLeft className="w-4 h-4 mr-1" />
                          Previous
                        </Button>
                        
                        <div className="flex items-center gap-1">
                          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                            let pageNum
                            if (totalPages <= 5) {
                              pageNum = i + 1
                            } else if (currentPage <= 3) {
                              pageNum = i + 1
                            } else if (currentPage >= totalPages - 2) {
                              pageNum = totalPages - 4 + i
                            } else {
                              pageNum = currentPage - 2 + i
                            }
                            
                            return (
                              <Button
                                key={pageNum}
                                variant={currentPage === pageNum ? "default" : "outline"}
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
                          onClick={() => handlePageChange(currentPage + 1)}
                          disabled={currentPage === totalPages || loading}
                        >
                          Next
                          <ChevronRight className="w-4 h-4 ml-1" />
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </>
        )}
        </div>
      </main>
    </>
  )
}
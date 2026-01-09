"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { useAuthStore } from "@/lib/store"
import { AppHeader } from "@/components/app-header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  ArrowLeft,
  AlertTriangle,
  Clock,
  TrendingUp,
  Wrench,
  History,
  BarChart3,
  Loader2
} from "lucide-react"
import { 
  fetchErrorCodeByCode, 
  fetchTroubleshootingProcedures,
  getSeverityColor,
  getCategoryColor,
  formatDuration,
  formatFrequency,
  type ErrorCode, 
  type TroubleshootingProcedure 
} from "@/lib/error-codes"
import { toast } from "sonner"

export default function ErrorCodeDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { user } = useAuthStore()
  const [errorCode, setErrorCode] = useState<ErrorCode | null>(null)
  const [procedures, setProcedures] = useState<TroubleshootingProcedure[]>([])
  const [loading, setLoading] = useState(true)
  const [proceduresLoading, setProceduresLoading] = useState(false)

  const code = params.code as string
  const token = user?.token

  useEffect(() => {
    if (user && token && code) {
      loadErrorCode()
      loadProcedures()
    }
  }, [user, token, code])

  const loadErrorCode = async () => {
    if (!token || !code) return
    
    try {
      setLoading(true)
      console.log('Loading error code:', code, 'with token:', token ? 'present' : 'missing')
      
      // Add timeout to prevent hanging
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 10000) // 10 second timeout
      
      const response = await fetchErrorCodeByCode(code, token)
      clearTimeout(timeoutId)
      
      console.log('Error code response:', response)
      
      if (response.success) {
        setErrorCode(response.data)
      } else {
        console.error('Error code not found:', response.message)
        toast.error("Error code not found")
        router.push('/error-codes')
      }
    } catch (error) {
      console.error('Error loading error code:', error)
      if (error.name === 'AbortError') {
        toast.error("Request timed out. Please try again.")
      } else {
        toast.error("Failed to load error code")
      }
      router.push('/error-codes')
    } finally {
      setLoading(false)
    }
  }

  const loadProcedures = async () => {
    if (!token || !code) return
    
    try {
      setProceduresLoading(true)
      const response = await fetchTroubleshootingProcedures(code, token)
      
      if (response.success) {
        setProcedures(response.data || [])
      } else {
        console.warn('No procedures found for error code:', code)
        setProcedures([])
      }
    } catch (error) {
      console.error('Error loading procedures:', error)
      // Don't show error toast for procedures, just log it
      setProcedures([])
    } finally {
      setProceduresLoading(false)
    }
  }

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'CRITICAL':
        return <AlertTriangle className="w-5 h-5 text-red-500" />
      case 'HIGH':
        return <AlertTriangle className="w-5 h-5 text-orange-500" />
      case 'MEDIUM':
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />
      case 'LOW':
        return <AlertTriangle className="w-5 h-5 text-green-500" />
      default:
        return <AlertTriangle className="w-5 h-5 text-gray-500" />
    }
  }

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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading error code {code}...</p>
          <div className="text-xs text-muted-foreground">
            <p>If this takes too long, the backend server might not be running.</p>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => router.push('/error-codes')}
              className="mt-2"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Error Codes
            </Button>
          </div>
        </div>
      </div>
    )
  }

  if (!errorCode) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <AlertTriangle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-lg font-semibold mb-2">Error Code Not Found</h2>
          <p className="text-muted-foreground mb-4">The requested error code could not be found.</p>
          <Button onClick={() => router.push('/error-codes')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Error Codes
          </Button>
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
      <div className="flex items-center gap-4">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => router.push('/error-codes')}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <span className="font-mono text-2xl font-bold">{errorCode.code}</span>
            {getSeverityIcon(errorCode.severity_level)}
            <Badge className={`${getSeverityColor(errorCode.severity_level)}`}>
              {errorCode.severity_level}
            </Badge>
          </div>
          <h1 className="text-xl font-semibold">{errorCode.title}</h1>
        </div>
      </div>

      {/* Error Code Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Error Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">{errorCode.description}</p>
          
          <div className="grid gap-4 md:grid-cols-3">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className={`${getCategoryColor(errorCode.category)}`}>
                {errorCode.category}
              </Badge>
            </div>
            
            <div className="flex items-center gap-2 text-sm">
              <TrendingUp className="w-4 h-4 text-muted-foreground" />
              <span className="text-muted-foreground">Frequency:</span>
              <span className="font-medium">{formatFrequency(errorCode.frequency_count)}</span>
            </div>
            
            <div className="flex items-center gap-2 text-sm">
              <Clock className="w-4 h-4 text-muted-foreground" />
              <span className="text-muted-foreground">Avg Resolution:</span>
              <span className="font-medium">{formatDuration(errorCode.avg_resolution_time_minutes)}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="procedures" className="space-y-4">
        <TabsList>
          <TabsTrigger value="procedures" className="flex items-center gap-2">
            <Wrench className="w-4 h-4" />
            Troubleshooting Procedures
          </TabsTrigger>
          <TabsTrigger value="history" className="flex items-center gap-2">
            <History className="w-4 h-4" />
            Resolution History
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4" />
            Analytics
          </TabsTrigger>
        </TabsList>

        <TabsContent value="procedures">
          <Card>
            <CardHeader>
              <CardTitle>Troubleshooting Procedures</CardTitle>
            </CardHeader>
            <CardContent>
              {proceduresLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin" />
                </div>
              ) : procedures.length > 0 ? (
                <div className="space-y-4">
                  {procedures.map((procedure, index) => (
                    <Card key={procedure.id} className="border-border/50">
                      <CardHeader className="pb-3">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">Step {procedure.step_number}</Badge>
                          <CardTitle className="text-base">{procedure.title}</CardTitle>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <p className="text-sm">{procedure.instruction}</p>
                        
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            <span>{formatDuration(procedure.estimated_time_minutes)}</span>
                          </div>
                          {procedure.required_tools && procedure.required_tools.length > 0 && (
                            <div className="flex items-center gap-1">
                              <Wrench className="w-3 h-3" />
                              <span>Tools: {procedure.required_tools.join(', ')}</span>
                            </div>
                          )}
                        </div>
                        
                        {procedure.safety_notes && (
                          <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-md">
                            <div className="flex items-start gap-2">
                              <AlertTriangle className="w-4 h-4 text-yellow-600 dark:text-yellow-400 mt-0.5" />
                              <div>
                                <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200">Safety Note</p>
                                <p className="text-sm text-yellow-700 dark:text-yellow-300">{procedure.safety_notes}</p>
                              </div>
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Wrench className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="font-semibold text-lg mb-2">No Procedures Available</h3>
                  <p className="text-sm text-muted-foreground">
                    No troubleshooting procedures have been defined for this error code yet.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle>Resolution History</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <History className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="font-semibold text-lg mb-2">Coming Soon</h3>
                <p className="text-sm text-muted-foreground">
                  Resolution history tracking will be available in a future update.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics">
          <Card>
            <CardHeader>
              <CardTitle>Error Analytics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <BarChart3 className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="font-semibold text-lg mb-2">Coming Soon</h3>
                <p className="text-sm text-muted-foreground">
                  Detailed analytics and trends will be available in a future update.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
        </div>
      </main>
    </>
  )
}
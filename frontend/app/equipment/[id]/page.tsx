"use client"

import { useEffect, useState, use } from "react"
import { useRouter } from "next/navigation"
import { useAuthStore } from "@/lib/store"
import { AppHeader } from "@/components/app-header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { EquipmentStatusBadge, CriticalityBadge, AlarmBadge } from "@/components/equipment-status-badge"
import { 
  ArrowLeft,
  AlertCircle, 
  Loader2,
  Settings,
  Activity,
  Wrench,
  AlertTriangle,
  Calendar,
  MapPin,
  Building,
  Factory,
  Gauge,
  Clock,
  TrendingUp,
  FileText,
  ExternalLink
} from "lucide-react"
import Link from "next/link"
import { 
  fetchEquipmentById,
  fetchEquipmentStatus,
  fetchEquipmentAlarms,
  fetchMaintenanceHistory,
  calculateOEE,
  formatDuration,
  formatCurrency,
  formatPercentage,
  formatNumber,
  isMaintenanceDue,
  isMaintenanceOverdue,
  type Equipment,
  type EquipmentStatus,
  type EquipmentAlarm,
  type MaintenanceRecord
} from "@/lib/equipment"

interface EquipmentDetailPageProps {
  params: Promise<{
    id: string
  }>
}

export default function EquipmentDetailPage({ params }: EquipmentDetailPageProps) {
  const router = useRouter()
  const { user } = useAuthStore()
  const resolvedParams = use(params)
  
  // State management
  const [equipment, setEquipment] = useState<Equipment | null>(null)
  const [status, setStatus] = useState<EquipmentStatus | null>(null)
  const [alarms, setAlarms] = useState<EquipmentAlarm[]>([])
  const [maintenance, setMaintenance] = useState<MaintenanceRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [activeTab, setActiveTab] = useState("overview")

  // Fetch equipment data
  const fetchData = async () => {
    if (!user?.token) return

    try {
      setLoading(true)
      setError("")
      
      // Fetch equipment details
      const equipmentResponse = await fetchEquipmentById(resolvedParams.id, user.token)
      
      if (!equipmentResponse.success) {
        setError(equipmentResponse.error || "Equipment not found")
        return
      }
      
      const equipmentData = equipmentResponse.data
      setEquipment(equipmentData)
      
      // Fetch additional data in parallel
      const [statusResponse, alarmsResponse, maintenanceResponse] = await Promise.all([
        fetchEquipmentStatus(resolvedParams.id, user.token).catch(() => ({ success: false })),
        fetchEquipmentAlarms(resolvedParams.id, user.token).catch(() => ({ success: false, data: [] })),
        fetchMaintenanceHistory(resolvedParams.id, user.token, { limit: 10 }).catch(() => ({ success: false, data: [] }))
      ])
      
      if (statusResponse.success) {
        setStatus(statusResponse.data)
      }
      
      if (alarmsResponse.success) {
        setAlarms(alarmsResponse.data || [])
      }
      
      if (maintenanceResponse.success) {
        setMaintenance(maintenanceResponse.data || [])
      }
      
    } catch (err) {
      console.error('Error fetching equipment data:', err)
      setError(err instanceof Error ? err.message : "Failed to fetch equipment data")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (user) {
      fetchData()
    }
  }, [user, resolvedParams.id])

  // Check permissions
  useEffect(() => {
    if (user && !['admin', 'editor', 'viewer'].includes(user.role)) {
      router.push("/dashboard")
    }
  }, [user, router])

  if (!user) return null

  if (loading) {
    return (
      <>
        <AppHeader />
        <main className="flex-1 overflow-y-auto p-6">
          <div className="mx-auto max-w-7xl">
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
                <p className="text-muted-foreground">Loading equipment details...</p>
              </div>
            </div>
          </div>
        </main>
      </>
    )
  }

  if (error || !equipment) {
    return (
      <>
        <AppHeader />
        <main className="flex-1 overflow-y-auto p-6">
          <div className="mx-auto max-w-7xl">
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error || "Equipment not found"}</AlertDescription>
            </Alert>
          </div>
        </main>
      </>
    )
  }

  const oee = status ? calculateOEE(
    formatNumber(status.availabilityPercentage), 
    formatNumber(status.reliabilityPercentage), 
    formatNumber(status.efficiencyPercentage)
  ) : 0
  const activeAlarms = alarms.filter(alarm => alarm.status === 'ACTIVE')
  const criticalAlarms = activeAlarms.filter(alarm => alarm.alarmType === 'CRITICAL')

  return (
    <>
      <AppHeader />
      <main className="flex-1 overflow-y-auto p-6" suppressHydrationWarning>
        <div className="mx-auto max-w-7xl space-y-6">
          {/* Header */}
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => router.back()}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold">{equipment.equipmentNumber}</h1>
                <EquipmentStatusBadge status={equipment.operationalState} />
                <CriticalityBadge criticality={equipment.criticality} />
              </div>
              <p className="text-lg text-muted-foreground">{equipment.name}</p>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card className="border-border/50">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-green-100 p-2 ring-1 ring-green-200">
                    <Gauge className="w-5 h-5 text-green-700" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">OEE</p>
                    <p className="text-2xl font-bold">{oee.toFixed(1)}%</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border/50">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-blue-100 p-2 ring-1 ring-blue-200">
                    <Clock className="w-5 h-5 text-blue-700" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Runtime</p>
                    <p className="text-2xl font-bold">{status?.runtimeHours?.toLocaleString() || 0}h</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border/50">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className={`rounded-lg p-2 ring-1 ${activeAlarms.length > 0 ? 'bg-red-100 ring-red-200' : 'bg-green-100 ring-green-200'}`}>
                    <AlertTriangle className={`w-5 h-5 ${activeAlarms.length > 0 ? 'text-red-700' : 'text-green-700'}`} />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Active Alarms</p>
                    <p className="text-2xl font-bold">{activeAlarms.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border/50">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-yellow-100 p-2 ring-1 ring-yellow-200">
                    <Wrench className="w-5 h-5 text-yellow-700" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Maintenance Due</p>
                    <p className="text-2xl font-bold">
                      {status && isMaintenanceDue(status.nextMaintenanceDate) ? 'Yes' : 'No'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="status">Status & Performance</TabsTrigger>
              <TabsTrigger value="maintenance">Maintenance</TabsTrigger>
              <TabsTrigger value="alarms">Alarms</TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                {/* Equipment Information */}
                <Card className="border-border/50">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Settings className="w-5 h-5 text-primary" />
                      Equipment Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Manufacturer:</span>
                        <p className="font-medium">{equipment.manufacturer}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Model:</span>
                        <p className="font-medium">{equipment.model}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Serial Number:</span>
                        <p className="font-mono text-xs bg-muted px-2 py-1 rounded">
                          {equipment.serialNumber}
                        </p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Category:</span>
                        <p className="font-medium">{equipment.category?.name || 'Unknown'}</p>
                      </div>
                    </div>
                    
                    <div className="pt-2 border-t border-border/50">
                      <span className="text-muted-foreground text-sm">Description:</span>
                      <p className="mt-1">{equipment.description}</p>
                    </div>
                  </CardContent>
                </Card>

                {/* Location Information */}
                <Card className="border-border/50">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <MapPin className="w-5 h-5 text-primary" />
                      Location
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {equipment.location ? (
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <Building className="w-4 h-4 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground">Plant:</span>
                          <Badge variant="outline">{equipment.location.plant}</Badge>
                        </div>
                        <div className="flex items-center gap-2">
                          <Factory className="w-4 h-4 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground">Area:</span>
                          <Badge variant="outline">{equipment.location.area}</Badge>
                        </div>
                        {equipment.location.line && (
                          <div className="flex items-center gap-2">
                            <span className="w-4 h-4" />
                            <span className="text-sm text-muted-foreground">Line:</span>
                            <Badge variant="outline">{equipment.location.line}</Badge>
                          </div>
                        )}
                        {equipment.location.station && (
                          <div className="flex items-center gap-2">
                            <span className="w-4 h-4" />
                            <span className="text-sm text-muted-foreground">Station:</span>
                            <Badge variant="outline">{equipment.location.station}</Badge>
                          </div>
                        )}
                        <div className="pt-2 border-t border-border/50">
                          <span className="text-muted-foreground text-sm">Functional Location:</span>
                          <p className="font-mono text-xs bg-muted px-2 py-1 rounded mt-1">
                            {equipment.location.functionalLocation}
                          </p>
                        </div>
                      </div>
                    ) : (
                      <p className="text-muted-foreground">Location information not available</p>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Installation & Dates */}
              <Card className="border-border/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-primary" />
                    Installation & Timeline
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Installation Date:</span>
                      <p className="font-medium">{new Date(equipment.installationDate).toLocaleDateString()}</p>
                    </div>
                    {equipment.commissioningDate && (
                      <div>
                        <span className="text-muted-foreground">Commissioning Date:</span>
                        <p className="font-medium">{new Date(equipment.commissioningDate).toLocaleDateString()}</p>
                      </div>
                    )}
                    {equipment.warrantyExpiry && (
                      <div>
                        <span className="text-muted-foreground">Warranty Expiry:</span>
                        <p className="font-medium">{new Date(equipment.warrantyExpiry).toLocaleDateString()}</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Status & Performance Tab */}
            <TabsContent value="status" className="space-y-4">
              {status ? (
                <div className="grid gap-4 md:grid-cols-2">
                  {/* Performance Metrics */}
                  <Card className="border-border/50">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-primary" />
                        Performance Metrics
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-muted-foreground">Availability:</span>
                          <span className="font-bold text-lg">{formatPercentage(status.availabilityPercentage)}%</span>
                        </div>
                        <div className="w-full bg-muted rounded-full h-2">
                          <div 
                            className="bg-green-500 h-2 rounded-full transition-all duration-300" 
                            style={{ width: `${formatNumber(status.availabilityPercentage)}%` }}
                          />
                        </div>
                      </div>

                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-muted-foreground">Reliability:</span>
                          <span className="font-bold text-lg">{formatPercentage(status.reliabilityPercentage)}%</span>
                        </div>
                        <div className="w-full bg-muted rounded-full h-2">
                          <div 
                            className="bg-blue-500 h-2 rounded-full transition-all duration-300" 
                            style={{ width: `${formatNumber(status.reliabilityPercentage)}%` }}
                          />
                        </div>
                      </div>

                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-muted-foreground">Efficiency:</span>
                          <span className="font-bold text-lg">{formatPercentage(status.efficiencyPercentage)}%</span>
                        </div>
                        <div className="w-full bg-muted rounded-full h-2">
                          <div 
                            className="bg-yellow-500 h-2 rounded-full transition-all duration-300" 
                            style={{ width: `${formatNumber(status.efficiencyPercentage)}%` }}
                          />
                        </div>
                      </div>

                      <div className="pt-3 border-t border-border/50">
                        <div className="flex justify-between items-center">
                          <span className="text-muted-foreground">Overall Equipment Effectiveness (OEE):</span>
                          <span className="font-bold text-xl text-primary">{oee.toFixed(1)}%</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Status Information */}
                  <Card className="border-border/50">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Activity className="w-5 h-5 text-primary" />
                        Current Status
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">Runtime Hours:</span>
                          <p className="font-bold text-lg">{formatNumber(status.runtimeHours).toLocaleString()}</p>
                        </div>
                        {status.cycleCount && (
                          <div>
                            <span className="text-muted-foreground">Cycle Count:</span>
                            <p className="font-bold text-lg">{formatNumber(status.cycleCount).toLocaleString()}</p>
                          </div>
                        )}
                        <div>
                          <span className="text-muted-foreground">Alarm Count:</span>
                          <p className="font-bold text-lg text-red-600">{formatNumber(status.alarmCount)}</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Warning Count:</span>
                          <p className="font-bold text-lg text-yellow-600">{formatNumber(status.warningCount)}</p>
                        </div>
                      </div>

                      {status.lastMaintenanceDate && (
                        <div className="pt-3 border-t border-border/50">
                          <span className="text-muted-foreground text-sm">Last Maintenance:</span>
                          <p className="font-medium">{new Date(status.lastMaintenanceDate).toLocaleDateString()}</p>
                        </div>
                      )}

                      {status.nextMaintenanceDate && (
                        <div>
                          <span className="text-muted-foreground text-sm">Next Maintenance:</span>
                          <div className="flex items-center gap-2 mt-1">
                            <p className="font-medium">{new Date(status.nextMaintenanceDate).toLocaleDateString()}</p>
                            {isMaintenanceDue(status.nextMaintenanceDate) && (
                              <Badge variant="destructive" className="text-xs">Due</Badge>
                            )}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              ) : (
                <Card className="border-border/50">
                  <CardContent className="p-8 text-center">
                    <Activity className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">Status information not available</p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* Maintenance Tab */}
            <TabsContent value="maintenance" className="space-y-4">
              <Card className="border-border/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Wrench className="w-5 h-5 text-primary" />
                    Maintenance History
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {maintenance.length > 0 ? (
                    <div className="rounded-lg border border-border/50 overflow-hidden">
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-muted/50">
                            <TableHead>Work Order</TableHead>
                            <TableHead>Type</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Scheduled</TableHead>
                            <TableHead>Technician</TableHead>
                            <TableHead className="text-right">Cost</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {maintenance.slice(0, 5).map((record) => (
                            <TableRow key={record.id}>
                              <TableCell className="font-medium">{record.workOrderNumber}</TableCell>
                              <TableCell>
                                <Badge variant="outline" className="text-xs">
                                  {record.workType}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <Badge 
                                  variant="outline" 
                                  className={`text-xs ${
                                    record.status === 'COMPLETED' ? 'bg-green-100 text-green-800 border-green-200' :
                                    record.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-800 border-blue-200' :
                                    record.status === 'SCHEDULED' ? 'bg-yellow-100 text-yellow-800 border-yellow-200' :
                                    'bg-gray-100 text-gray-800 border-gray-200'
                                  }`}
                                >
                                  {record.status}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  {record.scheduledDate && new Date(record.scheduledDate).toLocaleDateString()}
                                  {isMaintenanceOverdue(record.scheduledDate, record.status) && (
                                    <Badge variant="destructive" className="text-xs">Overdue</Badge>
                                  )}
                                </div>
                              </TableCell>
                              <TableCell>{record.technicianAssigned || '-'}</TableCell>
                              <TableCell className="text-right">{formatCurrency(record.totalCost || 0)}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Wrench className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">No maintenance records found</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Alarms Tab */}
            <TabsContent value="alarms" className="space-y-4">
              <Card className="border-border/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-primary" />
                    Active Alarms
                    {activeAlarms.length > 0 && (
                      <Badge variant="destructive" className="ml-2">
                        {activeAlarms.length}
                      </Badge>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {activeAlarms.length > 0 ? (
                    <div className="space-y-3">
                      {activeAlarms.map((alarm) => (
                        <div key={alarm.id} className="border border-border/50 rounded-lg p-4">
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <AlarmBadge type={alarm.alarmType} />
                              <span className="font-medium">{alarm.alarmCode}</span>
                              <Badge variant="outline" className="text-xs">
                                Severity: {alarm.severity}
                              </Badge>
                            </div>
                            <span className="text-xs text-muted-foreground">
                              {new Date(alarm.triggeredAt).toLocaleString()}
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground">{alarm.description}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <AlertTriangle className="w-12 h-12 text-green-500 mx-auto mb-4" />
                      <p className="text-muted-foreground">No active alarms</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </>
  )
}
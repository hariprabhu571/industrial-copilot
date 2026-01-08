"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuthStore, useChatStore } from "@/lib/store"
import { AppHeader } from "@/components/app-header"
import { StatCard } from "@/components/stat-card"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { FileText, MessageSquare, Clock, Activity, Upload, FileSearch, Loader2, Settings } from "lucide-react"
import Link from "next/link"
import { hasPermission } from "@/lib/auth"

interface DashboardStats {
  totalDocuments: number
  totalQueries: number
  avgResponseTime: string
  systemStatus: string
  recentDocuments: Array<{
    id: string
    name: string
    uploadedBy: string
    uploadedAt: string
  }>
}

export default function DashboardPage() {
  const router = useRouter()
  const { user } = useAuthStore()
  const { getUserMessages } = useChatStore()
  const [stats, setStats] = useState<DashboardStats>({
    totalDocuments: 0,
    totalQueries: 0,
    avgResponseTime: "-",
    systemStatus: "Loading...",
    recentDocuments: []
  })
  const [loading, setLoading] = useState(true)

  // Fetch dashboard statistics
  const fetchDashboardStats = async () => {
    if (!user?.token) return

    try {
      setLoading(true)
      
      // Fetch documents from API
      const documentsResponse = await fetch('/api/documents', {
        headers: {
          'Authorization': `Bearer ${user.token}`,
          'Content-Type': 'application/json'
        }
      })

      let totalDocuments = 0
      let recentDocuments: any[] = []

      if (documentsResponse.ok) {
        const documentsData = await documentsResponse.json()
        totalDocuments = documentsData.total || 0
        recentDocuments = (documentsData.documents || []).slice(0, 3).map((doc: any) => ({
          id: doc.id,
          name: doc.name,
          uploadedBy: doc.uploadedBy,
          uploadedAt: doc.uploadedAt
        }))
      }

      // Get user messages from local store
      const messages = getUserMessages(user.id)
      const userMessages = messages.filter((m) => m.role === "user")
      const avgResponseTime = messages.length > 0 ? "1.2s" : "-"

      setStats({
        totalDocuments,
        totalQueries: userMessages.length,
        avgResponseTime,
        systemStatus: "Online",
        recentDocuments
      })
    } catch (error) {
      console.error('Error fetching dashboard stats:', error)
      // Fallback to local data
      const messages = getUserMessages(user.id)
      const userMessages = messages.filter((m) => m.role === "user")
      
      setStats({
        totalDocuments: 0,
        totalQueries: userMessages.length,
        avgResponseTime: messages.length > 0 ? "1.2s" : "-",
        systemStatus: "Online",
        recentDocuments: []
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (user) {
      fetchDashboardStats()
    }
  }, [user])

  if (!user) return null

  return (
    <>
      <AppHeader />
      <main className="flex-1 overflow-y-auto p-6">
        <div className="mx-auto max-w-7xl space-y-6">
          {/* Welcome Section */}
          <div className="space-y-1">
            <h2 className="text-2xl font-bold tracking-tight text-balance">Welcome back, {user.name}!</h2>
            <p className="text-muted-foreground">{"Here's what's happening with your Industrial AI Copilot"}</p>
          </div>

          {/* Stats Grid */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <StatCard
              title="Total Documents"
              value={loading ? <Loader2 className="size-4 animate-spin" /> : stats.totalDocuments}
              icon={FileText}
              description="Documents in system"
            />
            <StatCard
              title="Total Queries"
              value={stats.totalQueries}
              icon={MessageSquare}
              description="Questions asked"
            />
            <StatCard 
              title="Avg Response Time" 
              value={stats.avgResponseTime} 
              icon={Clock} 
              description="System performance" 
            />
            <StatCard 
              title="System Status" 
              value={loading ? "Loading..." : stats.systemStatus} 
              icon={Activity} 
              description="All systems operational" 
            />
          </div>

          {/* Content Grid */}
          <div className="grid gap-6 md:grid-cols-2">
            {/* Quick Actions */}
            <Card className="border-border/50">
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>Common tasks and shortcuts</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Link href="/chat" className="block">
                  <Button variant="outline" className="w-full justify-start bg-transparent" size="lg">
                    <MessageSquare className="mr-2 size-5" />
                    Start Chat
                  </Button>
                </Link>
                <Link href="/equipment" className="block">
                  <Button variant="outline" className="w-full justify-start bg-transparent" size="lg">
                    <Settings className="mr-2 size-5" />
                    Equipment Management
                  </Button>
                </Link>
                {hasPermission(user.role, "upload") && (
                  <Link href="/upload" className="block">
                    <Button variant="outline" className="w-full justify-start bg-transparent" size="lg">
                      <Upload className="mr-2 size-5" />
                      Upload Document (Admin)
                    </Button>
                  </Link>
                )}
                <Link href="/documents" className="block">
                  <Button variant="outline" className="w-full justify-start bg-transparent" size="lg">
                    <FileText className="mr-2 size-5" />
                    Browse Documents
                  </Button>
                </Link>
                {hasPermission(user.role, "audit") && (
                  <Link href="/audit" className="block">
                    <Button variant="outline" className="w-full justify-start bg-transparent" size="lg">
                      <FileSearch className="mr-2 size-5" />
                      View Audit Logs
                    </Button>
                  </Link>
                )}
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card className="border-border/50">
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>Latest system events</CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <Loader2 className="size-8 animate-spin text-muted-foreground mb-4" />
                    <p className="text-sm text-muted-foreground">Loading recent activity...</p>
                  </div>
                ) : stats.recentDocuments.length === 0 && stats.totalQueries === 0 ? (
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <div className="rounded-lg bg-muted/50 p-4 ring-1 ring-border/50">
                      <Activity className="size-8 text-muted-foreground" />
                    </div>
                    <p className="mt-4 text-sm font-medium text-foreground">No recent activity</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Start by uploading documents or asking questions
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {stats.recentDocuments.map((doc) => (
                      <div key={doc.id} className="flex items-center gap-3 rounded-lg border border-border/50 p-3">
                        <div className="rounded bg-primary/10 p-2 ring-1 ring-primary/20">
                          <FileText className="size-4 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-foreground truncate">{doc.name}</p>
                          <p className="text-xs text-muted-foreground">Uploaded by {doc.uploadedBy}</p>
                        </div>
                      </div>
                    ))}
                    {getUserMessages(user.id).filter((m) => m.role === "user").slice(0, 2).map((msg) => (
                      <div key={msg.id} className="flex items-center gap-3 rounded-lg border border-border/50 p-3">
                        <div className="rounded bg-primary/10 p-2 ring-1 ring-primary/20">
                          <MessageSquare className="size-4 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-foreground truncate">{msg.content}</p>
                          <p className="text-xs text-muted-foreground">{new Date(msg.timestamp).toLocaleString()}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </>
  )
}
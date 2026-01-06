"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuthStore, useAuditStore, type AuditLog } from "@/lib/store"
import { AppHeader } from "@/components/app-header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Search, Download, FileSearch, Calendar } from "lucide-react"
import { hasPermission } from "@/lib/auth"

export default function AuditPage() {
  const router = useRouter()
  const { user } = useAuthStore()
  const { logs } = useAuditStore()
  const [searchQuery, setSearchQuery] = useState("")
  const [filteredLogs, setFilteredLogs] = useState<AuditLog[]>(logs)

  useEffect(() => {
    if (!user) {
      router.push("/")
    } else if (!hasPermission(user.role, "audit")) {
      router.push("/dashboard")
    }
  }, [user, router])

  useEffect(() => {
    const filtered = logs.filter(
      (log) =>
        log.user.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.details.toLowerCase().includes(searchQuery.toLowerCase()),
    )
    setFilteredLogs(filtered)
  }, [searchQuery, logs])

  if (!user || !hasPermission(user.role, "audit")) return null

  const exportLogs = () => {
    const csv = [
      ["Timestamp", "User", "Action", "Details", "Response"],
      ...filteredLogs.map((log) => [
        new Date(log.timestamp).toISOString(),
        log.user,
        log.action,
        log.details,
        log.response || "N/A",
      ]),
    ]
      .map((row) => row.map((cell) => `"${cell}"`).join(","))
      .join("\n")

    const blob = new Blob([csv], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `audit-logs-${new Date().toISOString().split("T")[0]}.csv`
    a.click()
  }

  const getActionBadgeVariant = (action: string) => {
    switch (action.toLowerCase()) {
      case "query":
        return "default"
      case "upload":
        return "secondary"
      case "delete":
        return "destructive"
      default:
        return "outline"
    }
  }

  return (
    <>
      <AppHeader />
      <main className="flex-1 overflow-y-auto p-6">
        <div className="mx-auto max-w-7xl space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h2 className="text-2xl font-bold tracking-tight">Audit Logs</h2>
              <p className="text-muted-foreground">Complete activity history and system events</p>
            </div>
            <Button onClick={exportLogs} disabled={filteredLogs.length === 0}>
              <Download className="mr-2 size-4" />
              Export CSV
            </Button>
          </div>

          <Card className="border-border/50">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Activity Log</CardTitle>
                  <CardDescription>{logs.length} total events recorded</CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="icon">
                    <Calendar className="size-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search by user, action, or details..."
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              {/* Audit Table */}
              {filteredLogs.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="rounded-lg bg-muted/50 p-4 ring-1 ring-border/50">
                    <FileSearch className="size-12 text-muted-foreground" />
                  </div>
                  <p className="mt-4 text-sm font-medium text-foreground">No audit logs found</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {logs.length === 0
                      ? "Activity will appear here as users interact with the system"
                      : "Try adjusting your search criteria"}
                  </p>
                </div>
              ) : (
                <div className="rounded-lg border border-border/50 overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/30 hover:bg-muted/30">
                        <TableHead>Timestamp</TableHead>
                        <TableHead>User</TableHead>
                        <TableHead>Action</TableHead>
                        <TableHead>Details</TableHead>
                        <TableHead>Response</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredLogs.map((log) => (
                        <TableRow key={log.id}>
                          <TableCell className="text-muted-foreground">
                            <div className="flex flex-col">
                              <span className="text-sm">{new Date(log.timestamp).toLocaleDateString()}</span>
                              <span className="text-xs">{new Date(log.timestamp).toLocaleTimeString()}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="font-mono text-xs">
                              {log.user}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant={getActionBadgeVariant(log.action)}>{log.action}</Badge>
                          </TableCell>
                          <TableCell className="max-w-md">
                            <p className="truncate text-sm text-foreground">{log.details}</p>
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {log.response && (
                              <Badge variant="outline" className="bg-success/10 border-success/30 text-success">
                                {log.response}
                              </Badge>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}

              {/* Pagination Info */}
              {filteredLogs.length > 0 && (
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <span>
                    Showing {filteredLogs.length} of {logs.length} events
                  </span>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" disabled>
                      Previous
                    </Button>
                    <span>Page 1 of 1</span>
                    <Button variant="outline" size="sm" disabled>
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </>
  )
}

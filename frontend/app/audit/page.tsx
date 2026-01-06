"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuthStore, useAuditStore } from "@/lib/store"
import { AppHeader } from "@/components/app-header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { FileSearch, Activity } from "lucide-react"
import { hasPermission } from "@/lib/auth"

export default function AuditPage() {
  const router = useRouter()
  const { user } = useAuthStore()
  const { logs } = useAuditStore()

  useEffect(() => {
    if (user && !hasPermission(user.role, "audit")) {
      router.push("/dashboard")
    } else if (!hasPermission(user.role, "audit")) {
      router.push("/dashboard")
    }
  }, [user, router])

  if (!user || !hasPermission(user.role, "audit")) return null

  return (
    <>
      <AppHeader />
      <main className="flex-1 overflow-y-auto p-6">
        <div className="mx-auto max-w-7xl space-y-6">
          <div className="space-y-1">
            <h2 className="text-2xl font-bold tracking-tight">Audit Logs</h2>
            <p className="text-muted-foreground">System activity and user actions</p>
          </div>

          <Card className="border-border/50">
            <CardHeader>
              <CardTitle>Activity Logs</CardTitle>
              <CardDescription>{logs.length} total log entries</CardDescription>
            </CardHeader>
            <CardContent>
              {logs.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="rounded-lg bg-muted/50 p-4 ring-1 ring-border/50">
                    <FileSearch className="size-12 text-muted-foreground" />
                  </div>
                  <p className="mt-4 text-sm font-medium text-foreground">No audit logs</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    System activity will appear here as users interact with the platform
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
                        <TableHead>Response Time</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {logs.map((log) => (
                        <TableRow key={log.id}>
                          <TableCell className="text-muted-foreground">
                            {new Date(log.timestamp).toLocaleString()}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{log.user}</Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Activity className="size-4 text-primary" />
                              {log.action}
                            </div>
                          </TableCell>
                          <TableCell className="max-w-md truncate">{log.details}</TableCell>
                          <TableCell className="text-muted-foreground">{log.response || "-"}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </>
  )
}
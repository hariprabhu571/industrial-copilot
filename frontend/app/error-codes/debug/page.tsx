"use client"

import { useAuthStore } from "@/lib/store"
import { AppHeader } from "@/components/app-header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertTriangle } from "lucide-react"

export default function ErrorCodesDebugPage() {
  const { user } = useAuthStore()

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
                Error Codes Debug
              </h2>
              <p className="text-muted-foreground">
                Simplified page to test sidebar navigation
              </p>
            </div>
          </div>

          {/* Simple Content */}
          <Card>
            <CardHeader>
              <CardTitle>Debug Information</CardTitle>
            </CardHeader>
            <CardContent>
              <p>This is a simplified error codes page to test if the sidebar navigation works.</p>
              <p>Try clicking on different sidebar items to see if navigation works from this page.</p>
              <p>User: {user.name} ({user.role})</p>
            </CardContent>
          </Card>
        </div>
      </main>
    </>
  )
}
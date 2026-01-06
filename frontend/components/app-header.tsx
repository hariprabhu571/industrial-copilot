"use client"

import { Badge } from "@/components/ui/badge"
import { Activity, Sparkles } from "lucide-react"

export function AppHeader() {
  return (
    <header className="flex h-16 items-center justify-between border-b border-border/50 bg-card/95 backdrop-blur-xl px-6 sticky top-0 z-10">
      <div className="flex items-center gap-4">
        <h1 className="text-lg font-semibold text-foreground flex items-center gap-2">
          <Sparkles className="size-5 text-primary" />
          Dashboard
        </h1>
      </div>
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-success/10 ring-1 ring-success/20">
          <Activity className="size-4 text-success animate-pulse" />
          <span className="text-sm text-muted-foreground">Backend:</span>
          <Badge variant="outline" className="border-success/50 bg-success/10 text-success font-medium">
            Online
          </Badge>
        </div>
      </div>
    </header>
  )
}
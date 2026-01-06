"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { useAuthStore } from "@/lib/store"
import { hasPermission } from "@/lib/auth"
import { LayoutDashboard, MessageSquare, FileText, Upload, FileSearch, Factory, LogOut, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { ThemeToggle } from "@/components/theme-toggle"

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard, permission: "view" },
  { name: "Chat", href: "/chat", icon: MessageSquare, permission: "chat" },
  { name: "Documents", href: "/documents", icon: FileText, permission: "view" },
  { name: "Upload", href: "/upload", icon: Upload, permission: "upload" },
  { name: "Users", href: "/users", icon: Users, permission: "audit" },
  { name: "Audit Logs", href: "/audit", icon: FileSearch, permission: "audit" },
]

export function AppSidebar() {
  const pathname = usePathname()
  const { user, logout } = useAuthStore()

  if (!user) return null

  const visibleNavigation = navigation.filter((item) => hasPermission(user.role, item.permission))

  return (
    <div className="flex h-full w-64 flex-col border-r border-sidebar-border bg-sidebar/95 backdrop-blur-xl">
      <div className="flex h-16 items-center justify-between gap-3 border-b border-sidebar-border px-6">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="absolute inset-0 bg-primary/20 blur-md rounded-md" />
            <div className="relative rounded-md bg-gradient-to-br from-primary/20 to-primary/10 p-2 ring-1 ring-primary/30">
              <Factory className="size-5 text-primary" />
            </div>
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-semibold text-sidebar-foreground">Industrial AI</span>
            <span className="text-xs text-sidebar-foreground/60">Copilot</span>
          </div>
        </div>
        <ThemeToggle />
      </div>

      <nav className="flex-1 space-y-1 p-4">
        {visibleNavigation.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
                isActive
                  ? "bg-gradient-to-r from-primary/20 to-primary/10 text-sidebar-accent-foreground ring-1 ring-primary/30 shadow-sm"
                  : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground hover:scale-[1.02]",
              )}
            >
              <item.icon className={cn("size-5 transition-transform", isActive && "text-primary")} />
              {item.name}
              {isActive && <span className="ml-auto size-1.5 rounded-full bg-primary animate-pulse" />}
            </Link>
          )
        })}
      </nav>

      <div className="border-t border-sidebar-border p-4">
        <div className="flex items-center gap-3 rounded-lg bg-gradient-to-br from-sidebar-accent/50 to-sidebar-accent/30 p-3 ring-1 ring-sidebar-border/50 backdrop-blur-sm">
          <Avatar className="size-10 ring-2 ring-primary/20">
            <AvatarFallback className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground font-semibold">
              {user.name.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-sidebar-foreground truncate">{user.name}</p>
            <p className="text-xs text-sidebar-foreground/60 capitalize flex items-center gap-1">
              <span className="size-1.5 rounded-full bg-success" />
              {user.role}
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => {
              logout()
              window.location.href = "/"
            }}
            className="shrink-0 hover:bg-destructive/10 hover:text-destructive transition-colors"
          >
            <LogOut className="size-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}

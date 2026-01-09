"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import { useAuthStore } from "@/lib/store"
import { AppSidebar } from "@/components/app-sidebar"

interface AuthenticatedLayoutProps {
  children: React.ReactNode
}

export function AuthenticatedLayout({ children }: AuthenticatedLayoutProps) {
  const router = useRouter()
  const pathname = usePathname()
  const { user } = useAuthStore()
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  useEffect(() => {
    if (isClient && !user && pathname !== "/") {
      router.push("/")
    }
  }, [user, router, pathname, isClient])

  // Don't render anything until client-side hydration is complete
  if (!isClient) {
    return <>{children}</>
  }

  // Don't show sidebar on login page
  if (pathname === "/" || !user) {
    return <>{children}</>
  }

  return (
    <div className="flex h-screen bg-background">
      <div className="shrink-0">
        <AppSidebar />
      </div>
      <div className="flex flex-1 flex-col overflow-auto">{children}</div>
    </div>
  )
}
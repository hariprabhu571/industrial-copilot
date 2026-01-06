"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { authenticate } from "@/lib/auth"
import { useAuthStore } from "@/lib/store"
import { Factory, AlertCircle, Sparkles } from "lucide-react"
import { ThemeToggle } from "@/components/theme-toggle"

export function LoginForm() {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const login = useAuthStore((state) => state.login)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    await new Promise((resolve) => setTimeout(resolve, 800))

    const user = await authenticate(username, password)
    if (user) {
      login(user)
      router.push("/dashboard")
    } else {
      setError("Invalid username or password")
    }

    setIsLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-accent/10 p-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />

      <div className="absolute top-4 right-4 z-10">
        <ThemeToggle />
      </div>

      <div className="w-full max-w-md space-y-8 relative z-10">
        <div className="flex flex-col items-center space-y-4">
          <div className="relative">
            <div className="absolute inset-0 bg-primary/20 blur-2xl rounded-full animate-pulse" />
            <div className="relative rounded-2xl bg-gradient-to-br from-primary/20 to-primary/10 p-4 ring-1 ring-primary/30 backdrop-blur-sm">
              <Factory className="size-10 text-primary" />
            </div>
          </div>
          <div className="text-center space-y-2">
            <h1 className="text-4xl font-bold tracking-tight text-balance bg-gradient-to-br from-foreground to-foreground/70 bg-clip-text text-transparent">
              Industrial AI Copilot
            </h1>
            <p className="text-sm text-muted-foreground flex items-center gap-2 justify-center">
              <Sparkles className="size-4" />
              Enterprise Document Intelligence Platform
            </p>
          </div>
        </div>

        <Card className="border-border/50 shadow-2xl backdrop-blur-sm bg-card/95">
          <CardHeader>
            <CardTitle className="text-2xl">Welcome Back</CardTitle>
            <CardDescription>Enter your credentials to access the platform</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <Alert variant="destructive" className="animate-in fade-in slide-in-from-top-2 duration-300">
                  <AlertCircle className="size-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  type="text"
                  placeholder="Enter username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  disabled={isLoading}
                  className="h-11"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                  className="h-11"
                  required
                />
              </div>

              <Button type="submit" className="w-full h-11 text-base font-medium" disabled={isLoading}>
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <span className="size-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                    Signing in...
                  </span>
                ) : (
                  "Sign In"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card className="border-primary/30 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <span className="size-2 rounded-full bg-primary animate-pulse" />
              Demo Credentials
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2.5 text-sm">
            <div className="flex justify-between items-center p-2 rounded-md hover:bg-primary/10 transition-colors">
              <span className="text-muted-foreground font-medium">Admin:</span>
              <code className="font-mono bg-muted px-2 py-1 rounded">admin / admin123</code>
            </div>
            <div className="flex justify-between items-center p-2 rounded-md hover:bg-primary/10 transition-colors">
              <span className="text-muted-foreground font-medium">Editor:</span>
              <code className="font-mono bg-muted px-2 py-1 rounded">editor / editor123</code>
            </div>
            <div className="flex justify-between items-center p-2 rounded-md hover:bg-primary/10 transition-colors">
              <span className="text-muted-foreground font-medium">Viewer:</span>
              <code className="font-mono bg-muted px-2 py-1 rounded">viewer / viewer123</code>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuthStore } from "@/lib/store"
import { AppHeader } from "@/components/app-header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { UserPlus, Trash2, Shield, Edit, Eye, CheckCircle, AlertCircle } from "lucide-react"
import { hasPermission, createUser, getAllUsers, deleteUser, type UserRole } from "@/lib/auth"

export default function UsersPage() {
  const router = useRouter()
  const { user } = useAuthStore()
  const [users, setUsers] = useState(getAllUsers())
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [name, setName] = useState("")
  const [role, setRole] = useState<UserRole>("viewer")
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (user && !hasPermission(user.role, "audit")) {
      router.push("/dashboard")
    }
  }, [user, router])

  if (!user || !hasPermission(user.role, "audit")) return null

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess("")
    setIsLoading(true)

    await new Promise((resolve) => setTimeout(resolve, 500))

    const result = createUser(username, password, role, name)
    if ("error" in result) {
      setError(result.error)
    } else {
      setSuccess(`User ${username} created successfully!`)
      setUsername("")
      setPassword("")
      setName("")
      setRole("viewer")
      setUsers(getAllUsers())
    }

    setIsLoading(false)
  }

  const handleDeleteUser = async (username: string) => {
    if (confirm(`Are you sure you want to delete user ${username}?`)) {
      const success = deleteUser(username)
      if (success) {
        setSuccess(`User ${username} deleted successfully!`)
        setUsers(getAllUsers())
      } else {
        setError("Cannot delete admin account or user not found")
      }
    }
  }

  const getRoleIcon = (role: UserRole) => {
    switch (role) {
      case "admin":
        return <Shield className="size-4" />
      case "editor":
        return <Edit className="size-4" />
      case "viewer":
        return <Eye className="size-4" />
    }
  }

  const getRoleBadgeVariant = (role: UserRole) => {
    switch (role) {
      case "admin":
        return "default"
      case "editor":
        return "secondary"
      case "viewer":
        return "outline"
    }
  }

  return (
    <>
      <AppHeader />
      <main className="flex-1 overflow-y-auto p-6">
        <div className="mx-auto max-w-7xl space-y-6">
          {/* Header */}
          <div className="space-y-1">
            <h2 className="text-3xl font-bold tracking-tight text-balance bg-gradient-to-br from-foreground to-foreground/70 bg-clip-text text-transparent">
              User Management
            </h2>
            <p className="text-muted-foreground">Create and manage user accounts for the platform</p>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            {/* Create User Form */}
            <Card className="border-border/50 shadow-lg backdrop-blur-sm bg-card/95">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <UserPlus className="size-5 text-primary" />
                  Create New User
                </CardTitle>
                <CardDescription>Add a new user account with specific role permissions</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleCreateUser} className="space-y-4">
                  {error && (
                    <Alert variant="destructive" className="animate-in fade-in slide-in-from-top-2">
                      <AlertCircle className="size-4" />
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}
                  {success && (
                    <Alert className="border-success/50 bg-success/10 animate-in fade-in slide-in-from-top-2">
                      <CheckCircle className="size-4 text-success" />
                      <AlertDescription className="text-success">{success}</AlertDescription>
                    </Alert>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      type="text"
                      placeholder="John Doe"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      disabled={isLoading}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="username">Username</Label>
                    <Input
                      id="username"
                      type="text"
                      placeholder="johndoe"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      disabled={isLoading}
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
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="role">Role</Label>
                    <Select value={role} onValueChange={(value) => setRole(value as UserRole)} disabled={isLoading}>
                      <SelectTrigger id="role">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="viewer">
                          <div className="flex items-center gap-2">
                            <Eye className="size-4" />
                            Viewer - Read-only access
                          </div>
                        </SelectItem>
                        <SelectItem value="editor">
                          <div className="flex items-center gap-2">
                            <Edit className="size-4" />
                            Editor - Can upload documents
                          </div>
                        </SelectItem>
                        <SelectItem value="admin">
                          <div className="flex items-center gap-2">
                            <Shield className="size-4" />
                            Admin - Full access
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? (
                      <span className="flex items-center gap-2">
                        <span className="size-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                        Creating User...
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">
                        <UserPlus className="size-4" />
                        Create User
                      </span>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* User List */}
            <Card className="border-border/50 shadow-lg backdrop-blur-sm bg-card/95">
              <CardHeader>
                <CardTitle>Existing Users</CardTitle>
                <CardDescription>Manage existing user accounts and permissions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-lg border border-border/50 overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/50">
                        <TableHead>User</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {users.map((u) => (
                        <TableRow key={u.id} className="hover:bg-muted/30 transition-colors">
                          <TableCell>
                            <div className="flex flex-col">
                              <span className="font-medium">{u.name}</span>
                              <span className="text-xs text-muted-foreground">@{u.username}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant={getRoleBadgeVariant(u.role)} className="flex items-center gap-1 w-fit">
                              {getRoleIcon(u.role)}
                              {u.role}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            {u.username !== "admin" ? (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteUser(u.username)}
                                className="hover:bg-destructive/10 hover:text-destructive"
                              >
                                <Trash2 className="size-4" />
                              </Button>
                            ) : (
                              <Badge variant="outline" className="text-xs">
                                Protected
                              </Badge>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Role Permissions Card */}
          <Card className="border-primary/30 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-base">Role Permissions Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Shield className="size-5 text-primary" />
                    <h4 className="font-semibold">Admin</h4>
                  </div>
                  <ul className="text-sm text-muted-foreground space-y-1 ml-7">
                    <li>• Full system access</li>
                    <li>• User management</li>
                    <li>• Upload & delete documents</li>
                    <li>• View audit logs</li>
                    <li>• Chat with AI</li>
                  </ul>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Edit className="size-5 text-primary" />
                    <h4 className="font-semibold">Editor</h4>
                  </div>
                  <ul className="text-sm text-muted-foreground space-y-1 ml-7">
                    <li>• Upload documents</li>
                    <li>• View documents</li>
                    <li>• Chat with AI</li>
                  </ul>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Eye className="size-5 text-primary" />
                    <h4 className="font-semibold">Viewer</h4>
                  </div>
                  <ul className="text-sm text-muted-foreground space-y-1 ml-7">
                    <li>• View documents</li>
                    <li>• Chat with AI</li>
                    <li>• Read-only access</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </>
  )
}
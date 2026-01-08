"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuthStore, type Document } from "@/lib/store"
import { AppHeader } from "@/components/app-header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { FileText, Search, Filter, RefreshCw, MoreVertical, Trash2, Eye, Upload, Loader2 } from "lucide-react"
import Link from "next/link"
import { hasPermission } from "@/lib/auth"

interface ApiDocument {
  id: string
  name: string
  department: string
  type: string
  size: string
  uploadedAt: string
  uploadedBy: string
  version?: string
  status?: string
}

export default function DocumentsPage() {
  const router = useRouter()
  const { user } = useAuthStore()
  const [documents, setDocuments] = useState<ApiDocument[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [filteredDocs, setFilteredDocs] = useState<ApiDocument[]>([])

  // Fetch documents from API
  const fetchDocuments = async () => {
    if (!user?.token) return
    
    try {
      setLoading(true)
      const response = await fetch('/api/documents', {
        headers: {
          'Authorization': `Bearer ${user.token}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        const data = await response.json()
        setDocuments(data.documents || [])
      } else {
        console.error('Failed to fetch documents:', response.status)
        // Fallback to empty array if API fails
        setDocuments([])
      }
    } catch (error) {
      console.error('Error fetching documents:', error)
      setDocuments([])
    } finally {
      setLoading(false)
    }
  }

  // Delete document
  const handleDeleteDocument = async (documentId: string) => {
    if (!user?.token) return
    
    if (!confirm('Are you sure you want to delete this document? This action cannot be undone.')) {
      return
    }

    try {
      const response = await fetch(`/api/documents/${documentId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${user.token}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        // Remove document from local state
        setDocuments(prev => prev.filter(doc => doc.id !== documentId))
      } else {
        const error = await response.json()
        alert(`Failed to delete document: ${error.error || 'Unknown error'}`)
      }
    } catch (error) {
      console.error('Error deleting document:', error)
      alert('Failed to delete document. Please try again.')
    }
  }

  useEffect(() => {
    if (user && !hasPermission(user.role, "documents")) {
      router.push("/dashboard")
    } else if (user) {
      fetchDocuments()
    }
  }, [user, router])

  useEffect(() => {
    const filtered = documents.filter(
      (doc) =>
        doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doc.department.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doc.type.toLowerCase().includes(searchQuery.toLowerCase()),
    )
    setFilteredDocs(filtered)
  }, [searchQuery, documents])

  if (!user || !hasPermission(user.role, "documents")) return null

  const canDelete = hasPermission(user.role, "upload")

  return (
    <>
      <AppHeader />
      <main className="flex-1 overflow-y-auto p-6">
        <div className="mx-auto max-w-7xl space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h2 className="text-2xl font-bold tracking-tight">Document Management</h2>
              <p className="text-muted-foreground">Browse and manage your document library</p>
            </div>
            {hasPermission(user.role, "upload") && (
              <Link href="/upload">
                <Button>
                  <Upload className="mr-2 size-4" />
                  Upload New
                </Button>
              </Link>
            )}
          </div>

          <Card className="border-border/50">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Documents</CardTitle>
                  <CardDescription>
                    {loading ? 'Loading...' : `${documents.length} total documents in system`}
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="icon">
                    <Filter className="size-4" />
                  </Button>
                  <Button 
                    variant="outline" 
                    size="icon" 
                    onClick={fetchDocuments}
                    disabled={loading}
                  >
                    {loading ? (
                      <Loader2 className="size-4 animate-spin" />
                    ) : (
                      <RefreshCw className="size-4" />
                    )}
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search documents by name, department, or type..."
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              {/* Loading State */}
              {loading ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <Loader2 className="size-8 animate-spin text-muted-foreground mb-4" />
                  <p className="text-sm text-muted-foreground">Loading documents...</p>
                </div>
              ) : filteredDocs.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="rounded-lg bg-muted/50 p-4 ring-1 ring-border/50">
                    <FileText className="size-12 text-muted-foreground" />
                  </div>
                  <p className="mt-4 text-sm font-medium text-foreground">No documents found</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {documents.length === 0
                      ? "Upload your first document to get started"
                      : "Try adjusting your search criteria"}
                  </p>
                  {hasPermission(user.role, "upload") && documents.length === 0 && (
                    <Link href="/upload">
                      <Button className="mt-4">
                        <Upload className="mr-2 size-4" />
                        Upload Document
                      </Button>
                    </Link>
                  )}
                </div>
              ) : (
                <div className="rounded-lg border border-border/50 overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/30 hover:bg-muted/30">
                        <TableHead>Name</TableHead>
                        <TableHead>Department</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Size</TableHead>
                        <TableHead>Uploaded</TableHead>
                        <TableHead className="w-12"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredDocs.map((doc) => (
                        <TableRow key={doc.id}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <div className="rounded bg-primary/10 p-2 ring-1 ring-primary/20">
                                <FileText className="size-4 text-primary" />
                              </div>
                              <div className="flex flex-col">
                                <span className="font-medium">{doc.name}</span>
                                {doc.version && (
                                  <span className="text-xs text-muted-foreground">{doc.version}</span>
                                )}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{doc.department}</Badge>
                          </TableCell>
                          <TableCell className="text-muted-foreground capitalize">{doc.type}</TableCell>
                          <TableCell className="text-muted-foreground">{doc.size}</TableCell>
                          <TableCell className="text-muted-foreground">
                            {new Date(doc.uploadedAt).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon-sm">
                                  <MoreVertical className="size-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem>
                                  <Eye className="mr-2 size-4" />
                                  View Details
                                </DropdownMenuItem>
                                {canDelete && (
                                  <DropdownMenuItem 
                                    className="text-destructive" 
                                    onClick={() => handleDeleteDocument(doc.id)}
                                  >
                                    <Trash2 className="mr-2 size-4" />
                                    Delete
                                  </DropdownMenuItem>
                                )}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
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
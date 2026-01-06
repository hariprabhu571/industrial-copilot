"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuthStore, useDocumentStore, type Document } from "@/lib/store"
import { AppHeader } from "@/components/app-header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { FileText, Search, Filter, RefreshCw, MoreVertical, Trash2, Eye, Upload } from "lucide-react"
import Link from "next/link"
import { hasPermission } from "@/lib/auth"

export default function DocumentsPage() {
  const router = useRouter()
  const { user } = useAuthStore()
  const { documents, removeDocument } = useDocumentStore()
  const [searchQuery, setSearchQuery] = useState("")
  const [filteredDocs, setFilteredDocs] = useState<Document[]>(documents)

  useEffect(() => {
    if (!user) {
      router.push("/")
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

  if (!user) return null

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
                  <CardDescription>{documents.length} total documents in system</CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="icon">
                    <Filter className="size-4" />
                  </Button>
                  <Button variant="outline" size="icon">
                    <RefreshCw className="size-4" />
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

              {/* Documents Table */}
              {filteredDocs.length === 0 ? (
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
                              <span className="font-medium">{doc.name}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{doc.department}</Badge>
                          </TableCell>
                          <TableCell className="text-muted-foreground">{doc.type}</TableCell>
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
                                  <DropdownMenuItem className="text-destructive" onClick={() => removeDocument(doc.id)}>
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

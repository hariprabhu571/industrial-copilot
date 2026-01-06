"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuthStore, useDocumentStore } from "@/lib/store"
import { AppHeader } from "@/components/app-header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import { Upload, FileText, CheckCircle2, AlertCircle, X } from "lucide-react"
import { hasPermission } from "@/lib/auth"

export default function UploadPage() {
  const router = useRouter()
  const { user } = useAuthStore()
  const { addDocument } = useDocumentStore()
  const [file, setFile] = useState<File | null>(null)
  const [department, setDepartment] = useState("")
  const [docType, setDocType] = useState("")
  const [description, setDescription] = useState("")
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [uploadComplete, setUploadComplete] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    if (!user) {
      router.push("/")
    } else if (!hasPermission(user.role, "upload")) {
      router.push("/dashboard")
    }
  }, [user, router])

  if (!user || !hasPermission(user.role, "upload")) return null

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      if (selectedFile.type !== "application/pdf") {
        setError("Only PDF files are supported")
        return
      }
      if (selectedFile.size > 50 * 1024 * 1024) {
        setError("File size must be less than 50MB")
        return
      }
      setFile(selectedFile)
      setError("")
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    const droppedFile = e.dataTransfer.files[0]
    if (droppedFile) {
      if (droppedFile.type !== "application/pdf") {
        setError("Only PDF files are supported")
        return
      }
      if (droppedFile.size > 50 * 1024 * 1024) {
        setError("File size must be less than 50MB")
        return
      }
      setFile(droppedFile)
      setError("")
    }
  }

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!file || !department || !docType) {
      setError("Please fill in all required fields")
      return
    }

    setIsUploading(true)
    setUploadProgress(0)

    // Simulate upload progress
    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval)
          return 100
        }
        return prev + 10
      })
    }, 200)

    await new Promise((resolve) => setTimeout(resolve, 2000))

    addDocument({
      id: Date.now().toString(),
      name: file.name.replace(".pdf", ""),
      department,
      type: docType,
      size: `${(file.size / (1024 * 1024)).toFixed(2)}MB`,
      uploadedAt: new Date(),
      uploadedBy: user.username,
    })

    setIsUploading(false)
    setUploadComplete(true)

    setTimeout(() => {
      router.push("/documents")
    }, 1500)
  }

  return (
    <>
      <AppHeader />
      <main className="flex-1 overflow-y-auto p-6">
        <div className="mx-auto max-w-3xl space-y-6">
          {/* Header */}
          <div className="space-y-1">
            <h2 className="text-2xl font-bold tracking-tight">Upload Document</h2>
            <p className="text-muted-foreground">Add new documents to your knowledge base</p>
          </div>

          <Card className="border-border/50">
            <CardHeader>
              <CardTitle>Document Upload</CardTitle>
              <CardDescription>Upload PDF documents with metadata for AI processing</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleUpload} className="space-y-6">
                {/* Drag & Drop Area */}
                <div
                  className="relative rounded-lg border-2 border-dashed border-border bg-muted/30 p-12 text-center transition-colors hover:border-primary/50"
                  onDrop={handleDrop}
                  onDragOver={(e) => e.preventDefault()}
                >
                  <input
                    type="file"
                    accept=".pdf"
                    onChange={handleFileChange}
                    className="absolute inset-0 cursor-pointer opacity-0"
                    disabled={isUploading || uploadComplete}
                  />
                  {file ? (
                    <div className="flex flex-col items-center gap-3">
                      <div className="rounded-lg bg-primary/10 p-4 ring-1 ring-primary/20">
                        <FileText className="size-8 text-primary" />
                      </div>
                      <div className="space-y-1">
                        <p className="font-medium text-foreground">{file.name}</p>
                        <p className="text-sm text-muted-foreground">{(file.size / (1024 * 1024)).toFixed(2)}MB</p>
                      </div>
                      {!isUploading && !uploadComplete && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation()
                            setFile(null)
                          }}
                        >
                          <X className="mr-2 size-4" />
                          Remove
                        </Button>
                      )}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-3">
                      <div className="rounded-lg bg-muted/50 p-4 ring-1 ring-border/50">
                        <Upload className="size-8 text-muted-foreground" />
                      </div>
                      <div className="space-y-1">
                        <p className="font-medium text-foreground">Drag & drop your file here</p>
                        <p className="text-sm text-muted-foreground">or click to browse</p>
                      </div>
                      <div className="mt-2 space-y-1 text-xs text-muted-foreground">
                        <p>Supported: PDF files only</p>
                        <p>Maximum size: 50MB</p>
                      </div>
                    </div>
                  )}
                </div>

                {error && (
                  <Alert variant="destructive">
                    <AlertCircle className="size-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                {/* Metadata Form */}
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="department">Department *</Label>
                    <Select value={department} onValueChange={setDepartment} disabled={isUploading || uploadComplete}>
                      <SelectTrigger id="department">
                        <SelectValue placeholder="Select department" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Safety">Safety</SelectItem>
                        <SelectItem value="Operations">Operations</SelectItem>
                        <SelectItem value="Training">Training</SelectItem>
                        <SelectItem value="Maintenance">Maintenance</SelectItem>
                        <SelectItem value="Quality">Quality</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="type">Document Type *</Label>
                    <Select value={docType} onValueChange={setDocType} disabled={isUploading || uploadComplete}>
                      <SelectTrigger id="type">
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Manual">Manual</SelectItem>
                        <SelectItem value="Procedure">Procedure</SelectItem>
                        <SelectItem value="Guide">Guide</SelectItem>
                        <SelectItem value="Specification">Specification</SelectItem>
                        <SelectItem value="Report">Report</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description (Optional)</Label>
                  <Textarea
                    id="description"
                    placeholder="Add a brief description of this document..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    disabled={isUploading || uploadComplete}
                    rows={3}
                  />
                </div>

                {/* Upload Progress */}
                {isUploading && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Uploading {file?.name}...</span>
                      <span className="font-medium text-primary">{uploadProgress}%</span>
                    </div>
                    <Progress value={uploadProgress} />
                  </div>
                )}

                {/* Success Message */}
                {uploadComplete && (
                  <Alert className="border-success/50 bg-success/10">
                    <CheckCircle2 className="size-4 text-success" />
                    <AlertDescription className="text-success">
                      Document uploaded successfully! Redirecting...
                    </AlertDescription>
                  </Alert>
                )}

                {/* Actions */}
                <div className="flex justify-end gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.push("/documents")}
                    disabled={isUploading}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={!file || !department || !docType || isUploading || uploadComplete}>
                    {isUploading ? "Uploading..." : uploadComplete ? "Complete!" : "Upload Document"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>
    </>
  )
}

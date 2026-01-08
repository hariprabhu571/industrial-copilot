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
  
  // Declare progressInterval at component level to avoid scoping issues
  let progressInterval: NodeJS.Timeout | null = null

  useEffect(() => {
    if (user && !hasPermission(user.role, "upload")) {
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

    // Check if we're in fallback mode (no backend authentication)
    if (user.token === 'fallback-mode') {
      // Simulate upload for fallback mode
      progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 100) {
            if (progressInterval) clearInterval(progressInterval)
            return 100
          }
          return prev + 10
        })
      }, 200)

      setTimeout(() => {
        if (progressInterval) clearInterval(progressInterval)
        setUploadProgress(100)

        // Add to local store only
        addDocument({
          id: Date.now().toString(),
          name: file.name.replace(".pdf", ""),
          department,
          type: docType,
          size: `${(file.size / (1024 * 1024)).toFixed(2)}MB`,
          uploadedAt: new Date(),
          uploadedBy: user.username,
        })

        setUploadComplete(true)
        setTimeout(() => {
          router.push("/documents")
        }, 1500)
      }, 2000)

      return
    }

    try {
      // Create FormData for file upload
      const formData = new FormData()
      formData.append('file', file)
      formData.append('department', department)
      formData.append('type', docType)
      formData.append('description', description)
      formData.append('userId', user.id)

      // Simulate upload progress with slower increment for large files
      const fileSize = file.size / (1024 * 1024) // Size in MB
      const progressSpeed = fileSize > 5 ? 1000 : 500 // Slower progress for larger files
      
      progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 85) { // Stop at 85% until we get response
            return 85
          }
          return prev + 5
        })
      }, progressSpeed)

      // Call the backend API with longer timeout
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 300000) // 5 minute timeout

      const response = await fetch('/api/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${user.token}`,
        },
        body: formData,
        signal: controller.signal,
      })

      clearTimeout(timeoutId)
      if (progressInterval) clearInterval(progressInterval)
      setUploadProgress(100)

      if (!response.ok) {
        const errorText = await response.text()
        console.error('Upload API Error:', response.status, errorText)
        
        // Better error messages for different status codes
        if (response.status === 413) {
          throw new Error('File too large. Please select a smaller file.')
        } else if (response.status === 403) {
          throw new Error('Permission denied. Only administrators can upload documents.')
        } else if (response.status === 500) {
          throw new Error('Server error during processing. Please try again or contact support.')
        } else {
          throw new Error(`Upload failed: ${response.status} - ${errorText}`)
        }
      }

      const result = await response.json()

      // Add to local store
      addDocument({
        id: result.documentId || Date.now().toString(),
        name: file.name.replace(".pdf", ""),
        department,
        type: docType,
        size: `${(file.size / (1024 * 1024)).toFixed(2)}MB`,
        uploadedAt: new Date(),
        uploadedBy: user.username,
      })

      setUploadComplete(true)

      setTimeout(() => {
        router.push("/documents")
      }, 1500)
    } catch (err) {
      const error = err as Error
      console.error('Upload error:', error)
      setUploadProgress(0)
      
      if (progressInterval) clearInterval(progressInterval)
      
      // Handle different error types
      if (error.name === 'AbortError') {
        setError('Upload timed out. Large files may take several minutes to process. Please try again.')
      } else if (error instanceof TypeError && error.message.includes('fetch')) {
        setError('Cannot connect to server. Please ensure the backend is running.')
      } else {
        setError(error.message || 'Upload failed. Please try again.')
      }
      
      // Provide specific error messages based on the error type
      if (error instanceof TypeError && error.message.includes('fetch')) {
        setError('Cannot connect to server. Please ensure the backend is running on port 3001.')
      } else if (error.message.includes('404')) {
        setError('Upload endpoint not found. Please check if the backend server is properly configured.')
      } else if (error.message.includes('401') || error.message.includes('403')) {
        setError('Authentication failed. Please try logging in again.')
      } else if (error.message.includes('413')) {
        setError('File too large. Please select a smaller file.')
      } else {
        setError(`Upload failed: ${error.message}`)
      }
      
      setIsUploading(false)
    }
  }

  return (
    <>
      <AppHeader />
      <main className="flex-1 overflow-y-auto p-6">
        <div className="mx-auto max-w-7xl space-y-6">
          {/* Header */}
          <div className="space-y-1">
            <h2 className="text-2xl font-bold tracking-tight">Upload Document</h2>
            <p className="text-muted-foreground">Add new documents to your knowledge base (Admin Only)</p>
          </div>

          <Card className="border-border/50">
            <CardHeader>
              <CardTitle>Document Upload (Admin Only)</CardTitle>
              <CardDescription>
                Upload PDF documents with metadata for AI processing. Only administrators can upload documents to ensure content quality and security.
                {user?.token === 'fallback-mode' && (
                  <div className="mt-2 text-sm text-amber-600">
                    ⚠️ Running in demo mode - documents will be stored locally only
                  </div>
                )}
              </CardDescription>
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
                      <span className="text-muted-foreground">
                        {uploadProgress < 85 
                          ? `Uploading ${file?.name}...` 
                          : `Processing ${file?.name} (AI analysis in progress)...`
                        }
                      </span>
                      <span className="font-medium text-primary">{uploadProgress}%</span>
                    </div>
                    <Progress value={uploadProgress} />
                    {uploadProgress >= 85 && (
                      <div className="text-xs text-muted-foreground">
                        Large files may take several minutes to process. Please wait...
                      </div>
                    )}
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
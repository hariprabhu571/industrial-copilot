"use client"

import type React from "react"

import { useEffect, useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { useAuthStore, useChatStore, useDocumentStore, useAuditStore } from "@/lib/store"
import { AppHeader } from "@/components/app-header"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ChatMessageComponent } from "@/components/chat-message"
import { Send, Loader2, MessageSquare, Trash2, AlertCircle } from "lucide-react"
import { hasPermission } from "@/lib/auth"

export default function ChatPage() {
  const router = useRouter()
  const { user } = useAuthStore()
  const { messages, addMessage, clearMessages } = useChatStore()
  const { documents } = useDocumentStore()
  const { addLog } = useAuditStore()
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!user) {
      router.push("/")
    } else if (!hasPermission(user.role, "chat")) {
      router.push("/dashboard")
    }
  }, [user, router])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  if (!user || !hasPermission(user.role, "chat")) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return

    const userMessage = {
      id: Date.now().toString(),
      role: "user" as const,
      content: input,
      timestamp: new Date(),
    }

    addMessage(userMessage)
    setInput("")
    setIsLoading(true)

    // Simulate AI response
    await new Promise((resolve) => setTimeout(resolve, 1500))

    const responses = [
      {
        content: `Based on the uploaded documents, here's what I found:\n\n• Always wear appropriate personal protective equipment (PPE)\n• Follow lockout/tagout procedures before maintenance\n• Conduct regular safety inspections\n• Report any hazards immediately to supervisors`,
        sources: [
          { name: "safety-manual.pdf", section: "Section 3.2" },
          { name: "procedures.pdf", section: "Page 15" },
        ],
      },
      {
        content: `The equipment specifications indicate:\n\n• Operating temperature: 20-25°C\n• Maximum pressure: 150 PSI\n• Maintenance interval: Every 500 hours\n• Lubrication type: ISO VG 68`,
        sources: [{ name: "equipment-specs.pdf", section: "Chapter 4" }],
      },
      {
        content: `According to the training materials:\n\n• Complete orientation within first week\n• Shadow experienced operator for 3 days\n• Pass written assessment with 80% minimum\n• Receive certification before independent operation`,
        sources: [{ name: "training-guide.pdf", section: "Section 2.1" }],
      },
    ]

    const aiResponse = {
      id: (Date.now() + 1).toString(),
      role: "assistant" as const,
      content:
        documents.length > 0
          ? responses[Math.floor(Math.random() * responses.length)].content
          : "I don't have any documents to reference yet. Please upload some documents first, and I'll be able to answer questions based on their content.",
      sources: documents.length > 0 ? responses[Math.floor(Math.random() * responses.length)].sources : undefined,
      timestamp: new Date(),
    }

    addMessage(aiResponse)

    // Add audit log
    addLog({
      id: Date.now().toString(),
      timestamp: new Date(),
      user: user.username,
      action: "Query",
      details: input,
      response: "1.2s",
    })

    setIsLoading(false)
  }

  const handleClearChat = () => {
    if (confirm("Are you sure you want to clear the chat history?")) {
      clearMessages()
    }
  }

  return (
    <>
      <AppHeader />
      <main className="flex h-[calc(100vh-4rem)] flex-col overflow-hidden">
        <div className="flex-1 overflow-y-auto p-6">
          <div className="mx-auto max-w-4xl space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <h2 className="text-2xl font-bold tracking-tight">AI Chat</h2>
                <p className="text-muted-foreground">Ask questions about your documents</p>
              </div>
              {messages.length > 0 && (
                <Button variant="outline" size="sm" onClick={handleClearChat}>
                  <Trash2 className="mr-2 size-4" />
                  Clear Chat
                </Button>
              )}
            </div>

            {/* Messages */}
            <Card className="border-border/50">
              <CardHeader className="border-b border-border/50 bg-muted/30">
                <div className="flex items-center gap-2">
                  <MessageSquare className="size-5 text-primary" />
                  <span className="font-semibold">Chat History</span>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                {messages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 text-center">
                    <div className="rounded-lg bg-muted/50 p-4 ring-1 ring-border/50">
                      <MessageSquare className="size-12 text-muted-foreground" />
                    </div>
                    <p className="mt-4 text-sm font-medium text-foreground">Start a conversation</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Ask questions about your documents and I'll help you find answers
                    </p>
                    {documents.length === 0 && (
                      <Alert className="mt-6 max-w-md">
                        <AlertCircle className="size-4" />
                        <AlertDescription>
                          Upload some documents first to enable AI-powered answers with source references.
                        </AlertDescription>
                      </Alert>
                    )}
                  </div>
                ) : (
                  <div className="divide-y divide-border/50">
                    {messages.map((message) => (
                      <ChatMessageComponent key={message.id} message={message} />
                    ))}
                    {isLoading && (
                      <div className="flex gap-4 bg-muted/30 p-4">
                        <div className="rounded-full bg-accent p-2">
                          <Loader2 className="size-4 animate-spin text-accent-foreground" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm text-muted-foreground">AI is thinking...</p>
                        </div>
                      </div>
                    )}
                    <div ref={messagesEndRef} />
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Input Area */}
        <div className="border-t border-border bg-card p-6">
          <div className="mx-auto max-w-4xl">
            <form onSubmit={handleSubmit} className="flex gap-3">
              <Input
                placeholder="Ask a question about your documents..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                disabled={isLoading}
                className="flex-1"
              />
              <Button type="submit" disabled={!input.trim() || isLoading}>
                {isLoading ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
              </Button>
            </form>
          </div>
        </div>
      </main>
    </>
  )
}

"use client"

import type React from "react"
import { useEffect, useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { useAuthStore, useChatStore, useDocumentStore, useAuditStore } from "@/lib/store"
import { AppHeader } from "@/components/app-header"
import { ConversationSidebar } from "@/components/conversation-sidebar"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ChatMessageComponent } from "@/components/chat-message"
import { Send, Loader2, MessageSquare, AlertCircle } from "lucide-react"
import { hasPermission } from "@/lib/auth"

export default function ChatPage() {
  const router = useRouter()
  const { user } = useAuthStore()
  const { 
    addMessage, 
    getConversationMessages, 
    createConversation, 
    activeConversationId, 
    setActiveConversation,
    updateConversationTitle 
  } = useChatStore()
  const { documents } = useDocumentStore()
  const { addLog } = useAuditStore()
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Get messages for the active conversation
  const messages = activeConversationId ? getConversationMessages(activeConversationId) : []

  useEffect(() => {
    if (user && !hasPermission(user.role, "chat")) {
      router.push("/dashboard")
    }
  }, [user, router])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  if (!user || !hasPermission(user.role, "chat")) return null

  const handleNewChat = () => {
    const conversationId = createConversation(user.id, "New Chat")
    setActiveConversation(conversationId)
  }

  const handleSelectConversation = (conversationId: string) => {
    setActiveConversation(conversationId)
  }

  const generateConversationTitle = (firstMessage: string): string => {
    // Use the first message as title, but limit length for display
    const cleanMessage = firstMessage.trim()
    if (cleanMessage.length <= 30) {
      return cleanMessage
    }
    // If longer than 30 characters, truncate at word boundary
    const truncated = cleanMessage.substring(0, 30)
    const lastSpaceIndex = truncated.lastIndexOf(' ')
    if (lastSpaceIndex > 15) { // Only truncate at word boundary if it's not too short
      return truncated.substring(0, lastSpaceIndex) + "..."
    }
    return truncated + "..."
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return

    // Create a new conversation if none is active
    let currentConversationId = activeConversationId
    if (!currentConversationId) {
      currentConversationId = createConversation(user.id)
      setActiveConversation(currentConversationId)
    }

    const userMessage = {
      id: Date.now().toString(),
      role: "user" as const,
      content: input,
      timestamp: new Date(),
      userId: user.id,
      conversationId: currentConversationId,
    }

    addMessage(userMessage)

    // Update conversation title if this is the first message in the conversation
    const currentMessages = getConversationMessages(currentConversationId)
    if (currentMessages.length === 1) { // Only the user message we just added
      const title = generateConversationTitle(input)
      updateConversationTitle(currentConversationId, title)
    }

    const currentInput = input
    setInput("")
    setIsLoading(true)

    // Check if we're in fallback mode (no backend)
    if (user.token === 'fallback-mode') {
      // Simulate AI response for fallback mode
      await new Promise((resolve) => setTimeout(resolve, 1500))

      const fallbackResponse = {
        id: (Date.now() + 1).toString(),
        role: "assistant" as const,
        content: documents.length > 0 
          ? "🔌 **Backend Offline - Demo Mode**\n\nI'm running in demo mode because the backend server is not available. In a real deployment, I would:\n\n• Search through your uploaded documents\n• Use AI to provide contextual answers\n• Reference specific sections and sources\n\nTo enable full functionality, please start the backend server on port 3001."
          : "📄 **Demo Mode - No Documents**\n\nI'm running in demo mode. To see the full AI capabilities:\n\n1. Start the backend server (`npm run dev` in backend folder)\n2. Upload some PDF documents\n3. Ask questions about the content\n\nI'll then provide AI-powered answers with source references!",
        timestamp: new Date(),
        userId: user.id,
        conversationId: currentConversationId,
      }

      addMessage(fallbackResponse)
      setIsLoading(false)
      return
    }

    try {
      // Call the backend API with proper JWT token
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`,
        },
        body: JSON.stringify({
          question: currentInput,
          userId: user.id
        }),
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error('API Error:', response.status, errorText)
        throw new Error(`API Error: ${response.status}`)
      }

      const data = await response.json()
      
      const aiResponse = {
        id: (Date.now() + 1).toString(),
        role: "assistant" as const,
        content: data.answer || "I apologize, but I couldn't process your request at the moment.",
        sources: data.retrieval?.map((r: any) => ({
          name: r.document.name,
          section: r.chunk.section || `Chunk ${r.chunk.index}`
        })),
        timestamp: new Date(),
        userId: user.id,
        conversationId: currentConversationId,
      }

      addMessage(aiResponse)

      // Add audit log
      addLog({
        id: Date.now().toString(),
        timestamp: new Date(),
        user: user.username,
        action: "Query",
        details: currentInput,
        response: "1.2s",
      })
    } catch (error: unknown) {
      console.error('Chat error:', error)
      
      // Provide a helpful fallback response based on the error
      let fallbackContent = ""
      
      if (error instanceof TypeError && error.message.includes('fetch')) {
        fallbackContent = "🔌 **Backend Connection Error**\n\nI can't connect to the AI service right now. This usually means:\n\n• The backend server is not running\n• Check if the backend is started on port 3001\n• Run `npm run dev` in the backend folder\n\nFor now, I can provide some general guidance based on your question."
      } else if (error instanceof Error && error.message.includes('404')) {
        fallbackContent = "🔍 **API Endpoint Not Found**\n\nThe chat API endpoint is not available. Please check if the backend server is properly configured."
      } else if (error instanceof Error && error.message.includes('500')) {
        fallbackContent = "⚠️ **Server Error**\n\nThe backend server encountered an error. Please check the server logs for more details."
      } else {
        fallbackContent = documents.length > 0 
          ? "⚠️ **Service Temporarily Unavailable**\n\nI'm having trouble connecting to the AI service. Please try again in a moment, or check if the backend server is running."
          : "📄 **No Documents Available**\n\nI don't have any documents to reference yet. Please upload some documents first, and I'll be able to answer questions based on their content.\n\nYou can upload documents using the Upload page in the sidebar."
      }

      const aiResponse = {
        id: (Date.now() + 1).toString(),
        role: "assistant" as const,
        content: fallbackContent,
        timestamp: new Date(),
        userId: user.id,
        conversationId: currentConversationId,
      }

      addMessage(aiResponse)
    }

    setIsLoading(false)
  }

  return (
    <>
      <AppHeader />
      <main className="flex h-[calc(100vh-4rem)] overflow-hidden">
        {/* Conversation Sidebar */}
        <div className="w-80 flex-shrink-0">
          <ConversationSidebar 
            onNewChat={handleNewChat}
            onSelectConversation={handleSelectConversation}
          />
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto p-6">
            <div className="mx-auto max-w-4xl space-y-6">
              {/* Messages */}
              {!activeConversationId ? (
                <div className="flex flex-col items-center justify-center h-full py-16 text-center">
                  <div className="rounded-lg bg-muted/50 p-6 ring-1 ring-border/50">
                    <MessageSquare className="size-16 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">Welcome to AI Chat</h3>
                    <p className="text-muted-foreground mb-4">
                      Start a new conversation or select an existing one from the sidebar
                    </p>
                    <Button onClick={handleNewChat}>
                      Start New Chat
                    </Button>
                  </div>
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
                <Card className="border-border/50">
                  <CardHeader className="border-b border-border/50 bg-muted/30">
                    <div className="flex items-center gap-2">
                      <MessageSquare className="size-5 text-primary" />
                      <span className="font-semibold">Chat Messages</span>
                    </div>
                  </CardHeader>
                  <CardContent className="p-0">
                    {messages.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-16 text-center">
                        <div className="rounded-lg bg-muted/50 p-4 ring-1 ring-border/50">
                          <MessageSquare className="size-12 text-muted-foreground" />
                        </div>
                        <p className="mt-4 text-sm font-medium text-foreground">Start the conversation</p>
                        <p className="mt-1 text-xs text-muted-foreground">
                          Ask questions about your documents and I'll help you find answers
                        </p>
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
              )}
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
        </div>
      </main>
    </>
  )
}
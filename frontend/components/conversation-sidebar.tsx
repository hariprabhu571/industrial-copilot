"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  Plus, 
  Search, 
  MessageSquare, 
  Trash2, 
  MoreHorizontal,
  Calendar
} from "lucide-react"
import { useChatStore, type Conversation } from "@/lib/store"
import { useAuthStore } from "@/lib/store"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { formatDistanceToNow } from "date-fns"

interface ConversationSidebarProps {
  onNewChat: () => void
  onSelectConversation: (conversationId: string) => void
}

export function ConversationSidebar({ onNewChat, onSelectConversation }: ConversationSidebarProps) {
  const { user } = useAuthStore()
  const { 
    conversations, 
    activeConversationId, 
    deleteConversation, 
    searchConversations,
    getUserConversations 
  } = useChatStore()
  
  const [searchQuery, setSearchQuery] = useState("")
  
  if (!user) return null

  const userConversations = searchQuery 
    ? searchConversations(user.id, searchQuery)
    : getUserConversations(user.id).slice(0, 10) // Show recent 10

  const handleDeleteConversation = (conversationId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    if (confirm("Are you sure you want to delete this conversation?")) {
      deleteConversation(conversationId)
    }
  }

  const formatDate = (date: Date) => {
    try {
      return formatDistanceToNow(new Date(date), { addSuffix: true })
    } catch {
      return "Unknown"
    }
  }

  return (
    <Card className="h-full border-r border-border/50 flex flex-col">
      <CardHeader className="border-b border-border/50 bg-muted/30 p-4 flex-shrink-0">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-sm">Conversations</h3>
            <Button 
              size="sm" 
              onClick={onNewChat}
              className="h-8 px-2 text-xs whitespace-nowrap"
            >
              <Plus className="size-3 mr-1" />
              New Chat
            </Button>
          </div>
          
          <div className="relative">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-8 text-sm"
            />
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="p-0 flex-1 overflow-hidden">
        <ScrollArea className="h-full">
          {userConversations.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center px-4">
              <MessageSquare className="size-8 text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground">
                {searchQuery ? "No conversations found" : "No conversations yet"}
              </p>
              {!searchQuery && (
                <p className="text-xs text-muted-foreground mt-1">
                  Start a new chat to begin
                </p>
              )}
            </div>
          ) : (
            <div className="divide-y divide-border/50">
              {userConversations.map((conversation) => (
                <div
                  key={conversation.id}
                  className={`group relative cursor-pointer p-3 hover:bg-muted/50 transition-colors ${
                    activeConversationId === conversation.id ? "bg-muted/70 border-r-2 border-primary" : ""
                  }`}
                  onClick={() => onSelectConversation(conversation.id)}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-medium truncate">
                        {conversation.title}
                      </h4>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="secondary" className="text-xs px-1.5 py-0.5">
                          {conversation.messageCount} messages
                        </Badge>
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Calendar className="size-3" />
                          {formatDate(conversation.updatedAt)}
                        </span>
                      </div>
                    </div>
                    
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="opacity-0 group-hover:opacity-100 h-6 w-6 p-0"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <MoreHorizontal className="size-3" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-32">
                        <DropdownMenuItem
                          onClick={(e) => handleDeleteConversation(conversation.id, e)}
                          className="text-destructive focus:text-destructive"
                        >
                          <Trash2 className="size-3 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
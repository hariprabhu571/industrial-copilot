"use client"

import { cn } from "@/lib/utils"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Copy, User, Cpu, FileText } from "lucide-react"
import type { ChatMessage } from "@/lib/store"

interface ChatMessageProps {
  message: ChatMessage
}

export function ChatMessageComponent({ message }: ChatMessageProps) {
  const isUser = message.role === "user"

  const copyToClipboard = () => {
    navigator.clipboard.writeText(message.content)
  }

  return (
    <div className={cn("flex gap-4 p-4", isUser ? "bg-transparent" : "bg-muted/30")}>
      <Avatar className="size-8 shrink-0">
        <AvatarFallback className={isUser ? "bg-primary text-primary-foreground" : "bg-accent text-accent-foreground"}>
          {isUser ? <User className="size-4" /> : <Cpu className="size-4" />}
        </AvatarFallback>
      </Avatar>
      <div className="flex-1 space-y-2">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold">{isUser ? "You" : "AI Assistant"}</span>
          <span className="text-xs text-muted-foreground">{new Date(message.timestamp).toLocaleTimeString()}</span>
        </div>
        <div className="prose prose-sm dark:prose-invert max-w-none">
          <p className="text-sm leading-relaxed text-foreground whitespace-pre-wrap">{message.content}</p>
        </div>
        {!isUser && message.sources && message.sources.length > 0 && (
          <div className="space-y-2 pt-2">
            <p className="text-xs font-medium text-muted-foreground">Sources:</p>
            <div className="flex flex-wrap gap-2">
              {message.sources.map((source, idx) => (
                <Badge key={idx} variant="outline" className="gap-1.5 bg-background">
                  <FileText className="size-3" />
                  <span className="text-xs">
                    {source.name} ({source.section})
                  </span>
                </Badge>
              ))}
            </div>
          </div>
        )}
        {!isUser && (
          <Button variant="ghost" size="sm" onClick={copyToClipboard} className="mt-2">
            <Copy className="mr-2 size-3" />
            Copy
          </Button>
        )}
      </div>
    </div>
  )
}

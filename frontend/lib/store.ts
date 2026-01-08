"use client"

import { create } from "zustand"
import { persist } from "zustand/middleware"
import type { User } from "./auth"

interface AuthStore {
  user: User | null
  login: (user: User) => void
  logout: () => void
  switchUser: (user: User) => void
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      user: null,
      login: (user) => {
        const currentUser = get().user
        // If switching to a different user, clear the previous user's active conversation
        if (currentUser && currentUser.id !== user.id) {
          // We'll handle this in the chat page useEffect
        }
        set({ user })
      },
      logout: () => {
        set({ user: null })
      },
      switchUser: (user: User) => {
        // Clear active conversation when switching users
        set({ user })
      },
    }),
    {
      name: "auth-storage",
    },
  ),
)

export interface Document {
  id: string
  name: string
  department: string
  type: string
  size: string
  uploadedAt: Date
  uploadedBy: string
}

interface DocumentStore {
  documents: Document[]
  addDocument: (doc: Document) => void
  removeDocument: (id: string) => void
}

export const useDocumentStore = create<DocumentStore>()(
  persist(
    (set) => ({
      documents: [],
      addDocument: (doc) => set((state) => ({ documents: [...state.documents, doc] })),
      removeDocument: (id) =>
        set((state) => ({
          documents: state.documents.filter((d) => d.id !== id),
        })),
    }),
    {
      name: "document-storage",
    },
  ),
)

export interface ChatMessage {
  id: string
  role: "user" | "assistant"
  content: string
  sources?: { name: string; section: string }[]
  timestamp: Date
  userId: string
  conversationId: string // Add conversationId to group messages
}

export interface Conversation {
  id: string
  title: string
  userId: string
  createdAt: Date
  updatedAt: Date
  messageCount: number
}

interface ChatStore {
  messages: ChatMessage[]
  conversations: Conversation[]
  activeConversationId: string | null
  addMessage: (message: ChatMessage) => void
  clearMessages: () => void
  getUserMessages: (userId: string) => ChatMessage[]
  clearUserMessages: (userId: string) => void
  // New conversation methods
  createConversation: (userId: string, title?: string) => string
  getConversationMessages: (conversationId: string) => ChatMessage[]
  getUserConversations: (userId: string) => Conversation[]
  setActiveConversation: (conversationId: string | null) => void
  updateConversationTitle: (conversationId: string, title: string) => void
  deleteConversation: (conversationId: string) => void
  searchConversations: (userId: string, query: string) => Conversation[]
}

export const useChatStore = create<ChatStore>()(
  persist(
    (set, get) => ({
      messages: [],
      conversations: [],
      activeConversationId: null,
      addMessage: (message) => {
        set((state) => ({ messages: [...state.messages, message] }))
        
        // Update conversation
        const { conversations } = get()
        const conversation = conversations.find((c: Conversation) => c.id === message.conversationId)
        if (conversation) {
          set((state) => ({
            conversations: state.conversations.map((c: Conversation) => 
              c.id === message.conversationId 
                ? { ...c, updatedAt: new Date(), messageCount: c.messageCount + 1 }
                : c
            )
          }))
        }
      },
      clearMessages: () => set({ messages: [] }),
      getUserMessages: (userId) => get().messages.filter(msg => msg.userId === userId),
      clearUserMessages: (userId) => set((state) => ({
        messages: state.messages.filter(msg => msg.userId !== userId),
        conversations: state.conversations.filter(conv => conv.userId !== userId),
        activeConversationId: state.activeConversationId && 
          state.conversations.find(c => c.id === state.activeConversationId)?.userId === userId 
            ? null 
            : state.activeConversationId
      })),
      
      // New conversation methods
      createConversation: (userId, title = "New Chat") => {
        const conversationId = `conv_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
        const newConversation: Conversation = {
          id: conversationId,
          title,
          userId,
          createdAt: new Date(),
          updatedAt: new Date(),
          messageCount: 0,
        }
        
        set((state) => ({
          conversations: [newConversation, ...state.conversations],
          activeConversationId: conversationId,
        }))
        
        return conversationId
      },
      
      getConversationMessages: (conversationId) => 
        get().messages.filter(msg => msg.conversationId === conversationId),
      
      getUserConversations: (userId) => 
        get().conversations
          .filter(conv => conv.userId === userId)
          .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()),
      
      setActiveConversation: (conversationId) => 
        set({ activeConversationId: conversationId }),
      
      updateConversationTitle: (conversationId, title) => 
        set((state) => ({
          conversations: state.conversations.map((c: Conversation) => 
            c.id === conversationId ? { ...c, title } : c
          )
        })),
      
      deleteConversation: (conversationId) => 
        set((state) => ({
          conversations: state.conversations.filter((c: Conversation) => c.id !== conversationId),
          messages: state.messages.filter(msg => msg.conversationId !== conversationId),
          activeConversationId: state.activeConversationId === conversationId ? null : state.activeConversationId,
        })),
      
      searchConversations: (userId, query) => 
        get().conversations
          .filter((conv: Conversation) => 
            conv.userId === userId && 
            conv.title.toLowerCase().includes(query.toLowerCase())
          )
          .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()),
    }),
    {
      name: "chat-storage",
      // Add user-specific storage key
      partialize: (state) => ({
        messages: state.messages,
        conversations: state.conversations,
        activeConversationId: state.activeConversationId,
      }),
    },
  ),
)

export interface AuditLog {
  id: string
  timestamp: Date
  user: string
  action: string
  details: string
  response?: string
}

interface AuditStore {
  logs: AuditLog[]
  addLog: (log: AuditLog) => void
}

export const useAuditStore = create<AuditStore>()(
  persist(
    (set) => ({
      logs: [],
      addLog: (log) => set((state) => ({ logs: [log, ...state.logs] })),
    }),
    {
      name: "audit-storage",
    },
  ),
)
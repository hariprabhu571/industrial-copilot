// Mock authentication system with role-based access control
export type UserRole = "admin" | "editor" | "viewer"

export interface User {
  id: string
  username: string
  role: UserRole
  name: string
  email?: string
  token?: string
}

// Demo users - kept for display purposes
const users: Record<string, { password: string; user: Omit<User, 'token'> }> = {
  admin: {
    password: "admin123",
    user: { id: "1", username: "admin", role: "admin", name: "Admin User", email: "admin@company.com" },
  },
  editor: {
    password: "editor123",
    user: { id: "2", username: "editor", role: "editor", name: "Editor User", email: "editor@company.com" },
  },
  viewer: {
    password: "viewer123",
    user: { id: "3", username: "viewer", role: "viewer", name: "Viewer User", email: "viewer@company.com" },
  },
}

export async function authenticate(username: string, password: string): Promise<User | null> {
  try {
    // Call backend API for authentication
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, password }),
    })

    if (response.ok) {
      const data = await response.json()
      
      if (data.success && data.data.user && data.data.token) {
        return {
          id: data.data.user.id,
          username: data.data.user.username,
          role: data.data.user.role,
          name: users[username.toLowerCase()]?.user.name || `${data.data.user.role.charAt(0).toUpperCase() + data.data.user.role.slice(1)} User`,
          email: data.data.user.email,
          token: data.data.token,
        }
      }
    }

    // If backend authentication fails, don't fall back to mock
    console.log('Backend authentication failed, status:', response.status)
    return null
    
  } catch (error) {
    console.error('Authentication error:', error)
    // Only use fallback if backend is completely unreachable
    if (error instanceof TypeError && error.message.includes('fetch')) {
      console.log('Backend unreachable, using fallback authentication')
      const userRecord = users[username.toLowerCase()]
      if (userRecord && userRecord.password === password) {
        return {
          ...userRecord.user,
          token: 'fallback-mode' // Special token to indicate fallback mode
        }
      }
    }
    return null
  }
}

export function hasPermission(role: UserRole, action: string): boolean {
  const permissions: Record<UserRole, string[]> = {
    admin: ["view", "upload", "delete", "audit", "chat", "documents"],
    editor: ["view", "chat", "documents"], // Removed "upload" - only admins can upload
    viewer: ["view", "chat", "documents"],
  }
  return permissions[role].includes(action)
}

export function createUser(username: string, password: string, role: UserRole, name: string): User | { error: string } {
  if (users[username.toLowerCase()]) {
    return { error: "Username already exists" }
  }

  const newUser: User = {
    id: Date.now().toString(),
    username: username.toLowerCase(),
    role,
    name,
  }

  users[username.toLowerCase()] = {
    password,
    user: newUser,
  }

  return newUser
}

export function getAllUsers(): User[] {
  return Object.values(users).map((u) => u.user)
}

export function deleteUser(username: string): boolean {
  if (username === "admin") return false // Protect admin account
  if (users[username.toLowerCase()]) {
    delete users[username.toLowerCase()]
    return true
  }
  return false
}
"use client"

import { useAuthStore } from "@/lib/store"
import { useEffect, useState } from "react"

export default function EquipmentDebugPage() {
  const { user } = useAuthStore()
  const [apiTest, setApiTest] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const testAPI = async () => {
    if (!user?.token) {
      setApiTest({ error: "No user token found" })
      return
    }

    setLoading(true)
    try {
      console.log('Testing API with token:', user.token.substring(0, 50) + '...')
      
      // Test direct backend connection first
      const backendResponse = await fetch('http://localhost:3001/api/equipment', {
        headers: {
          'Authorization': `Bearer ${user.token}`,
          'Content-Type': 'application/json'
        }
      })
      
      console.log('Backend response status:', backendResponse.status)
      const backendData = await backendResponse.json()
      console.log('Backend response:', backendData)
      
      // Test frontend proxy
      const proxyResponse = await fetch('/api/equipment', {
        headers: {
          'Authorization': `Bearer ${user.token}`,
          'Content-Type': 'application/json'
        }
      })
      
      console.log('Proxy response status:', proxyResponse.status)
      const proxyData = await proxyResponse.json()
      console.log('Proxy response:', proxyData)
      
      setApiTest({
        backend: backendData,
        proxy: proxyData,
        backendStatus: backendResponse.status,
        proxyStatus: proxyResponse.status
      })
    } catch (error) {
      console.error('API test error:', error)
      setApiTest({ error: error.message })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (user) {
      testAPI()
    }
  }, [user])

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Equipment Debug Page</h1>
      
      <div className="space-y-6">
        {/* Authentication Status */}
        <div className="border rounded-lg p-4">
          <h2 className="text-lg font-semibold mb-2">Authentication Status</h2>
          {user ? (
            <div className="space-y-2">
              <p><strong>User:</strong> {user.name} ({user.username})</p>
              <p><strong>Role:</strong> {user.role}</p>
              <p><strong>Token:</strong> {user.token ? 'Present' : 'Missing'}</p>
              <p><strong>Token Preview:</strong> {user.token?.substring(0, 50)}...</p>
            </div>
          ) : (
            <p className="text-red-600">❌ No user logged in</p>
          )}
        </div>

        {/* API Test */}
        <div className="border rounded-lg p-4">
          <h2 className="text-lg font-semibold mb-2">API Test</h2>
          <button 
            onClick={testAPI}
            disabled={loading || !user}
            className="bg-blue-500 text-white px-4 py-2 rounded disabled:opacity-50 mb-4"
          >
            {loading ? 'Testing...' : 'Test Equipment API'}
          </button>
          
          {apiTest && (
            <div className="bg-gray-100 p-4 rounded">
              <pre className="text-sm overflow-auto">
                {JSON.stringify(apiTest, null, 2)}
              </pre>
            </div>
          )}
        </div>

        {/* Navigation Links */}
        <div className="border rounded-lg p-4">
          <h2 className="text-lg font-semibold mb-2">Navigation</h2>
          <div className="space-y-2">
            <a href="/equipment" className="block text-blue-500 underline">
              Equipment List
            </a>
            <a href="/equipment/770e8400-e29b-41d4-a716-446655440007" className="block text-blue-500 underline">
              Equipment Detail (Sample)
            </a>
            <a href="/dashboard" className="block text-blue-500 underline">
              Dashboard
            </a>
            <a href="/" className="block text-blue-500 underline">
              Login
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
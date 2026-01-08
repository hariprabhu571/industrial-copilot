"use client"

export default function EquipmentTestPage() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Equipment Test Page</h1>
      <p>If you can see this page, the routing is working correctly.</p>
      <div className="mt-4">
        <a href="/equipment" className="text-blue-500 underline">
          Back to Equipment List
        </a>
      </div>
    </div>
  )
}
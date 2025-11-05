"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import AdminLayout from "@/components/admin-layout"
import { Button } from "@/components/ui/Button"
import { API_BASE } from "@/lib/api"

const API_BASE_URL = API_BASE

interface Employee {
  id: number
  username: string
  email: string
  firstName: string
  lastName: string
  phoneNumber: string
  role: string
}

export default function AdminEmployeesPage() {
  const router = useRouter()
  const [employees, setEmployees] = useState<Employee[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Note: You'll need to implement a GET /api/employees endpoint on the backend
    // For now, this is a placeholder showing the structure
    setLoading(false)
  }, [])

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Employee Management</h1>
            <p className="text-gray-600 mt-1">Manage technicians and service center staff</p>
          </div>
          <Button className="bg-purple-600 hover:bg-purple-700 text-white">+ Add Employee</Button>
        </div>

        <div className="bg-white rounded-lg p-8 border border-gray-200 text-center">
          <p className="text-gray-600">
            Employee management requires additional backend endpoints. This section will be fully functional once the
            backend API is extended.
          </p>
          <p className="text-sm text-gray-500 mt-2">Needed endpoints: GET /api/employees, POST /api/employees</p>
        </div>
      </div>
    </AdminLayout>
  )
}

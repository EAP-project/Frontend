"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import AdminLayout from "@/components/admin-layout"
import { Button } from "@/components/ui/Button"
import { API_BASE } from "@/lib/api"

const API_BASE_URL = API_BASE

interface Appointment {
  id: number
  status: string
  appointmentDateTime: string
  customerNotes: string
}

interface Service {
  id: number
  name: string
  estimatedCost: number
}

export default function AdminDashboard() {
  const router = useRouter()
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [stats, setStats] = useState({
    total: 0,
    scheduled: 0,
    inProgress: 0,
    completed: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem("token")
    if (!token) {
      router.push("/login")
      return
    }

    const fetchAppointments = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/appointments`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        if (response.ok) {
          const data = await response.json()
          setAppointments(data)

          // Calculate stats
          setStats({
            total: data.length,
            scheduled: data.filter((a: Appointment) => a.status === "SCHEDULED").length,
            inProgress: data.filter((a: Appointment) => a.status === "IN_PROGRESS").length,
            completed: data.filter((a: Appointment) => a.status === "COMPLETED").length,
          })
        }
      } catch (err) {
        console.error("Error fetching appointments:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchAppointments()
  }, [router])

  return (
    <AdminLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600 mt-1">Overview of all appointments and service center operations</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[
            { label: "Total Appointments", value: stats.total, color: "bg-blue-50 text-blue-700" },
            { label: "Scheduled", value: stats.scheduled, color: "bg-purple-50 text-purple-700" },
            { label: "In Progress", value: stats.inProgress, color: "bg-yellow-50 text-yellow-700" },
            { label: "Completed", value: stats.completed, color: "bg-green-50 text-green-700" },
          ].map((stat, i) => (
            <div key={i} className={`${stat.color} rounded-lg p-6 border`}>
              <p className="text-sm font-medium opacity-75">{stat.label}</p>
              <p className="text-3xl font-bold mt-2">{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Recent Appointments */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Recent Appointments</h2>
          {loading ? (
            <div className="text-center py-12 text-gray-500">Loading...</div>
          ) : (
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200 bg-gray-50">
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">ID</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">DateTime</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Status</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Notes</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {appointments.slice(0, 10).map((apt) => (
                      <tr key={apt.id} className="border-b border-gray-200 hover:bg-gray-50">
                        <td className="px-6 py-4 text-sm text-gray-900">#{apt.id}</td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {new Date(apt.appointmentDateTime).toLocaleString()}
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <span className="px-2.5 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-medium">
                            {apt.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600 max-w-xs truncate">
                          {apt.customerNotes || "-"}
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-purple-600 border-purple-200 bg-transparent"
                          >
                            View
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  )
}

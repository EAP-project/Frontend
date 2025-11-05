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
  technicianNotes?: string
}

export default function AdminAppointmentsPage() {
  const router = useRouter()
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState("")
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [newStatus, setNewStatus] = useState("")

  useEffect(() => {
    fetchAppointments()
  }, [filter])

  const fetchAppointments = async () => {
    const token = localStorage.getItem("token")
    if (!token) {
      router.push("/login")
      return
    }

    try {
      const url = filter ? `${API_BASE_URL}/appointments?status=${filter}` : `${API_BASE_URL}/appointments`

      const response = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      })

      if (response.ok) {
        setAppointments(await response.json())
      }
    } catch (err) {
      console.error("Error fetching appointments:", err)
    } finally {
      setLoading(false)
    }
  }

  const handleStatusUpdate = async () => {
    if (!selectedAppointment || !newStatus) return

    const token = localStorage.getItem("token")
    try {
      const response = await fetch(`${API_BASE_URL}/appointments/${selectedAppointment.id}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      })

      if (response.ok) {
        setShowDetailModal(false)
        fetchAppointments()
      }
    } catch (err) {
      console.error("Error updating status:", err)
    }
  }

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      SCHEDULED: "bg-blue-100 text-blue-700",
      IN_PROGRESS: "bg-yellow-100 text-yellow-700",
      COMPLETED: "bg-green-100 text-green-700",
      CANCELLED: "bg-red-100 text-red-700",
      AWAITING_PARTS: "bg-orange-100 text-orange-700",
      QUOTE_REQUESTED: "bg-purple-100 text-purple-700",
      AWAITING_CUSTOMER_APPROVAL: "bg-indigo-100 text-indigo-700",
    }
    return colors[status] || "bg-gray-100 text-gray-700"
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Appointments Management</h1>
          <p className="text-gray-600 mt-1">View and manage all customer appointments</p>
        </div>

        <div className="flex gap-4 items-center">
          <select
            value={filter}
            onChange={(e) => {
              setFilter(e.target.value)
              setLoading(true)
            }}
            className="border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            <option value="">All Appointments</option>
            <option value="SCHEDULED">Scheduled</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="COMPLETED">Completed</option>
            <option value="CANCELLED">Cancelled</option>
            <option value="AWAITING_PARTS">Awaiting Parts</option>
            <option value="QUOTE_REQUESTED">Quote Requested</option>
            <option value="AWAITING_CUSTOMER_APPROVAL">Awaiting Approval</option>
          </select>
          <span className="text-sm text-gray-600">Total: {appointments.length}</span>
        </div>

        {loading ? (
          <div className="text-center py-12 text-gray-500">Loading appointments...</div>
        ) : (
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50">
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">ID</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Date & Time</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Status</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Customer Notes</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {appointments.map((apt) => (
                    <tr key={apt.id} className="border-b border-gray-200 hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">#{apt.id}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {new Date(apt.appointmentDateTime).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(apt.status)}`}>
                          {apt.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600 max-w-xs truncate">{apt.customerNotes || "-"}</td>
                      <td className="px-6 py-4 text-sm">
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-purple-600 border-purple-200 hover:bg-purple-50 bg-transparent"
                          onClick={() => {
                            setSelectedAppointment(apt)
                            setNewStatus(apt.status)
                            setShowDetailModal(true)
                          }}
                        >
                          Manage
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Detail Modal */}
        {showDetailModal && selectedAppointment && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4 shadow-lg">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Manage Appointment #{selectedAppointment.id}</h2>

              <div className="space-y-4 mb-6">
                <div>
                  <p className="text-xs text-gray-500 mb-1">Current Status</p>
                  <p className="font-semibold text-gray-900">{selectedAppointment.status}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Date & Time</p>
                  <p className="font-semibold text-gray-900">
                    {new Date(selectedAppointment.appointmentDateTime).toLocaleString()}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Update Status</label>
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="SCHEDULED">Scheduled</option>
                    <option value="IN_PROGRESS">In Progress</option>
                    <option value="COMPLETED">Completed</option>
                    <option value="CANCELLED">Cancelled</option>
                    <option value="AWAITING_PARTS">Awaiting Parts</option>
                    <option value="QUOTE_REQUESTED">Quote Requested</option>
                    <option value="AWAITING_CUSTOMER_APPROVAL">Awaiting Approval</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-3">
                <Button onClick={() => setShowDetailModal(false)} variant="outline" className="flex-1">
                  Cancel
                </Button>
                <Button onClick={handleStatusUpdate} className="flex-1 bg-purple-600 hover:bg-purple-700 text-white">
                  Update Status
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  )
}

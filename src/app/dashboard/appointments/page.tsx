"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import DashboardLayout from "@/components/dashboard-layout"
import { Button } from "@/components/ui/Button"
import { API_BASE } from "@/lib/api"

const API_BASE_URL = API_BASE

interface Appointment {
  id: number
  status: string
  appointmentDateTime: string
  customerNotes: string
  technicianNotes?: string
  estimatedCost?: number
  type?: string
  vehicle?: {
    id: number
    model: string
    year: number
    licensePlate: string
  }
}

export default function AppointmentsPage() {
  const router = useRouter()
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState("")
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null)
  const [showDetailModal, setShowDetailModal] = useState(false)

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

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      SCHEDULED: "bg-blue-100 text-blue-700 border-blue-300",
      IN_PROGRESS: "bg-yellow-100 text-yellow-700 border-yellow-300",
      COMPLETED: "bg-green-100 text-green-700 border-green-300",
      CANCELLED: "bg-red-100 text-red-700 border-red-300",
      AWAITING_PARTS: "bg-orange-100 text-orange-700 border-orange-300",
      QUOTE_REQUESTED: "bg-purple-100 text-purple-700 border-purple-300",
      AWAITING_CUSTOMER_APPROVAL: "bg-indigo-100 text-indigo-700 border-indigo-300",
      PENDING: "bg-orange-100 text-orange-700 border-orange-300",
    }
    return colors[status] || "bg-gray-100 text-gray-700 border-gray-300"
  }

  const getStatusBadgeColor = (status: string) => {
    const badgeColors: Record<string, string> = {
      PENDING: "bg-orange-500 text-white",
      SCHEDULED: "bg-blue-500 text-white",
      IN_PROGRESS: "bg-yellow-500 text-white",
      COMPLETED: "bg-green-500 text-white",
      CANCELLED: "bg-red-500 text-white",
    }
    return badgeColors[status] || "bg-gray-500 text-white"
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Appointments</h1>
          <p className="text-gray-600 mt-1">Track and manage your service appointments</p>
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
            <option value="PENDING">Pending</option>
          </select>
          <span className="text-sm text-gray-600 font-medium">
            {appointments.length} appointment{appointments.length !== 1 ? "s" : ""}
          </span>
        </div>

        {loading ? (
          <div className="text-center py-12 text-gray-500">Loading appointments...</div>
        ) : appointments.length > 0 ? (
          <div className="space-y-4">
            {appointments.map((apt) => (
              <div
                key={apt.id}
                className="bg-white rounded-lg p-6 border border-gray-200 hover:shadow-md transition-all cursor-pointer"
                onClick={() => {
                  setSelectedAppointment(apt)
                  setShowDetailModal(true)
                }}
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-semibold text-lg text-gray-900">Appointment #{apt.id}</h3>
                    <p className="text-sm text-gray-600 mt-1">{new Date(apt.appointmentDateTime).toLocaleString()}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm font-bold ${getStatusBadgeColor(apt.status)}`}>
                    {apt.status}
                  </span>
                </div>

                {apt.vehicle && (
                  <div className="mb-4 pb-4 border-b border-gray-100">
                    <p className="text-sm text-gray-600">
                      <strong>Vehicle:</strong> {apt.vehicle.year} {apt.vehicle.model} ({apt.vehicle.licensePlate})
                    </p>
                  </div>
                )}

                {apt.customerNotes && (
                  <p className="text-gray-600 mb-3 text-sm">
                    <strong>Notes:</strong> {apt.customerNotes}
                  </p>
                )}

                <div className="flex justify-end pt-4 border-t border-gray-100">
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-purple-600 border-purple-200 hover:bg-purple-50 bg-transparent"
                  >
                    View Details
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
            <p className="text-gray-600 mb-4">No appointments found</p>
            <Button
              className="bg-purple-600 hover:bg-purple-700 text-white"
              onClick={() => router.push("/dashboard/book-service")}
            >
              Book Your First Appointment
            </Button>
          </div>
        )}

        {showDetailModal && selectedAppointment && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-2xl w-full shadow-lg overflow-hidden">
              <div className="bg-gradient-to-r from-gray-800 to-gray-900 p-6 text-white flex justify-between items-start">
                <div>
                  <h2 className="text-2xl font-bold">Appointment Details</h2>
                  <p className="text-gray-300 mt-1">Appointment - {selectedAppointment.status}</p>
                </div>
                <button onClick={() => setShowDetailModal(false)} className="text-gray-300 hover:text-white">
                  ✕
                </button>
              </div>

              <div className="p-6 space-y-6">
                {/* Status Badge */}
                <div className="flex items-start gap-4">
                  <span
                    className={`px-4 py-2 rounded-full text-sm font-bold ${getStatusBadgeColor(selectedAppointment.status)}`}
                  >
                    {selectedAppointment.status}
                  </span>
                  <p className="text-sm text-gray-600 pt-2">
                    Your appointment is {selectedAppointment.status.toLowerCase()}
                  </p>
                </div>

                {/* Vehicle Information */}
                {selectedAppointment.vehicle && (
                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <h3 className="font-semibold text-gray-900 mb-3">Vehicle Information</h3>
                    <div className="space-y-2">
                      <p className="text-sm">
                        <strong>Vehicle ID:</strong> {selectedAppointment.vehicle.id}
                      </p>
                      <p className="text-sm">
                        <strong>Vehicle Number:</strong> {selectedAppointment.vehicle.licensePlate}
                      </p>
                      <p className="text-sm">
                        <strong>Vehicle Model:</strong> {selectedAppointment.vehicle.model}
                      </p>
                      <p className="text-sm">
                        <strong>Year:</strong> {selectedAppointment.vehicle.year}
                      </p>
                    </div>
                  </div>
                )}

                {/* Appointment Details */}
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <h3 className="font-semibold text-gray-900 mb-3">Appointment Details</h3>
                  <div className="space-y-2">
                    <p className="text-sm">
                      <strong>Date:</strong> {new Date(selectedAppointment.appointmentDateTime).toLocaleDateString()}
                    </p>
                    <p className="text-sm">
                      <strong>Time:</strong> {new Date(selectedAppointment.appointmentDateTime).toLocaleTimeString()}
                    </p>
                    {selectedAppointment.customerNotes && (
                      <p className="text-sm">
                        <strong>Your Notes:</strong> {selectedAppointment.customerNotes}
                      </p>
                    )}
                  </div>
                </div>

                {selectedAppointment.status === "PENDING" && (
                  <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200 text-sm text-gray-700">
                    <p>
                      To book a new appointment for this vehicle, you must first cancel this pending appointment. After
                      cancellation, you can immediately submit a new booking request.
                    </p>
                  </div>
                )}

                {selectedAppointment.status === "PENDING" && (
                  <Button className="w-full bg-red-600 hover:bg-red-700 text-white">CANCEL</Button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}

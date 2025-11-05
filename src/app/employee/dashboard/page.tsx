"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import EmployeeLayout from "@/components/employee-layout"
import { Button } from "@/components/ui/Button"

const API_BASE_URL = "http://localhost:8080/api"

interface Appointment {
  id: number
  status: string
  appointmentDateTime: string
  customerNotes: string
}

export default function EmployeeDashboard() {
  const router = useRouter()
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState("SCHEDULED")

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
      const url = `${API_BASE_URL}/appointments?status=${filter}`
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
      SCHEDULED: "bg-blue-100 text-blue-700",
      IN_PROGRESS: "bg-yellow-100 text-yellow-700",
      COMPLETED: "bg-green-100 text-green-700",
      CANCELLED: "bg-red-100 text-red-700",
      AWAITING_PARTS: "bg-orange-100 text-orange-700",
    }
    return colors[status] || "bg-gray-100 text-gray-700"
  }

  return (
    <EmployeeLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Employee Dashboard</h1>
          <p className="text-gray-600 mt-1">Manage your assigned appointments and log work time</p>
        </div>

        <div className="flex gap-4 items-center">
          <select
            value={filter}
            onChange={(e) => {
              setFilter(e.target.value)
              setLoading(true)
            }}
            className="border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          >
            <option value="SCHEDULED">Scheduled</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="COMPLETED">Completed</option>
            <option value="AWAITING_PARTS">Awaiting Parts</option>
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
                className="bg-white rounded-lg p-6 border border-gray-200 hover:shadow-md transition-all"
              >
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-semibold text-lg text-gray-900">Appointment #{apt.id}</h3>
                    <p className="text-sm text-gray-600 mt-1">{new Date(apt.appointmentDateTime).toLocaleString()}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(apt.status)}`}>
                    {apt.status}
                  </span>
                </div>

                {apt.customerNotes && (
                  <p className="text-gray-600 mb-4 text-sm bg-gray-50 p-3 rounded">{apt.customerNotes}</p>
                )}

                <div className="flex gap-3">
                  {apt.status === "SCHEDULED" && (
                    <Button
                      onClick={() => router.push(`/employee/appointments/${apt.id}/start`)}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white"
                    >
                      Start Work
                    </Button>
                  )}
                  <Button
                    onClick={() => router.push(`/employee/appointments/${apt.id}/time-log`)}
                    variant="outline"
                    className="text-indigo-600 border-indigo-200"
                  >
                    Log Time
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
            <p className="text-gray-600">No appointments found</p>
          </div>
        )}
      </div>
    </EmployeeLayout>
  )
}

"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import AdminLayout from "@/components/admin-layout"
import { API_BASE } from "@/lib/api"

const API_BASE_URL = API_BASE

interface TimeLog {
  id: number
  startTime: string
  endTime: string
  notes: string
  employeeId: number
  employeeName: string
  appointmentId: number
}

export default function AdminTimeLogsPage() {
  const router = useRouter()
  const [timeLogs, setTimeLogs] = useState<TimeLog[]>([])
  const [loading, setLoading] = useState(true)
  const [filterAppointment, setFilterAppointment] = useState("")

  useEffect(() => {
    // This would fetch time logs for a specific appointment
    // The backend has: GET /api/appointments/{id}/time-logs
    setLoading(false)
  }, [filterAppointment])

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Time Logs</h1>
          <p className="text-gray-600 mt-1">View technician work logs by appointment</p>
        </div>

        <div className="flex gap-4 items-center">
          <input
            type="number"
            placeholder="Enter appointment ID..."
            value={filterAppointment}
            onChange={(e) => setFilterAppointment(e.target.value)}
            className="border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
        </div>

        {loading ? (
          <div className="text-center py-12 text-gray-500">Loading time logs...</div>
        ) : filterAppointment ? (
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50">
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">ID</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Employee</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Start Time</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">End Time</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Duration</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {timeLogs.length > 0 ? (
                    timeLogs.map((log) => {
                      const start = new Date(log.startTime)
                      const end = new Date(log.endTime)
                      const duration = Math.round((end.getTime() - start.getTime()) / 1000 / 60)

                      return (
                        <tr key={log.id} className="border-b border-gray-200 hover:bg-gray-50">
                          <td className="px-6 py-4 text-sm font-medium text-gray-900">#{log.id}</td>
                          <td className="px-6 py-4 text-sm text-gray-600">{log.employeeName}</td>
                          <td className="px-6 py-4 text-sm text-gray-600">{start.toLocaleString()}</td>
                          <td className="px-6 py-4 text-sm text-gray-600">{end.toLocaleString()}</td>
                          <td className="px-6 py-4 text-sm font-medium text-gray-900">{duration} mins</td>
                          <td className="px-6 py-4 text-sm text-gray-600 max-w-xs truncate">{log.notes}</td>
                        </tr>
                      )
                    })
                  ) : (
                    <tr>
                      <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                        No time logs found for this appointment
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-lg p-8 border border-gray-200 text-center">
            <p className="text-gray-600">Enter an appointment ID to view its time logs</p>
          </div>
        )}
      </div>
    </AdminLayout>
  )
}

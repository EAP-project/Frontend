"use client"

import type React from "react"

import { useState } from "react"
import { useRouter, useParams } from "next/navigation"
import EmployeeLayout from "@/components/employee-layout"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { API_BASE } from "@/lib/api"

const API_BASE_URL = API_BASE

export default function TimeLogPage() {
  const router = useRouter()
  const params = useParams()
  const appointmentId = params.id as string

  const [formData, setFormData] = useState({
    startTime: "",
    endTime: "",
    notes: "",
  })
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)

    const token = localStorage.getItem("token")
    try {
      const response = await fetch(`${API_BASE_URL}/appointments/${appointmentId}/time-logs`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          startTime: new Date(formData.startTime).toISOString(),
          endTime: new Date(formData.endTime).toISOString(),
          notes: formData.notes,
        }),
      })

      if (response.ok) {
        setSuccess(true)
        setFormData({ startTime: "", endTime: "", notes: "" })
        setTimeout(() => router.push("/employee/dashboard"), 2000)
      }
    } catch (err) {
      console.error("Error logging time:", err)
    } finally {
      setSubmitting(false)
    }
  }

  const calculateDuration = () => {
    if (!formData.startTime || !formData.endTime) return 0
    const start = new Date(formData.startTime)
    const end = new Date(formData.endTime)
    return Math.round((end.getTime() - start.getTime()) / 1000 / 60)
  }

  return (
    <EmployeeLayout>
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Log Work Time</h1>
        <p className="text-gray-600 mb-8">Appointment #{appointmentId}</p>

        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700">
            Time logged successfully! Redirecting...
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6 bg-white rounded-lg p-8 border border-gray-200 shadow-sm">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Start Time</label>
            <Input
              type="datetime-local"
              value={formData.startTime}
              onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">End Time</label>
            <Input
              type="datetime-local"
              value={formData.endTime}
              onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
              required
            />
          </div>

          {calculateDuration() > 0 && (
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <p className="text-sm text-gray-600">
                <strong>Duration:</strong> {calculateDuration()} minutes
              </p>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Work Notes</label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Describe the work completed..."
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 min-h-24 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              required
            />
          </div>

          <div className="flex gap-3">
            <Button type="button" onClick={() => router.back()} variant="outline" className="flex-1">
              Cancel
            </Button>
            <Button type="submit" className="flex-1 bg-purple-600 hover:bg-purple-700 text-white" disabled={submitting}>
              {submitting ? "Logging..." : "Log Time"}
            </Button>
          </div>
        </form>
      </div>
    </EmployeeLayout>
  )
}

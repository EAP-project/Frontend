"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import DashboardLayout from "@/components/dashboard-layout"
import { Button } from "@/components/ui/Button"
import { API_BASE } from "@/lib/api"

const API_BASE_URL = API_BASE

interface Vehicle {
  id: number
  model: string
  year: number
  licensePlate: string
}

export default function ModificationRequestPage() {
  const router = useRouter()
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    vehicleId: "",
    customerNotes: "",
  })

  useEffect(() => {
    const token = localStorage.getItem("token")
    if (!token) {
      router.push("/login")
      return
    }

    const fetchVehicles = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/vehicles`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        if (response.ok) setVehicles(await response.json())
      } catch (err) {
        console.error("Error fetching vehicles:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchVehicles()
  }, [router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`${API_BASE_URL}/appointments/modification-request`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          vehicleId: Number.parseInt(formData.vehicleId),
          customerNotes: formData.customerNotes,
        }),
      })

      if (!response.ok) throw new Error("Request failed")

      router.push("/dashboard/appointments")
    } catch (err) {
      console.error("Error submitting request:", err)
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="text-center py-12 text-gray-500">Loading...</div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Request a Modification Quote</h1>
        <p className="text-gray-600 mb-8">Tell us what modifications you need, and we'll provide a quote</p>

        <form onSubmit={handleSubmit} className="space-y-6 bg-white rounded-lg p-8 border border-gray-200 shadow-sm">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Select Vehicle</label>
            <select
              value={formData.vehicleId}
              onChange={(e) => setFormData({ ...formData, vehicleId: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              required
            >
              <option value="">Choose a vehicle...</option>
              {vehicles.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.year} {v.model} ({v.licensePlate})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Describe Your Modification Request</label>
            <textarea
              value={formData.customerNotes}
              onChange={(e) => setFormData({ ...formData, customerNotes: e.target.value })}
              placeholder="Describe the modifications you're interested in, parts you want to install, upgrades you want to make, etc..."
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 min-h-32 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              required
            />
          </div>

          <Button
            type="submit"
            className="w-full bg-purple-600 hover:bg-purple-700 text-white h-11"
            disabled={submitting}
          >
            {submitting ? "Submitting..." : "Request Quote"}
          </Button>
        </form>
      </div>
    </DashboardLayout>
  )
}

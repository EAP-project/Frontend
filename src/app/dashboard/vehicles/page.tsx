"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import DashboardLayout from "@/components/dashboard-layout"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { API_BASE } from "@/lib/api"

const API_BASE_URL = API_BASE

interface Vehicle {
  id: number
  model: string
  year: number
  licensePlate: string
}

export default function VehiclesPage() {
  const router = useRouter()
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    model: "",
    year: new Date().getFullYear(),
    licensePlate: "",
  })
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    fetchVehicles()
  }, [])

  const fetchVehicles = async () => {
    const token = localStorage.getItem("token")
    if (!token) {
      router.push("/login")
      return
    }

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

  const handleAddVehicle = async (e: React.FormEvent) => {
    e.preventDefault()
    const token = localStorage.getItem("token")
    setSubmitting(true)

    try {
      const response = await fetch(`${API_BASE_URL}/vehicles`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        setFormData({ model: "", year: new Date().getFullYear(), licensePlate: "" })
        setShowForm(false)
        fetchVehicles()
      }
    } catch (err) {
      console.error("Error adding vehicle:", err)
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="text-center py-12 text-gray-500">Loading vehicles...</div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Vehicles</h1>
            <p className="text-gray-600 mt-1">Manage your registered vehicles</p>
          </div>
          <Button onClick={() => setShowForm(!showForm)} className="bg-purple-600 hover:bg-purple-700 text-white">
            + Add Vehicle
          </Button>
        </div>

        {showForm && (
          <form onSubmit={handleAddVehicle} className="bg-white rounded-lg p-6 border border-gray-200 space-y-4">
            <h2 className="text-lg font-semibold text-gray-900">Add New Vehicle</h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Model</label>
                <Input
                  type="text"
                  placeholder="e.g., Corolla"
                  value={formData.model}
                  onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Year</label>
                <Input
                  type="number"
                  placeholder={new Date().getFullYear().toString()}
                  value={formData.year}
                  onChange={(e) => setFormData({ ...formData, year: Number.parseInt(e.target.value) })}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">License Plate</label>
                <Input
                  type="text"
                  placeholder="e.g., ABC-1234"
                  value={formData.licensePlate}
                  onChange={(e) => setFormData({ ...formData, licensePlate: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                type="button"
                onClick={() => {
                  setShowForm(false)
                  setFormData({ model: "", year: new Date().getFullYear(), licensePlate: "" })
                }}
                variant="outline"
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="flex-1 bg-purple-600 hover:bg-purple-700 text-white"
                disabled={submitting}
              >
                {submitting ? "Adding..." : "Add Vehicle"}
              </Button>
            </div>
          </form>
        )}

        {vehicles.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {vehicles.map((vehicle) => (
              <div
                key={vehicle.id}
                className="bg-white rounded-lg p-6 border border-gray-200 hover:shadow-md transition-all"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="font-semibold text-lg text-gray-900">
                      {vehicle.year} {vehicle.model}
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">
                      License Plate:{" "}
                      <span className="font-mono font-semibold text-gray-900">{vehicle.licensePlate}</span>
                    </p>
                  </div>
                  <div className="bg-purple-100 text-purple-700 w-12 h-12 rounded-lg flex items-center justify-center">
                    <span className="text-xl">🚗</span>
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-100">
                  <Button
                    size="sm"
                    className="w-full bg-purple-600 hover:bg-purple-700 text-white"
                    onClick={() => router.push(`/dashboard/book-service?vehicleId=${vehicle.id}`)}
                  >
                    Book Service for This Vehicle
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
            <p className="text-gray-600 mb-4">No vehicles added yet</p>
            <p className="text-sm text-gray-500 mb-4">Add your first vehicle to get started with booking services</p>
            <Button className="bg-purple-600 hover:bg-purple-700 text-white" onClick={() => setShowForm(true)}>
              Add Your First Vehicle
            </Button>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}

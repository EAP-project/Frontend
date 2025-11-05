"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import AdminLayout from "@/components/admin-layout"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { API_BASE } from "@/lib/api"

const API_BASE_URL = API_BASE

interface Service {
  id: number
  name: string
  description: string
  estimatedCost: number
  estimatedDurationMinutes: number
}

export default function AdminServicesPage() {
  const router = useRouter()
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    estimatedCost: "",
    estimatedDurationMinutes: "",
  })

  useEffect(() => {
    fetchServices()
  }, [])

  const fetchServices = async () => {
    const token = localStorage.getItem("token")
    if (!token) {
      router.push("/login")
      return
    }

    try {
      const response = await fetch(`${API_BASE_URL}/services`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (response.ok) {
        setServices(await response.json())
      }
    } catch (err) {
      console.error("Error fetching services:", err)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateService = async (e: React.FormEvent) => {
    e.preventDefault()
    const token = localStorage.getItem("token")

    try {
      const response = await fetch(`${API_BASE_URL}/services`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: formData.name,
          description: formData.description,
          estimatedCost: Number.parseFloat(formData.estimatedCost),
          estimatedDurationMinutes: Number.parseInt(formData.estimatedDurationMinutes),
        }),
      })

      if (response.ok) {
        setFormData({
          name: "",
          description: "",
          estimatedCost: "",
          estimatedDurationMinutes: "",
        })
        setShowForm(false)
        fetchServices()
      }
    } catch (err) {
      console.error("Error creating service:", err)
    }
  }

  const handleDeleteService = async (id: number) => {
    if (!confirm("Are you sure you want to delete this service?")) return

    const token = localStorage.getItem("token")
    try {
      const response = await fetch(`${API_BASE_URL}/services/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      })

      if (response.ok) {
        fetchServices()
      }
    } catch (err) {
      console.error("Error deleting service:", err)
    }
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Services Management</h1>
            <p className="text-gray-600 mt-1">Create and manage available services</p>
          </div>
          <Button onClick={() => setShowForm(!showForm)} className="bg-purple-600 hover:bg-purple-700 text-white">
            + New Service
          </Button>
        </div>

        {showForm && (
          <form onSubmit={handleCreateService} className="bg-white rounded-lg p-6 border border-gray-200 space-y-4">
            <h2 className="text-lg font-semibold text-gray-900">Add New Service</h2>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Service Name</label>
              <Input
                type="text"
                placeholder="e.g., Full Synthetic Oil Change"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                placeholder="e.g., Premium oil and filter replacement"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 min-h-20 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Estimated Cost ($)</label>
                <Input
                  type="number"
                  placeholder="0.00"
                  step="0.01"
                  value={formData.estimatedCost}
                  onChange={(e) => setFormData({ ...formData, estimatedCost: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Duration (minutes)</label>
                <Input
                  type="number"
                  placeholder="30"
                  value={formData.estimatedDurationMinutes}
                  onChange={(e) => setFormData({ ...formData, estimatedDurationMinutes: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="flex gap-3">
              <Button type="button" onClick={() => setShowForm(false)} variant="outline" className="flex-1">
                Cancel
              </Button>
              <Button type="submit" className="flex-1 bg-purple-600 hover:bg-purple-700 text-white">
                Create Service
              </Button>
            </div>
          </form>
        )}

        {loading ? (
          <div className="text-center py-12 text-gray-500">Loading services...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {services.map((service) => (
              <div
                key={service.id}
                className="bg-white rounded-lg p-6 border border-gray-200 hover:shadow-md transition-all"
              >
                <div className="flex justify-between items-start mb-3">
                  <h3 className="font-semibold text-lg text-gray-900">{service.name}</h3>
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-red-600 border-red-200 hover:bg-red-50 bg-transparent"
                    onClick={() => handleDeleteService(service.id)}
                  >
                    Delete
                  </Button>
                </div>
                <p className="text-gray-600 text-sm mb-4">{service.description}</p>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-500">Cost</p>
                    <p className="font-semibold text-purple-600">${service.estimatedCost.toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Duration</p>
                    <p className="font-semibold text-gray-900">{service.estimatedDurationMinutes} mins</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && services.length === 0 && (
          <div className="text-center py-12 text-gray-500">No services created yet. Create one to get started.</div>
        )}
      </div>
    </AdminLayout>
  )
}

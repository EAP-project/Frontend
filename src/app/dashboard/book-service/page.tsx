"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import DashboardLayout from "@/components/dashboard-layout"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { API_BASE } from "@/lib/api"

const API_BASE_URL = API_BASE

interface Service {
  id: number
  name: string
  description: string
  estimatedDurationMinutes: number
  estimatedCost: number
}

interface Vehicle {
  id: number
  model: string
  year: number
  licensePlate: string
}

interface SuccessModalProps {
  isOpen: boolean
  contactNumbers: string[]
  onClose: () => void
}

function SuccessModal({ isOpen, contactNumbers, onClose }: SuccessModalProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full shadow-xl overflow-hidden">
        <div className="flex flex-col items-center p-8 text-center">
          <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mb-6">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Appointment Submitted Successfully</h2>
          <p className="text-gray-600 mb-6">
            Your appointment has been submitted successfully! Our supervisor will contact you shortly.
          </p>

          {contactNumbers.length > 0 && (
            <div className="w-full mb-6 bg-gray-50 p-4 rounded-lg border border-gray-200">
              <p className="text-xs text-gray-600 font-medium mb-2">Contact Numbers:</p>
              <div className="space-y-2">
                {contactNumbers.map((number, idx) => (
                  <p key={idx} className="text-sm font-mono text-gray-900 bg-white px-3 py-1 rounded">
                    {number}
                  </p>
                ))}
              </div>
            </div>
          )}

          <Button onClick={onClose} className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-2">
            Great!
          </Button>
        </div>
      </div>
    </div>
  )
}

export default function BookServicePage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [services, setServices] = useState<Service[]>([])
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [selectedService, setSelectedService] = useState<Service | null>(null)
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null)
  const [showSuccess, setShowSuccess] = useState(false)
  const [contactNumbers] = useState([
    "9476340286",
    "9476342068",
    "9470291623",
    "9476277157",
    "9478353085",
    "0711234567",
  ])
  const [formData, setFormData] = useState({
    vehicleId: searchParams.get("vehicleId") || "",
    serviceId: "",
    appointmentDateTime: "",
    customerNotes: "",
    contactNumber: "",
    expectedDeliveryDate: "",
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    const token = localStorage.getItem("token")
    if (!token) {
      router.push("/login")
      return
    }

    const fetchData = async () => {
      try {
        const [servicesRes, vehiclesRes] = await Promise.all([
          fetch(`${API_BASE_URL}/services`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(`${API_BASE_URL}/vehicles`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ])

        if (servicesRes.ok) setServices(await servicesRes.json())
        if (vehiclesRes.ok) {
          const vehiclesData = await vehiclesRes.json()
          setVehicles(vehiclesData)
          // Auto-select vehicle from URL param if available
          if (searchParams.get("vehicleId")) {
            const selected = vehiclesData.find((v: Vehicle) => v.id === Number(searchParams.get("vehicleId")))
            if (selected) setSelectedVehicle(selected)
          }
        }
      } catch (err) {
        console.error("Error fetching data:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [router, searchParams])

  const validateContactNumber = (number: string): boolean => {
    return /^\d{11}$/.test(number.replace(/\D/g, ""))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const newErrors: Record<string, string> = {}

    if (!validateContactNumber(formData.contactNumber)) {
      newErrors.contactNumber = "Contact number must be exactly 11 digits (e.g., 94771234567)"
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    setSubmitting(true)

    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`${API_BASE_URL}/appointments/standard-service`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          vehicleId: Number.parseInt(formData.vehicleId),
          serviceId: Number.parseInt(formData.serviceId),
          appointmentDateTime: formData.appointmentDateTime,
          customerNotes: formData.customerNotes,
        }),
      })

      if (!response.ok) throw new Error("Booking failed")

      setShowSuccess(true)
      setTimeout(() => {
        router.push("/dashboard/appointments")
      }, 3000)
    } catch (err) {
      console.error("Error booking service:", err)
      setErrors({ submit: "Failed to book appointment. Please try again." })
    } finally {
      setSubmitting(false)
    }
  }

  const handleVehicleChange = (vehicleId: string) => {
    setFormData({ ...formData, vehicleId })
    const vehicle = vehicles.find((v) => v.id === Number(vehicleId))
    setSelectedVehicle(vehicle || null)
  }

  const handleServiceChange = (serviceId: string) => {
    setFormData({ ...formData, serviceId })
    const service = services.find((s) => s.id === Number(serviceId))
    setSelectedService(service || null)
  }

  const handleContactNumberChange = (value: string) => {
    setFormData({ ...formData, contactNumber: value })
    setErrors({ ...errors, contactNumber: "" })
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
        <h1 className="text-3xl font-bold text-gray-900 mb-1">New Service Appointment</h1>
        <p className="text-gray-600 mb-8">Fill in the details to book a service for your vehicle</p>

        <form onSubmit={handleSubmit} className="space-y-8 bg-white rounded-lg p-8 border border-gray-200 shadow-sm">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <span className="text-2xl">🚗</span>
              <h2 className="text-lg font-semibold text-gray-900">Vehicle Information</h2>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Select Vehicle *</label>
                <select
                  value={formData.vehicleId}
                  onChange={(e) => handleVehicleChange(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  required
                >
                  <option value="">Choose a vehicle...</option>
                  {vehicles.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.year} {v.model} - {v.licensePlate}
                    </option>
                  ))}
                </select>
              </div>

              {selectedVehicle && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-gray-500 font-medium mb-1">Vehicle Number</label>
                    <Input type="text" value={`# ${selectedVehicle.licensePlate}`} disabled className="bg-gray-50" />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 font-medium mb-1">Vehicle Model</label>
                    <Input type="text" value={selectedVehicle.model} disabled className="bg-gray-50" />
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="border-t border-gray-200 pt-8">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-2xl">🔧</span>
              <h2 className="text-lg font-semibold text-gray-900">Service Details</h2>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Select Services *</label>
                <select
                  value={formData.serviceId}
                  onChange={(e) => handleServiceChange(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  required
                >
                  <option value="">Choose a service...</option>
                  {services.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Issue Description (Optional)</label>
                <textarea
                  value={formData.customerNotes}
                  onChange={(e) => setFormData({ ...formData, customerNotes: e.target.value })}
                  placeholder="full services"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 min-h-24 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              {selectedService && (
                <div className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-lg p-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-xs text-gray-600 font-medium">Estimated Duration</span>
                      <p className="text-lg font-semibold text-gray-900 mt-1">
                        {selectedService.estimatedDurationMinutes} minutes
                      </p>
                    </div>
                    <div>
                      <span className="text-xs text-gray-600 font-medium">Cost</span>
                      <p className="text-lg font-semibold text-purple-600 mt-1">
                        ${selectedService.estimatedCost.toFixed(2)}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="border-t border-gray-200 pt-8">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-2xl">⏰</span>
              <h2 className="text-lg font-semibold text-gray-900">Appointment Timing</h2>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Preferred Date *</label>
                  <Input
                    type="date"
                    value={formData.appointmentDateTime.split("T")[0] || ""}
                    onChange={(e) => {
                      const date = e.target.value
                      const time = formData.appointmentDateTime.split("T")[1] || "10:00"
                      setFormData({ ...formData, appointmentDateTime: `${date}T${time}` })
                    }}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Preferred Time *</label>
                  <Input
                    type="time"
                    value={formData.appointmentDateTime.split("T")[1] || "10:00"}
                    onChange={(e) => {
                      const date = formData.appointmentDateTime.split("T")[0] || new Date().toISOString().split("T")[0]
                      setFormData({ ...formData, appointmentDateTime: `${date}T${e.target.value}` })
                    }}
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">Format: 07:30 PM</p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Expected Delivery Date *</label>
                <Input
                  type="date"
                  value={formData.expectedDeliveryDate}
                  onChange={(e) => setFormData({ ...formData, expectedDeliveryDate: e.target.value })}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Contact Number *
                  {errors.contactNumber && <span className="text-red-600 ml-1">({errors.contactNumber})</span>}
                </label>
                <Input
                  type="tel"
                  placeholder="9476342068"
                  value={formData.contactNumber}
                  onChange={(e) => handleContactNumberChange(e.target.value)}
                  className={errors.contactNumber ? "border-red-500 focus:ring-red-500" : ""}
                  required
                />
                <p className={`text-xs mt-1 ${errors.contactNumber ? "text-red-600" : "text-gray-500"}`}>
                  Contact number must be exactly 11 digits (e.g., 9476342068)
                </p>
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex gap-3 pt-4 border-t border-gray-200">
            <Button
              type="button"
              onClick={() => router.back()}
              className="flex-1 border-2 border-blue-500 text-blue-600 bg-white hover:bg-blue-50"
            >
              RESET FORM
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold"
              disabled={submitting}
            >
              {submitting ? "SUBMITTING..." : "SUBMIT APPOINTMENT"}
            </Button>
          </div>

          {errors.submit && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">{errors.submit}</div>
          )}
        </form>
      </div>

      <SuccessModal isOpen={showSuccess} contactNumbers={contactNumbers} onClose={() => setShowSuccess(false)} />
    </DashboardLayout>
  )
}

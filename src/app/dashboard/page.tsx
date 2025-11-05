"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import DashboardLayout from "@/components/dashboard-layout"
import { Button } from "@/components/ui/Button"
import Link from "next/link"

const API_BASE_URL = "http://localhost:8080/api"

interface Service {
  id: number
  name: string
  description: string
  estimatedCost: number
  estimatedDurationMinutes: number
}

interface Appointment {
  id: number
  status: string
  appointmentDateTime: string
}

interface Vehicle {
  id: number
  model: string
  year: number
  licensePlate: string
}

export default function DashboardPage() {
  const router = useRouter()
  const [services, setServices] = useState<Service[]>([])
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalAppointments: 0,
    pendingAppointments: 0,
    totalVehicles: 0,
  })

  useEffect(() => {
    const token = localStorage.getItem("token")
    if (!token) {
      router.push("/login")
      return
    }

    const fetchData = async () => {
      try {
        const [servicesRes, appointmentsRes, vehiclesRes] = await Promise.all([
          fetch(`${API_BASE_URL}/services`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(`${API_BASE_URL}/appointments`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(`${API_BASE_URL}/vehicles`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ])

        const servicesData = servicesRes.ok ? await servicesRes.json() : []
        const appointmentsData = appointmentsRes.ok ? await appointmentsRes.json() : []
        const vehiclesData = vehiclesRes.ok ? await vehiclesRes.json() : []

        setServices(servicesData)
        setAppointments(appointmentsData)
        setVehicles(vehiclesData)

        setStats({
          totalAppointments: appointmentsData.length,
          pendingAppointments: appointmentsData.filter(
            (a: Appointment) => a.status === "SCHEDULED" || a.status === "QUOTE_REQUESTED",
          ).length,
          totalVehicles: vehiclesData.length,
        })
      } catch (err) {
        console.error("Error fetching data:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [router])

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div className="bg-gradient-to-r from-purple-600 to-purple-700 rounded-lg p-8 text-white shadow-lg">
          <h1 className="text-3xl font-bold mb-2">Welcome to Garage24 !!</h1>
          <p className="text-purple-100">We are here to keep your vehicles running smoothly.</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { label: "Total Appointments", value: stats.totalAppointments, icon: "📅" },
            { label: "Pending", value: stats.pendingAppointments, icon: "⏳" },
            { label: "My Vehicles", value: stats.totalVehicles, icon: "🚗" },
          ].map((stat, i) => (
            <div key={i} className="bg-white rounded-lg p-6 border border-gray-200 hover:shadow-md transition-all">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">{stat.label}</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">{stat.value}</p>
                </div>
                <div className="text-4xl opacity-50">{stat.icon}</div>
              </div>
            </div>
          ))}
        </div>

        {!loading && appointments.length === 0 ? (
          <div className="bg-white rounded-lg p-12 border border-gray-200 text-center">
            <div className="flex justify-center mb-6">
              <svg width="200" height="150" viewBox="0 0 200 150" className="text-gray-400">
                <ellipse cx="100" cy="110" rx="60" ry="20" fill="currentColor" opacity="0.2" />
                <g transform="translate(50, 40)">
                  <rect x="0" y="30" width="100" height="50" rx="8" fill="none" stroke="currentColor" strokeWidth="2" />
                  <circle cx="25" cy="80" r="12" fill="currentColor" opacity="0.3" />
                  <circle cx="75" cy="80" r="12" fill="currentColor" opacity="0.3" />
                  <rect x="10" y="35" width="20" height="15" fill="currentColor" opacity="0.2" />
                  <rect x="70" y="35" width="20" height="15" fill="currentColor" opacity="0.2" />
                </g>
              </svg>
            </div>
            <p className="text-lg font-semibold text-gray-900 mb-2">You haven't made any booking yet...</p>
            <p className="text-gray-600 mb-6">Schedule your first service appointment today</p>
            <Link href="/dashboard/book-service">
              <Button className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 font-semibold">
                BOOK APPOINTMENT
              </Button>
            </Link>
          </div>
        ) : (
          <>
            {/* Quick Actions */}
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Quick Actions</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Link href="/dashboard/book-service">
                  <Button className="w-full bg-purple-600 hover:bg-purple-700 text-white h-14 text-base font-semibold">
                    Book a Service
                  </Button>
                </Link>
                <Link href="/dashboard/modification-request">
                  <Button variant="outline" className="w-full h-14 text-base font-semibold bg-transparent">
                    Request a Quote
                  </Button>
                </Link>
                <Link href="/dashboard/vehicles">
                  <Button variant="outline" className="w-full h-14 text-base font-semibold bg-transparent">
                    Manage Vehicles
                  </Button>
                </Link>
              </div>
            </div>

            {/* Available Services */}
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Available Services</h2>
              {loading ? (
                <div className="text-center py-12 text-gray-500">Loading services...</div>
              ) : services.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {services.slice(0, 6).map((service) => (
                    <div
                      key={service.id}
                      className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-all"
                    >
                      <h3 className="font-semibold text-lg text-gray-900 mb-2">{service.name}</h3>
                      <p className="text-gray-600 text-sm mb-4">{service.description}</p>
                      <div className="flex justify-between items-center pt-4 border-t border-gray-100">
                        <div>
                          <p className="text-xs text-gray-500">Duration</p>
                          <p className="font-semibold text-gray-900">{service.estimatedDurationMinutes} mins</p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-gray-500">Cost</p>
                          <p className="font-semibold text-purple-600">${service.estimatedCost.toFixed(2)}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500">No services available</div>
              )}
            </div>

            {/* Recent Appointments */}
            <div>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-gray-900">Recent Appointments</h2>
                <Link href="/dashboard/appointments">
                  <Button variant="outline" size="sm" className="bg-transparent">
                    View All
                  </Button>
                </Link>
              </div>
              {appointments.length > 0 ? (
                <div className="space-y-3">
                  {appointments.slice(0, 5).map((apt) => (
                    <div
                      key={apt.id}
                      className="bg-white border border-gray-200 rounded-lg p-4 flex justify-between items-center hover:shadow-sm transition-all"
                    >
                      <div>
                        <p className="font-semibold text-gray-900">Appointment #{apt.id}</p>
                        <p className="text-sm text-gray-600">{new Date(apt.appointmentDateTime).toLocaleString()}</p>
                      </div>
                      <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium">
                        {apt.status}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <p>No appointments scheduled yet</p>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  )
}

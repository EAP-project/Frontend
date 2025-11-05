// "use client";

// export default function DashboardPage() {
//   return (
//     <main className="min-h-screen bg-gray-50 flex items-center justify-center">
//       <div className="bg-white p-8 rounded-2xl shadow-md w-full max-w-2xl text-center">
//         <h2 className="text-2xl font-bold text-blue-600 mb-4">Dashboard</h2>
//         <p className="text-gray-600 mb-6">
//           Welcome to your Automobile Service Dashboard.  
//           Here you’ll be able to manage your appointments and service logs.
//         </p>

//         <div className="grid grid-cols-2 gap-4">
//           <button className="py-3 px-6 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
//             Book Appointment
//           </button>
//           <button className="py-3 px-6 bg-green-600 text-white rounded-lg hover:bg-green-700">
//             View Service Logs
//           </button>
//           <button className="py-3 px-6 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 col-span-2">
//             Manage Profile
//           </button>
//         </div>
//       </div>
//     </main>
//   );
// }




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
        {/* Welcome Banner */}
        <div className="bg-gradient-to-r from-indigo-600 to-indigo-300 rounded-lg p-8 text-white shadow-lg">
          <h1 className="text-3xl font-bold mb-2">Welcome to AutoService</h1>
          <p className="text-indigo-100">Manage your vehicle services, appointments, and quotes all in one place.</p>
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

        {/* Quick Actions */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link href="/dashboard/book-service">
              <button className="w-full h-16 text-lg bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg cursor-pointer">
                Book a Service
              </button>
            </Link>
            <Link href="/dashboard/modification-request">
              <button className="w-full h-14 text-base font-semibold bg-transparent border hover:bg-indigo-200 border-indigo-200 text-indigo-600 rounded-lg cursor-pointer">
                Request a Quote
              </button>
            </Link>
            <Link href="/dashboard/vehicles">
              <button className="w-full h-14 text-base font-semibold bg-transparent border hover:bg-indigo-200 border-indigo-200 text-indigo-600 rounded-lg cursor-pointer">
                Manage Vehicles
              </button>
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
          {loading ? (
            <div className="text-center py-12 text-gray-500">Loading appointments...</div>
          ) : appointments.length > 0 ? (
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
              <p className="mb-4">No appointments yet</p>
              <Link href="/dashboard/book-service">
                <Button className="bg-purple-600 hover:bg-purple-700 text-white">Book Your First Appointment</Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}

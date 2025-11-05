"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getAllAppointments, getAllServices, Appointment, Service } from "@/lib/api";
import Sidebar from "@/components/Sidebar";
import { Card } from "@/components/ui/card";
import {
  Users,
  Wrench,
  Calendar,
  Activity,
  Clock,
  CheckCircle,
  AlertCircle,
  XCircle,
} from "lucide-react";

export default function AdminDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<{ firstName?: string; lastName?: string; email?: string; role?: string } | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userStr = localStorage.getItem("user");

    if (!token || !userStr) {
      router.push("/login");
      return;
    }

    const userData = JSON.parse(userStr);
    setUser(userData);

    if (!userData.role?.toUpperCase().includes("ADMIN")) {
      const role = userData.role?.toUpperCase() || "";
      if (
        role.includes("EMPLOYEE") ||
        role.includes("TECHNICIAN") ||
        role.includes("SUPERVISOR") ||
        role.includes("MANAGER")
      ) {
        router.push("/dashboard/employee");
      } else {
        router.push("/dashboard/customer");
      }
      return;
    }

    loadData();
  }, [router]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [appointmentsData, servicesData] = await Promise.all([
        getAllAppointments(),
        getAllServices(),
      ]);
      setAppointments(appointmentsData);
      setServices(servicesData);
    } catch (err) {
      console.error("Failed to load data:", err);
      setError(err instanceof Error ? err.message : "Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  if (!user || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  const pendingAppointments = appointments.filter((apt) => apt.status === "PENDING");
  const confirmedAppointments = appointments.filter((apt) => apt.status === "CONFIRMED");
  const completedAppointments = appointments.filter((apt) => apt.status === "COMPLETED");
  const cancelledAppointments = appointments.filter((apt) => apt.status === "CANCELLED");
  const todayAppointments = appointments.filter((apt) => {
    const aptDate = new Date(apt.appointmentDateTime);
    const today = new Date();
    return aptDate.toDateString() === today.toDateString();
  });

  const stats = [
    {
      title: "Total Appointments",
      value: appointments.length.toString(),
      icon: <Calendar className="h-6 w-6 text-blue-600" />,
      bgColor: "bg-blue-50",
    },
    {
      title: "Active Services",
      value: services.length.toString(),
      icon: <Wrench className="h-6 w-6 text-green-600" />,
      bgColor: "bg-green-50",
    },
    {
      title: "Today&apos;s Appointments",
      value: todayAppointments.length.toString(),
      icon: <Clock className="h-6 w-6 text-purple-600" />,
      bgColor: "bg-purple-50",
    },
    {
      title: "Completed",
      value: completedAppointments.length.toString(),
      icon: <CheckCircle className="h-6 w-6 text-orange-600" />,
      bgColor: "bg-orange-50",
    },
  ];

  const statusBreakdown = [
    {
      status: "Pending",
      count: pendingAppointments.length,
      icon: <AlertCircle className="h-5 w-5 text-yellow-600" />,
      color: "text-yellow-600",
      bgColor: "bg-yellow-50",
    },
    {
      status: "Confirmed",
      count: confirmedAppointments.length,
      icon: <CheckCircle className="h-5 w-5 text-blue-600" />,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      status: "Completed",
      count: completedAppointments.length,
      icon: <CheckCircle className="h-5 w-5 text-green-600" />,
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      status: "Cancelled",
      count: cancelledAppointments.length,
      icon: <XCircle className="h-5 w-5 text-red-600" />,
      color: "text-red-600",
      bgColor: "bg-red-50",
    },
  ];

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Sidebar role="admin" />
      
      <main className="flex-1 p-8 ml-64">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              Admin Dashboard
            </h2>
            <p className="text-gray-600">
              Welcome back, {user.firstName}! Here\'s your system overview.
            </p>
          </div>

          {error && (
            <Card className="p-4 mb-6 bg-red-50 border-red-200">
              <p className="text-red-600">{error}</p>
            </Card>
          )}

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {stats.map((stat, index) => (
              <Card key={index} className={`p-6 ${stat.bgColor}`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">
                      {stat.title}
                    </p>
                    <p className="text-3xl font-bold text-gray-900">
                      {stat.value}
                    </p>
                  </div>
                  <div className={stat.bgColor}>{stat.icon}</div>
                </div>
              </Card>
            ))}
          </div>

          {/* Status Breakdown */}
          <Card className="p-6 mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Appointment Status Overview
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {statusBreakdown.map((item, index) => (
                <div key={index} className={`p-4 rounded-lg ${item.bgColor}`}>
                  <div className="flex items-center gap-3">
                    {item.icon}
                    <div>
                      <p className="text-sm font-medium text-gray-600">
                        {item.status}
                      </p>
                      <p className={`text-2xl font-bold ${item.color}`}>
                        {item.count}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Today&apos;s Appointments */}
          <Card className="p-6 mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Today&apos;s Appointments
            </h3>
            {todayAppointments.length === 0 ? (
              <p className="text-gray-500">No appointments scheduled for today.</p>
            ) : (
              <div className="space-y-3">
                {todayAppointments.slice(0, 5).map((apt) => (
                  <div
                    key={apt.id}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">
                        {apt.service?.serviceName || "N/A"}
                      </p>
                      <p className="text-sm text-gray-600">
                        {apt.vehicle?.model} ({apt.vehicle?.year}) - {apt.vehicle?.licensePlate}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900">
                        {new Date(apt.appointmentDateTime).toLocaleTimeString("en-US", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                      <p className={`text-xs px-2 py-1 rounded-full inline-block ${
                        apt.status === "CONFIRMED" ? "bg-blue-100 text-blue-700" :
                        apt.status === "PENDING" ? "bg-yellow-100 text-yellow-700" :
                        apt.status === "COMPLETED" ? "bg-green-100 text-green-700" :
                        "bg-gray-100 text-gray-700"
                      }`}>
                        {apt.status}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Recent Appointments */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Recent Appointments
            </h3>
            {appointments.length === 0 ? (
              <p className="text-gray-500">No appointments found.</p>
            ) : (
              <div className="space-y-3">
                {appointments.slice(0, 10).map((apt) => (
                  <div
                    key={apt.id}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">
                        {apt.service?.serviceName || "N/A"}
                      </p>
                      <p className="text-sm text-gray-600">
                        {apt.vehicle?.model} ({apt.vehicle?.year}) - {apt.vehicle?.licensePlate}
                      </p>
                      {apt.employee && (
                        <p className="text-xs text-gray-500">
                          Assigned to: {apt.employee.firstName} {apt.employee.lastName}
                        </p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900">
                        {new Date(apt.appointmentDateTime).toLocaleDateString()}
                      </p>
                      <p className={`text-xs px-2 py-1 rounded-full inline-block ${
                        apt.status === "CONFIRMED" ? "bg-blue-100 text-blue-700" :
                        apt.status === "PENDING" ? "bg-yellow-100 text-yellow-700" :
                        apt.status === "COMPLETED" ? "bg-green-100 text-green-700" :
                        apt.status === "CANCELLED" ? "bg-red-100 text-red-700" :
                        "bg-gray-100 text-gray-700"
                      }`}>
                        {apt.status}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </main>
    </div>
  );
}

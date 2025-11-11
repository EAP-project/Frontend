"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import {
  getAllAppointments,
  getAllServices,
  Appointment,
  Service,
} from "@/lib/api";
import { Card } from "@/components/ui/card";
import Skeleton from "@/components/ui/Skeleton";
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
  const { user, token, initialized } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      // Fetch appointments and services in parallel for better performance
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
  }, []);

  useEffect(() => {
    if (!initialized) return;

    if (!user || !token) {
      router.push("/login");
      return;
    }

    if (!user.role?.toUpperCase().includes("ADMIN")) {
      const role = user.role?.toUpperCase() || "";
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
  }, [initialized, user, token, router, loadData]);

  // Memoize expensive calculations to avoid recalculating on every render
  const appointmentStats = useMemo(() => {
    const pending = appointments.filter((apt) => apt.status === "PENDING");
    const confirmed = appointments.filter((apt) => apt.status === "CONFIRMED");
    const completed = appointments.filter((apt) => apt.status === "COMPLETED");
    const cancelled = appointments.filter((apt) => apt.status === "CANCELLED");
    
    const today = new Date();
    const todayStr = today.toDateString();
    const todayApts = appointments.filter((apt) => {
      const aptDate = new Date(apt.appointmentDateTime);
      return aptDate.toDateString() === todayStr;
    });

    return {
      pending,
      confirmed,
      completed,
      cancelled,
      today: todayApts,
    };
  }, [appointments]);

  const { pending: pendingAppointments, confirmed: confirmedAppointments, completed: completedAppointments, cancelled: cancelledAppointments, today: todayAppointments } = appointmentStats;

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

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
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              Admin Dashboard
            </h2>
            <p className="text-gray-600">
              Welcome back, {user.firstName}! Here&apos;s your system overview.
            </p>
          </div>
          <button
            onClick={() => router.push("/add-service")}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center gap-2"
          >
            <Wrench className="h-5 w-5" />
            Add New Service
          </button>
        </div>

        {error && (
          <Card className="p-4 mb-6 bg-red-50 border-red-200">
            <p className="text-red-600">{error}</p>
          </Card>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {loading ? (
            Array.from({ length: 4 }).map((_, index) => (
              <Card key={index} className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <Skeleton lines={1} className="w-32 h-4 mb-2" />
                    <Skeleton lines={1} className="w-16 h-8" />
                  </div>
                  <Skeleton variant="circle" className="h-10 w-10" />
                </div>
              </Card>
            ))
          ) : (
            stats.map((stat, index) => (
              <Card
                key={index}
                className={`p-6 ${stat.bgColor} ${
                  stat.title === "Active Services"
                    ? "cursor-pointer hover:shadow-lg transition-shadow"
                    : ""
                }`}
                onClick={() => {
                  if (stat.title === "Active Services") {
                    router.push("/admin/services");
                  }
                }}
              >
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
            ))
          )}
        </div>

        {/* Status Breakdown */}
        <Card className="p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Appointment Status Overview
          </h3>
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="p-4 rounded-lg bg-gray-50">
                  <div className="flex items-center gap-3">
                    <Skeleton variant="circle" className="h-5 w-5" />
                    <div className="flex-1">
                      <Skeleton lines={1} className="w-20 h-4 mb-1" />
                      <Skeleton lines={1} className="w-12 h-7" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
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
          )}
        </Card>

        {/* Today&apos;s Appointments */}
        <Card className="p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Today&apos;s Appointments
          </h3>
          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, index) => (
                <div key={index} className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <Skeleton lines={1} className="w-48 h-5 mb-2" />
                      <Skeleton lines={1} className="w-64 h-4" />
                    </div>
                    <div className="text-right">
                      <Skeleton lines={1} className="w-16 h-5 mb-1" />
                      <Skeleton lines={1} className="w-20 h-6 rounded-full" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : todayAppointments.length === 0 ? (
            <p className="text-gray-500">
              No appointments scheduled for today.
            </p>
          ) : (
            <div className="space-y-3">
              {todayAppointments.slice(0, 5).map((apt) => (
                <div
                  key={apt.id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">
                      {apt.service?.name || "N/A"}
                    </p>
                    <p className="text-sm text-gray-600">
                      {apt.vehicle?.model} ({apt.vehicle?.year}) -{" "}
                      {apt.vehicle?.licensePlate}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">
                      {new Date(apt.appointmentDateTime).toLocaleTimeString(
                        "en-US",
                        {
                          hour: "2-digit",
                          minute: "2-digit",
                        }
                      )}
                    </p>
                    <p
                      className={`text-xs px-2 py-1 rounded-full inline-block ${
                        apt.status === "CONFIRMED"
                          ? "bg-blue-100 text-blue-700"
                          : apt.status === "PENDING"
                          ? "bg-yellow-100 text-yellow-700"
                          : apt.status === "COMPLETED"
                          ? "bg-green-100 text-green-700"
                          : "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {apt.status}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Services Overview */}
        <Card className="p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Services Overview
            </h3>
            <button
              onClick={() => router.push("/admin/services")}
              className="text-blue-600 hover:text-blue-700 font-medium text-sm flex items-center gap-1"
            >
              View All
              <Wrench className="h-4 w-4" />
            </button>
          </div>
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.from({ length: 6 }).map((_, index) => (
                <div key={index} className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-start justify-between mb-2">
                    <Skeleton lines={1} className="w-32 h-5" />
                    <Skeleton lines={1} className="w-16 h-6 rounded-full" />
                  </div>
                  <Skeleton lines={2} className="w-full mb-2" />
                  <div className="flex items-center justify-between">
                    <Skeleton lines={1} className="w-16 h-5" />
                    <Skeleton lines={1} className="w-12 h-4" />
                  </div>
                </div>
              ))}
            </div>
          ) : services.length === 0 ? (
            <div className="text-center py-8">
              <Wrench className="h-12 w-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-500 mb-4">No services available yet.</p>
              <button
                onClick={() => router.push("/add-service")}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium"
              >
                Add First Service
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {services.slice(0, 6).map((service) => (
                <div
                  key={service.id}
                  className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                  onClick={() => router.push("/admin/services")}
                >
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-medium text-gray-900">
                      {service.name}
                    </h4>
                    {service.category && (
                      <span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-700">
                        {service.category.name}
                      </span>
                    )}
                  </div>
                  {service.description && (
                    <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                      {service.description}
                    </p>
                  )}
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-semibold text-green-600">
                      $
                      {service.estimatedCost?.toFixed(2) ||
                        service.estimatedCost?.toFixed(2) ||
                        "N/A"}
                    </span>
                    {service.estimatedDurationMinutes && (
                      <span className="text-gray-500">
                        {service.estimatedDurationMinutes} min
                      </span>
                    )}
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
          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, index) => (
                <div key={index} className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <Skeleton lines={1} className="w-48 h-5 mb-2" />
                      <Skeleton lines={1} className="w-56 h-4 mb-1" />
                      <Skeleton lines={1} className="w-32 h-3" />
                    </div>
                    <div className="text-right">
                      <Skeleton lines={1} className="w-24 h-5 mb-1" />
                      <Skeleton lines={1} className="w-20 h-6 rounded-full" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : appointments.length === 0 ? (
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
                      {apt.service?.name || "N/A"}
                    </p>
                    <p className="text-sm text-gray-600">
                      {apt.vehicle?.model} ({apt.vehicle?.year}) -{" "}
                      {apt.vehicle?.licensePlate}
                    </p>
                    {apt.employee && (
                      <p className="text-xs text-gray-500">
                        Assigned to: {apt.employee.firstName}{" "}
                        {apt.employee.lastName}
                      </p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">
                      {new Date(apt.appointmentDateTime).toLocaleDateString()}
                    </p>
                    <p
                      className={`text-xs px-2 py-1 rounded-full inline-block ${
                        apt.status === "CONFIRMED"
                          ? "bg-blue-100 text-blue-700"
                          : apt.status === "PENDING"
                          ? "bg-yellow-100 text-yellow-700"
                          : apt.status === "COMPLETED"
                          ? "bg-green-100 text-green-700"
                          : apt.status === "CANCELLED"
                          ? "bg-red-100 text-red-700"
                          : "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {apt.status}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}

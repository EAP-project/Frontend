"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getMyAppointments, Appointment } from "@/lib/api";
import Sidebar from "@/components/Sidebar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/Button";
import {
  Calendar,
  Plus,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
} from "lucide-react";

export default function AppointmentsPage() {
  const router = useRouter();
  const [user, setUser] = useState<{
    firstName?: string;
    lastName?: string;
    email?: string;
    role?: string;
  } | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>("all");

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userStr = localStorage.getItem("user");

    if (!token || !userStr) {
      router.push("/login");
      return;
    }

    const userData = JSON.parse(userStr);
    setUser(userData);

    loadAppointments();
  }, [router]);

  const loadAppointments = async () => {
    try {
      setLoading(true);
      const appointmentsData = await getMyAppointments();
      setAppointments(appointmentsData);
    } catch (err) {
      console.error("Failed to load appointments:", err);
      setError(
        err instanceof Error ? err.message : "Failed to load appointments"
      );
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case "CANCELLED":
        return <XCircle className="h-5 w-5 text-red-600" />;
      case "CONFIRMED":
        return <CheckCircle className="h-5 w-5 text-blue-600" />;
      case "PENDING":
        return <AlertCircle className="h-5 w-5 text-yellow-600" />;
      default:
        return <Clock className="h-5 w-5 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return "bg-green-100 text-green-700";
      case "CANCELLED":
        return "bg-red-100 text-red-700";
      case "CONFIRMED":
        return "bg-blue-100 text-blue-700";
      case "PENDING":
        return "bg-yellow-100 text-yellow-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const filteredAppointments = appointments.filter((apt) => {
    if (filter === "all") return true;
    return apt.status === filter.toUpperCase();
  });

  const upcomingCount = appointments.filter(
    (apt) => apt.status !== "COMPLETED" && apt.status !== "CANCELLED"
  ).length;

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar role="customer" user={user} />

      <main className="flex-1 p-8 ml-64">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <Calendar className="h-8 w-8 text-blue-600" />
                My Appointments
              </h1>
              <p className="text-gray-600 mt-2">
                Track and manage your service appointments
              </p>
            </div>
            <Link href="/appointments/add">
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Book New Appointment
              </Button>
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <Card className="p-4 bg-blue-50 border-blue-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-blue-600 font-medium">Total</p>
                  <p className="text-2xl font-bold text-blue-900">
                    {appointments.length}
                  </p>
                </div>
                <Calendar className="h-8 w-8 text-blue-600" />
              </div>
            </Card>
            <Card className="p-4 bg-yellow-50 border-yellow-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-yellow-600 font-medium">
                    Upcoming
                  </p>
                  <p className="text-2xl font-bold text-yellow-900">
                    {upcomingCount}
                  </p>
                </div>
                <Clock className="h-8 w-8 text-yellow-600" />
              </div>
            </Card>
            <Card className="p-4 bg-green-50 border-green-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-green-600 font-medium">
                    Completed
                  </p>
                  <p className="text-2xl font-bold text-green-900">
                    {
                      appointments.filter((a) => a.status === "COMPLETED")
                        .length
                    }
                  </p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
            </Card>
            <Card className="p-4 bg-red-50 border-red-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-red-600 font-medium">Cancelled</p>
                  <p className="text-2xl font-bold text-red-900">
                    {
                      appointments.filter((a) => a.status === "CANCELLED")
                        .length
                    }
                  </p>
                </div>
                <XCircle className="h-8 w-8 text-red-600" />
              </div>
            </Card>
          </div>

          {/* Filter */}
          <div className="mb-6">
            <div className="flex gap-2">
              <Button
                variant={filter === "all" ? "default" : "outline"}
                onClick={() => setFilter("all")}
                size="sm"
              >
                All
              </Button>
              <Button
                variant={filter === "pending" ? "default" : "outline"}
                onClick={() => setFilter("pending")}
                size="sm"
              >
                Pending
              </Button>
              <Button
                variant={filter === "confirmed" ? "default" : "outline"}
                onClick={() => setFilter("confirmed")}
                size="sm"
              >
                Confirmed
              </Button>
              <Button
                variant={filter === "completed" ? "default" : "outline"}
                onClick={() => setFilter("completed")}
                size="sm"
              >
                Completed
              </Button>
              <Button
                variant={filter === "cancelled" ? "default" : "outline"}
                onClick={() => setFilter("cancelled")}
                size="sm"
              >
                Cancelled
              </Button>
            </div>
          </div>

          {error && (
            <Card className="p-4 mb-6 bg-red-50 border-red-200">
              <p className="text-red-600">{error}</p>
            </Card>
          )}

          {/* Appointments List */}
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-lg text-gray-600">
                Loading appointments...
              </div>
            </div>
          ) : filteredAppointments.length === 0 ? (
            <Card className="p-12 text-center">
              <Calendar className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {filter === "all"
                  ? "No Appointments Yet"
                  : `No ${filter} Appointments`}
              </h3>
              <p className="text-gray-600 mb-6">
                {filter === "all"
                  ? "Book your first service appointment"
                  : `You don&apos;t have any ${filter} appointments`}
              </p>
              {filter === "all" && (
                <Link href="/appointments/add">
                  <Button className="gap-2">
                    <Plus className="h-4 w-4" />
                    Book Your First Appointment
                  </Button>
                </Link>
              )}
            </Card>
          ) : (
            <div className="space-y-4">
              {filteredAppointments.map((appointment) => (
                <Card
                  key={appointment.id}
                  className="p-6 hover:shadow-lg transition-shadow"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        {getStatusIcon(appointment.status || "")}
                        <h3 className="text-lg font-bold text-gray-900">
                          {appointment.service?.serviceName || "N/A"}
                        </h3>
                        <span
                          className={`text-xs px-3 py-1 rounded-full font-medium ${getStatusColor(
                            appointment.status || ""
                          )}`}
                        >
                          {appointment.status}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
                        <div>
                          <p className="text-sm text-gray-600">Date & Time</p>
                          <p className="font-medium text-gray-900">
                            {new Date(
                              appointment.appointmentDateTime
                            ).toLocaleDateString("en-US", {
                              weekday: "short",
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                            })}
                          </p>
                          <p className="text-sm text-gray-700">
                            {new Date(
                              appointment.appointmentDateTime
                            ).toLocaleTimeString("en-US", {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </p>
                        </div>

                        <div>
                          <p className="text-sm text-gray-600">Vehicle</p>
                          <p className="font-medium text-gray-900">
                            {appointment.vehicle?.model} (
                            {appointment.vehicle?.year})
                          </p>
                          <p className="text-sm text-gray-700">
                            {appointment.vehicle?.licensePlate}
                          </p>
                        </div>

                        <div>
                          <p className="text-sm text-gray-600">Service Price</p>
                          <p className="font-medium text-gray-900">
                            ${appointment.service?.price?.toFixed(2) || "N/A"}
                          </p>
                        </div>
                      </div>

                      {appointment.customerNotes && (
                        <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                          <p className="text-sm text-gray-600 mb-1">
                            Your Notes:
                          </p>
                          <p className="text-sm text-gray-900">
                            {appointment.customerNotes}
                          </p>
                        </div>
                      )}

                      {appointment.employee && (
                        <div className="mt-3">
                          <p className="text-sm text-gray-600">
                            Assigned Technician:{" "}
                            <span className="font-medium text-gray-900">
                              {appointment.employee.firstName}{" "}
                              {appointment.employee.lastName}
                            </span>
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

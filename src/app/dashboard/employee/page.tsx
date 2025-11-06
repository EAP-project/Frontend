"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getAllAppointments, Appointment } from "@/lib/api";
import Sidebar from "@/components/Sidebar";
import { Card } from "@/components/ui/card";
import {
  Wrench,
  Calendar,
  Clock,
  CheckCircle,
  AlertCircle,
  XCircle,
} from "lucide-react";

export default function EmployeeDashboard() {
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

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userStr = localStorage.getItem("user");

    if (!token || !userStr) {
      router.push("/login");
      return;
    }

    const userData = JSON.parse(userStr);
    setUser(userData);

    const role = userData.role?.toUpperCase() || "";
    if (role.includes("ADMIN")) {
      router.push("/dashboard/admin");
      return;
    } else if (
      !role.includes("EMPLOYEE") &&
      !role.includes("TECHNICIAN") &&
      !role.includes("SUPERVISOR") &&
      !role.includes("MANAGER")
    ) {
      router.push("/dashboard/customer");
      return;
    }

    loadData();
  }, [router]);

  const loadData = async () => {
    try {
      setLoading(true);
      const appointmentsData = await getAllAppointments();
      setAppointments(appointmentsData);
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

  const activeJobs = appointments.filter(
    (apt) => apt.status === "CONFIRMED" || apt.status === "IN_PROGRESS"
  );
  const completedToday = appointments.filter((apt) => {
    if (apt.status !== "COMPLETED") return false;
    const aptDate = new Date(apt.updatedAt || apt.createdAt || "");
    const today = new Date();
    return aptDate.toDateString() === today.toDateString();
  });
  const pendingTasks = appointments.filter((apt) => apt.status === "PENDING");

  const todayAppointments = appointments
    .filter((apt) => {
      const aptDate = new Date(apt.appointmentDateTime);
      const today = new Date();
      return aptDate.toDateString() === today.toDateString();
    })
    .sort(
      (a, b) =>
        new Date(a.appointmentDateTime).getTime() -
        new Date(b.appointmentDateTime).getTime()
    );

  const stats = [
    {
      title: "Active Jobs",
      value: activeJobs.length.toString(),
      icon: <Wrench className="h-6 w-6 text-blue-600" />,
      bgColor: "bg-blue-50",
    },
    {
      title: "Completed Today",
      value: completedToday.length.toString(),
      icon: <CheckCircle className="h-6 w-6 text-green-600" />,
      bgColor: "bg-green-50",
    },
    {
      title: "Pending Tasks",
      value: pendingTasks.length.toString(),
      icon: <AlertCircle className="h-6 w-6 text-orange-600" />,
      bgColor: "bg-orange-50",
    },
    {
      title: "Today&apos;s Schedule",
      value: todayAppointments.length.toString(),
      icon: <Clock className="h-6 w-6 text-purple-600" />,
      bgColor: "bg-purple-50",
    },
  ];

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      <Sidebar role="employee" />

      <main className="flex-1 p-8 ml-64">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              Employee Dashboard
            </h2>
            <p className="text-gray-600">
              Welcome back, {user.firstName}! Here are your tasks for today.
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

          {/* Today&apos;s Appointments */}
          <Card className="p-6 mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Calendar className="h-5 w-5 text-blue-600" />
              Today&apos;s Appointments
            </h3>
            {todayAppointments.length === 0 ? (
              <p className="text-gray-500">
                No appointments scheduled for today.
              </p>
            ) : (
              <div className="space-y-3">
                {todayAppointments.map((apt) => (
                  <div
                    key={apt.id}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <p className="text-sm font-semibold text-blue-600">
                          {new Date(apt.appointmentDateTime).toLocaleTimeString(
                            "en-US",
                            {
                              hour: "2-digit",
                              minute: "2-digit",
                            }
                          )}
                        </p>
                        <p
                          className={`text-xs px-2 py-1 rounded-full ${
                            apt.status === "CONFIRMED"
                              ? "bg-blue-100 text-blue-700"
                              : apt.status === "PENDING"
                              ? "bg-yellow-100 text-yellow-700"
                              : apt.status === "IN_PROGRESS"
                              ? "bg-purple-100 text-purple-700"
                              : apt.status === "COMPLETED"
                              ? "bg-green-100 text-green-700"
                              : "bg-gray-100 text-gray-700"
                          }`}
                        >
                          {apt.status}
                        </p>
                      </div>
                      <p className="font-medium text-gray-900">
                        {apt.service?.serviceName || apt.service?.name || "N/A"}
                      </p>
                      <p className="text-sm text-gray-600">
                        {apt.vehicle?.model} ({apt.vehicle?.year}) -{" "}
                        {apt.vehicle?.licensePlate}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Active Jobs */}
          <Card className="p-6 mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Wrench className="h-5 w-5 text-green-600" />
              Active Jobs
            </h3>
            {activeJobs.length === 0 ? (
              <p className="text-gray-500">No active jobs at the moment.</p>
            ) : (
              <div className="space-y-3">
                {activeJobs.slice(0, 10).map((apt) => (
                  <div
                    key={apt.id}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">
                        {apt.service?.serviceName || "N/A"}
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
                            : apt.status === "IN_PROGRESS"
                            ? "bg-purple-100 text-purple-700"
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

          {/* Pending Tasks */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-orange-600" />
              Pending Tasks
            </h3>
            {pendingTasks.length === 0 ? (
              <p className="text-gray-500">No pending tasks.</p>
            ) : (
              <div className="space-y-3">
                {pendingTasks.slice(0, 10).map((apt) => (
                  <div
                    key={apt.id}
                    className="flex items-center justify-between p-4 bg-orange-50 rounded-lg hover:bg-orange-100 transition-colors"
                  >
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">
                        {apt.service?.serviceName || "N/A"}
                      </p>
                      <p className="text-sm text-gray-600">
                        {apt.vehicle?.model} ({apt.vehicle?.year}) -{" "}
                        {apt.vehicle?.licensePlate}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900">
                        {new Date(apt.appointmentDateTime).toLocaleDateString()}
                      </p>
                      <p className="text-xs px-2 py-1 rounded-full inline-block bg-yellow-100 text-yellow-700">
                        PENDING
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

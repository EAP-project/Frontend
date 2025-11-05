"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/card";
import {
  Wrench,
  Calendar,
  Clock,
  CheckCircle,
  AlertCircle,
  LogOut,
  Clipboard,
  User,
} from "lucide-react";

export default function EmployeeDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    // Check if user is logged in and has employee role
    const token = localStorage.getItem("token");
    const userStr = localStorage.getItem("user");

    if (!token || !userStr) {
      router.push("/login");
      return;
    }

    const userData = JSON.parse(userStr);
    setUser(userData);

    // Verify employee/technician/supervisor/manager role
    const role = userData.role?.toUpperCase() || "";
    if (role.includes("ADMIN")) {
      router.push("/dashboard/admin");
    } else if (
      !role.includes("EMPLOYEE") &&
      !role.includes("TECHNICIAN") &&
      !role.includes("SUPERVISOR") &&
      !role.includes("MANAGER")
    ) {
      router.push("/dashboard/customer");
    }
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    router.push("/login");
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  const stats = [
    {
      title: "Active Jobs",
      value: "12",
      icon: <Wrench className="h-6 w-6 text-blue-600" />,
      bgColor: "bg-blue-50",
    },
    {
      title: "Completed Today",
      value: "8",
      icon: <CheckCircle className="h-6 w-6 text-green-600" />,
      bgColor: "bg-green-50",
    },
    {
      title: "Pending Tasks",
      value: "5",
      icon: <AlertCircle className="h-6 w-6 text-orange-600" />,
      bgColor: "bg-orange-50",
    },
    {
      title: "Hours Logged",
      value: "6.5",
      icon: <Clock className="h-6 w-6 text-purple-600" />,
      bgColor: "bg-purple-50",
    },
  ];

  const todayAppointments = [
    {
      time: "09:00 AM",
      customer: "Robert Williams",
      service: "Oil Change & Inspection",
      status: "In Progress",
      statusColor: "text-blue-600 bg-blue-50",
    },
    {
      time: "11:00 AM",
      customer: "Sarah Davis",
      service: "Brake Repair",
      status: "Scheduled",
      statusColor: "text-gray-600 bg-gray-50",
    },
    {
      time: "02:00 PM",
      customer: "Michael Brown",
      service: "Tire Replacement",
      status: "Scheduled",
      statusColor: "text-gray-600 bg-gray-50",
    },
    {
      time: "04:00 PM",
      customer: "Emily Johnson",
      service: "Engine Diagnostics",
      status: "Scheduled",
      statusColor: "text-gray-600 bg-gray-50",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      {/* Header */}
      <nav className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600">
                <Wrench className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">
                  Employee Dashboard
                </h1>
                <p className="text-xs text-gray-500">Technician Portal</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-semibold text-gray-900">
                  {user.firstName} {user.lastName}
                </p>
                <p className="text-xs text-gray-500">{user.email}</p>
              </div>
              <Button
                onClick={handleLogout}
                variant="outline"
                size="sm"
                className="gap-2"
              >
                <LogOut className="h-4 w-4" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Good morning, {user.firstName}!
          </h2>
          <p className="text-gray-600">
            You have {stats[0].value} active jobs and {stats[2].value} pending
            tasks today.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <Card
              key={index}
              className="p-6 bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                  {stat.icon}
                </div>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-1">
                {stat.value}
              </h3>
              <p className="text-sm text-gray-600">{stat.title}</p>
            </Card>
          ))}
        </div>

        {/* Quick Actions & Today's Schedule */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Quick Actions */}
          <div className="lg:col-span-1">
            <Card className="p-6 bg-white border border-gray-200 rounded-xl shadow-sm">
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                Quick Actions
              </h3>
              <div className="space-y-3">
                <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white justify-start gap-3">
                  <Clock className="h-5 w-5" />
                  Log Time
                </Button>
                <Button className="w-full bg-green-600 hover:bg-green-700 text-white justify-start gap-3">
                  <CheckCircle className="h-5 w-5" />
                  Complete Job
                </Button>
                <Button className="w-full bg-purple-600 hover:bg-purple-700 text-white justify-start gap-3">
                  <Clipboard className="h-5 w-5" />
                  View Tasks
                </Button>
                <Button className="w-full bg-orange-600 hover:bg-orange-700 text-white justify-start gap-3">
                  <Calendar className="h-5 w-5" />
                  My Schedule
                </Button>
              </div>
            </Card>
          </div>

          {/* Today's Appointments */}
          <div className="lg:col-span-2">
            <Card className="p-6 bg-white border border-gray-200 rounded-xl shadow-sm">
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                Today&apos;s Appointments
              </h3>
              <div className="space-y-4">
                {todayAppointments.map((appointment, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="text-center">
                        <p className="text-sm font-bold text-gray-900">
                          {appointment.time}
                        </p>
                      </div>
                      <div className="h-10 w-px bg-gray-300" />
                      <div>
                        <p className="text-sm font-semibold text-gray-900">
                          {appointment.customer}
                        </p>
                        <p className="text-xs text-gray-600">
                          {appointment.service}
                        </p>
                      </div>
                    </div>
                    <span
                      className={`text-xs font-semibold px-3 py-1 rounded-full ${appointment.statusColor}`}
                    >
                      {appointment.status}
                    </span>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>

        {/* Active Jobs */}
        <Card className="p-6 bg-white border border-gray-200 rounded-xl shadow-sm">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Active Jobs</h3>
          <div className="space-y-4">
            {[
              {
                vehicle: "2023 Honda Accord",
                customer: "Robert Williams",
                service: "Oil Change & Inspection",
                progress: 75,
                timeRemaining: "30 mins",
              },
              {
                vehicle: "2021 Toyota Camry",
                customer: "Lisa Anderson",
                service: "Transmission Service",
                progress: 45,
                timeRemaining: "1.5 hours",
              },
              {
                vehicle: "2022 Ford F-150",
                customer: "James Wilson",
                service: "Brake System Overhaul",
                progress: 20,
                timeRemaining: "3 hours",
              },
            ].map((job, index) => (
              <div
                key={index}
                className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 transition-colors"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-50 rounded-lg">
                      <User className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">
                        {job.vehicle}
                      </p>
                      <p className="text-xs text-gray-600">{job.customer}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-500">Time Remaining</p>
                    <p className="text-sm font-semibold text-gray-900">
                      {job.timeRemaining}
                    </p>
                  </div>
                </div>
                <p className="text-sm text-gray-700 mb-2">{job.service}</p>
                <div className="flex items-center gap-3">
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all"
                      style={{ width: `${job.progress}%` }}
                    />
                  </div>
                  <span className="text-xs font-semibold text-gray-600">
                    {job.progress}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </main>
    </div>
  );
}

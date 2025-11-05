"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/card";
import {
  Users,
  Wrench,
  BarChart3,
  Settings,
  Calendar,
  Shield,
  LogOut,
  Activity,
} from "lucide-react";

export default function AdminDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    // Check if user is logged in and has admin role
    const token = localStorage.getItem("token");
    const userStr = localStorage.getItem("user");

    if (!token || !userStr) {
      router.push("/login");
      return;
    }

    const userData = JSON.parse(userStr);
    setUser(userData);

    // Verify admin role
    if (!userData.role?.toUpperCase().includes("ADMIN")) {
      // Redirect to appropriate dashboard based on role
      const role = userData.role?.toUpperCase() || "";
      if (role.includes("EMPLOYEE") || role.includes("TECHNICIAN") || role.includes("SUPERVISOR") || role.includes("MANAGER")) {
        router.push("/dashboard/employee");
      } else {
        router.push("/dashboard/customer");
      }
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
      title: "Total Users",
      value: "1,248",
      change: "+12%",
      icon: <Users className="h-6 w-6 text-blue-600" />,
      bgColor: "bg-blue-50",
    },
    {
      title: "Active Services",
      value: "342",
      change: "+8%",
      icon: <Wrench className="h-6 w-6 text-green-600" />,
      bgColor: "bg-green-50",
    },
    {
      title: "Appointments",
      value: "156",
      change: "+23%",
      icon: <Calendar className="h-6 w-6 text-purple-600" />,
      bgColor: "bg-purple-50",
    },
    {
      title: "System Health",
      value: "98%",
      change: "+2%",
      icon: <Activity className="h-6 w-6 text-orange-600" />,
      bgColor: "bg-orange-50",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <nav className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-red-600 to-red-700">
                <Shield className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Admin Dashboard</h1>
                <p className="text-xs text-gray-500">System Administrator</p>
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
            Welcome back, {user.firstName}!
          </h2>
          <p className="text-gray-600">
            Here&apos;s what&apos;s happening with your service center today.
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
                <span className="text-sm font-semibold text-green-600">
                  {stat.change}
                </span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-1">
                {stat.value}
              </h3>
              <p className="text-sm text-gray-600">{stat.title}</p>
            </Card>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <Card className="p-6 bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 rounded-lg bg-blue-50">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">
                Manage Users
              </h3>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              Add, edit, or remove users and manage permissions.
            </p>
            <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">
              Manage Users
            </Button>
          </Card>

          <Card className="p-6 bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 rounded-lg bg-green-50">
                <Wrench className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">
                Service Management
              </h3>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              Oversee all ongoing services and assignments.
            </p>
            <Button className="w-full bg-green-600 hover:bg-green-700 text-white">
              View Services
            </Button>
          </Card>

          <Card className="p-6 bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 rounded-lg bg-purple-50">
                <BarChart3 className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">
                Analytics & Reports
              </h3>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              View detailed analytics and generate reports.
            </p>
            <Button className="w-full bg-purple-600 hover:bg-purple-700 text-white">
              View Analytics
            </Button>
          </Card>

          <Card className="p-6 bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 rounded-lg bg-orange-50">
                <Settings className="h-6 w-6 text-orange-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">
                System Settings
              </h3>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              Configure system-wide settings and preferences.
            </p>
            <Button className="w-full bg-orange-600 hover:bg-orange-700 text-white">
              Settings
            </Button>
          </Card>

          <Card className="p-6 bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 rounded-lg bg-red-50">
                <Calendar className="h-6 w-6 text-red-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">
                Appointments
              </h3>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              Manage all customer appointments and schedules.
            </p>
            <Button className="w-full bg-red-600 hover:bg-red-700 text-white">
              View Calendar
            </Button>
          </Card>

          <Card className="p-6 bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 rounded-lg bg-indigo-50">
                <Shield className="h-6 w-6 text-indigo-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">
                Security & Logs
              </h3>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              Monitor system security and audit logs.
            </p>
            <Button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white">
              View Logs
            </Button>
          </Card>
        </div>

        {/* Recent Activity */}
        <Card className="p-6 bg-white border border-gray-200 rounded-xl shadow-sm">
          <h3 className="text-xl font-bold text-gray-900 mb-4">
            Recent System Activity
          </h3>
          <div className="space-y-4">
            {[
              {
                action: "New user registered",
                user: "John Doe",
                time: "5 minutes ago",
              },
              {
                action: "Service completed",
                user: "Jane Smith",
                time: "15 minutes ago",
              },
              {
                action: "Appointment scheduled",
                user: "Mike Johnson",
                time: "1 hour ago",
              },
              {
                action: "System settings updated",
                user: "Admin",
                time: "2 hours ago",
              },
            ].map((activity, index) => (
              <div
                key={index}
                className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0"
              >
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {activity.action}
                  </p>
                  <p className="text-xs text-gray-500">{activity.user}</p>
                </div>
                <span className="text-xs text-gray-400">{activity.time}</span>
              </div>
            ))}
          </div>
        </Card>
      </main>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/card";
import {
  Calendar,
  Clock,
  Car,
  FileText,
  LogOut,
  Plus,
  CheckCircle,
  AlertCircle,
  User,
} from "lucide-react";

export default function CustomerDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem("token");
    const userStr = localStorage.getItem("user");

    if (!token || !userStr) {
      router.push("/login");
      return;
    }

    const userData = JSON.parse(userStr);
    setUser(userData);

    // Verify customer role (or redirect if admin/employee)
    const role = userData.role?.toUpperCase() || "";
    if (role.includes("ADMIN")) {
      router.push("/dashboard/admin");
    } else if (
      role.includes("EMPLOYEE") ||
      role.includes("TECHNICIAN") ||
      role.includes("SUPERVISOR") ||
      role.includes("MANAGER")
    ) {
      router.push("/dashboard/employee");
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
      title: "Active Vehicles",
      value: "2",
      icon: <Car className="h-6 w-6 text-blue-600" />,
      bgColor: "bg-blue-50",
    },
    {
      title: "Upcoming Appointments",
      value: "1",
      icon: <Calendar className="h-6 w-6 text-green-600" />,
      bgColor: "bg-green-50",
    },
    {
      title: "Service History",
      value: "12",
      icon: <FileText className="h-6 w-6 text-purple-600" />,
      bgColor: "bg-purple-50",
    },
    {
      title: "Pending Payments",
      value: "$0",
      icon: <AlertCircle className="h-6 w-6 text-orange-600" />,
      bgColor: "bg-orange-50",
    },
  ];

  const upcomingAppointments = [
    {
      date: "Nov 8, 2025",
      time: "10:00 AM",
      service: "Oil Change & Inspection",
      vehicle: "2023 Honda Accord",
      status: "Confirmed",
      statusColor: "text-green-600 bg-green-50",
    },
  ];

  const recentServices = [
    {
      date: "Oct 28, 2025",
      service: "Tire Rotation",
      vehicle: "2023 Honda Accord",
      cost: "$45.00",
      status: "Completed",
    },
    {
      date: "Sep 15, 2025",
      service: "Brake Inspection",
      vehicle: "2021 Toyota Camry",
      cost: "$0.00",
      status: "Completed",
    },
    {
      date: "Aug 5, 2025",
      service: "Engine Diagnostics",
      vehicle: "2023 Honda Accord",
      cost: "$120.00",
      status: "Completed",
    },
  ];

  const myVehicles = [
    {
      make: "Honda",
      model: "Accord",
      year: "2023",
      vin: "1HGBH41JXMN109186",
      lastService: "Oct 28, 2025",
    },
    {
      make: "Toyota",
      model: "Camry",
      year: "2021",
      vin: "4T1BF1FK8CU123456",
      lastService: "Sep 15, 2025",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50">
      {/* Header */}
      <nav className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-purple-600 to-blue-600">
                <User className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">
                  Customer Dashboard
                </h1>
                <p className="text-xs text-gray-500">My Services</p>
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
            Manage your vehicles and schedule service appointments.
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

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <Card className="p-6 bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 rounded-lg bg-blue-50">
                <Calendar className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">
                Book Appointment
              </h3>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              Schedule a service appointment for your vehicle.
            </p>
            <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white gap-2">
              <Plus className="h-4 w-4" />
              New Appointment
            </Button>
          </Card>

          <Card className="p-6 bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 rounded-lg bg-green-50">
                <Car className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">
                Add Vehicle
              </h3>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              Register a new vehicle to your account.
            </p>
            <Button className="w-full bg-green-600 hover:bg-green-700 text-white gap-2">
              <Plus className="h-4 w-4" />
              Add Vehicle
            </Button>
          </Card>

          <Card className="p-6 bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 rounded-lg bg-purple-50">
                <FileText className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">
                Service History
              </h3>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              View complete service records and invoices.
            </p>
            <Button className="w-full bg-purple-600 hover:bg-purple-700 text-white">
              View History
            </Button>
          </Card>
        </div>

        {/* Upcoming Appointments & My Vehicles */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Upcoming Appointments */}
          <Card className="p-6 bg-white border border-gray-200 rounded-xl shadow-sm">
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              Upcoming Appointments
            </h3>
            {upcomingAppointments.length > 0 ? (
              <div className="space-y-4">
                {upcomingAppointments.map((appointment, index) => (
                  <div
                    key={index}
                    className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-white rounded-lg">
                          <Calendar className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-gray-900">
                            {appointment.date}
                          </p>
                          <p className="text-xs text-gray-600">
                            {appointment.time}
                          </p>
                        </div>
                      </div>
                      <span
                        className={`text-xs font-semibold px-3 py-1 rounded-full ${appointment.statusColor}`}
                      >
                        {appointment.status}
                      </span>
                    </div>
                    <p className="text-sm font-medium text-gray-900 mb-1">
                      {appointment.service}
                    </p>
                    <p className="text-xs text-gray-600">{appointment.vehicle}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                <p className="text-sm text-gray-500">
                  No upcoming appointments
                </p>
              </div>
            )}
          </Card>

          {/* My Vehicles */}
          <Card className="p-6 bg-white border border-gray-200 rounded-xl shadow-sm">
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              My Vehicles
            </h3>
            <div className="space-y-4">
              {myVehicles.map((vehicle, index) => (
                <div
                  key={index}
                  className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 transition-colors"
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-blue-50 rounded-lg">
                      <Car className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">
                        {vehicle.year} {vehicle.make} {vehicle.model}
                      </p>
                      <p className="text-xs text-gray-600">VIN: {vehicle.vin}</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-xs text-gray-500 mt-3">
                    <span>Last Service: {vehicle.lastService}</span>
                    <Button size="sm" variant="outline" className="text-xs">
                      Details
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Recent Services */}
        <Card className="p-6 bg-white border border-gray-200 rounded-xl shadow-sm">
          <h3 className="text-xl font-bold text-gray-900 mb-4">
            Recent Services
          </h3>
          <div className="space-y-4">
            {recentServices.map((service, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-purple-300 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-green-50 rounded-lg">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">
                      {service.service}
                    </p>
                    <p className="text-xs text-gray-600">{service.vehicle}</p>
                    <p className="text-xs text-gray-500">{service.date}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-gray-900">
                    {service.cost}
                  </p>
                  <p className="text-xs text-green-600">{service.status}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </main>
    </div>
  );
}

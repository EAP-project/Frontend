"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/card";
import Sidebar from "@/components/Sidebar";
import { Calendar, Car, FileText, Plus, Clock } from "lucide-react";
import {
  getMyVehicles,
  getMyAppointments,
  Vehicle,
  Appointment,
} from "@/lib/api";

export default function CustomerDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<{
    firstName?: string;
    lastName?: string;
    email?: string;
    role?: string;
  } | null>(null);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initDashboard = async () => {
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
      } else if (role.includes("EMPLOYEE")) {
        router.push("/dashboard/employee");
        return;
      }
      try {
        const [vehiclesData, appointmentsData] = await Promise.all([
          getMyVehicles(),
          getMyAppointments(),
        ]);
        setVehicles(vehiclesData);
        setAppointments(appointmentsData);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    initDashboard();
  }, [router]);

  if (!user)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div>Loading...</div>
      </div>
    );

  const upcomingAppointments = appointments.filter(
    (apt) => apt.status !== "COMPLETED" && apt.status !== "CANCELLED"
  );

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar role="customer" user={user} />
      <main className="flex-1 p-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">
            Welcome, {user.firstName}!
          </h1>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-lg text-gray-600">
                Loading your dashboard...
              </div>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2">
              <Card className="p-6">
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <Car className="h-6 w-6" />
                  My Vehicles ({vehicles.length})
                </h2>
                {vehicles.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-600 mb-4">
                      No vehicles registered yet
                    </p>
                    <Link href="/vehicles/add">
                      <Button className="gap-2">
                        <Plus className="h-4 w-4" />
                        Add Your First Vehicle
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {vehicles.map((v) => (
                      <div
                        key={v.id}
                        className="p-3 border rounded hover:bg-gray-50 transition-colors"
                      >
                        <p className="font-bold text-gray-900">
                          {v.year} {v.model}
                        </p>
                        <p className="text-sm text-gray-600">
                          {v.licensePlate}
                        </p>
                      </div>
                    ))}
                    <Link href="/vehicles">
                      <Button variant="outline" className="w-full mt-2">
                        View All Vehicles
                      </Button>
                    </Link>
                  </div>
                )}
              </Card>

              <Card className="p-6">
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <Calendar className="h-6 w-6" />
                  Upcoming Appointments ({upcomingAppointments.length})
                </h2>
                {upcomingAppointments.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-600 mb-4">
                      No upcoming appointments
                    </p>
                    <Link href="/appointments/add">
                      <Button className="gap-2">
                        <Plus className="h-4 w-4" />
                        Book an Appointment
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {upcomingAppointments.slice(0, 3).map((a) => (
                      <div
                        key={a.id}
                        className="p-3 border rounded hover:bg-gray-50 transition-colors"
                      >
                        <p className="font-bold text-gray-900">
                          {a.service?.name || "N/A"}
                        </p>
                        <p className="text-sm text-gray-600">
                          {new Date(a.appointmentDateTime).toLocaleDateString(
                            "en-US",
                            {
                              weekday: "short",
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            }
                          )}
                        </p>
                        <span
                          className={`text-xs px-2 py-1 rounded inline-block mt-1 ${
                            a.status === "CONFIRMED"
                              ? "bg-blue-100 text-blue-700"
                              : a.status === "PENDING"
                              ? "bg-yellow-100 text-yellow-700"
                              : "bg-gray-100 text-gray-700"
                          }`}
                        >
                          {a.status}
                        </span>
                      </div>
                    ))}
                    <Link href="/appointments">
                      <Button variant="outline" className="w-full mt-2">
                        View All Appointments
                      </Button>
                    </Link>
                  </div>
                )}
              </Card>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

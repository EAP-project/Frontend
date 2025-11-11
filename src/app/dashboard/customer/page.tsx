"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/card";
import { Calendar, Car, FileText, Plus, Clock } from "lucide-react";
import {
  getMyVehicles,
  getMyAppointments,
  Vehicle,
  Appointment,
} from "@/lib/api";
import Skeleton from "@/components/ui/Skeleton";
import { useAuth } from "@/context/AuthContext";

export default function CustomerDashboard() {
  const router = useRouter();
  const { user, token, initialized } = useAuth();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const initDashboard = async () => {
      if (!initialized) return;
      if (!token || !user) {
        router.push("/login");
        return;
      }

      const role = user.role?.toUpperCase() || "";
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
  }, [router, initialized, token, user]);

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
    <div className="p-8">
      <div className="max-w-7xl mx-auto">

        {loading ? (
          <div className="grid gap-6 md:grid-cols-2">
            <Card className="p-6">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Car className="h-6 w-6" />
                My Vehicles
              </h2>
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="p-3 border rounded">
                    <div className="flex items-center justify-between">
                      <div className="flex-1 pr-4">
                        <Skeleton lines={1} />
                        <div className="mt-2">
                          <Skeleton lines={1} className="w-1/2" />
                        </div>
                      </div>
                      <div className="w-24">
                        <Skeleton variant="rect" className="h-8 w-full" />
                      </div>
                    </div>
                  </div>
                ))}
                <div className="mt-2">
                  <Skeleton variant="rect" className="h-10 w-40 rounded-full" />
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Calendar className="h-6 w-6" />
                Upcoming Appointments
              </h2>
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="p-3 border rounded">
                    <div className="flex items-center justify-between">
                      <div className="flex-1 pr-4">
                        <Skeleton lines={1} />
                        <div className="mt-2">
                          <Skeleton lines={1} className="w-1/3" />
                        </div>
                      </div>
                      <div className="w-20">
                        <Skeleton variant="rect" className="h-6 w-full" />
                      </div>
                    </div>
                  </div>
                ))}
                <div className="mt-2">
                  <Skeleton variant="rect" className="h-10 w-48 rounded-full" />
                </div>
              </div>
            </Card>
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
                      <p className="text-sm text-gray-600">{v.licensePlate}</p>
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
                  <p className="text-gray-600 mb-4">No upcoming appointments</p>
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
    </div>
  );
}

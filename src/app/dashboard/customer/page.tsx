"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/card";
import { Sidebar } from "@/components/Sidebar";
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
      <main className="flex-1 overflow-y-auto p-8">
        <h1 className="text-3xl font-bold mb-8">Welcome, {user.firstName}!</h1>
        <div className="grid gap-6 md:grid-cols-2">
          <Card className="p-6">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Car className="h-6 w-6" />
              Vehicles ({vehicles.length})
            </h2>
            {loading ? (
              <p>Loading...</p>
            ) : vehicles.length === 0 ? (
              <Link href="/vehicles/add">
                <Button>Add Vehicle</Button>
              </Link>
            ) : (
              vehicles.map((v) => (
                <div key={v.id} className="mb-2 p-3 border rounded">
                  <p className="font-bold">
                    {v.year} {v.model}
                  </p>
                  <p className="text-sm text-gray-600">{v.licensePlate}</p>
                </div>
              ))
            )}
          </Card>
          <Card className="p-6">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Calendar className="h-6 w-6" />
              Appointments ({upcomingAppointments.length})
            </h2>
            {loading ? (
              <p>Loading...</p>
            ) : upcomingAppointments.length === 0 ? (
              <Link href="/appointments/add">
                <Button>Book Now</Button>
              </Link>
            ) : (
              upcomingAppointments.map((a) => (
                <div key={a.id} className="mb-3 p-3 border rounded">
                  <p className="font-bold">{a.service.serviceName}</p>
                  <p className="text-sm">
                    {new Date(a.appointmentDateTime).toLocaleString()}
                  </p>
                  <span className="text-xs px-2 py-1 rounded bg-green-100">
                    {a.status}
                  </span>
                </div>
              ))
            )}
          </Card>
        </div>
      </main>
    </div>
  );
}

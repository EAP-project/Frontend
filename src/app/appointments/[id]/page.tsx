"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/Button";
import { getAppointmentById, getMyVehicles, Appointment } from "@/lib/api";
import Link from "next/link";

export default function AppointmentDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const idParam = params?.id;
  const id = idParam ? Number(idParam) : NaN;

  const [appointment, setAppointment] = useState<Appointment | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userStr = localStorage.getItem("user");
    if (!token || !userStr) {
      router.push("/login");
      return;
    }

    if (Number.isNaN(id)) {
      setError("Invalid appointment id");
      setLoading(false);
      return;
    }

    const load = async () => {
      try {
        setLoading(true);
        const apt = await getAppointmentById(id);

        // If vehicle is missing or incomplete, try to fetch user's vehicles and resolve
        let resolved = apt;
  const v = (apt as unknown as { vehicle?: unknown }).vehicle;
  if (!v || !((v as unknown as { model?: unknown }).model)) {
          try {
            const vehicles = await getMyVehicles();
            const vehicleId = v && typeof v === "object" ? (v as unknown as { id?: unknown }).id ?? null : null;
            if (vehicleId != null) {
              const found = vehicles.find((x) => x.id === vehicleId);
              if (found) resolved = { ...apt, vehicle: found } as Appointment;
            }
          } catch (e) {
            console.warn("Could not fetch vehicles to enrich appointment details", e);
          }
        }

        setAppointment(resolved as Appointment);
      } catch (err) {
        console.error(err);
        setError(err instanceof Error ? err.message : String(err));
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [id, router]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div>Loading...</div>
    </div>
  );

  if (error) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-red-600">{error}</div>
    </div>
  );

  if (!appointment) return (
    <div className="min-h-screen flex items-center justify-center">
      <div>No appointment found</div>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar role="customer" user={JSON.parse(localStorage.getItem('user') || '{}')} />

      <main className="flex-1 p-8 ml-64">
        <div className="max-w-4xl mx-auto">
          <div className="mb-6 flex items-center justify-between">
            <h1 className="text-2xl font-bold">Appointment Details</h1>
            <Link href="/appointments">
              <Button>Back</Button>
            </Link>
          </div>

          <Card className="p-6">
            <div className="mb-4">
              <p className="text-sm text-gray-600">Date & Time</p>
              <p className="font-medium text-gray-900">{new Date(appointment.appointmentDateTime).toLocaleString()}</p>
            </div>

            <div className="mb-4">
              <p className="text-sm text-gray-600">Status</p>
              <p className="font-medium text-gray-900">{appointment.status}</p>
            </div>

            <div className="mb-4">
              <p className="text-sm text-gray-600">Service</p>
              <p className="font-medium text-gray-900">{appointment.service?.name ?? appointment.service?.name ?? 'N/A'}</p>
            </div>

            <div className="mb-4">
              <p className="text-sm text-gray-600">Vehicle</p>
              <p className="font-medium text-gray-900">{appointment.vehicle?.model ?? 'Unknown'} ({appointment.vehicle?.year ?? 'Unknown'})</p>
              <p className="text-sm text-gray-700">{appointment.vehicle?.licensePlate ?? 'Unknown'}</p>
            </div>

            {appointment.customerNotes && (
              <div className="mb-4">
                <p className="text-sm text-gray-600">Customer Notes</p>
                <p className="text-sm text-gray-900">{appointment.customerNotes}</p>
              </div>
            )}

            {appointment.employee && (
              <div className="mb-4">
                <p className="text-sm text-gray-600">Assigned Technician</p>
                <p className="font-medium text-gray-900">{appointment.employee.firstName} {appointment.employee.lastName}</p>
              </div>
            )}
          </Card>
        </div>
      </main>
    </div>
  );
}

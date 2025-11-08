"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/Button";
import {
  getAppointmentById,
  getMyVehicles,
  getAppointmentServices,
  Appointment,
  Service,
} from "@/lib/api";
import Link from "next/link";

export default function AppointmentDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const idParam = params?.id;
  const id = idParam ? Number(idParam) : NaN;

  const [appointment, setAppointment] = useState<Appointment | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [showServices, setShowServices] = useState(false);
  const [loadingServices, setLoadingServices] = useState(false);
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
        if (!v || !(v as unknown as { model?: unknown }).model) {
          try {
            const vehicles = await getMyVehicles();
            const vehicleId =
              v && typeof v === "object"
                ? (v as unknown as { id?: unknown }).id ?? null
                : null;
            if (vehicleId != null) {
              const found = vehicles.find((x) => x.id === vehicleId);
              if (found) resolved = { ...apt, vehicle: found } as Appointment;
            }
          } catch (e) {
            console.warn(
              "Could not fetch vehicles to enrich appointment details",
              e
            );
          }
        }

        setAppointment(resolved as Appointment);

        // Check if services are already loaded in the appointment
        if (resolved.services && resolved.services.length > 0) {
          console.log("Services already loaded:", resolved.services);
          setServices(resolved.services);
        }
      } catch (err) {
        console.error(err);
        setError(err instanceof Error ? err.message : String(err));
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [id, router]);

  const handleViewServices = async () => {
    // If services are already loaded from appointment, just toggle
    if (services.length > 0) {
      setShowServices(!showServices);
      return;
    }

    // Otherwise, fetch services from API
    if (!showServices) {
      setLoadingServices(true);
      try {
        const serviceList = await getAppointmentServices(id);
        console.log("Fetched services:", serviceList);
        setServices(serviceList);
        setShowServices(true);
      } catch (err) {
        console.error("Error loading services:", err);
        setError(
          err instanceof Error ? err.message : "Failed to load services"
        );
      } finally {
        setLoadingServices(false);
      }
    } else {
      setShowServices(!showServices);
    }
  };

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div>Loading...</div>
      </div>
    );

  if (error)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-red-600">{error}</div>
      </div>
    );

  if (!appointment)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div>No appointment found</div>
      </div>
    );

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar
        role="customer"
        user={JSON.parse(localStorage.getItem("user") || "{}")}
      />

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
              <p className="font-medium text-gray-900">
                {new Date(appointment.appointmentDateTime).toLocaleString()}
              </p>
            </div>

            <div className="mb-4">
              <p className="text-sm text-gray-600">Status</p>
              <p className="font-medium text-gray-900">{appointment.status}</p>
            </div>

            <div className="mb-4">
              <p className="text-sm text-gray-600">Services</p>
              <p className="font-medium text-gray-900">
                {services.length > 0
                  ? `${services.length} service${
                      services.length > 1 ? "s" : ""
                    } selected`
                  : appointment.service?.name ?? "N/A"}
              </p>
              {services.length > 1 && (
                <p className="text-xs text-gray-500 mt-1">
                  Click &quot;View All Services&quot; below to see details
                </p>
              )}
            </div>

            {/* View Services Button */}
            <div className="mb-4">
              <Button
                onClick={handleViewServices}
                disabled={loadingServices}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                {loadingServices
                  ? "Loading..."
                  : showServices
                  ? "Hide Services"
                  : "View All Services"}
              </Button>
            </div>

            {/* Services Table */}
            {showServices && services.length > 0 && (
              <div className="mb-4 bg-gray-50 p-4 rounded-lg border border-gray-200">
                <h3 className="font-semibold text-gray-900 mb-3">
                  Selected Services ({services.length})
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-300">
                        <th className="text-left py-2 px-2 text-sm font-semibold text-gray-700">
                          Service Name
                        </th>
                        <th className="text-left py-2 px-2 text-sm font-semibold text-gray-700">
                          Duration
                        </th>
                        <th className="text-right py-2 px-2 text-sm font-semibold text-gray-700">
                          Estimated Cost
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {services.map((service) => (
                        <tr
                          key={service.id}
                          className="border-b border-gray-200"
                        >
                          <td className="py-2 px-2 text-sm text-gray-900">
                            {service.name}
                          </td>
                          <td className="py-2 px-2 text-sm text-gray-600">
                            {service.estimatedDurationMinutes} min
                          </td>
                          <td className="py-2 px-2 text-sm text-gray-900 text-right">
                            ${service.estimatedCost?.toFixed(2) || "0.00"}
                          </td>
                        </tr>
                      ))}
                      <tr className="font-semibold bg-gray-100">
                        <td className="py-2 px-2 text-sm text-gray-900">
                          Total
                        </td>
                        <td className="py-2 px-2 text-sm text-gray-900">
                          {services.reduce(
                            (sum, s) => sum + (s.estimatedDurationMinutes || 0),
                            0
                          )}{" "}
                          min
                        </td>
                        <td className="py-2 px-2 text-sm text-gray-900 text-right">
                          $
                          {services
                            .reduce((sum, s) => sum + (s.estimatedCost || 0), 0)
                            .toFixed(2)}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            <div className="mb-4">
              <p className="text-sm text-gray-600">Vehicle</p>
              <p className="font-medium text-gray-900">
                {appointment.vehicle?.model ?? "Unknown"} (
                {appointment.vehicle?.year ?? "Unknown"})
              </p>
              <p className="text-sm text-gray-700">
                {appointment.vehicle?.licensePlate ?? "Unknown"}
              </p>
            </div>

            {appointment.customerNotes && (
              <div className="mb-4">
                <p className="text-sm text-gray-600">Customer Notes</p>
                <p className="text-sm text-gray-900">
                  {appointment.customerNotes}
                </p>
              </div>
            )}

            {appointment.employee && (
              <div className="mb-4">
                <p className="text-sm text-gray-600">Assigned Technician</p>
                <p className="font-medium text-gray-900">
                  {appointment.employee.firstName}{" "}
                  {appointment.employee.lastName}
                </p>
              </div>
            )}
          </Card>
        </div>
      </main>
    </div>
  );
}

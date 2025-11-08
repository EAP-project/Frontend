"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  getMyAppointments,
  getMyVehicles,
  Appointment,
  Vehicle,
} from "@/lib/api";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/Button";
import {
  Calendar,
  Plus,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  X,
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
  const [vehicleError, setVehicleError] = useState<string | null>(null);
  const [showServicesModal, setShowServicesModal] = useState(false);
  const [selectedAppointment, setSelectedAppointment] =
    useState<Appointment | null>(null);

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
      console.debug("Loaded appointments:", appointmentsData);

      // If vehicle details are missing from appointments, try to fetch user's vehicles
      let finalAppointments = appointmentsData;
      const needsVehicleResolve = appointmentsData.some((a) => {
        const v = a.vehicle as unknown;
        if (!v) return true;
        if (typeof v === "object") return !("model" in (v as object));
        return true;
      });

      if (needsVehicleResolve) {
        try {
          const tokenSample = localStorage.getItem("token");
          console.debug(
            "Token present for vehicle fetch:",
            !!tokenSample,
            tokenSample
              ? `${tokenSample.slice(0, 10)}...${tokenSample.slice(-10)}`
              : null
          );
          const vehicles = await getMyVehicles();
          console.debug("Fetched user vehicles for mapping:", vehicles);
          if (!vehicles || vehicles.length === 0) {
            setVehicleError(
              "No vehicles returned from /api/vehicles. Check JWT/token in localStorage."
            );
          } else {
            setVehicleError(null);
          }

          finalAppointments = appointmentsData.map((a) => {
            const vc = (a as unknown as { vehicle?: unknown }).vehicle;
            let vehicleId: number | null = null;

            if (vc == null) {
              const maybeVehicleIdField = (
                a as unknown as { vehicleId?: unknown }
              ).vehicleId;
              if (maybeVehicleIdField != null) {
                const n = Number(maybeVehicleIdField);
                vehicleId = Number.isNaN(n) ? null : n;
              }
            } else if (typeof vc === "number") {
              vehicleId = vc;
            } else if (typeof vc === "object") {
              const maybe =
                (vc as unknown as { id?: unknown }).id ??
                (a as unknown as { vehicleId?: unknown }).vehicleId;
              if (maybe != null) {
                const n = Number(maybe);
                vehicleId = Number.isNaN(n) ? null : n;
              }
            }

            let resolvedVehicle: Vehicle | null = null;
            if (vehicleId != null) {
              resolvedVehicle =
                vehicles.find((v) => v.id === vehicleId) ?? null;
            }

            // Fallback matching: if we couldn't resolve by id, try licensePlate and model/year
            if (!resolvedVehicle) {
              const apptVehicleObj =
                vc && typeof vc === "object"
                  ? (vc as unknown as {
                      licensePlate?: unknown;
                      model?: unknown;
                      year?: unknown;
                    })
                  : null;

              // Try licensePlate matches (normalize spaces/case)
              const apptLicense =
                apptVehicleObj?.licensePlate ??
                (a as unknown as { licensePlate?: unknown }).licensePlate ??
                (a as unknown as { plate?: unknown }).plate ??
                (a as unknown as { plateNumber?: unknown }).plateNumber ??
                null;
              if (apptLicense != null) {
                const lp = String(apptLicense)
                  .trim()
                  .replace(/\s+/g, "")
                  .toLowerCase();
                const foundByPlate = vehicles.find(
                  (v) =>
                    (v.licensePlate ?? "")
                      .toString()
                      .replace(/\s+/g, "")
                      .toLowerCase() === lp
                );
                if (foundByPlate) {
                  resolvedVehicle = foundByPlate;
                  console.debug("Fallback matched vehicle by licensePlate", {
                    appointmentId: (a as unknown as { id?: unknown }).id,
                    apptLicense,
                    matchedId: foundByPlate.id,
                  });
                }
              }

              // Try model + (optional) year matches
              if (!resolvedVehicle) {
                const apptModel =
                  apptVehicleObj?.model ??
                  (a as unknown as { vehicleModel?: unknown }).vehicleModel ??
                  (a as unknown as { model?: unknown }).model ??
                  null;
                const apptYear =
                  apptVehicleObj?.year ??
                  (a as unknown as { vehicleYear?: unknown }).vehicleYear ??
                  null;
                if (apptModel != null) {
                  const m = String(apptModel).trim().toLowerCase();
                  const y = apptYear != null ? Number(apptYear) : null;
                  const foundByModel = vehicles.find(
                    (v) =>
                      v.model?.toString().trim().toLowerCase() === m &&
                      (y == null || v.year === y)
                  );
                  if (foundByModel) {
                    resolvedVehicle = foundByModel;
                    console.debug("Fallback matched vehicle by model/year", {
                      appointmentId: (a as unknown as { id?: unknown }).id,
                      apptModel,
                      apptYear,
                      matchedId: foundByModel.id,
                    });
                  }
                }
              }
            }

            // Detailed debug per appointment to help troubleshoot mapping
            console.debug("Appointment mapping:", {
              appointmentId: (a as unknown as { id?: unknown }).id,
              appointmentVehicleRaw: vc,
              resolvedVehicleId: vehicleId,
              matchedVehicle: resolvedVehicle,
            });

            // If we didn't resolve by id but appointment already had a full vehicle object, keep it
            if (
              !resolvedVehicle &&
              vc &&
              typeof vc === "object" &&
              (vc as unknown as { model?: unknown }).model
            ) {
              resolvedVehicle = vc as Vehicle;
            }

            // Final fallback: an explicit "Unknown" vehicle so UI shows clear placeholders
            if (!resolvedVehicle) {
              resolvedVehicle = {
                id: vehicleId ?? -1,
                model: "Unknown",
                year: 0,
                licensePlate: "Unknown",
              } as Vehicle;
              // record that we couldn't resolve this specific appointment
              console.warn(
                `Could not resolve vehicle for appointment ${
                  (a as unknown as { id?: unknown }).id
                }: vehicleId=${vehicleId}`
              );
            }

            return { ...a, vehicle: resolvedVehicle };
          });
        } catch (vehErr) {
          console.warn(
            "Could not fetch vehicles to enrich appointments:",
            vehErr
          );
          // proceed with original appointmentsData
        }
      }

      setAppointments(finalAppointments as Appointment[]);
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
    <div className="p-8">
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
                <p className="text-sm text-yellow-600 font-medium">Upcoming</p>
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
                <p className="text-sm text-green-600 font-medium">Completed</p>
                <p className="text-2xl font-bold text-green-900">
                  {appointments.filter((a) => a.status === "COMPLETED").length}
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
                  {appointments.filter((a) => a.status === "CANCELLED").length}
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

        {vehicleError && (
          <Card className="p-4 mb-6 bg-yellow-50 border-yellow-200">
            <p className="text-yellow-700">{vehicleError}</p>
          </Card>
        )}

        {/* Appointments List */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-lg text-gray-600">Loading appointments...</div>
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
                      <div className="flex-1">
                        {appointment.services &&
                        appointment.services.length > 0 ? (
                          <div>
                            <h3 className="text-lg font-bold text-gray-900">
                              {appointment.services.length} Service
                              {appointment.services.length > 1 ? "s" : ""}{" "}
                              Selected
                            </h3>
                            <button
                              onClick={() => {
                                setSelectedAppointment(appointment);
                                setShowServicesModal(true);
                              }}
                              className="text-sm text-blue-600 hover:text-blue-800 underline"
                            >
                              View Services →
                            </button>
                          </div>
                        ) : (
                          <h3 className="text-lg font-bold text-gray-900">
                            {appointment.service?.name || "N/A"}
                          </h3>
                        )}
                      </div>
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
                          {appointment.vehicle?.model ?? "Unknown"} (
                          {appointment.vehicle?.year
                            ? appointment.vehicle.year
                            : "Unknown"}
                          )
                        </p>
                        <p className="text-sm text-gray-700">
                          {appointment.vehicle?.licensePlate ?? "Unknown"}
                        </p>
                      </div>

                      <div>
                        <p className="text-sm text-gray-600">Service Price</p>
                        <p className="font-medium text-gray-900">
                          {(() => {
                            const price =
                              appointment.service?.estimatedCost ??
                              appointment.service?.estimatedCost;
                            return price != null
                              ? `$${Number(price).toFixed(2)}`
                              : "N/A";
                          })()}
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

      {/* Services Modal */}
      {showServicesModal && selectedAppointment && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            {/* Background overlay */}
            <div
              className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75"
              onClick={() => setShowServicesModal(false)}
            ></div>

            {/* This element is to trick the browser into centering the modal contents. */}
            <span
              className="hidden sm:inline-block sm:align-middle sm:h-screen"
              aria-hidden="true"
            >
              &#8203;
            </span>

            {/* Modal panel */}
            <div className="relative inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full z-50">
              {/* Header */}
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-white">
                    Selected Services
                  </h3>
                  <button
                    onClick={() => setShowServicesModal(false)}
                    className="text-white hover:text-gray-200 transition-colors"
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="px-6 py-6">
                {selectedAppointment.services &&
                selectedAppointment.services.length > 0 ? (
                  <div className="space-y-2">
                    {selectedAppointment.services.map((service, index) => (
                      <div
                        key={service.id}
                        className="bg-gray-50 p-3 rounded border border-gray-200"
                      >
                        <p className="text-sm font-medium text-gray-900">
                          {index + 1}. {service.name}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-gray-50 p-3 rounded border border-gray-200">
                    <p className="text-sm font-medium text-gray-900">
                      {selectedAppointment.service?.name || "N/A"}
                    </p>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="bg-gray-50 px-6 py-4 flex justify-end">
                <button
                  onClick={() => setShowServicesModal(false)}
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

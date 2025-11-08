"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Calendar as CalendarIcon, Check, DollarSign, Clock, X } from "lucide-react";
import Link from "next/link";
import {
  createAppointment,
  AppointmentRequestDTO,
  getMyVehicles,
  getAllServices,
  getServiceCategories,
  Vehicle,
  Service,
  ServiceCategory,
} from "@/lib/api";

export default function AddAppointmentPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [categories, setCategories] = useState<ServiceCategory[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [showConfirm, setShowConfirm] = useState(false);
  const [confirmType, setConfirmType] = useState<"cancel" | "book" | null>(null);

  // Form state
  const [vehicleId, setVehicleId] = useState<number>(0);
  const [selectedServiceIds, setSelectedServiceIds] = useState<number[]>([]);
  const [appointmentDateTime, setAppointmentDateTime] = useState<string>("");
  const [customerNotes, setCustomerNotes] = useState<string>("");
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log("Fetching vehicles, services, and categories...");
        const [vehiclesData, servicesData, categoriesData] = await Promise.all([
          getMyVehicles(),
          getAllServices(),
          getServiceCategories(),
        ]);
        console.log("Vehicles:", vehiclesData);
        console.log("Services:", servicesData);
        console.log("Categories:", categoriesData);
        
        setVehicles(vehiclesData);
        setServices(servicesData);
        setCategories(categoriesData);

        if (servicesData.length === 0) {
          setError("No services available. Please contact the administrator.");
        }
      } catch (err) {
        console.error("Error fetching data:", err);
        if (err instanceof Error) {
          setError(`Failed to load data: ${err.message}`);
        } else {
          setError("Failed to load data. Please try again.");
        }
      } finally {
        setLoadingData(false);
      }
    };

    fetchData();
  }, []);

  const handleServiceToggle = (serviceId: number) => {
    setSelectedServiceIds((prev) =>
      prev.includes(serviceId)
        ? prev.filter((id) => id !== serviceId)
        : [...prev, serviceId]
    );
    // Clear service selection error when user selects a service
    if (formErrors.serviceIds) {
      setFormErrors((prev) => ({ ...prev, serviceIds: "" }));
    }
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};

    if (vehicleId === 0) {
      errors.vehicleId = "Please select a vehicle";
    }

    if (selectedServiceIds.length === 0) {
      errors.serviceIds = "Please select at least one service";
    }

    if (!appointmentDateTime) {
      errors.appointmentDateTime = "Appointment date and time are required";
    } else {
      const selectedDate = new Date(appointmentDateTime);
      if (selectedDate <= new Date()) {
        errors.appointmentDateTime = "Appointment must be in the future";
      }
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      setConfirmType("book");
      setShowConfirm(true);
    }
  };

  const handleBookAppointment = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const appointmentData: AppointmentRequestDTO = {
        vehicleId: vehicleId,
        serviceId: selectedServiceIds[0], // For backward compatibility
        serviceIds: selectedServiceIds,
        appointmentDateTime: new Date(appointmentDateTime).toISOString(),
        customerNotes: customerNotes,
      };
      await createAppointment(appointmentData);
      router.push(
        "/dashboard/customer?success=Appointment booked successfully"
      );
    } catch (err: unknown) {
      console.error("Error booking appointments:", err);
      if (err instanceof Error) {
        setError(
          err.message || "Failed to book appointment. Please try again."
        );
      } else {
        setError(String(err));
      }
    } finally {
      setIsLoading(false);
      setShowConfirm(false);
      setConfirmType(null);
    }
  };

  interface ConfirmationModalProps {
    open: boolean;
    message: string;
    onConfirm: () => void;
    onCancel: () => void;
  }

  const ConfirmationModal = ({
    open,
    message,
    onConfirm,
    onCancel,
  }: ConfirmationModalProps) => {
    if (!open) return null;
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-transparent backdrop-blur-sm">
        <div className="bg-white/90 w-80 p-6 rounded-2xl shadow-2xl border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800 mb-3">
            Confirmation
          </h3>
          <p className="text-sm text-gray-600 mb-6">{message}</p>
          <div className="flex justify-end gap-3">
            <button
              onClick={onCancel}
              className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 text-sm font-medium"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium"
            >
              Confirm
            </button>
          </div>
        </div>
      </div>
    );
  };

  if (loadingData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <div className="text-lg">Loading...</div>
        </div>
      </div>
    );
  }

  const selectedServices = services.filter((s) =>
    selectedServiceIds.includes(s.id)
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50">
      {/* Header */}
      <nav className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16">
            <Button
              asChild
              variant="ghost"
              size="sm"
              className="gap-2 text-blue-700 hover:text-blue-900"
            >
              <Link href="/dashboard/customer">
                <ArrowLeft className="h-4 w-4" />
                Back to Dashboard
              </Link>
            </Button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 bg-blue-100 rounded-lg">
              <CalendarIcon className="h-8 w-8 text-blue-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900">
              Book Appointment
            </h1>
          </div>
          <p className="text-gray-600">
            Schedule service appointments for your vehicle. You can select multiple services.
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-xl">
            {error}
          </div>
        )}

        {/* No Vehicles Warning */}
        {vehicles.length === 0 && !loadingData && (
          <Card className="p-6 mb-6 bg-yellow-50 border border-yellow-200">
            <p className="text-yellow-800 mb-3">
              You don&apos;t have any vehicles registered yet. Please add a
              vehicle first.
            </p>
            <Button
              asChild
              className="bg-yellow-600 hover:bg-yellow-700 text-white"
            >
              <Link href="/vehicles/add">Add Vehicle</Link>
            </Button>
          </Card>
        )}

        {/* Form Card */}
        <Card className="p-8 bg-white border border-gray-200 rounded-2xl shadow-xl">
          <form onSubmit={handleSubmit} className="space-y-6">{/* Vehicle Selection */}
            <div>
              <label className="block text-base font-medium text-purple-700 mb-2">
                Select Vehicle
              </label>
              <select
                className={`w-full h-12 pl-3 pr-3 rounded-xl text-base border ${
                  formErrors.vehicleId ? "border-red-500" : "border-purple-300"
                } focus:border-purple-500 focus:ring focus:ring-purple-200 transition-all bg-white text-gray-900`}
                value={vehicleId}
                onChange={(e) => {
                  setVehicleId(parseInt(e.target.value, 10));
                  if (formErrors.vehicleId) {
                    setFormErrors((prev) => ({ ...prev, vehicleId: "" }));
                  }
                }}
                disabled={vehicles.length === 0}
              >
                <option value={0}>Select a vehicle</option>
                {vehicles.map((vehicle) => (
                  <option key={vehicle.id} value={vehicle.id}>
                    {vehicle.year} {vehicle.model} ({vehicle.licensePlate})
                  </option>
                ))}
              </select>
              {formErrors.vehicleId && (
                <p className="text-red-600 text-sm mt-1">
                  {formErrors.vehicleId}
                </p>
              )}
            </div>

            {/* Service Selection */}
            <div>
              <label className="block text-base font-medium text-purple-700 mb-2">
                Select Services
              </label>
              <div className="space-y-2 mb-3">
                {services.map((service) => (
                  <label
                    key={service.id}
                    className="flex items-center p-3 border border-purple-200 rounded-lg hover:bg-purple-50 cursor-pointer transition-colors"
                  >
                    <input
                      type="checkbox"
                      checked={selectedServiceIds.includes(service.id)}
                      onChange={() => handleServiceToggle(service.id)}
                      className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                    />
                    <span className="ml-3 text-gray-900 font-medium">
                      {service.name}
                    </span>
                    {service.estimatedCost && (
                      <span className="ml-auto text-gray-600">
                        ${service.estimatedCost.toFixed(2)}
                      </span>
                    )}
                  </label>
                ))}
              </div>
              {formErrors.serviceIds && (
                <p className="text-red-600 text-sm mt-1">
                  {formErrors.serviceIds}
                </p>
              )}
            </div>

            {/* Selected Services Table */}
            {selectedServices.length > 0 && (
              <div className="bg-blue-50 p-4 rounded-xl border border-blue-200">
                <h3 className="font-semibold text-gray-900 mb-3">
                  Selected Services ({selectedServices.length})
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-blue-300">
                        <th className="text-left py-2 px-2 text-sm font-semibold text-gray-700">
                          Service
                        </th>
                        <th className="text-left py-2 px-2 text-sm font-semibold text-gray-700">
                          Duration
                        </th>
                        <th className="text-right py-2 px-2 text-sm font-semibold text-gray-700">
                          Cost
                        </th>
                        <th className="w-10"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedServices.map((service) => (
                        <tr
                          key={service.id}
                          className="border-b border-blue-200"
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
                          <td className="py-2 px-2 text-center">
                            <button
                              type="button"
                              onClick={() => handleServiceToggle(service.id)}
                              className="text-red-600 hover:text-red-800"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                      <tr className="font-semibold">
                        <td className="py-2 px-2 text-sm text-gray-900">
                          Total
                        </td>
                        <td className="py-2 px-2 text-sm text-gray-900">
                          {selectedServices.reduce(
                            (sum, s) => sum + (s.estimatedDurationMinutes || 0),
                            0
                          )}{" "}
                          min
                        </td>
                        <td className="py-2 px-2 text-sm text-gray-900 text-right">
                          $
                          {selectedServices
                            .reduce((sum, s) => sum + (s.estimatedCost || 0), 0)
                            .toFixed(2)}
                        </td>
                        <td></td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Appointment Date and Time */}
            <div>
              <label className="block text-base font-medium text-purple-700 mb-2">
                Appointment Date & Time
              </label>
              <Input
                type="datetime-local"
                className={`h-12 rounded-xl text-base border ${
                  formErrors.appointmentDateTime
                    ? "border-red-500"
                    : "border-purple-300"
                } focus:border-purple-500 focus:ring focus:ring-purple-200 transition-all`}
                value={appointmentDateTime}
                onChange={(e) => {
                  setAppointmentDateTime(e.target.value);
                  if (formErrors.appointmentDateTime) {
                    setFormErrors((prev) => ({
                      ...prev,
                      appointmentDateTime: "",
                    }));
                  }
                }}
                min={new Date().toISOString().slice(0, 16)}
              />
              {formErrors.appointmentDateTime && (
                <p className="text-red-600 text-sm mt-1">
                  {formErrors.appointmentDateTime}
                </p>
              )}
            </div>

            {/* Customer Notes */}
            <div>
              <label className="block text-base font-medium text-purple-700 mb-2">
                Notes (Optional)
              </label>
              <textarea
                placeholder="Any special requests or information..."
                className="w-full min-h-24 p-3 rounded-xl text-base border border-purple-300 focus:border-purple-500 focus:ring focus:ring-purple-200 transition-all resize-y"
                value={customerNotes}
                onChange={(e) => setCustomerNotes(e.target.value)}
              />
            </div>

            {/* Submit Button */}
            <div className="flex gap-4 pt-4">
              <Button
                type="button"
                variant="outline"
                className="flex-1 h-12 rounded-xl text-base"
                onClick={() => {
                  setConfirmType("cancel");
                  setShowConfirm(true);
                }}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isLoading || vehicles.length === 0}
                className="flex-1 h-12 rounded-xl text-base font-semibold bg-gradient-to-r from-purple-600 to-blue-500 text-white hover:from-purple-700 hover:to-blue-600 transition-all disabled:opacity-50"
              >
                {isLoading ? "Booking..." : "Book Appointment"}
              </Button>
            </div>
          </form>
        </Card>

        <ConfirmationModal
          open={showConfirm}
          message={
            confirmType === "cancel"
              ? "Are you sure you want to cancel booking this appointment?"
              : "Are you sure you want to book this appointment?"
          }
          onConfirm={() => {
            if (confirmType === "cancel") {
              setShowConfirm(false);
              setConfirmType(null);
              router.push("/dashboard/customer");
            } else if (confirmType === "book") {
              handleBookAppointment();
            }
          }}
          onCancel={() => {
            setShowConfirm(false);
            setConfirmType(null);
          }}
        />
      </main>
    </div>
  );
}
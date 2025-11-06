// Slot-Based Booking System - Updated November 6, 2025
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/Button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Calendar as CalendarIcon, Clock } from "lucide-react";
import Link from "next/link";
import {
  createSlotBasedAppointment,
  SlotBasedAppointmentRequestDTO,
  getMyVehicles,
  getAllServices,
  getAvailableSlots,
  Vehicle,
  Service,
  AvailableSlot,
} from "@/lib/api";

const appointmentSchema = z.object({
  vehicleId: z.number().min(1, "Please select a vehicle"),
  serviceId: z.number().min(1, "Please select a service"),
  appointmentDate: z.string().min(1, "Please select a date"),
  sessionPeriod: z.enum(["MORNING", "AFTERNOON"], {
    message: "Please select a session period",
  }),
  slotNumber: z.number().min(1, "Please select a time slot").max(5),
  customerNotes: z.string().optional(),
});

type AppointmentFormValues = z.infer<typeof appointmentSchema>;

export default function AddAppointmentPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [sessionPeriod, setSessionPeriod] = useState<"MORNING" | "AFTERNOON" | null>(null);
  const [availableSlots, setAvailableSlots] = useState<AvailableSlot[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<number | null>(null);

  const form = useForm<AppointmentFormValues>({
    resolver: zodResolver(appointmentSchema),
    defaultValues: {
      vehicleId: 0,
      serviceId: 0,
      appointmentDate: "",
      sessionPeriod: undefined,
      slotNumber: 0,
      customerNotes: "",
    },
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log("Fetching vehicles and services...");
        const vehiclesData = await getMyVehicles();
        console.log("Vehicles:", vehiclesData);
        setVehicles(vehiclesData);

        const servicesData = await getAllServices();
        console.log("Services:", servicesData);
        console.log("Services length:", servicesData?.length);
        console.log("Services data type:", typeof servicesData);
        setServices(servicesData || []);

        if (!servicesData || servicesData.length === 0) {
          setError("No services available. Please contact the administrator.");
        }
      } catch (err) {
        console.error("Error fetching data:", err);
        if (err instanceof Error) {
          setError(`Failed to load data: ${err.message}`);
        } else {
          setError("Failed to load vehicles and services. Please try again.");
        }
      } finally {
        setLoadingData(false);
      }
    };

    fetchData();
  }, []);

  // Fetch available slots when date or session period changes
  useEffect(() => {
    const fetchSlots = async () => {
      if (!selectedDate || !sessionPeriod) {
        setAvailableSlots([]);
        setSelectedSlot(null);
        return;
      }

      setLoadingSlots(true);
      setError(null);
      try {
        const slots = await getAvailableSlots(selectedDate, sessionPeriod);
        setAvailableSlots(slots);
        setSelectedSlot(null); // Reset selected slot when slots change
      } catch (err) {
        console.error("Error fetching slots:", err);
        setError("Failed to load available slots. Please try again.");
        setAvailableSlots([]);
      } finally {
        setLoadingSlots(false);
      }
    };

    fetchSlots();
  }, [selectedDate, sessionPeriod]);

  const onSubmit = async (data: AppointmentFormValues) => {
    setIsLoading(true);
    setError(null);

    try {
      // Validate that the selected slot is available
      const slot = availableSlots.find(s => s.slotNumber === data.slotNumber);
      if (!slot?.isAvailable) {
        setError("Selected slot is not available. Please choose another slot.");
        setIsLoading(false);
        return;
      }

      const appointmentData: SlotBasedAppointmentRequestDTO = {
        vehicleId: data.vehicleId,
        serviceId: data.serviceId,
        appointmentDate: data.appointmentDate,
        sessionPeriod: data.sessionPeriod,
        slotNumber: data.slotNumber,
        customerNotes: data.customerNotes,
      };

      await createSlotBasedAppointment(appointmentData);

      // Redirect back to customer dashboard
      router.push(
        "/dashboard/customer?success=Appointment booked successfully"
      );
    } catch (err: unknown) {
      console.error("Error booking appointment:", err);
      if (err instanceof Error) {
        setError(
          err.message || "Failed to book appointment. Please try again."
        );
      } else {
        setError(String(err));
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (loadingData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

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
      <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
            Schedule a service appointment for your vehicle.
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

        {/* No Services Warning */}
        {services.length === 0 && !loadingData && vehicles.length > 0 && (
          <Card className="p-6 mb-6 bg-orange-50 border border-orange-200">
            <p className="text-orange-800">
              No services are currently available. Please contact support or try
              again later.
            </p>
          </Card>
        )}

        {/* Debug Info - Services Loaded */}
        {services.length > 0 && (
          <Card className="p-4 mb-6 bg-blue-50 border border-blue-200">
            <p className="text-blue-900 font-semibold mb-2">
              ✓ {services.length} service{services.length !== 1 ? "s" : ""}{" "}
              available:
            </p>
            <ul className="text-sm text-gray-800 space-y-1 list-disc list-inside">
              {services.map((service) => (
                <li key={service.id} className="text-gray-900">
                  {service.serviceName || service.name || "Unnamed Service"}{" "}
                  {(service.price || service.estimatedCost) ? `- $${service.price || service.estimatedCost}` : ""}
                </li>
              ))}
            </ul>
          </Card>
        )}

        {/* Form Card */}
        <Card className="p-8 bg-white border border-gray-200 rounded-2xl shadow-xl">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Vehicle Selection */}
              <FormField
                control={form.control}
                name="vehicleId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-base text-purple-700">
                      Select Vehicle
                    </FormLabel>
                    <FormControl>
                      <select
                        className="w-full h-12 pl-3 pr-3 rounded-xl text-base border border-purple-300 focus:border-purple-500 focus:ring focus:ring-purple-200 transition-all bg-white text-gray-900"
                        {...field}
                        onChange={(e) =>
                          field.onChange(parseInt(e.target.value, 10))
                        }
                        disabled={vehicles.length === 0}
                      >
                        <option value={0}>Select a vehicle</option>
                        {vehicles.map((vehicle) => (
                          <option key={vehicle.id} value={vehicle.id}>
                            {vehicle.year} {vehicle.model} (
                            {vehicle.licensePlate})
                          </option>
                        ))}
                      </select>
                    </FormControl>
                    <FormMessage className="text-red-600" />
                  </FormItem>
                )}
              />

              {/* Service Selection */}
              <FormField
                control={form.control}
                name="serviceId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-base text-purple-700">
                      Select Service
                    </FormLabel>
                    <FormControl>
                      <select
                        className="w-full h-12 pl-3 pr-3 rounded-xl text-base border border-purple-300 focus:border-purple-500 focus:ring focus:ring-purple-200 transition-all bg-white text-gray-900"
                        {...field}
                        onChange={(e) =>
                          field.onChange(parseInt(e.target.value, 10))
                        }
                      >
                        <option value={0}>Select a service</option>
                        {services.map((service) => (
                          <option key={service.id} value={service.id}>
                            {service.serviceName || service.name || "Unnamed Service"}
                            {(service.price || service.estimatedCost) ? ` - $${service.price || service.estimatedCost}` : ""}
                          </option>
                        ))}
                      </select>
                    </FormControl>
                    <FormMessage className="text-red-600" />
                  </FormItem>
                )}
              />

              {/* Appointment Date */}
              <FormField
                control={form.control}
                name="appointmentDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-base text-purple-700">
                      Select Date
                    </FormLabel>
                    <FormControl>
                      <input
                        type="date"
                        className="w-full h-12 pl-3 pr-3 rounded-xl text-base border border-purple-300 focus:border-purple-500 focus:ring focus:ring-purple-200 transition-all bg-white text-gray-900"
                        min={new Date().toISOString().split('T')[0]}
                        value={selectedDate || ""}
                        onChange={(e) => {
                          const dateValue = e.target.value;
                          setSelectedDate(dateValue);
                          field.onChange(dateValue);
                          // Reset session and slot when date changes
                          setSessionPeriod(null);
                          setSelectedSlot(null);
                          form.setValue('sessionPeriod', "MORNING");
                          form.setValue('slotNumber', 0);
                        }}
                      />
                    </FormControl>
                    <FormMessage className="text-red-600" />
                  </FormItem>
                )}
              />

              {/* Session Period Selection */}
              {selectedDate && (
                <FormField
                  control={form.control}
                  name="sessionPeriod"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-base text-purple-700">
                        Choose Session
                      </FormLabel>
                      <FormControl>
                        <div className="flex gap-4">
                          <button
                            type="button"
                            onClick={() => {
                              setSessionPeriod("MORNING");
                              field.onChange("MORNING");
                              setSelectedSlot(null);
                              form.setValue('slotNumber', 0);
                            }}
                            className={`flex-1 p-4 rounded-lg text-base font-medium transition-all ${
                              sessionPeriod === "MORNING"
                                ? "bg-purple-600 text-white border-2 border-purple-600"
                                : "bg-white border-2 border-gray-300 text-gray-700 hover:border-purple-400"
                            }`}
                          >
                            <div>
                              <div className="font-semibold">Morning</div>
                              <div className="text-sm opacity-90">7:00 AM - 12:00 PM</div>
                            </div>
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setSessionPeriod("AFTERNOON");
                              field.onChange("AFTERNOON");
                              setSelectedSlot(null);
                              form.setValue('slotNumber', 0);
                            }}
                            className={`flex-1 p-4 rounded-lg text-base font-medium transition-all ${
                              sessionPeriod === "AFTERNOON"
                                ? "bg-purple-600 text-white border-2 border-purple-600"
                                : "bg-white border-2 border-gray-300 text-gray-700 hover:border-purple-400"
                            }`}
                          >
                            <div>
                              <div className="font-semibold">Afternoon</div>
                              <div className="text-sm opacity-90">1:00 PM - 6:00 PM</div>
                            </div>
                          </button>
                        </div>
                      </FormControl>
                      <FormMessage className="text-red-600" />
                    </FormItem>
                  )}
                />
              )}

              {/* Available Slots Display */}
              {selectedDate && sessionPeriod && (
                <FormField
                  control={form.control}
                  name="slotNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-base text-purple-700">
                        Available Slots ({sessionPeriod === "MORNING" ? "Morning" : "Afternoon"})
                      </FormLabel>
                      <FormControl>
                        <div className="space-y-2">
                          {loadingSlots ? (
                            <div className="flex items-center justify-center p-8 text-gray-500">
                              <Clock className="animate-spin h-6 w-6 mr-2" />
                              Loading available slots...
                            </div>
                          ) : availableSlots.length === 0 ? (
                            <div className="p-6 bg-yellow-50 border border-yellow-200 rounded-xl text-yellow-800 text-center">
                              No slots available for this date and session. Please try another date or session.
                            </div>
                          ) : (
                            <div className="grid gap-3">
                              {availableSlots.map((slot) => (
                                <button
                                  key={slot.slotNumber}
                                  type="button"
                                  onClick={() => {
                                    if (slot.isAvailable) {
                                      setSelectedSlot(slot.slotNumber);
                                      field.onChange(slot.slotNumber);
                                    }
                                  }}
                                  disabled={!slot.isAvailable}
                                  className={`w-full p-4 rounded-xl text-left transition-all ${
                                    selectedSlot === slot.slotNumber
                                      ? "bg-gradient-to-r from-purple-600 to-blue-500 text-white shadow-lg transform scale-105 border-2 border-purple-700"
                                      : slot.isAvailable
                                      ? "bg-white border-2 border-green-300 hover:border-green-500 text-gray-900 hover:shadow-md"
                                      : "bg-gray-100 border-2 border-gray-300 text-gray-400 cursor-not-allowed opacity-60"
                                  }`}
                                >
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                      <div className={`text-3xl ${selectedSlot === slot.slotNumber ? "" : slot.isAvailable ? "opacity-70" : "opacity-40"}`}>
                                        {slot.isAvailable ? "✓" : "✗"}
                                      </div>
                                      <div>
                                        <div className="font-bold text-lg">
                                          Slot {slot.slotNumber}
                                        </div>
                                        <div className={`text-sm ${selectedSlot === slot.slotNumber ? "text-white" : slot.isAvailable ? "text-gray-600" : "text-gray-400"}`}>
                                          {formatTime(slot.startTime)} - {formatTime(slot.endTime)}
                                        </div>
                                      </div>
                                    </div>
                                    {!slot.isAvailable && (
                                      <span className="text-xs font-bold bg-red-100 text-red-700 px-3 py-1 rounded-full">
                                        BOOKED
                                      </span>
                                    )}
                                    {selectedSlot === slot.slotNumber && (
                                      <span className="text-xs font-bold bg-white text-purple-700 px-3 py-1 rounded-full">
                                        SELECTED
                                      </span>
                                    )}
                                  </div>
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      </FormControl>
                      <FormMessage className="text-red-600" />
                    </FormItem>
                  )}
                />
              )}

              {/* Customer Notes */}
              <FormField
                control={form.control}
                name="customerNotes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-base text-purple-700">
                      Notes (Optional)
                    </FormLabel>
                    <FormControl>
                      <textarea
                        placeholder="Any special requests or information..."
                        className="w-full min-h-24 p-3 rounded-xl text-base border border-purple-300 focus:border-purple-500 focus:ring focus:ring-purple-200 transition-all resize-y"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className="text-red-600" />
                  </FormItem>
                )}
              />

              {/* Submit Button */}
              <div className="flex gap-4 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1 h-12 rounded-xl text-base"
                  onClick={() => router.push("/dashboard/customer")}
                  disabled={isLoading}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={
                    isLoading ||
                    vehicles.length === 0 ||
                    !selectedDate ||
                    !sessionPeriod ||
                    !selectedSlot
                  }
                  className="flex-1 h-12 rounded-xl text-base font-semibold bg-gradient-to-r from-purple-600 to-blue-500 text-white hover:from-purple-700 hover:to-blue-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? "Booking..." : "Book Appointment"}
                </Button>
              </div>
            </form>
          </Form>
        </Card>
      </main>
    </div>
  );
}

// Helper function to format time from HH:mm:ss to readable format
function formatTime(timeStr: string): string {
  const [hours, minutes] = timeStr.split(':');
  const hour = parseInt(hours, 10);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
  return `${displayHour}:${minutes} ${ampm}`;
}


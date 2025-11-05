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
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Calendar as CalendarIcon } from "lucide-react";
import Link from "next/link";
import {
  createAppointment,
  AppointmentRequestDTO,
  getMyVehicles,
  getAllServices,
  Vehicle,
  Service,
} from "@/lib/api";

const appointmentSchema = z.object({
  vehicleId: z.number().min(1, "Please select a vehicle"),
  serviceId: z.number().min(1, "Please select a service"),
  appointmentDateTime: z
    .string()
    .min(1, "Appointment date and time are required"),
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

  const form = useForm<AppointmentFormValues>({
    resolver: zodResolver(appointmentSchema),
    defaultValues: {
      vehicleId: 0,
      serviceId: 0,
      appointmentDateTime: "",
      customerNotes: "",
    },
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log("Fetching vehicles and services...");
        const [vehiclesData, servicesData] = await Promise.all([
          getMyVehicles(),
          getAllServices(),
        ]);
        console.log("Vehicles:", vehiclesData);
        console.log("Services:", servicesData);
        setVehicles(vehiclesData);
        setServices(servicesData);

        if (servicesData.length === 0) {
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

  const onSubmit = async (data: AppointmentFormValues) => {
    setIsLoading(true);
    setError(null);

    try {
      const appointmentData: AppointmentRequestDTO = {
        vehicleId: data.vehicleId,
        serviceId: data.serviceId,
        appointmentDateTime: new Date(data.appointmentDateTime).toISOString(),
        customerNotes: data.customerNotes,
      };

      await createAppointment(appointmentData);

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
                  {service.serviceName}{" "}
                  {service.price ? `- $${service.price}` : ""}
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
                            {service.serviceName}
                            {service.price ? ` - $${service.price}` : ""}
                          </option>
                        ))}
                      </select>
                    </FormControl>
                    <FormMessage className="text-red-600" />
                  </FormItem>
                )}
              />

              {/* Appointment Date and Time */}
              <FormField
                control={form.control}
                name="appointmentDateTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-base text-purple-700">
                      Appointment Date & Time
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="datetime-local"
                        className="h-12 rounded-xl text-base border-purple-300 focus:border-purple-500 focus:ring focus:ring-purple-200 transition-all"
                        {...field}
                        min={new Date().toISOString().slice(0, 16)}
                      />
                    </FormControl>
                    <FormMessage className="text-red-600" />
                  </FormItem>
                )}
              />

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
                  disabled={isLoading || vehicles.length === 0}
                  className="flex-1 h-12 rounded-xl text-base font-semibold bg-gradient-to-r from-purple-600 to-blue-500 text-white hover:from-purple-700 hover:to-blue-600 transition-all disabled:opacity-50"
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

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

const appointmentSchema = z.object({
  vehicleId: z.number().min(1, "Please select a vehicle"),
  serviceIds: z.array(z.number()).min(1, "Please select at least one service"),
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
  const [categories, setCategories] = useState<ServiceCategory[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [selectedServices, setSelectedServices] = useState<number[]>([]);
  const [expandedCategories, setExpandedCategories] = useState<Set<number>>(new Set());

  const form = useForm<AppointmentFormValues>({
    resolver: zodResolver(appointmentSchema),
    defaultValues: {
      vehicleId: 0,
      serviceIds: [],
      appointmentDateTime: "",
      customerNotes: "",
    },
  });

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
        
        // Expand all categories by default
        setExpandedCategories(new Set(categoriesData.map(cat => cat.id)));

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

  const toggleService = (serviceId: number) => {
    setSelectedServices(prev => {
      const newSelection = prev.includes(serviceId)
        ? prev.filter(id => id !== serviceId)
        : [...prev, serviceId];
      
      form.setValue('serviceIds', newSelection);
      return newSelection;
    });
  };

  const toggleCategory = (categoryId: number) => {
    setExpandedCategories(prev => {
      const newSet = new Set(prev);
      if (newSet.has(categoryId)) {
        newSet.delete(categoryId);
      } else {
        newSet.add(categoryId);
      }
      return newSet;
    });
  };

  const groupServicesByCategory = () => {
    const grouped: Record<number, Service[]> = {};
    
    services.forEach(service => {
      const categoryId = service.category?.id || 0;
      if (!grouped[categoryId]) {
        grouped[categoryId] = [];
      }
      grouped[categoryId].push(service);
    });
    
    return grouped;
  };

  const calculateTotalCost = () => {
    return selectedServices.reduce((total, serviceId) => {
      const service = services.find(s => s.id === serviceId);
      return total + (service?.estimatedCost || 0);
    }, 0);
  };

  const calculateTotalDuration = () => {
    return selectedServices.reduce((total, serviceId) => {
      const service = services.find(s => s.id === serviceId);
      return total + (service?.estimatedDurationMinutes || 0);
    }, 0);
  };

  const onSubmit = async (data: AppointmentFormValues) => {
    setIsLoading(true);
    setError(null);

    try {
      // Create appointments for each selected service
      const appointmentPromises = data.serviceIds.map(serviceId => {
        const appointmentData: AppointmentRequestDTO = {
          vehicleId: data.vehicleId,
          serviceId: serviceId,
          appointmentDateTime: new Date(data.appointmentDateTime).toISOString(),
          customerNotes: data.customerNotes,
        };
        return createAppointment(appointmentData);
      });

      await Promise.all(appointmentPromises);

      // Redirect back to customer dashboard
      router.push(
        `/dashboard/customer?success=${data.serviceIds.length} appointment(s) booked successfully`
      );
    } catch (err: unknown) {
      console.error("Error booking appointments:", err);
      if (err instanceof Error) {
        setError(
          err.message || "Failed to book appointments. Please try again."
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
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <div className="text-lg">Loading...</div>
        </div>
      </div>
    );
  }

  const groupedServices = groupServicesByCategory();

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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Form */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="p-8 bg-white border border-gray-200 rounded-2xl shadow-xl">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  {/* Vehicle Selection */}
                  <FormField
                    control={form.control}
                    name="vehicleId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-base text-purple-700 font-semibold">
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

                  {/* Service Selection by Category */}
                  <FormField
                    control={form.control}
                    name="serviceIds"
                    render={() => (
                      <FormItem>
                        <FormLabel className="text-base text-purple-700 font-semibold">
                          Select Services
                        </FormLabel>
                        <div className="space-y-4">
                          {categories.map(category => {
                            const categoryServices = groupedServices[category.id] || [];
                            if (categoryServices.length === 0) return null;
                            
                            const isExpanded = expandedCategories.has(category.id);

                            return (
                              <div key={category.id} className="border border-gray-200 rounded-lg overflow-hidden">
                                {/* Category Header */}
                                <button
                                  type="button"
                                  onClick={() => toggleCategory(category.id)}
                                  className="w-full px-4 py-3 bg-gray-50 hover:bg-gray-100 flex items-center justify-between transition-colors"
                                >
                                  <div className="flex items-center gap-3">
                                    <div className="h-8 w-8 rounded-lg bg-purple-100 flex items-center justify-center">
                                      <span className="text-purple-600 font-bold text-sm">
                                        {categoryServices.length}
                                      </span>
                                    </div>
                                    <div className="text-left">
                                      <h3 className="font-semibold text-gray-900">
                                        {category.name}
                                      </h3>
                                      {category.description && (
                                        <p className="text-xs text-gray-500">
                                          {category.description}
                                        </p>
                                      )}
                                    </div>
                                  </div>
                                  <span className="text-gray-400">
                                    {isExpanded ? "−" : "+"}
                                  </span>
                                </button>

                                {/* Services List */}
                                {isExpanded && (
                                  <div className="p-3 space-y-2">
                                    {categoryServices.map(service => {
                                      const isSelected = selectedServices.includes(service.id);
                                      
                                      return (
                                        <div
                                          key={service.id}
                                          onClick={() => toggleService(service.id)}
                                          className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                                            isSelected
                                              ? 'border-purple-500 bg-purple-50'
                                              : 'border-gray-200 hover:border-purple-300 bg-white'
                                          }`}
                                        >
                                          <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                              <div className="flex items-center gap-2 mb-1">
                                                <div className={`h-5 w-5 rounded flex items-center justify-center border-2 ${
                                                  isSelected
                                                    ? 'bg-purple-600 border-purple-600'
                                                    : 'border-gray-300'
                                                }`}>
                                                  {isSelected && (
                                                    <Check className="h-3 w-3 text-white" />
                                                  )}
                                                </div>
                                                <h4 className="font-semibold text-gray-900">
                                                  {service.name}
                                                </h4>
                                              </div>
                                              {service.description && (
                                                <p className="text-sm text-gray-600 ml-7 mb-2">
                                                  {service.description}
                                                </p>
                                              )}
                                              <div className="flex items-center gap-4 ml-7">
                                                <div className="flex items-center gap-1 text-green-600">
                                                  <DollarSign className="h-4 w-4" />
                                                  <span className="font-semibold">
                                                    {service.estimatedCost?.toFixed(2) || 'N/A'}
                                                  </span>
                                                </div>
                                                <div className="flex items-center gap-1 text-gray-600">
                                                  <Clock className="h-4 w-4" />
                                                  <span className="text-sm">
                                                    {service.estimatedDurationMinutes || 'N/A'} min
                                                  </span>
                                                </div>
                                              </div>
                                            </div>
                                          </div>
                                        </div>
                                      );
                                    })}
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
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
                        <FormLabel className="text-base text-purple-700 font-semibold">
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
                        <FormLabel className="text-base text-purple-700 font-semibold">
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

                  {/* Submit Buttons */}
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
                      disabled={isLoading || vehicles.length === 0 || selectedServices.length === 0}
                      className="flex-1 h-12 rounded-xl text-base font-semibold bg-gradient-to-r from-purple-600 to-blue-500 text-white hover:from-purple-700 hover:to-blue-600 transition-all disabled:opacity-50"
                    >
                      {isLoading ? "Booking..." : `Book ${selectedServices.length} Service${selectedServices.length !== 1 ? 's' : ''}`}
                    </Button>
                  </div>
                </form>
              </Form>
            </Card>
          </div>

          {/* Right Column - Summary */}
          <div className="lg:col-span-1">
            <Card className="p-6 bg-white border border-gray-200 rounded-2xl shadow-xl sticky top-8">
              <h3 className="text-lg font-bold text-gray-900 mb-4">
                Booking Summary
              </h3>
              
              {selectedServices.length === 0 ? (
                <div className="text-center py-8">
                  <CalendarIcon className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500 text-sm">
                    No services selected yet
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Selected Services */}
                  <div>
                    <h4 className="text-sm font-semibold text-gray-700 mb-2">
                      Selected Services ({selectedServices.length})
                    </h4>
                    <div className="space-y-2">
                      {selectedServices.map(serviceId => {
                        const service = services.find(s => s.id === serviceId);
                        if (!service) return null;
                        
                        return (
                          <div key={serviceId} className="flex items-start justify-between p-3 bg-gray-50 rounded-lg">
                            <div className="flex-1">
                              <p className="text-sm font-medium text-gray-900">
                                {service.name}
                              </p>
                              
                            </div>
                            <div className="flex items-center gap-2">
                             
                              <button
                                type="button"
                                onClick={() => toggleService(serviceId)}
                                className="text-gray-400 hover:text-red-600 transition-colors"
                              >
                                <X className="h-4 w-4" />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  

                  {/* Info Note */}
                  <div className="pt-4 border-t border-gray-200">
                    <p className="text-xs text-gray-500">
                      💡 All selected services will be scheduled for the same date and time.
                    </p>
                  </div>
                </div>
              )}
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
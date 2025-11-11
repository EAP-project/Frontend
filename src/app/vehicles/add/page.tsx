"use client";

import { useState } from "react";
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
import { ArrowLeft, Car } from "lucide-react";
import Link from "next/link";
import { createVehicle, VehicleDTO } from "@/lib/api";

const vehicleSchema = z.object({
  model: z.string().min(1, "Model is required"),
  year: z
    .number()
    .min(1900, "Year must be 1900 or later")
    .max(new Date().getFullYear() + 1, "Year cannot be in the future"),
  licensePlate: z.string().min(1, "License plate is required"),
});

type VehicleFormValues = z.infer<typeof vehicleSchema>;

export default function AddVehiclePage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [confirmType, setConfirmType] = useState<"cancel" | "add" | null>(null);
  const [formData, setFormData] = useState<VehicleFormValues | null>(null);


  const form = useForm<VehicleFormValues>({
    resolver: zodResolver(vehicleSchema),
    defaultValues: {
      model: "",
      year: new Date().getFullYear(),
      licensePlate: "",
    },
  });

  const onSubmit = async (data: VehicleFormValues) => {
    setFormData(data);
    setConfirmType("add");
    setShowConfirm(true);
  };

  const handleAddVehicle = async () => {
    if (!formData) return;
    setIsLoading(true);
    setError(null);
    try {
      const vehicleData: VehicleDTO = {
        model: formData.model,
        year: formData.year,
        licensePlate: formData.licensePlate,
      };
      await createVehicle(vehicleData);
      router.push("/dashboard/customer?success=Vehicle added successfully");
    } catch (err: unknown) {
      console.error("Error adding vehicle:", err);
      if (err instanceof Error) {
        setError(err.message || "Failed to add vehicle. Please try again.");
      } else {
        setError(String(err));
      }
    } finally {
      setIsLoading(false);
      setShowConfirm(false);
      setConfirmType(null);
      setFormData(null);
    }
  };
  interface ConfirmationModalProps {
    open: boolean;
    message: string;
    onConfirm: () => void;
    onCancel: () => void;
  }

  const ConfirmationModal = ({ open, message, onConfirm, onCancel }: ConfirmationModalProps) => {
    if (!open) return null;
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-transparent backdrop-blur-sm">
        <div className="bg-white/90 w-80 p-6 rounded-2xl shadow-2xl border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800 mb-3">Confirmation</h3>
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
              <Car className="h-8 w-8 text-blue-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900">
              Add New Vehicle
            </h1>
          </div>
          <p className="text-gray-600">
            Register a new vehicle to your account for service appointments.
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-xl">
            {error}
          </div>
        )}

        {/* Form Card */}
        <Card className="p-8 bg-white border border-gray-200 rounded-2xl shadow-xl">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Model */}
              <FormField
                control={form.control}
                name="model"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-base text-purple-700">
                      Vehicle Model
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g., Honda Accord, Toyota Camry"
                        className="h-12 rounded-xl text-base border-purple-300 focus:border-purple-500 focus:ring focus:ring-purple-200 transition-all"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className="text-red-600" />
                  </FormItem>
                )}
              />

              {/* Year */}
              <FormField
                control={form.control}
                name="year"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-base text-purple-700">
                      Year
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="2024"
                        className="h-12 rounded-xl text-base border-purple-300 focus:border-purple-500 focus:ring focus:ring-purple-200 transition-all"
                        {...field}
                        onChange={(e) =>
                          field.onChange(parseInt(e.target.value, 10))
                        }
                      />
                    </FormControl>
                    <FormMessage className="text-red-600" />
                  </FormItem>
                )}
              />

              {/* License Plate */}
              <FormField
                control={form.control}
                name="licensePlate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-base text-purple-700">
                      License Plate
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="ABC-1234"
                        className="h-12 rounded-xl text-base border-purple-300 focus:border-purple-500 focus:ring focus:ring-purple-200 transition-all"
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
                  disabled={isLoading}
                  className="flex-1 h-12 rounded-xl text-base font-semibold bg-gradient-to-r from-purple-600 to-blue-500 text-white hover:from-purple-700 hover:to-blue-600 transition-all disabled:opacity-50"
                >
                  {isLoading ? "Adding Vehicle..." : "Add Vehicle"}
                </Button>
              </div>
            </form>
          </Form>
        </Card>
      </main>
      <ConfirmationModal
        open={showConfirm}
        message={
          confirmType === "cancel"
            ? "Are you sure you want to cancel adding this vehicle?"
            : "Are you sure you want to add this vehicle?"
        }
        onConfirm={() => {
          if (confirmType === "cancel") {
            setShowConfirm(false);
            setConfirmType(null);
            router.push("/dashboard/customer");
          } else if (confirmType === "add") {
            handleAddVehicle();
          }
        }}
        onCancel={() => {
          setShowConfirm(false);
          setConfirmType(null);
        }}
      />
    </div>
  );
}

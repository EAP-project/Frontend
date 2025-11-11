"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
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
import { ArrowLeft, Wrench } from "lucide-react";
import Link from "next/link";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api";

const serviceSchema = z.object({
  serviceName: z.string().min(1, "Service name is required"),
  description: z.string().optional(),
  price: z.number().min(0, "Price must be positive").optional(),
});

type ServiceFormValues = z.infer<typeof serviceSchema>;

export default function AddServicePage() {
  const router = useRouter();
  const { token } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<ServiceFormValues>({
    resolver: zodResolver(serviceSchema),
    defaultValues: {
      serviceName: "",
      description: "",
      price: undefined,
    },
  });

  const onSubmit = async (data: ServiceFormValues) => {
    setIsLoading(true);
    setError(null);

    try {
      if (!token) {
        throw new Error("You must be logged in to add a service");
      }

      const response = await fetch(`${API_BASE}/services`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(
          errorData?.error || `Failed to create service: ${response.status}`
        );
      }

      // Redirect back to admin dashboard
      router.push("/dashboard/admin?success=Service created successfully");
    } catch (err: unknown) {
      console.error("Error creating service:", err);
      if (err instanceof Error) {
        setError(err.message || "Failed to create service. Please try again.");
      } else {
        setError(String(err));
      }
    } finally {
      setIsLoading(false);
    }
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
              <Link href="/dashboard/admin">
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
              <Wrench className="h-8 w-8 text-blue-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900">
              Add New Service
            </h1>
          </div>
          <p className="text-gray-600">
            Create a new service offering for customers.
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
              {/* Service Name */}
              <FormField
                control={form.control}
                name="serviceName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-base text-purple-700">
                      Service Name *
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g., Oil Change, Tire Rotation, Brake Inspection"
                        className="h-12 rounded-xl text-base border-purple-300 focus:border-purple-500 focus:ring focus:ring-purple-200 transition-all"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className="text-red-600" />
                  </FormItem>
                )}
              />

              {/* Description */}
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-base text-purple-700">
                      Description
                    </FormLabel>
                    <FormControl>
                      <textarea
                        placeholder="Describe the service in detail..."
                        className="w-full min-h-24 p-3 rounded-xl text-base border border-purple-300 focus:border-purple-500 focus:ring focus:ring-purple-200 transition-all resize-y"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className="text-red-600" />
                  </FormItem>
                )}
              />

              {/* Price */}
              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-base text-purple-700">
                      Price ($)
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="0.00"
                        className="h-12 rounded-xl text-base border-purple-300 focus:border-purple-500 focus:ring focus:ring-purple-200 transition-all"
                        {...field}
                        onChange={(e) => {
                          const value = e.target.value;
                          field.onChange(value ? parseFloat(value) : undefined);
                        }}
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
                  onClick={() => router.push("/dashboard/admin")}
                  disabled={isLoading}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 h-12 rounded-xl text-base font-semibold bg-gradient-to-r from-purple-600 to-blue-500 text-white hover:from-purple-700 hover:to-blue-600 transition-all disabled:opacity-50"
                >
                  {isLoading ? "Creating..." : "Create Service"}
                </Button>
              </div>
            </form>
          </Form>
        </Card>
      </main>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getMyVehicles, Vehicle } from "@/lib/api";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/Button";
import { Car, Plus, Calendar } from "lucide-react";

export default function VehiclesPage() {
  const router = useRouter();
  const [user, setUser] = useState<{
    firstName?: string;
    lastName?: string;
    email?: string;
    role?: string;
  } | null>(null);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userStr = localStorage.getItem("user");

    if (!token || !userStr) {
      router.push("/login");
      return;
    }

    const userData = JSON.parse(userStr);
    setUser(userData);

    loadVehicles();
  }, [router]);

  const loadVehicles = async () => {
    try {
      setLoading(true);
      const vehiclesData = await getMyVehicles();
      setVehicles(vehiclesData);
    } catch (err) {
      console.error("Failed to load vehicles:", err);
      setError(err instanceof Error ? err.message : "Failed to load vehicles");
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

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <Car className="h-8 w-8 text-blue-600" />
              My Vehicles
            </h1>
            <p className="text-gray-600 mt-2">
              Manage your registered vehicles
            </p>
          </div>
          <Link href="/vehicles/add">
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Add New Vehicle
            </Button>
          </Link>
        </div>

        {error && (
          <Card className="p-4 mb-6 bg-red-50 border-red-200">
            <p className="text-red-600">{error}</p>
          </Card>
        )}

        {/* Vehicles Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-lg text-gray-600">Loading vehicles...</div>
          </div>
        ) : vehicles.length === 0 ? (
          <Card className="p-12 text-center">
            <Car className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No Vehicles Yet
            </h3>
            <p className="text-gray-600 mb-6">
              Add your first vehicle to start booking appointments
            </p>
            <Link href="/vehicles/add">
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Add Your First Vehicle
              </Button>
            </Link>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {vehicles.map((vehicle) => (
              <Card
                key={vehicle.id}
                className="p-6 hover:shadow-lg transition-shadow"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                      <Car className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">
                        {vehicle.year} {vehicle.model}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {vehicle.licensePlate}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Model:</span>
                    <span className="font-medium text-gray-900">
                      {vehicle.model}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Year:</span>
                    <span className="font-medium text-gray-900">
                      {vehicle.year}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">License Plate:</span>
                    <span className="font-medium text-gray-900">
                      {vehicle.licensePlate}
                    </span>
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-200">
                  <Link href={`/appointments/add?vehicleId=${vehicle.id}`}>
                    <Button variant="outline" className="w-full gap-2">
                      <Calendar className="h-4 w-4" />
                      Book Appointment
                    </Button>
                  </Link>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

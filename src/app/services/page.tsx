"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getAllServices, Service } from "@/lib/api";
import Sidebar from "@/components/Sidebar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/Button";
import { Wrench, Calendar, DollarSign } from "lucide-react";

export default function ServicesPage() {
  const router = useRouter();
  const [user, setUser] = useState<{
    firstName?: string;
    lastName?: string;
    email?: string;
    role?: string;
  } | null>(null);
  const [services, setServices] = useState<Service[]>([]);
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

    loadServices();
  }, [router]);

  const loadServices = async () => {
    try {
      setLoading(true);
      const servicesData = await getAllServices();
      setServices(servicesData);
    } catch (err) {
      console.error("Failed to load services:", err);
      setError(err instanceof Error ? err.message : "Failed to load services");
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
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar role="customer" user={user} />

      <main className="flex-1 p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <Wrench className="h-8 w-8 text-blue-600" />
              Available Services
            </h1>
            <p className="text-gray-600 mt-2">
              Browse our automotive services and book an appointment
            </p>
          </div>

          {error && (
            <Card className="p-4 mb-6 bg-red-50 border-red-200">
              <p className="text-red-600">{error}</p>
            </Card>
          )}

          {/* Services Grid */}
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-lg text-gray-600">Loading services...</div>
            </div>
          ) : services.length === 0 ? (
            <Card className="p-12 text-center">
              <Wrench className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                No Services Available
              </h3>
              <p className="text-gray-600">
                Please check back later for available services
              </p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {services.map((service) => (
                <Card
                  key={service.id}
                  className="p-6 hover:shadow-lg transition-shadow flex flex-col"
                >
                  <div className="flex items-start gap-4 mb-4">
                    <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                      <Wrench className="h-6 w-6 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-gray-900 mb-1">
                        {service.name}
                      </h3>
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4 text-green-600" />
                        <span className="text-2xl font-bold text-green-600">
                          {service.estimatedCost ? service.estimatedCost.toFixed(2) : "N/A"}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="mb-4 flex-1">
                    <p className="text-sm text-gray-600 line-clamp-3">
                      {service.description || "Professional automotive service"}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-gray-200">
                    <Link href={`/appointments/add?serviceId=${service.id}`}>
                      <Button className="w-full gap-2">
                        <Calendar className="h-4 w-4" />
                        Book This Service
                      </Button>
                    </Link>
                  </div>
                </Card>
              ))}
            </div>
          )}

          {/* Info Card */}
          <Card className="mt-8 p-6 bg-blue-50 border-blue-200">
            <h3 className="text-lg font-semibold text-blue-900 mb-2">
              Need Help Choosing?
            </h3>
            <p className="text-blue-700 mb-4">
              Not sure which service you need? Our expert technicians can help
              you determine the best service for your vehicle during your
              appointment.
            </p>
            <Link href="/appointments/add">
              <Button
                variant="outline"
                className="border-blue-300 text-blue-700 hover:bg-blue-100"
              >
                Book a Consultation
              </Button>
            </Link>
          </Card>
        </div>
      </main>
    </div>
  );
}

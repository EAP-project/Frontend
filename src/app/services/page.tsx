"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getAllServices, getServiceCategories, Service, ServiceCategory } from "@/lib/api";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/Button";
import Skeleton from "@/components/ui/Skeleton";
import { Wrench, Calendar, DollarSign, Clock, ChevronDown, ChevronUp } from "lucide-react";

export default function ServicesPage() {
  const router = useRouter();
  const { user, token, initialized } = useAuth();
  const [services, setServices] = useState<Service[]>([]);
  const [categories, setCategories] = useState<ServiceCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedCategories, setExpandedCategories] = useState<Set<number>>(new Set());
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);

  useEffect(() => {
    if (!initialized) return;
    if (!token || !user) {
      router.push("/login");
      return;
    }

    loadData();
  }, [router, initialized, token, user]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [servicesData, categoriesData] = await Promise.all([
        getAllServices(),
        getServiceCategories()
      ]);
      
      setServices(servicesData);
      setCategories(categoriesData);
      
      // Expand all categories by default
      setExpandedCategories(new Set(categoriesData.map(cat => cat.id)));
    } catch (err) {
      console.error("Failed to load data:", err);
      setError(err instanceof Error ? err.message : "Failed to load services");
    } finally {
      setLoading(false);
    }
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

  const getImageUrl = (imageUrl?: string) => {
    if (!imageUrl) return null;
    // If it's already a full URL, return it
    if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
      return imageUrl;
    }
    // Otherwise, prepend your backend URL
    return `http://localhost:8080${imageUrl}`;
  };

  if (!initialized || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  const groupedServices = groupServicesByCategory();
  const filteredCategories = selectedCategory 
    ? categories.filter(cat => cat.id === selectedCategory)
    : categories;

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 flex items-center gap-3 mb-2">
            <Wrench className="h-10 w-10 text-blue-600" />
            Our Services
          </h1>
          <p className="text-gray-600 text-lg">
            Professional automotive services organized by category
          </p>
        </div>

        {error && (
          <Card className="p-4 mb-6 bg-red-50 border-red-200">
            <p className="text-red-600">{error}</p>
          </Card>
        )}

        {/* Category Filter Pills */}
        {loading ? (
          <div className="mb-8 flex flex-wrap gap-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} variant="rect" className="h-8 w-32 rounded-full" />
            ))}
          </div>
        ) : categories.length > 0 ? (
          <div className="mb-8 flex flex-wrap gap-3">
            <Button
              variant={selectedCategory === null ? "default" : "outline"}
              onClick={() => setSelectedCategory(null)}
              size="sm"
              className="rounded-full"
            >
              All Categories
            </Button>
            {categories.map(category => (
              <Button
                key={category.id}
                variant={selectedCategory === category.id ? "default" : "outline"}
                onClick={() => setSelectedCategory(category.id)}
                size="sm"
                className="rounded-full"
              >
                {category.name}
                <span className="ml-2 px-2 py-0.5 bg-white/20 rounded-full text-xs">
                  {groupedServices[category.id]?.length || 0}
                </span>
              </Button>
            ))}
          </div>
        ) : null}

        {loading ? (
          <div className="space-y-8">
            {/* Skeleton for category sections */}
            {Array.from({ length: 2 }).map((_, catIndex) => (
              <div key={catIndex} className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200">
                {/* Category Header Skeleton */}
                <div className="px-6 py-5 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <Skeleton variant="rect" className="h-12 w-12 rounded-lg" />
                    <div>
                      <Skeleton lines={1} className="w-48 h-6 mb-2" />
                      <Skeleton lines={1} className="w-64 h-4" />
                    </div>
                  </div>
                  <Skeleton variant="rect" className="h-8 w-24 rounded-full" />
                </div>

                {/* Service Cards Grid Skeleton */}
                <div className="px-6 pb-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {Array.from({ length: 3 }).map((_, cardIndex) => (
                      <Card key={cardIndex} className="overflow-hidden border-2">
                        {/* Image Skeleton */}
                        <Skeleton variant="rect" className="h-48 w-full rounded-none" />
                        
                        {/* Content Skeleton */}
                        <div className="p-5">
                          <Skeleton lines={2} className="mb-4" />
                          <Skeleton lines={3} className="mb-4" />
                          
                          <div className="flex items-center justify-between mb-4 pt-4 border-t border-gray-100">
                            <Skeleton lines={1} className="w-20 h-4" />
                            <Skeleton lines={1} className="w-16 h-6" />
                          </div>
                          
                          <Skeleton variant="rect" className="h-10 w-full rounded-lg" />
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              </div>
            ))}
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
          <div className="space-y-8">
            {filteredCategories.map(category => {
              const categoryServices = groupedServices[category.id] || [];
              const isExpanded = expandedCategories.has(category.id);
              
              if (categoryServices.length === 0) return null;

              return (
                <div key={category.id} className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200">
                  {/* Category Header */}
                  <button
                    onClick={() => toggleCategory(category.id)}
                    className="w-full px-6 py-5 flex items-center justify-between hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                        <Wrench className="h-6 w-6 text-white" />
                      </div>
                      <div className="text-left">
                        <h2 className="text-2xl font-bold text-gray-900">
                          {category.name}
                        </h2>
                        {category.description && (
                          <p className="text-sm text-gray-600 mt-1">
                            {category.description}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="px-4 py-2 bg-blue-100 text-blue-700 rounded-full font-semibold">
                        {categoryServices.length} {categoryServices.length === 1 ? 'Service' : 'Services'}
                      </span>
                      {isExpanded ? (
                        <ChevronUp className="h-6 w-6 text-gray-400" />
                      ) : (
                        <ChevronDown className="h-6 w-6 text-gray-400" />
                      )}
                    </div>
                  </button>

                  {/* Services Grid */}
                  {isExpanded && (
                    <div className="px-6 pb-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {categoryServices.map(service => (
                          <Card
                            key={service.id}
                            className="overflow-hidden hover:shadow-xl transition-all duration-300 border-2 hover:border-blue-400 group"
                          >
                            {/* Service Image */}
                            {service.imageUrl ? (
                              <div className="relative h-48 overflow-hidden bg-gray-100">
                                <img
                                  src={getImageUrl(service.imageUrl) || ''}
                                  alt={service.name}
                                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                                  onError={(e) => {
                                    e.currentTarget.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="300"%3E%3Crect fill="%23f3f4f6" width="400" height="300"/%3E%3Ctext fill="%239ca3af" font-family="sans-serif" font-size="18" x="50%25" y="50%25" text-anchor="middle" dominant-baseline="middle"%3ENo Image%3C/text%3E%3C/svg%3E';
                                  }}
                                />
                                <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full">
                                  <span className="text-sm font-bold text-green-600">
                                    ${service.estimatedCost?.toFixed(2) || 'N/A'}
                                  </span>
                                </div>
                              </div>
                            ) : (
                              <div className="h-48 bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                                <Wrench className="h-16 w-16 text-white opacity-50" />
                              </div>
                            )}

                            {/* Service Content */}
                            <div className="p-5">
                              <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2 min-h-[3.5rem]">
                                {service.name}
                              </h3>
                              
                              <p className="text-sm text-gray-600 mb-4 line-clamp-3 min-h-[4rem]">
                                {service.description || "Professional automotive service with expert technicians"}
                              </p>

                              <div className="flex items-center justify-between mb-4 pt-4 border-t border-gray-100">
                                <div className="flex items-center gap-2 text-gray-600">
                                  <Clock className="h-4 w-4" />
                                  <span className="text-sm font-medium">
                                    {service.estimatedDurationMinutes 
                                      ? `${service.estimatedDurationMinutes} min`
                                      : 'N/A'}
                                  </span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <DollarSign className="h-5 w-5 text-green-600" />
                                  <span className="text-xl font-bold text-green-600">
                                    {service.estimatedCost?.toFixed(2) || 'N/A'}
                                  </span>
                                </div>
                              </div>

                              <Link href={`/appointments/add?serviceId=${service.id}`}>
                                <Button className="w-full gap-2 group-hover:shadow-md transition-all">
                                  <Calendar className="h-4 w-4" />
                                  Book This Service
                                </Button>
                              </Link>
                            </div>
                          </Card>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Help Card */}
        <Card className="mt-8 p-8 bg-gradient-to-br from-blue-50 to-purple-50 border-2 border-blue-200">
          <div className="flex items-start gap-6">
            <div className="h-16 w-16 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0">
              <Wrench className="h-8 w-8 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="text-2xl font-bold text-gray-900 mb-3">
                Need Help Choosing?
              </h3>
              <p className="text-gray-700 mb-5 text-lg">
                Not sure which service you need? Our expert technicians can help you
                determine the best service for your vehicle during your appointment.
              </p>
              <Link href="/appointments/add">
                <Button
                  size="lg"
                  className="gap-2 bg-blue-600 hover:bg-blue-700"
                >
                  <Calendar className="h-5 w-5" />
                  Book a Consultation
                </Button>
              </Link>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
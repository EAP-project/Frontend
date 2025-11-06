"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  getAllServices,
  deleteService,
  createService,
  Service,
  ServiceDTO,
} from "@/lib/api";
import Sidebar from "@/components/Sidebar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/Button";
import {
  Wrench,
  Plus,
  Clock,
  DollarSign,
  Edit,
  Trash2,
  Search,
  List,
  Upload,
  X,
} from "lucide-react";

export default function ServicesManagementPage() {
  const router = useRouter();
  const [user, setUser] = useState<{
    firstName?: string;
    lastName?: string;
    role?: string;
  } | null>(null);

  // View Mode State
  const [services, setServices] = useState<Service[]>([]);
  const [filteredServices, setFilteredServices] = useState<Service[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  // Add Mode State
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    serviceName: "",
    description: "",
    price: "",
    estimatedCost: "",
    estimatedDurationMinutes: "",
    categoryId: "",
  });
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // Common State
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userStr = localStorage.getItem("user");

    if (!token || !userStr) {
      router.push("/login");
      return;
    }

    const userData = JSON.parse(userStr);
    setUser(userData);

    // Only allow admin
    if (!userData.role?.toUpperCase().includes("ADMIN")) {
      router.push("/dashboard/customer");
      return;
    }

    loadServices();
  }, [router]);

  const loadServices = async () => {
    try {
      setLoading(true);
      const data = await getAllServices();
      setServices(data);
      setFilteredServices(data);
    } catch (err) {
      console.error("Failed to load services:", err);
      setError(err instanceof Error ? err.message : "Failed to load services");
    } finally {
      setLoading(false);
    }
  };

  // Helper function to construct full image URL
  const getServiceImageUrl = (service: Service): string | null => {
    if (service.imageUrl) {
      if (service.imageUrl.startsWith("http")) {
        return service.imageUrl;
      }
      return `http://localhost:8080${service.imageUrl}`;
    }
    return null;
  };

  const handleDeleteService = async (
    serviceId: number,
    serviceName: string
  ) => {
    if (!confirm(`Are you sure you want to delete "${serviceName}"?`)) {
      return;
    }

    try {
      setLoading(true);
      setError(null);
      await deleteService(serviceId);

      // Reload services after deletion
      await loadServices();

      setSuccess(`Service "${serviceName}" has been deleted successfully!`);
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error("Failed to delete service:", err);
      setError(err instanceof Error ? err.message : "Failed to delete service");
    } finally {
      setLoading(false);
    }
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImage(file);

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
  };

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmitService = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    try {
      setLoading(true);

      const serviceData: ServiceDTO = {
        serviceName: formData.serviceName,
        description: formData.description,
        price: parseFloat(formData.price),
        estimatedCost: parseFloat(formData.estimatedCost),
        estimatedDurationMinutes: parseInt(formData.estimatedDurationMinutes),
        categoryId: parseInt(formData.categoryId),
      };

      await createService(serviceData, selectedImage || undefined);

      setSuccess("Service created successfully!");

      // Reset form
      setFormData({
        serviceName: "",
        description: "",
        price: "",
        estimatedCost: "",
        estimatedDurationMinutes: "",
        categoryId: "",
      });
      setSelectedImage(null);
      setImagePreview(null);

      // Reload services and switch to view mode
      await loadServices();
      setTimeout(() => {
        setShowAddForm(false);
        setSuccess(null);
      }, 2000);
    } catch (err) {
      console.error("Error creating service:", err);
      setError(err instanceof Error ? err.message : "Failed to create service");
    } finally {
      setLoading(false);
    }
  };

  // Filter services based on search query and category
  useEffect(() => {
    let filtered = services;

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(
        (service) =>
          service.serviceName
            ?.toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
          service.description?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filter by category
    if (selectedCategory !== "all") {
      filtered = filtered.filter(
        (service) =>
          service.category?.name?.toLowerCase() ===
          selectedCategory.toLowerCase()
      );
    }

    setFilteredServices(filtered);
  }, [searchQuery, selectedCategory, services]);

  const getCategoryColor = (categoryName?: string) => {
    switch (categoryName?.toLowerCase()) {
      case "maintenance":
        return "bg-blue-100 text-blue-700";
      case "repair":
        return "bg-red-100 text-red-700";
      case "inspection":
        return "bg-yellow-100 text-yellow-700";
      case "customization":
        return "bg-purple-100 text-purple-700";
      case "emergency":
        return "bg-orange-100 text-orange-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  if (!user || (loading && services.length === 0)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar
        role={
          (user.role?.toLowerCase() as "customer" | "admin" | "employee") ||
          "admin"
        }
      />

      <main className="flex-1 ml-64 p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Service Management
              </h1>
              <p className="text-gray-600">
                {showAddForm
                  ? "Add a new service"
                  : "Manage all services available for customers"}
              </p>
            </div>
            <Button
              onClick={() => setShowAddForm(!showAddForm)}
              className={`${
                showAddForm
                  ? "bg-gray-600 hover:bg-gray-700"
                  : "bg-blue-600 hover:bg-blue-700"
              } text-white flex items-center gap-2`}
            >
              {showAddForm ? (
                <>
                  <List className="h-5 w-5" />
                  View Services
                </>
              ) : (
                <>
                  <Plus className="h-5 w-5" />
                  Add New Service
                </>
              )}
            </Button>
          </div>

          {/* Success/Error Messages */}
          {success && (
            <Card className="p-4 mb-6 bg-green-50 border-green-200">
              <p className="text-green-600">{success}</p>
            </Card>
          )}

          {error && (
            <Card className="p-4 mb-6 bg-red-50 border-red-200">
              <p className="text-red-600">{error}</p>
            </Card>
          )}

          {/* ADD SERVICE FORM */}
          {showAddForm ? (
            <Card className="p-8">
              <form onSubmit={handleSubmitService} className="space-y-6">
                {/* Service Name */}
                <div>
                  <label
                    htmlFor="serviceName"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Service Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="serviceName"
                    name="serviceName"
                    value={formData.serviceName}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                    placeholder="e.g., Oil Change Service"
                  />
                </div>

                {/* Description */}
                <div>
                  <label
                    htmlFor="description"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Description <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    required
                    rows={4}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                    placeholder="Describe the service in detail..."
                  />
                </div>

                {/* Category */}
                <div>
                  <label
                    htmlFor="categoryId"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Category <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="categoryId"
                    name="categoryId"
                    value={formData.categoryId}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                  >
                    <option value="">Select a category</option>
                    <option value="1">Maintenance</option>
                    <option value="2">Repair</option>
                    <option value="3">Inspection</option>
                    <option value="4">Customization</option>
                    <option value="5">Emergency</option>
                  </select>
                </div>

                {/* Price and Estimated Cost */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label
                      htmlFor="price"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Base Price ($) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      id="price"
                      name="price"
                      value={formData.price}
                      onChange={handleInputChange}
                      required
                      min="0"
                      step="0.01"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                      placeholder="49.99"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="estimatedCost"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Estimated Cost ($) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      id="estimatedCost"
                      name="estimatedCost"
                      value={formData.estimatedCost}
                      onChange={handleInputChange}
                      required
                      min="0"
                      step="0.01"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                      placeholder="75.00"
                    />
                  </div>
                </div>

                {/* Duration */}
                <div>
                  <label
                    htmlFor="estimatedDurationMinutes"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Estimated Duration (minutes){" "}
                    <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    id="estimatedDurationMinutes"
                    name="estimatedDurationMinutes"
                    value={formData.estimatedDurationMinutes}
                    onChange={handleInputChange}
                    required
                    min="1"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                    placeholder="60"
                  />
                </div>

                {/* Image Upload */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Service Image
                  </label>

                  {imagePreview ? (
                    <div className="relative w-full h-48 border-2 border-gray-300 rounded-lg overflow-hidden">
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={handleRemoveImage}
                        className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-colors"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                      <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <label htmlFor="imageUpload" className="cursor-pointer">
                        <span className="text-blue-600 hover:text-blue-700 font-medium">
                          Click to upload
                        </span>
                        <span className="text-gray-600"> or drag and drop</span>
                        <p className="text-sm text-gray-500 mt-1">
                          PNG, JPG, GIF up to 10MB
                        </p>
                      </label>
                      <input
                        id="imageUpload"
                        type="file"
                        accept="image/*"
                        onChange={handleImageSelect}
                        className="hidden"
                      />
                    </div>
                  )}
                </div>

                {/* Submit Button */}
                <div className="flex gap-4 pt-4">
                  <Button
                    type="submit"
                    disabled={loading}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? "Creating..." : "Create Service"}
                  </Button>
                  <Button
                    type="button"
                    onClick={() => setShowAddForm(false)}
                    className="flex-1 bg-gray-500 hover:bg-gray-600 text-white"
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </Card>
          ) : (
            /* VIEW SERVICES */
            <>
              {/* Stats */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <Card className="p-6 bg-blue-50">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 mb-1">
                        Total Services
                      </p>
                      <p className="text-3xl font-bold text-gray-900">
                        {services.length}
                      </p>
                    </div>
                    <Wrench className="h-10 w-10 text-blue-600" />
                  </div>
                </Card>

                <Card className="p-6 bg-green-50">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 mb-1">
                        Maintenance
                      </p>
                      <p className="text-3xl font-bold text-gray-900">
                        {
                          services.filter(
                            (s) =>
                              s.category?.name?.toLowerCase() === "maintenance"
                          ).length
                        }
                      </p>
                    </div>
                    <Wrench className="h-10 w-10 text-green-600" />
                  </div>
                </Card>

                <Card className="p-6 bg-red-50">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 mb-1">
                        Repairs
                      </p>
                      <p className="text-3xl font-bold text-gray-900">
                        {
                          services.filter(
                            (s) => s.category?.name?.toLowerCase() === "repair"
                          ).length
                        }
                      </p>
                    </div>
                    <Wrench className="h-10 w-10 text-red-600" />
                  </div>
                </Card>

                <Card className="p-6 bg-yellow-50">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 mb-1">
                        Inspections
                      </p>
                      <p className="text-3xl font-bold text-gray-900">
                        {
                          services.filter(
                            (s) =>
                              s.category?.name?.toLowerCase() === "inspection"
                          ).length
                        }
                      </p>
                    </div>
                    <Wrench className="h-10 w-10 text-yellow-600" />
                  </div>
                </Card>
              </div>

              {/* Filters */}
              <Card className="p-6 mb-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Search */}
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search services..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  {/* Category Filter */}
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                  >
                    <option value="all">All Categories</option>
                    <option value="maintenance">Maintenance</option>
                    <option value="repair">Repair</option>
                    <option value="inspection">Inspection</option>
                    <option value="customization">Customization</option>
                    <option value="emergency">Emergency</option>
                  </select>
                </div>
              </Card>

              {/* Services Grid */}
              {filteredServices.length === 0 ? (
                <Card className="p-12 text-center">
                  <Wrench className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    No Services Found
                  </h3>
                  <p className="text-gray-600 mb-6">
                    {searchQuery || selectedCategory !== "all"
                      ? "Try adjusting your filters"
                      : "Get started by adding your first service"}
                  </p>
                  {!searchQuery && selectedCategory === "all" && (
                    <Button
                      onClick={() => setShowAddForm(true)}
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      <Plus className="h-5 w-5 mr-2" />
                      Add Service
                    </Button>
                  )}
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredServices.map((service) => {
                    const imageUrl = getServiceImageUrl(service);

                    return (
                      <Card
                        key={service.id}
                        className="overflow-hidden hover:shadow-lg transition-shadow"
                      >
                        {/* Service Image */}
                        <div className="h-48 bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center relative">
                          {imageUrl ? (
                            <img
                              src={imageUrl}
                              alt={service.serviceName}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                // Fallback if image fails to load
                                e.currentTarget.style.display = "none";
                                const parent = e.currentTarget.parentElement;
                                if (parent) {
                                  parent.innerHTML =
                                    '<svg class="h-20 w-20 text-white opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>';
                                }
                              }}
                            />
                          ) : (
                            <Wrench className="h-20 w-20 text-white opacity-50" />
                          )}
                        </div>

                        <div className="p-6">
                          {/* Category Badge */}
                          {service.category && (
                            <span
                              className={`text-xs px-3 py-1 rounded-full font-medium ${getCategoryColor(
                                service.category.name
                              )}`}
                            >
                              {service.category.name}
                            </span>
                          )}

                          {/* Service Name */}
                          <h3 className="text-xl font-bold text-gray-900 mt-3 mb-2">
                            {service.serviceName}
                          </h3>

                          {/* Description */}
                          {service.description && (
                            <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                              {service.description}
                            </p>
                          )}

                          {/* Service Details */}
                          <div className="space-y-2 mb-4">
                            <div className="flex items-center text-gray-700">
                              <DollarSign className="h-4 w-4 mr-2 text-green-600" />
                              <span className="font-semibold">
                                $
                                {service.estimatedCost?.toFixed(2) ||
                                  service.price?.toFixed(2) ||
                                  "N/A"}
                              </span>
                            </div>
                            {service.estimatedDurationMinutes && (
                              <div className="flex items-center text-gray-700">
                                <Clock className="h-4 w-4 mr-2 text-blue-600" />
                                <span className="text-sm">
                                  {service.estimatedDurationMinutes} minutes
                                </span>
                              </div>
                            )}
                          </div>

                          {/* Action Buttons */}
                          <div className="flex gap-2 pt-4 border-t border-gray-200">
                            <button
                              onClick={() =>
                                router.push(
                                  `/admin/services/edit/${service.id}`
                                )
                              }
                              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg font-medium transition-colors"
                            >
                              <Edit className="h-4 w-4" />
                              Edit
                            </button>
                            <button
                              onClick={() =>
                                handleDeleteService(
                                  service.id,
                                  service.serviceName
                                )
                              }
                              disabled={loading}
                              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              <Trash2 className="h-4 w-4" />
                              Delete
                            </button>
                          </div>
                        </div>
                      </Card>
                    );
                  })}
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
}

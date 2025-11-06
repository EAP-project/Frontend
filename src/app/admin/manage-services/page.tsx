"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  getAllServices,
  deleteService,
  createService,
  updateService,
  Service,
  ServiceDTO,
  getServiceCategories,
  ServiceCategory,
  createServiceCategory,
  deleteServiceCategory,
  updateServiceCategory,
  getServiceById,
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
  ChevronDown,
  ChevronUp,
  Folder,
  FolderPlus,
  FolderOpen,
  Save,
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
  const [categories, setCategories] = useState<ServiceCategory[]>([]);
  const [filteredServices, setFilteredServices] = useState<Service[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [expandedCategories, setExpandedCategories] = useState<Set<number>>(new Set());

  // Add/Edit Mode State
  const [showAddForm, setShowAddForm] = useState(false);
  const [showAddCategoryForm, setShowAddCategoryForm] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [editingCategory, setEditingCategory] = useState<ServiceCategory | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    estimatedCost: "",
    estimatedDurationMinutes: "",
    categoryId: "",
  });
  const [categoryFormData, setCategoryFormData] = useState({
    name: "",
    description: "",
  });
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // Common State
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"services" | "categories">("services");

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userStr = localStorage.getItem("user");

    if (!token || !userStr) {
      router.push("/login");
      return;
    }

    const userData = JSON.parse(userStr);
    setUser(userData);

    if (!userData.role?.toUpperCase().includes("ADMIN")) {
      router.push("/dashboard/customer");
      return;
    }

    loadServices();
    loadCategories();
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

  const loadCategories = async () => {
    try {
      const data = await getServiceCategories();
      setCategories(data);
      const allCategoryIds = new Set(data.map(cat => cat.id));
      setExpandedCategories(allCategoryIds);
    } catch (err) {
      console.error("Failed to load categories:", err);
    }
  };

  const getServiceImageUrl = (service: Service): string | null => {
    if (service.imageUrl) {
      if (service.imageUrl.startsWith("http")) {
        return service.imageUrl;
      }
      return `http://localhost:8080${service.imageUrl}`;
    }
    return null;
  };

  const handleDeleteService = async (serviceId: number, serviceName: string) => {
    if (!confirm(`Are you sure you want to delete "${serviceName}"?`)) {
      return;
    }

    try {
      setLoading(true);
      setError(null);
      await deleteService(serviceId);
      await loadServices();
      setSuccess(`Service "${serviceName}" has been deleted successfully!`);
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error("Failed to delete service:", err);
      setError(err instanceof Error ? err.message : "Failed to delete service");
    } finally {
      setLoading(false);
    }
    }

    const handleDeleteCategory = async (categoryId: number, categoryName: string) => {
      if (!confirm(`Are you sure you want to delete category "${categoryName}"? This will also delete all services under this category.`)) {
        return;
      }

      try {
        setLoading(true);
        setError(null);
        await deleteServiceCategory(categoryId);
        await loadCategories();
        await loadServices();
        setSuccess(`Category "${categoryName}" has been deleted successfully!`);
        setTimeout(() => setSuccess(null), 3000);
      } catch (err) {
        console.error("Failed to delete category:", err);
        setError(err instanceof Error ? err.message : "Failed to delete category");
      } finally {
        setLoading(false);
      }
    };

  const handleEditService = async (service: Service) => {
    try {
      setLoading(true);
      const serviceData = await getServiceById(service.id);
      setEditingService(serviceData);
      setFormData({
        name: serviceData.name,
        description: serviceData.description || "",
        estimatedCost: serviceData.estimatedCost?.toString() || "",
        estimatedDurationMinutes: serviceData.estimatedDurationMinutes?.toString() || "",
        categoryId: serviceData.category?.id?.toString() || "",
      });
      
      if (serviceData.imageUrl) {
        const imageUrl = getServiceImageUrl(serviceData);
        if (imageUrl) {
          setImagePreview(imageUrl);
        }
      }
      
      setShowAddForm(true);
    } catch (err) {
      console.error("Failed to load service data:", err);
      setError("Failed to load service data for editing");
    } finally {
      setLoading(false);
    }
  };

  const handleEditCategory = async (category: ServiceCategory) => {
    setEditingCategory(category);
    setCategoryFormData({
      name: category.name,
      description: category.description || "",
    });
    setShowAddCategoryForm(true);
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImage(file);
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
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCategoryInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setCategoryFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmitService = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!formData.name || !formData.estimatedCost || !formData.estimatedDurationMinutes || !formData.categoryId) {
      setError("Please fill in all required fields");
      return;
    }

    try {
      setLoading(true);

      const serviceData: ServiceDTO = {
        name: formData.name,
        description: formData.description,
        estimatedCost: parseFloat(formData.estimatedCost),
        estimatedDurationMinutes: parseInt(formData.estimatedDurationMinutes),
        categoryId: parseInt(formData.categoryId),
      };

      if (editingService) {
        await updateService(editingService.id, serviceData, selectedImage || undefined);
        setSuccess("Service updated successfully!");
      } else {
        await createService(serviceData, selectedImage || undefined);
        setSuccess("Service created successfully!");
      }

      resetForms();
      await loadServices();
      setTimeout(() => {
        setShowAddForm(false);
        setSuccess(null);
      }, 2000);
    } catch (err) {
      console.error("Error saving service:", err);
      setError(err instanceof Error ? err.message : `Failed to ${editingService ? 'update' : 'create'} service`);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!categoryFormData.name) {
      setError("Category name is required");
      return;
    }

    try {
      setLoading(true);

      if (editingCategory) {
        await updateServiceCategory(editingCategory.id, categoryFormData);
        setSuccess("Category updated successfully!");
      } else {
        await createServiceCategory(categoryFormData);
        setSuccess("Category created successfully!");
      }

      resetForms();
      await loadCategories();
      setTimeout(() => {
        setShowAddCategoryForm(false);
        setSuccess(null);
      }, 2000);
    } catch (err) {
      console.error("Error saving category:", err);
      setError(err instanceof Error ? err.message : `Failed to ${editingCategory ? 'update' : 'create'} category`);
    } finally {
      setLoading(false);
    }
  };

  const resetForms = () => {
    setFormData({
      name: "",
      description: "",
      estimatedCost: "",
      estimatedDurationMinutes: "",
      categoryId: "",
    });
    setCategoryFormData({
      name: "",
      description: "",
    });
    setSelectedImage(null);
    setImagePreview(null);
    setEditingService(null);
    setEditingCategory(null);
  };

  const handleCancelForm = () => {
    setShowAddForm(false);
    setShowAddCategoryForm(false);
    resetForms();
  };

  useEffect(() => {
    let filtered = services;

    if (searchQuery) {
      filtered = filtered.filter(
        (service) =>
          service.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          service.description?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (selectedCategory !== "all") {
      filtered = filtered.filter(
        (service) =>
          service.category?.id?.toString() === selectedCategory
      );
    }

    setFilteredServices(filtered);
  }, [searchQuery, selectedCategory, services]);

  const servicesByCategory = categories.map(category => ({
    category,
    services: filteredServices.filter(service => service.category?.id === category.id)
  })).filter(group => group.services.length > 0 || selectedCategory === "all");

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

  const getServicesCountByCategory = (categoryId: number) => {
    return services.filter(service => service.category?.id === categoryId).length;
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
        role={(user.role?.toLowerCase() as "customer" | "admin" | "employee") || "admin"}
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
                  ? editingService ? "Edit Service" : "Add a new service"
                  : showAddCategoryForm
                  ? editingCategory ? "Edit Category" : "Add a new category"
                  : "Manage services and categories"}
              </p>
            </div>
            <div className="flex gap-2">
              {!showAddForm && !showAddCategoryForm && (
                <>
                  <Button
                    onClick={() => setShowAddCategoryForm(true)}
                    className="bg-green-600 hover:bg-green-700 text-white flex items-center gap-2"
                  >
                    <FolderPlus className="h-5 w-5" />
                    Add Category
                  </Button>
                  <Button
                    onClick={() => setShowAddForm(true)}
                    className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2"
                  >
                    <Plus className="h-5 w-5" />
                    Add Service
                  </Button>
                </>
              )}
              {(showAddForm || showAddCategoryForm) && (
                <Button
                  onClick={handleCancelForm}
                  className="bg-gray-600 hover:bg-gray-700 text-white flex items-center gap-2"
                >
                  <List className="h-5 w-5" />
                  View All
                </Button>
              )}
            </div>
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

          {/* ADD/EDIT CATEGORY FORM */}
          {showAddCategoryForm ? (
            <Card className="p-8">
              <form onSubmit={handleSubmitCategory} className="space-y-6">
                <div className="flex items-center gap-3 mb-6">
                  <FolderPlus className="h-8 w-8 text-green-600" />
                  <h2 className="text-2xl font-bold text-gray-900">
                    {editingCategory ? "Edit Category" : "Add New Category"}
                  </h2>
                </div>

                <div>
                  <label htmlFor="categoryName" className="block text-sm font-medium text-gray-700 mb-2">
                    Category Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="categoryName"
                    name="name"
                    value={categoryFormData.name}
                    onChange={handleCategoryInputChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900"
                    placeholder="e.g., Engine Repair, Brake Services, etc."
                  />
                </div>

                <div>
                  <label htmlFor="categoryDescription" className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    id="categoryDescription"
                    name="description"
                    value={categoryFormData.description}
                    onChange={handleCategoryInputChange}
                    rows={4}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900"
                    placeholder="Describe what types of services belong to this category..."
                  />
                </div>

                <div className="flex gap-4 pt-4">
                  <Button
                    type="submit"
                    disabled={loading}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      "Saving..."
                    ) : (
                      <>
                        <Save className="h-4 w-4" />
                        {editingCategory ? "Update Category" : "Create Category"}
                      </>
                    )}
                  </Button>
                  <Button
                    type="button"
                    onClick={handleCancelForm}
                    className="flex-1 bg-gray-500 hover:bg-gray-600 text-white"
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </Card>
          ) : /* ADD/EDIT SERVICE FORM */
          showAddForm ? (
            <Card className="p-8">
              <form onSubmit={handleSubmitService} className="space-y-6">
                <div className="flex items-center gap-3 mb-6">
                  <Plus className="h-8 w-8 text-blue-600" />
                  <h2 className="text-2xl font-bold text-gray-900">
                    {editingService ? "Edit Service" : "Add New Service"}
                  </h2>
                </div>

                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                    Service Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                    placeholder="e.g., Oil Change Service"
                  />
                </div>

                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows={4}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                    placeholder="Describe the service in detail..."
                  />
                </div>

                <div>
                  <label htmlFor="categoryId" className="block text-sm font-medium text-gray-700 mb-2">
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
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="estimatedCost" className="block text-sm font-medium text-gray-700 mb-2">
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

                <div>
                  <label htmlFor="estimatedDurationMinutes" className="block text-sm font-medium text-gray-700 mb-2">
                    Estimated Duration (minutes) <span className="text-red-500">*</span>
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

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Service Image
                  </label>
                  <p className="text-sm text-gray-500 mb-3">
                    {editingService && imagePreview && !selectedImage 
                      ? "Current image is displayed. Upload a new image to replace it." 
                      : "Upload an image for this service"}
                  </p>

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

                <div className="flex gap-4 pt-4">
                  <Button
                    type="submit"
                    disabled={loading}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      "Saving..."
                    ) : (
                      <>
                        <Save className="h-4 w-4" />
                        {editingService ? "Update Service" : "Create Service"}
                      </>
                    )}
                  </Button>
                  <Button
                    type="button"
                    onClick={handleCancelForm}
                    className="flex-1 bg-gray-500 hover:bg-gray-600 text-white"
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </Card>
          ) : (
            /* VIEW MODE - SERVICES AND CATEGORIES */
            <>
              {/* Tabs */}
              <div className="flex border-b border-gray-200 mb-6">
                <button
                  onClick={() => setActiveTab("services")}
                  className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${
                    activeTab === "services"
                      ? "border-blue-500 text-blue-600"
                      : "border-transparent text-gray-500 hover:text-gray-700"
                  }`}
                >
                  Services
                </button>
                <button
                  onClick={() => setActiveTab("categories")}
                  className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${
                    activeTab === "categories"
                      ? "border-blue-500 text-blue-600"
                      : "border-transparent text-gray-500 hover:text-gray-700"
                  }`}
                >
                  Categories
                </button>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <Card className="p-6 bg-blue-50">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 mb-1">Total Services</p>
                      <p className="text-3xl font-bold text-gray-900">{services.length}</p>
                    </div>
                    <Wrench className="h-10 w-10 text-blue-600" />
                  </div>
                </Card>

                <Card className="p-6 bg-green-50">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 mb-1">Total Categories</p>
                      <p className="text-3xl font-bold text-gray-900">{categories.length}</p>
                    </div>
                    <Folder className="h-10 w-10 text-green-600" />
                  </div>
                </Card>

                {categories.slice(0, 2).map((category) => (
                  <Card key={category.id} className="p-6 bg-gray-50">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600 mb-1">{category.name}</p>
                        <p className="text-3xl font-bold text-gray-900">
                          {getServicesCountByCategory(category.id)}
                        </p>
                      </div>
                      <FolderOpen className="h-10 w-10 text-gray-600" />
                    </div>
                  </Card>
                ))}
              </div>

              {/* SERVICES TAB */}
              {activeTab === "services" && (
                <>
                  {/* Filters */}
                  <Card className="p-6 mb-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

                      <select
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                      >
                        <option value="all">All Categories</option>
                        {categories.map((category) => (
                          <option key={category.id} value={category.id}>
                            {category.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </Card>

                  {/* Services Organized by Categories */}
                  {servicesByCategory.length === 0 ? (
                    <Card className="p-12 text-center">
                      <Wrench className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">No Services Found</h3>
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
                    <div className="space-y-6">
                      {servicesByCategory.map(({ category, services: categoryServices }) => (
                        <Card key={category.id} className="overflow-hidden">
                          {/* Category Header */}
                          <div 
                            className="p-6 bg-gray-50 border-b border-gray-200 cursor-pointer hover:bg-gray-100 transition-colors"
                            onClick={() => toggleCategory(category.id)}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-4">
                                <div className="flex-1">
                                  <h3 className="text-xl font-bold text-gray-900">{category.name}</h3>
                                  {category.description && (
                                    <p className="text-gray-600 mt-1">{category.description}</p>
                                  )}
                                </div>
                                <span className="bg-blue-100 text-blue-800 text-sm font-medium px-3 py-1 rounded-full">
                                  {categoryServices.length} service{categoryServices.length !== 1 ? 's' : ''}
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                {expandedCategories.has(category.id) ? (
                                  <ChevronUp className="h-5 w-5 text-gray-500" />
                                ) : (
                                  <ChevronDown className="h-5 w-5 text-gray-500" />
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Services Grid - Collapsible */}
                          {expandedCategories.has(category.id) && (
                            <div className="p-6">
                              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {categoryServices.map((service) => {
                                  const imageUrl = getServiceImageUrl(service);

                                  return (
                                    <Card key={service.id} className="overflow-hidden hover:shadow-lg transition-shadow border">
                                      {/* Service Image */}
                                      <div className="h-32 bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center relative">
                                        {imageUrl ? (
                                          <img
                                            src={imageUrl}
                                            alt={service.name}
                                            className="w-full h-full object-cover"
                                            onError={(e) => {
                                              e.currentTarget.style.display = "none";
                                              const parent = e.currentTarget.parentElement;
                                              if (parent) {
                                                parent.innerHTML = '<svg class="h-12 w-12 text-white opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>';
                                              }
                                            }}
                                          />
                                        ) : (
                                          <Wrench className="h-12 w-12 text-white opacity-50" />
                                        )}
                                      </div>

                                      <div className="p-4">
                                        <h4 className="text-lg font-bold text-gray-900 mb-2">{service.name}</h4>

                                        {service.description && (
                                          <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                                            {service.description}
                                          </p>
                                        )}

                                        <div className="space-y-2 mb-3">
                                          <div className="flex items-center text-gray-700">
                                            <DollarSign className="h-4 w-4 mr-2 text-green-600" />
                                            <span className="font-semibold">
                                              ${service.estimatedCost?.toFixed(2) || "N/A"}
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

                                        <div className="flex gap-2 pt-3 border-t border-gray-200">
                                          <button
                                            onClick={() => handleEditService(service)}
                                            className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg font-medium transition-colors text-sm"
                                          >
                                            <Edit className="h-3 w-3" />
                                            Edit
                                          </button>
                                          <button
                                            onClick={() => handleDeleteService(service.id, service.name)}
                                            disabled={loading}
                                            className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg font-medium transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                                          >
                                            <Trash2 className="h-3 w-3" />
                                            Delete
                                          </button>
                                        </div>
                                      </div>
                                    </Card>
                                  );
                                })}
                              </div>
                            </div>
                          )}
                        </Card>
                      ))}
                    </div>
                  )}
                </>
              )}

              {/* CATEGORIES TAB */}
              {activeTab === "categories" && (
                <div className="space-y-6">
                  {categories.length === 0 ? (
                    <Card className="p-12 text-center">
                      <Folder className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">No Categories Found</h3>
                      <p className="text-gray-600 mb-6">Get started by creating your first service category</p>
                      <Button
                        onClick={() => setShowAddCategoryForm(true)}
                        className="bg-green-600 hover:bg-green-700 text-white"
                      >
                        <FolderPlus className="h-5 w-5 mr-2" />
                        Add Category
                      </Button>
                    </Card>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {categories.map((category) => (
                        <Card key={category.id} className="p-6 hover:shadow-lg transition-shadow">
                          <div className="flex items-start justify-between mb-4">
                            <Folder className="h-8 w-8 text-green-600 mt-1" />
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleEditCategory(category)}
                                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                title="Edit Category"
                              >
                                <Edit className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteCategory(category.id, category.name)}
                                disabled={loading}
                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                                title="Delete Category"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </div>

                          <h3 className="text-xl font-bold text-gray-900 mb-2">{category.name}</h3>

                          {category.description && (
                            <p className="text-gray-600 text-sm mb-4">{category.description}</p>
                          )}

                          <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                            <span className="text-sm text-gray-500">
                              {getServicesCountByCategory(category.id)} services
                            </span>
                            <button
                              onClick={() => {
                                setActiveTab("services");
                                setSelectedCategory(category.id.toString());
                              }}
                              className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                            >
                              View Services
                            </button>
                          </div>
                        </Card>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
}

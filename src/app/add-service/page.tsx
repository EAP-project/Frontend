"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { createService, ServiceDTO } from "@/lib/api";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import Sidebar from "@/components/Sidebar";
import { ArrowLeft, Upload, X } from "lucide-react";

export default function AddServicePage() {
  const router = useRouter();
  const { user, token, initialized } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const [formData, setFormData] = useState<ServiceDTO>({
    name: "",
    description: "",
    estimatedCost: 0,
    estimatedDurationMinutes: 0,
    categoryId: 1, // Default category
  });
  const [showConfirm, setShowConfirm] = useState(false);
  const [confirmType, setConfirmType] = useState<"cancel" | "create" | null>(null);

  useEffect(() => {
    if (!initialized) return;
    if (!token || !user) {
      router.push("/login");
      return;
    }

    // Only allow admin
    if (!user.role?.toUpperCase().includes("ADMIN")) {
      router.push("/dashboard/customer");
      return;
    }
  }, [router, initialized, token, user]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setConfirmType("create");
    setShowConfirm(true);
  };

  const handleCreateService = async () => {
    setLoading(true);
    setError(null);
    setSuccess(false);
    try {
      await createService(formData, imageFile || undefined);
      setSuccess(true);
      setFormData({
        name: "",
        description: "",
        estimatedCost: 0,
        estimatedDurationMinutes: 0,
        categoryId: 1,
      });
      setImageFile(null);
      setImagePreview(null);
      setTimeout(() => {
        router.push("/dashboard/admin");
      }, 2000);
    } catch (err) {
      console.error("Failed to create service:", err);
      setError(err instanceof Error ? err.message : "Failed to create service");
    } finally {
      setLoading(false);
      setShowConfirm(false);
      setConfirmType(null);
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

  if (!initialized || !user) {
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
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <button
              onClick={() => router.back()}
              className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Back
            </button>
            <h1 className="text-3xl font-bold text-gray-900">
              Add New Service
            </h1>
            <p className="text-gray-600 mt-2">
              Create a new service for customers to book
            </p>
          </div>

          {/* Form */}
          <Card className="p-8">
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-700">{error}</p>
              </div>
            )}

            {success && (
              <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-green-700">
                  Service created successfully! Redirecting...
                </p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Service Name */}
              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Service Name *
                </label>
                <Input
                  id="name"
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="e.g., Oil Change, Brake Repair"
                />
              </div>

              {/* Description */}
              <div>
                <label
                  htmlFor="description"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Description
                </label>
                <textarea
                  id="description"
                  rows={4}
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  placeholder="Describe the service details..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Estimated Cost */}
              <div>
                <label
                  htmlFor="estimatedCost"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Estimated Cost ($) *
                </label>
                <Input
                  id="estimatedCost"
                  type="number"
                  required
                  min="0"
                  step="0.01"
                  value={formData.estimatedCost || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      estimatedCost: parseFloat(e.target.value) || 0,
                    })
                  }
                  placeholder="0.00"
                />
              </div>

              {/* Estimated Duration */}
              <div>
                <label
                  htmlFor="estimatedDurationMinutes"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Estimated Duration (minutes) *
                </label>
                <Input
                  id="estimatedDurationMinutes"
                  type="number"
                  required
                  min="0"
                  value={formData.estimatedDurationMinutes || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      estimatedDurationMinutes: parseInt(e.target.value) || 0,
                    })
                  }
                  placeholder="e.g., 60"
                />
              </div>

              {/* Category */}
              <div>
                <label
                  htmlFor="categoryId"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Service Category *
                </label>
                <select
                  id="categoryId"
                  required
                  value={formData.categoryId}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      categoryId: parseInt(e.target.value),
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                >
                  <option value={1}>Maintenance</option>
                  <option value={2}>Repair</option>
                  <option value={3}>Inspection</option>
                  <option value={4}>Customization</option>
                  <option value={5}>Emergency</option>
                </select>
              </div>

              {/* Image Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Service Image (Optional)
                </label>

                {!imagePreview ? (
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
                    <Upload className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <label
                      htmlFor="image-upload"
                      className="cursor-pointer text-blue-600 hover:text-blue-700 font-medium"
                    >
                      Click to upload image
                      <input
                        id="image-upload"
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="hidden"
                      />
                    </label>
                    <p className="text-gray-500 text-sm mt-2">
                      PNG, JPG or WEBP (max 5MB)
                    </p>
                  </div>
                ) : (
                  <div className="relative">
                    <img
                      src={imagePreview}
                      alt="Service preview"
                      className="w-full h-64 object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={removeImage}
                      className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>

              {/* Submit Button */}
              <div className="flex gap-4 pt-4">
                <Button
                  type="button"
                  onClick={() => {
                    setConfirmType("cancel");
                    setShowConfirm(true);
                  }}
                  className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                >
                  {loading ? "Creating..." : "Create Service"}
                </Button>
              </div>
      <ConfirmationModal
        open={showConfirm}
        message={
          confirmType === "cancel"
            ? "Are you sure you want to cancel adding this service?"
            : "Are you sure you want to create this service?"
        }
        onConfirm={() => {
          if (confirmType === "cancel") {
            setShowConfirm(false);
            setConfirmType(null);
            router.back();
          } else if (confirmType === "create") {
            handleCreateService();
          }
        }}
        onCancel={() => {
          setShowConfirm(false);
          setConfirmType(null);
        }}
      />
            </form>
          </Card>
        </div>
      </main>
    </div>
  );
}

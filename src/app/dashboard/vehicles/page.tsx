"use client";

import type React from "react";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/dashboard-layout";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

const API_BASE_URL = "http://localhost:8000/api";

interface Vehicle {
  id: number;
  model: string;
  year: number;
  licensePlate: string;
}

export default function VehiclesPage() {
  const router = useRouter();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    model: "",
    year: new Date().getFullYear(),
    licensePlate: "",
  });

  useEffect(() => {
    fetchVehicles();
  }, []);

  const fetchVehicles = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/vehicles`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) setVehicles(await response.json());
    } catch (err) {
      console.error("Error fetching vehicles:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddVehicle = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem("token");

    try {
      const response = await fetch(`${API_BASE_URL}/vehicles`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setFormData({
          model: "",
          year: new Date().getFullYear(),
          licensePlate: "",
        });
        setShowForm(false);
        fetchVehicles();
      }
    } catch (err) {
      console.error("Error adding vehicle:", err);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="text-center py-12 text-gray-500">
          Loading vehicles...
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div>
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Vehicles</h1>
          <button
            onClick={() => setShowForm(!showForm)}
            className="px-4 py-2 rounded-md bg-indigo-600 hover:bg-indigo-700 text-white cursor-pointer"
          >
            + Add Vehicle
          </button>
        </div>

        {showForm && (
          <form
            onSubmit={handleAddVehicle}
            className="bg-white rounded-lg p-6 mb-8 border border-gray-200"
          >
            <h2 className="text-lg font-semibold mb-4">Add New Vehicle</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <Input
                type="text"
                placeholder="Model"
                value={formData.model}
                onChange={(e) =>
                  setFormData({ ...formData, model: e.target.value })
                }
                required
              />
              <Input
                type="number"
                placeholder="Year"
                value={formData.year}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    year: Number.parseInt(e.target.value),
                  })
                }
                required
              />
              <Input
                type="text"
                placeholder="License Plate"
                value={formData.licensePlate}
                onChange={(e) =>
                  setFormData({ ...formData, licensePlate: e.target.value })
                }
                required
              />
            </div>
            <button
              type="submit"
              className="px-4 py-2 rounded-md bg-indigo-600 hover:bg-indigo-700 text-white cursor-pointer"
            >
              Add Vehicle
            </button>
          </form>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {vehicles.length > 0 ? (
            vehicles.map((v) => (
              <div
                key={v.id}
                className="bg-white rounded-lg p-6 border border-gray-200 hover:shadow-md transition-all"
              >
                <h3 className="font-semibold text-lg text-gray-900">
                  {v.year} {v.model}
                </h3>
                <p className="text-gray-600">License Plate: {v.licensePlate}</p>
              </div>
            ))
          ) : (
            <div className="col-span-full text-center py-12 text-gray-500">
              No vehicles added yet
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}

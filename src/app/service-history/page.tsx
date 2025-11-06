"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Appointment, getMyServiceHistory } from "@/lib/api";
import { Sidebar } from "@/components/Sidebar";
import {
  Calendar,
  Clock,
  Car,
  CheckCircle,
  Eye,
  X,
  Wrench,
} from "lucide-react";

export default function ServiceHistoryPage() {
  const router = useRouter();
  const [user, setUser] = useState<{
    firstName?: string;
    lastName?: string;
    email?: string;
    role?: string;
  } | null>(null);
  const [history, setHistory] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedAppointment, setSelectedAppointment] =
    useState<Appointment | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userStr = localStorage.getItem("user");

    if (!token || !userStr) {
      router.push("/login");
      return;
    }

    try {
      const parsedUser = JSON.parse(userStr);
      setUser(parsedUser);

      if (parsedUser.role !== "CUSTOMER") {
        router.push("/dashboard/employee");
        return;
      }
    } catch (err) {
      console.error("Error parsing user:", err);
      router.push("/login");
      return;
    }

    fetchHistory();
  }, [router]);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const data = await getMyServiceHistory();
      setHistory(data);
    } catch (err: any) {
      setError(err.message || "Failed to fetch service history");
    } finally {
      setLoading(false);
    }
  };

  const formatDateTime = (dateTimeStr: string) => {
    const date = new Date(dateTimeStr);
    return date.toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const viewDetails = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setShowDetailsModal(true);
  };

  if (loading) {
    return (
      <div className="flex h-screen">
        {user && <Sidebar role="customer" user={user} />}
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading service history...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-screen">
        {user && <Sidebar role="customer" user={user} />}
        <div className="flex-1 p-6">
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {user && <Sidebar role="customer" user={user} />}
      <div className="flex-1 overflow-auto">
        <div className="p-6">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900">
              Service History
            </h1>
            <p className="text-gray-600 mt-2">
              View your completed service records
            </p>
          </div>

          {history.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-8 text-center">
              <CheckCircle className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">No service history found</p>
              <p className="text-gray-400 mt-2">
                Your completed services will appear here
              </p>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        ID
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Service
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Vehicle
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Completed Time
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {history.map((appointment) => (
                      <tr
                        key={appointment.id}
                        className="hover:bg-gray-50 transition-colors"
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm font-medium text-gray-900">
                            #{appointment.id}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                            <span className="text-sm text-gray-600">
                              {new Date(
                                appointment.appointmentDateTime
                              ).toLocaleDateString()}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <Wrench className="h-4 w-4 text-gray-400 mr-2" />
                            <span className="text-sm font-medium text-gray-900">
                              {appointment.service?.name || "N/A"}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <Car className="h-4 w-4 text-gray-400 mr-2" />
                            <div>
                              <div className="text-sm text-gray-900">
                                {appointment.vehicle?.model}
                              </div>
                              <div className="text-xs text-gray-500">
                                {appointment.vehicle?.licensePlate}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <Clock className="h-4 w-4 text-green-500 mr-2" />
                            <span className="text-sm text-gray-600">
                              {formatDateTime(appointment.appointmentDateTime)}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <button
                            onClick={() => viewDetails(appointment)}
                            className="text-blue-600 hover:text-blue-800 transition-colors"
                          >
                            <Eye className="h-5 w-5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Details Modal */}
        {showDetailsModal && selectedAppointment && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-40">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto relative z-50">
              <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">
                  Appointment Details - #{selectedAppointment.id}
                </h3>
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <div className="px-6 py-4 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-gray-500 uppercase">
                      Service Name
                    </label>
                    <p className="text-sm font-medium text-gray-900">
                      {selectedAppointment.service?.name || "N/A"}
                    </p>
                  </div>

                  <div>
                    <label className="text-xs text-gray-500 uppercase">
                      Status
                    </label>
                    <p className="text-sm">
                      <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800">
                        COMPLETED
                      </span>
                    </p>
                  </div>

                  <div>
                    <label className="text-xs text-gray-500 uppercase">
                      Vehicle
                    </label>
                    <p className="text-sm font-medium text-gray-900">
                      {selectedAppointment.vehicle?.model} -{" "}
                      {selectedAppointment.vehicle?.year}
                    </p>
                    <p className="text-xs text-gray-500">
                      {selectedAppointment.vehicle?.licensePlate}
                    </p>
                  </div>

                  <div>
                    <label className="text-xs text-gray-500 uppercase">
                      Date & Time
                    </label>
                    <p className="text-sm font-medium text-gray-900">
                      {formatDateTime(selectedAppointment.appointmentDateTime)}
                    </p>
                  </div>
                </div>

                {selectedAppointment.technicianNotes && (
                  <div>
                    <label className="text-xs text-gray-500 uppercase">
                      Technician Notes
                    </label>
                    <p className="text-sm text-gray-700 mt-1 bg-gray-50 p-3 rounded">
                      {selectedAppointment.technicianNotes}
                    </p>
                  </div>
                )}

                {selectedAppointment.customerNotes && (
                  <div>
                    <label className="text-xs text-gray-500 uppercase">
                      Your Notes
                    </label>
                    <p className="text-sm text-gray-700 mt-1 bg-gray-50 p-3 rounded">
                      {selectedAppointment.customerNotes}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

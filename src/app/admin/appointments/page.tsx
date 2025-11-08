"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Appointment, getActiveAppointments } from "@/lib/api";
import {
  Calendar,
  Clock,
  Car,
  Eye,
  X,
  Wrench,
  User,
  AlertCircle,
} from "lucide-react";

export default function AdminAppointmentsPage() {
  const router = useRouter();
  const [user, setUser] = useState<{
    firstName?: string;
    lastName?: string;
    email?: string;
    role?: string;
  } | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedAppointment, setSelectedAppointment] =
    useState<Appointment | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showServicesModal, setShowServicesModal] = useState(false);

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

      if (parsedUser.role !== "ADMIN") {
        router.push("/dashboard/customer");
        return;
      }
    } catch (err) {
      console.error("Error parsing user:", err);
      router.push("/login");
      return;
    }

    fetchAppointments();
  }, [router]);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const data = await getActiveAppointments();
      // Sort by date, newest first
      const sorted = data.sort(
        (a, b) =>
          new Date(b.appointmentDateTime).getTime() -
          new Date(a.appointmentDateTime).getTime()
      );
      setAppointments(sorted);
    } catch (err: any) {
      setError(err.message || "Failed to fetch appointments");
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

  const getStatusBadge = (status: string) => {
    const statusStyles: { [key: string]: string } = {
      PENDING: "bg-yellow-100 text-yellow-800",
      SCHEDULED: "bg-blue-100 text-blue-800",
      IN_PROGRESS: "bg-purple-100 text-purple-800",
      AWAITING_PARTS: "bg-orange-100 text-orange-800",
    };

    return (
      <span
        className={`px-3 py-1 rounded-full text-xs font-semibold ${
          statusStyles[status] || "bg-gray-100 text-gray-800"
        }`}
      >
        {status.replace("_", " ")}
      </span>
    );
  };

  const viewDetails = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setShowDetailsModal(true);
  };

  if (loading) {
    return (
      <div className="flex h-screen">
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading appointments...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-screen">
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
      <div className="flex-1 overflow-auto">
        <div className="p-6">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900">
              Active Appointments
            </h1>
            <p className="text-gray-600 mt-2">
              View all active appointments (excluding completed and cancelled)
            </p>
          </div>

          {appointments.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-8 text-center">
              <Calendar className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">
                No active appointments found
              </p>
              <p className="text-gray-400 mt-2">
                All appointments are either completed or cancelled
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
                        Customer
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date & Time
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Service
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Vehicle
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {appointments.map((appointment) => (
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
                            <User className="h-4 w-4 text-gray-400 mr-2" />
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {appointment.vehicle?.owner?.firstName}{" "}
                                {appointment.vehicle?.owner?.lastName}
                              </div>
                              <div className="text-xs text-gray-500">
                                {appointment.vehicle?.owner?.email}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <Clock className="h-4 w-4 text-gray-400 mr-2" />
                            <span className="text-sm text-gray-600">
                              {formatDateTime(appointment.appointmentDateTime)}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          {appointment.services &&
                          appointment.services.length > 0 ? (
                            <div>
                              <div className="flex items-center mb-1">
                                <Wrench className="h-4 w-4 text-gray-400 mr-2" />
                                <span className="text-sm font-medium text-gray-900">
                                  {appointment.services.length} Service
                                  {appointment.services.length > 1
                                    ? "s"
                                    : ""}{" "}
                                  Selected
                                </span>
                              </div>
                              <button
                                onClick={() => {
                                  setSelectedAppointment(appointment);
                                  setShowServicesModal(true);
                                }}
                                className="text-xs text-blue-600 hover:text-blue-800 underline ml-6"
                              >
                                View Services →
                              </button>
                            </div>
                          ) : (
                            <div className="flex items-center">
                              <Wrench className="h-4 w-4 text-gray-400 mr-2" />
                              <span className="text-sm font-medium text-gray-900">
                                {appointment.service?.name || "N/A"}
                              </span>
                            </div>
                          )}
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
                          {appointment.status &&
                            getStatusBadge(appointment.status)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <button
                            onClick={() => viewDetails(appointment)}
                            className="text-blue-600 hover:text-blue-800 transition-colors"
                            title="View Details"
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
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
              {/* Background overlay */}
              <div
                className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75"
                onClick={() => setShowDetailsModal(false)}
              ></div>

              {/* This element is to trick the browser into centering the modal contents. */}
              <span
                className="hidden sm:inline-block sm:align-middle sm:h-screen"
                aria-hidden="true"
              >
                &#8203;
              </span>

              {/* Modal panel */}
              <div className="relative inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-3xl sm:w-full z-50">
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-white">
                      Appointment Details - #{selectedAppointment.id}
                    </h3>
                    <button
                      onClick={() => setShowDetailsModal(false)}
                      className="text-white hover:text-gray-200 transition-colors"
                    >
                      <X className="h-6 w-6" />
                    </button>
                  </div>
                </div>

                {/* Content */}
                <div className="px-6 py-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Appointment Information */}
                    <div className="space-y-4">
                      <h4 className="text-sm font-semibold text-gray-900 uppercase tracking-wider border-b pb-2">
                        Appointment Information
                      </h4>

                      <div>
                        <label className="text-xs text-gray-500 uppercase">
                          Appointment ID
                        </label>
                        <p className="text-sm font-medium text-gray-900">
                          #{selectedAppointment.id}
                        </p>
                      </div>

                      <div>
                        <label className="text-xs text-gray-500 uppercase">
                          Date
                        </label>
                        <p className="text-sm font-medium text-gray-900">
                          {new Date(
                            selectedAppointment.appointmentDateTime
                          ).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </p>
                      </div>

                      <div>
                        <label className="text-xs text-gray-500 uppercase">
                          Time
                        </label>
                        <p className="text-sm font-medium text-gray-900">
                          {new Date(
                            selectedAppointment.appointmentDateTime
                          ).toLocaleTimeString("en-US", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>

                      <div>
                        <label className="text-xs text-gray-500 uppercase">
                          Status
                        </label>
                        <p className="text-sm">
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-semibold ${
                              selectedAppointment.status === "SCHEDULED"
                                ? "bg-blue-100 text-blue-800"
                                : selectedAppointment.status === "IN_PROGRESS"
                                ? "bg-yellow-100 text-yellow-800"
                                : selectedAppointment.status === "COMPLETED"
                                ? "bg-green-100 text-green-800"
                                : "bg-gray-100 text-gray-800"
                            }`}
                          >
                            {selectedAppointment.status}
                          </span>
                        </p>
                      </div>
                    </div>

                    {/* Service Information */}
                    <div className="space-y-4">
                      <h4 className="text-sm font-semibold text-gray-900 uppercase tracking-wider border-b pb-2">
                        Service Information
                      </h4>

                      {selectedAppointment.services &&
                      selectedAppointment.services.length > 0 ? (
                        <div>
                          <label className="text-xs text-gray-500 uppercase">
                            Selected Services (
                            {selectedAppointment.services.length})
                          </label>
                          <div className="mt-2 space-y-2">
                            {selectedAppointment.services.map(
                              (service, index) => (
                                <div
                                  key={service.id}
                                  className="bg-gray-50 p-2 rounded border border-gray-200"
                                >
                                  <p className="text-sm font-medium text-gray-900">
                                    {index + 1}. {service.name}
                                  </p>
                                </div>
                              )
                            )}
                          </div>
                        </div>
                      ) : (
                        <div>
                          <label className="text-xs text-gray-500 uppercase">
                            Service Name
                          </label>
                          <div className="mt-2 bg-gray-50 p-2 rounded border border-gray-200">
                            <p className="text-sm font-medium text-gray-900">
                              {selectedAppointment.service?.name || "N/A"}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Vehicle Information */}
                    <div className="space-y-4">
                      <h4 className="text-sm font-semibold text-gray-900 uppercase tracking-wider border-b pb-2">
                        Vehicle Information
                      </h4>

                      <div>
                        <label className="text-xs text-gray-500 uppercase">
                          Model
                        </label>
                        <p className="text-sm font-medium text-gray-900">
                          {selectedAppointment.vehicle?.model}
                        </p>
                      </div>

                      <div>
                        <label className="text-xs text-gray-500 uppercase">
                          Year
                        </label>
                        <p className="text-sm font-medium text-gray-900">
                          {selectedAppointment.vehicle?.year}
                        </p>
                      </div>

                      <div>
                        <label className="text-xs text-gray-500 uppercase">
                          License Plate
                        </label>
                        <p className="text-sm font-mono font-medium text-gray-900 bg-gray-100 px-2 py-1 rounded inline-block">
                          {selectedAppointment.vehicle?.licensePlate}
                        </p>
                      </div>
                    </div>

                    {/* Customer Information */}
                    <div className="space-y-4">
                      <h4 className="text-sm font-semibold text-gray-900 uppercase tracking-wider border-b pb-2">
                        Customer Information
                      </h4>

                      <div>
                        <label className="text-xs text-gray-500 uppercase">
                          Name
                        </label>
                        <p className="text-sm font-medium text-gray-900">
                          {selectedAppointment.vehicle?.owner?.firstName}{" "}
                          {selectedAppointment.vehicle?.owner?.lastName}
                        </p>
                      </div>

                      <div>
                        <label className="text-xs text-gray-500 uppercase">
                          Email
                        </label>
                        <p className="text-sm text-gray-700">
                          {selectedAppointment.vehicle?.owner?.email}
                        </p>
                      </div>

                      <div>
                        <label className="text-xs text-gray-500 uppercase">
                          Customer Notes
                        </label>
                        {selectedAppointment.customerNotes ? (
                          <p className="text-sm text-gray-700 bg-yellow-50 p-3 rounded border border-yellow-200 mt-1">
                            {selectedAppointment.customerNotes}
                          </p>
                        ) : (
                          <p className="text-sm text-gray-500 italic mt-1">
                            No notes provided
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Assigned Employees Section */}
                  {selectedAppointment.assignedEmployees &&
                    selectedAppointment.assignedEmployees.length > 0 && (
                      <div className="mt-6 pt-6 border-t">
                        <h4 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-3">
                          Assigned Employees
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {selectedAppointment.assignedEmployees.map((emp) => (
                            <span
                              key={emp.id}
                              className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium"
                            >
                              {emp.firstName} {emp.lastName}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                  {/* Additional Information */}
                  {(selectedAppointment.createdAt ||
                    selectedAppointment.updatedAt ||
                    selectedAppointment.technicianNotes) && (
                    <div className="mt-6 pt-6 border-t">
                      <h4 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-3">
                        Additional Information
                      </h4>
                      <div className="grid grid-cols-2 gap-4">
                        {selectedAppointment.createdAt && (
                          <div>
                            <label className="text-xs text-gray-500 uppercase">
                              Created At
                            </label>
                            <p className="text-sm text-gray-700">
                              {new Date(
                                selectedAppointment.createdAt
                              ).toLocaleString("en-US", {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </p>
                          </div>
                        )}
                        {selectedAppointment.updatedAt && (
                          <div>
                            <label className="text-xs text-gray-500 uppercase">
                              Last Updated
                            </label>
                            <p className="text-sm text-gray-700">
                              {new Date(
                                selectedAppointment.updatedAt
                              ).toLocaleString("en-US", {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </p>
                          </div>
                        )}
                      </div>
                      {selectedAppointment.technicianNotes && (
                        <div className="mt-4">
                          <label className="text-xs text-gray-500 uppercase">
                            Technician Notes
                          </label>
                          <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded border border-gray-200 mt-1">
                            {selectedAppointment.technicianNotes}
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Footer */}
                <div className="bg-gray-50 px-6 py-4 flex justify-end space-x-3">
                  <button
                    onClick={() => setShowDetailsModal(false)}
                    className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Services Modal */}
        {showServicesModal && selectedAppointment && (
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
              {/* Background overlay */}
              <div
                className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75"
                onClick={() => setShowServicesModal(false)}
              ></div>

              {/* This element is to trick the browser into centering the modal contents. */}
              <span
                className="hidden sm:inline-block sm:align-middle sm:h-screen"
                aria-hidden="true"
              >
                &#8203;
              </span>

              {/* Modal panel */}
              <div className="relative inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full z-50">
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-white">
                      Selected Services
                    </h3>
                    <button
                      onClick={() => setShowServicesModal(false)}
                      className="text-white hover:text-gray-200 transition-colors"
                    >
                      <X className="h-6 w-6" />
                    </button>
                  </div>
                </div>

                {/* Content */}
                <div className="px-6 py-6">
                  {selectedAppointment.services &&
                  selectedAppointment.services.length > 0 ? (
                    <div className="space-y-2">
                      {selectedAppointment.services.map((service, index) => (
                        <div
                          key={service.id}
                          className="bg-gray-50 p-3 rounded border border-gray-200"
                        >
                          <p className="text-sm font-medium text-gray-900">
                            {index + 1}. {service.name}
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="bg-gray-50 p-3 rounded border border-gray-200">
                      <p className="text-sm font-medium text-gray-900">
                        {selectedAppointment.service?.name || "N/A"}
                      </p>
                    </div>
                  )}
                </div>

                {/* Footer */}
                <div className="bg-gray-50 px-6 py-4 flex justify-end">
                  <button
                    onClick={() => setShowServicesModal(false)}
                    className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

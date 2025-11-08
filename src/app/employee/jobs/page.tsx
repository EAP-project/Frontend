"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getMyInProgressAppointments, Appointment } from "@/lib/api";
import { Card } from "@/components/ui/card";
import {
  Calendar,
  Clock,
  Car,
  FileText,
  Eye,
  X,
  ChevronDown,
} from "lucide-react";

export default function MyJobsPage() {
  const router = useRouter();
  const [user, setUser] = useState<{
    firstName?: string;
    lastName?: string;
    email?: string;
    role?: string;
  } | null>(null);
  const [inProgressAppointments, setInProgressAppointments] = useState<
    Appointment[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [selectedAppointment, setSelectedAppointment] =
    useState<Appointment | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showServicesModal, setShowServicesModal] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [pendingStatus, setPendingStatus] = useState("");
  const [pendingAppointmentId, setPendingAppointmentId] = useState<
    number | null
  >(null);

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

      if (parsedUser.role !== "EMPLOYEE" && parsedUser.role !== "ADMIN") {
        router.push("/dashboard/customer");
        return;
      }
    } catch (error) {
      console.error("Failed to parse user:", error);
      router.push("/login");
      return;
    }

    loadData();
  }, [router]);

  const loadData = async () => {
    try {
      setLoading(true);
      const inProgress = await getMyInProgressAppointments();
      setInProgressAppointments(inProgress);
      setError(null);
    } catch (err) {
      console.error("Failed to load data:", err);
      setError(err instanceof Error ? err.message : "Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateTime: string) => {
    const date = new Date(dateTime);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatTime = (dateTime: string) => {
    const date = new Date(dateTime);
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatDateTime = (dateTime: string) => {
    const date = new Date(dateTime);
    return date.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleViewDetails = (appointment: Appointment) => {
    console.log("View details clicked for appointment:", appointment);
    setSelectedAppointment(appointment);
    setShowDetailsModal(true);
    console.log("Modal should be visible now. showDetailsModal:", true);
  };

  const closeModal = () => {
    setShowDetailsModal(false);
    setSelectedAppointment(null);
  };

  interface ConfirmationModalProps {
    isOpen: boolean;
    message: string;
    onConfirm: () => void;
    onCancel: () => void;
  }

  const ConfirmationModal = ({
    isOpen,
    message,
    onConfirm,
    onCancel,
  }: ConfirmationModalProps) => {
    if (!isOpen) return null;

    return (
      <div className="fixed inset-0 bg-transparent backdrop-blur-sm flex items-center justify-center z-50">
        <div className="bg-white/90 p-6 rounded-lg shadow-xl w-80 border border-gray-200">
          <p className="text-sm font-medium text-gray-700 mb-4">{message}</p>

          <div className="flex justify-end gap-3">
            <button
              onClick={onCancel}
              className="px-3 py-1.5 text-sm rounded-md bg-gray-200 hover:bg-gray-300"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              className="px-3 py-1.5 text-sm rounded-md text-white bg-blue-600 hover:bg-blue-700"
            >
              Confirm
            </button>
          </div>
        </div>
      </div>
    );
  };

  const confirmStatusChange = async () => {
    if (!pendingAppointmentId) return;

    setShowConfirm(false);

    try {
      setActionLoading(pendingAppointmentId);

      const token = localStorage.getItem("token");
      const response = await fetch(
        `http://localhost:8080/api/appointments/${pendingAppointmentId}/status`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ status: pendingStatus }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update status");
      }

      await loadData();
    } catch (err) {
      console.error("Failed to update status:", err);
      setError(err instanceof Error ? err.message : "Failed to update status");
    } finally {
      setActionLoading(null);
      setPendingAppointmentId(null);
      setPendingStatus("");
    }
  };

  // Removed handleStatusChange as it's replaced by confirmStatusChange

  if (!user || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">
          Welcome, {user.firstName} {user.lastName}
        </h1>
        <p className="text-gray-600 mt-2">Employee Dashboard</p>
      </div>

      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* In-Progress Appointments */}
      <div>
        <div className="mb-4">
          <h2 className="text-xl font-semibold text-gray-800">
            My Jobs (In Progress)
          </h2>
          <p className="text-gray-600 text-sm mt-1">
            Appointments you are currently working on
          </p>
        </div>

        {inProgressAppointments.length === 0 ? (
          <Card className="p-8 text-center">
            <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <p className="text-gray-600">No jobs in progress</p>
            <p className="text-gray-500 text-sm mt-2">
              Accept scheduled appointments from the dashboard to start working
              on them
            </p>
          </Card>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden">
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
                    Time
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Service
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Vehicle Model
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Vehicle Number
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Details
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {inProgressAppointments.map((appointment) => (
                  <tr key={appointment.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      #{appointment.id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                        <span className="text-sm text-gray-900">
                          {formatDate(appointment.appointmentDateTime)}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 text-gray-400 mr-2" />
                        <span className="text-sm text-gray-900">
                          {formatTime(appointment.appointmentDateTime)}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {appointment.services &&
                      appointment.services.length > 1 ? (
                        <div className="flex flex-col gap-1">
                          <div className="text-sm font-medium text-gray-900">
                            {appointment.services.length} Services Selected
                          </div>
                          <button
                            onClick={() => {
                              setSelectedAppointment(appointment);
                              setShowServicesModal(true);
                            }}
                            className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1 w-fit"
                          >
                            View Services →
                          </button>
                        </div>
                      ) : (
                        <div className="text-sm font-medium text-gray-900">
                          {appointment.services?.[0]?.name ||
                            appointment.service?.name ||
                            "N/A"}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Car className="h-4 w-4 text-gray-400 mr-2" />
                        <span className="text-sm text-gray-900">
                          {appointment.vehicle.model}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-mono text-gray-900 bg-gray-100 px-2 py-1 rounded">
                        {appointment.vehicle.licensePlate}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <button
                        onClick={() => handleViewDetails(appointment)}
                        className="inline-flex items-center p-2 text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
                        title="View Details"
                      >
                        <Eye className="h-5 w-5" />
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="relative inline-block text-left">
                        <select
                          value={appointment.status}
                          onChange={(e) => {
                            setPendingStatus(e.target.value);
                            setPendingAppointmentId(appointment.id);
                            setShowConfirm(true);
                          }}
                          disabled={actionLoading === appointment.id}
                          className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-xs font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                        >
                          <option value="IN_PROGRESS">In Progress</option>
                          <option value="AWAITING_PARTS">Awaiting Parts</option>
                          <option value="COMPLETED">Completed</option>
                        </select>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
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
              onClick={closeModal}
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
                    Job Details - #{selectedAppointment.id}
                  </h3>
                  <button
                    onClick={closeModal}
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
                        {formatDate(selectedAppointment.appointmentDateTime)}
                      </p>
                    </div>

                    <div>
                      <label className="text-xs text-gray-500 uppercase">
                        Time
                      </label>
                      <p className="text-sm font-medium text-gray-900">
                        {formatTime(selectedAppointment.appointmentDateTime)}
                      </p>
                    </div>

                    <div>
                      <label className="text-xs text-gray-500 uppercase">
                        Status
                      </label>
                      <p className="text-sm">
                        <span className="px-2 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-800">
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

                    <div>
                      <label className="text-xs text-gray-500 uppercase">
                        Service Name
                      </label>
                      <p className="text-sm font-medium text-gray-900">
                        {selectedAppointment.service?.name || "N/A"}
                      </p>
                    </div>

                    {selectedAppointment.service?.description && (
                      <div>
                        <label className="text-xs text-gray-500 uppercase">
                          Description
                        </label>
                        <p className="text-sm text-gray-700">
                          {selectedAppointment.service.description}
                        </p>
                      </div>
                    )}

                    {selectedAppointment.service?.estimatedCost && (
                      <div>
                        <label className="text-xs text-gray-500 uppercase">
                          Estimated Cost
                        </label>
                        <p className="text-sm font-medium text-green-600">
                          ${selectedAppointment.service.estimatedCost}
                        </p>
                      </div>
                    )}

                    {selectedAppointment.service?.estimatedDurationMinutes && (
                      <div>
                        <label className="text-xs text-gray-500 uppercase">
                          Estimated Duration
                        </label>
                        <p className="text-sm font-medium text-gray-900">
                          {selectedAppointment.service.estimatedDurationMinutes}{" "}
                          minutes
                        </p>
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
                        {selectedAppointment.vehicle.model}
                      </p>
                    </div>

                    <div>
                      <label className="text-xs text-gray-500 uppercase">
                        Year
                      </label>
                      <p className="text-sm font-medium text-gray-900">
                        {selectedAppointment.vehicle.year}
                      </p>
                    </div>

                    <div>
                      <label className="text-xs text-gray-500 uppercase">
                        License Plate
                      </label>
                      <p className="text-sm font-mono font-medium text-gray-900 bg-gray-100 px-2 py-1 rounded inline-block">
                        {selectedAppointment.vehicle.licensePlate}
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
                        {selectedAppointment.vehicle.owner?.firstName}{" "}
                        {selectedAppointment.vehicle.owner?.lastName}
                      </p>
                    </div>

                    <div>
                      <label className="text-xs text-gray-500 uppercase">
                        Email
                      </label>
                      <p className="text-sm text-gray-700">
                        {selectedAppointment.vehicle.owner?.email}
                      </p>
                    </div>

                    {selectedAppointment.customerNotes && (
                      <div>
                        <label className="text-xs text-gray-500 uppercase">
                          Customer Notes
                        </label>
                        <p className="text-sm text-gray-700 bg-yellow-50 p-3 rounded border border-yellow-200">
                          {selectedAppointment.customerNotes}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Additional Information */}
                {(selectedAppointment.createdAt ||
                  selectedAppointment.updatedAt) && (
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
                            {formatDateTime(selectedAppointment.createdAt)}
                          </p>
                        </div>
                      )}
                      {selectedAppointment.updatedAt && (
                        <div>
                          <label className="text-xs text-gray-500 uppercase">
                            Last Updated
                          </label>
                          <p className="text-sm text-gray-700">
                            {formatDateTime(selectedAppointment.updatedAt)}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="bg-gray-50 px-6 py-4 flex justify-end space-x-3">
                <button
                  onClick={closeModal}
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[80vh] overflow-y-auto">
            {/* Header */}
            <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-4 flex justify-between items-center">
              <h3 className="text-xl font-bold">Selected Services</h3>
              <button
                onClick={() => {
                  setShowServicesModal(false);
                  setSelectedAppointment(null);
                }}
                className="text-white hover:bg-white/20 rounded-full p-1 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Services List */}
            <div className="p-6">
              <div className="space-y-3">
                {selectedAppointment.services &&
                selectedAppointment.services.length > 0 ? (
                  selectedAppointment.services.map((service, index) => (
                    <div
                      key={service.id}
                      className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200 hover:border-blue-300 transition-colors"
                    >
                      <div className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-semibold">
                        {index + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900">
                          {service.name}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-4">
                    <p className="text-gray-500 text-sm">No services found</p>
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="bg-gray-50 px-6 py-4 flex justify-end">
              <button
                onClick={() => {
                  setShowServicesModal(false);
                  setSelectedAppointment(null);
                }}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      <ConfirmationModal
        isOpen={showConfirm}
        message={`Are you sure you want to change status to "${pendingStatus.replace(
          "_",
          " "
        )}"?`}
        onConfirm={confirmStatusChange}
        onCancel={() => setShowConfirm(false)}
      />
    </div>
  );
}

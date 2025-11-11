"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import { getAllTimeLogs, TimeLog } from "@/lib/api";
import Skeleton from "@/components/ui/Skeleton";
import { Clock, Calendar, Car, FileText, User } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export default function AdminTimeLogsPage() {
  const router = useRouter();
  const { user, token, initialized } = useAuth();
  const [timeLogs, setTimeLogs] = useState<TimeLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentTime, setCurrentTime] = useState(new Date());
  const [filterEmployee, setFilterEmployee] = useState<string>("");

  const fetchTimeLogs = useCallback(async () => {
    try {
      setLoading(true);
      const logs = await getAllTimeLogs();
      setTimeLogs(logs);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to fetch time logs");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!initialized) return;

    if (!user || !token) {
      router.push("/login");
      return;
    }

    if (user.role !== "ADMIN") {
      router.push("/dashboard/customer");
      return;
    }

    fetchTimeLogs();

    // Update current time every second for live duration calculation
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(interval);
  }, [initialized, user, token, router, fetchTimeLogs]);

  const formatDateTime = useCallback((dateTimeStr: string) => {
    const date = new Date(dateTimeStr);
    return date.toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }, []);

  // Calculate live duration for ongoing logs
  const calculateDuration = (log: TimeLog): string => {
    if (log.endTime) {
      // Completed log - use the formatted duration from backend
      return log.formattedDuration || "00:00:00";
    } else {
      // Ongoing log - calculate live duration
      const startTime = new Date(log.startTime);
      const diffMs = currentTime.getTime() - startTime.getTime();
      const totalSeconds = Math.floor(diffMs / 1000);

      const hours = Math.floor(totalSeconds / 3600);
      const minutes = Math.floor((totalSeconds % 3600) / 60);
      const seconds = totalSeconds % 60;

      return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(
        2,
        "0"
      )}:${String(seconds).padStart(2, "0")}`;
    }
  };

  // Calculate total time logged (including ongoing)
  const calculateTotalDuration = (): string => {
    let totalSeconds = 0;

    timeLogs.forEach((log) => {
      if (log.endTime) {
        // Completed log
        const startTime = new Date(log.startTime);
        const endTime = new Date(log.endTime);
        const diffMs = endTime.getTime() - startTime.getTime();
        totalSeconds += Math.floor(diffMs / 1000);
      } else {
        // Ongoing log
        const startTime = new Date(log.startTime);
        const diffMs = currentTime.getTime() - startTime.getTime();
        totalSeconds += Math.floor(diffMs / 1000);
      }
    });

    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(
      2,
      "0"
    )}:${String(seconds).padStart(2, "0")}`;
  };

  // Memoize unique employees list to avoid recalculating on every render
  const uniqueEmployees = useMemo(() => {
    const employees = new Set<string>();
    timeLogs.forEach((log) => {
      employees.add(`${log.employeeFirstName} ${log.employeeLastName}`);
    });
    return Array.from(employees).sort();
  }, [timeLogs]);

  // Memoize filtered time logs
  const filteredTimeLogs = useMemo(() => {
    if (!filterEmployee) return timeLogs;
    return timeLogs.filter(
      (log) =>
        `${log.employeeFirstName} ${log.employeeLastName}` === filterEmployee
    );
  }, [timeLogs, filterEmployee]);

  // Calculate total for filtered logs
  const calculateFilteredTotalDuration = (): string => {
    let totalSeconds = 0;

    filteredTimeLogs.forEach((log) => {
      if (log.endTime) {
        const startTime = new Date(log.startTime);
        const endTime = new Date(log.endTime);
        const diffMs = endTime.getTime() - startTime.getTime();
        totalSeconds += Math.floor(diffMs / 1000);
      } else {
        const startTime = new Date(log.startTime);
        const diffMs = currentTime.getTime() - startTime.getTime();
        totalSeconds += Math.floor(diffMs / 1000);
      }
    });

    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(
      2,
      "0"
    )}:${String(seconds).padStart(2, "0")}`;
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <div className="flex-1 overflow-auto">
        <div className="p-6">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900">
              All Employee Time Logs
            </h1>
            <p className="text-gray-600 mt-2">
              View time logs for all employees across all appointments
            </p>
          </div>

          {/* Error Message - Inline */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
              {error}
            </div>
          )}

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {loading ? (
              Array.from({ length: 3 }).map((_, index) => (
                <div key={index} className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <Skeleton lines={1} className="w-24 h-4 mb-2" />
                      <Skeleton lines={1} className="w-16 h-8" />
                    </div>
                    <Skeleton variant="circle" className="h-8 w-8" />
                  </div>
                </div>
              ))
            ) : (
              <>
                <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Total Time Logs</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {timeLogs.length}
                      </p>
                    </div>
                    <Clock className="h-8 w-8 text-blue-500" />
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Active Employees</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {uniqueEmployees.length}
                      </p>
                    </div>
                    <User className="h-8 w-8 text-green-500" />
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Total Time Logged</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {calculateTotalDuration()}
                      </p>
                    </div>
                    <Clock className="h-8 w-8 text-purple-500" />
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Filter */}
          <div className="bg-white rounded-lg shadow p-4 mb-6">
            <div className="flex items-center gap-4">
              <label className="text-sm font-medium text-gray-700">
                Filter by Employee:
              </label>
              <select
                value={filterEmployee}
                onChange={(e) => setFilterEmployee(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Employees</option>
                {uniqueEmployees.map((employee) => (
                  <option key={employee} value={employee}>
                    {employee}
                  </option>
                ))}
              </select>
              {filterEmployee && (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">
                    Showing {filteredTimeLogs.length} logs • Total:{" "}
                    {calculateFilteredTotalDuration()}
                  </span>
                  <button
                    onClick={() => setFilterEmployee("")}
                    className="text-sm text-blue-600 hover:text-blue-800"
                  >
                    Clear
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Time Logs Table */}
          {loading ? (
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Employee
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Service
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Vehicle
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Start Time
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        End Time
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Duration
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Notes
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {Array.from({ length: 5 }).map((_, index) => (
                      <tr key={index}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Skeleton lines={2} className="w-36" />
                        </td>
                        <td className="px-6 py-4">
                          <Skeleton lines={1} className="w-32 h-4" />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Skeleton lines={2} className="w-28" />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Skeleton lines={1} className="w-36 h-4" />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Skeleton lines={1} className="w-36 h-4" />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Skeleton lines={1} className="w-20 h-4" />
                        </td>
                        <td className="px-6 py-4">
                          <Skeleton lines={1} className="w-24 h-4" />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : filteredTimeLogs.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-8 text-center">
              <Clock className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">No time logs found</p>
              <p className="text-gray-400 mt-2">
                Time logs will appear here once employees start tracking time
              </p>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Employee
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Service
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Vehicle
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Start Time
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        End Time
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Duration
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Notes
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredTimeLogs.map((log) => (
                      <tr
                        key={log.id}
                        className="hover:bg-gray-50 transition-colors"
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <User className="h-4 w-4 text-gray-400 mr-2" />
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {log.employeeFirstName} {log.employeeLastName}
                              </div>
                              <div className="text-xs text-gray-500">
                                {log.employeeEmail}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <FileText className="h-4 w-4 text-gray-400 mr-2" />
                            <span className="text-sm text-gray-900">
                              {log.serviceName || "N/A"}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <Car className="h-4 w-4 text-gray-400 mr-2" />
                            <div>
                              <div className="text-sm text-gray-900">
                                {log.vehicleModel}
                              </div>
                              <div className="text-xs text-gray-500">
                                {log.vehicleNumber}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                            <span className="text-sm text-gray-600">
                              {formatDateTime(log.startTime)}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {log.endTime ? (
                            <div className="flex items-center">
                              <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                              <span className="text-sm text-gray-600">
                                {formatDateTime(log.endTime)}
                              </span>
                            </div>
                          ) : (
                            <span className="text-sm text-yellow-600 font-medium">
                              In Progress
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <Clock className="h-4 w-4 text-gray-400 mr-2" />
                            {log.endTime ? (
                              <span className="text-sm font-mono text-gray-900">
                                {calculateDuration(log)}
                              </span>
                            ) : (
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-mono text-yellow-600 animate-pulse">
                                  {calculateDuration(log)}
                                </span>
                                <span className="text-xs text-yellow-600 font-semibold">
                                  LIVE
                                </span>
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm text-gray-600">
                            {log.notes || "-"}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getMyTimeLogs, TimeLog } from "@/lib/api";
import { Sidebar } from "@/components/Sidebar";
import { Clock, Calendar, Car, FileText } from "lucide-react";

export default function TimeLogsPage() {
  const router = useRouter();
  const [user, setUser] = useState<{
    firstName?: string;
    lastName?: string;
    email?: string;
    role?: string;
  } | null>(null);
  const [timeLogs, setTimeLogs] = useState<TimeLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentTime, setCurrentTime] = useState(new Date());

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
    } catch (err) {
      console.error("Error parsing user:", err);
      router.push("/login");
      return;
    }

    fetchTimeLogs();

    // Update current time every second for live duration calculation
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(interval);
  }, [router]);

  const fetchTimeLogs = async () => {
    try {
      setLoading(true);
      const logs = await getMyTimeLogs();
      setTimeLogs(logs);
    } catch (err: any) {
      setError(err.message || "Failed to fetch time logs");
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
        // Completed log - calculate from start and end times
        const startTime = new Date(log.startTime);
        const endTime = new Date(log.endTime);
        const diffMs = endTime.getTime() - startTime.getTime();
        totalSeconds += Math.floor(diffMs / 1000);
      } else {
        // Ongoing log - calculate from start time to now
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

  if (loading) {
    return (
      <div className="flex h-screen">
        {user && <Sidebar role="employee" user={user} />}
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading time logs...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-screen">
        {user && <Sidebar role="employee" user={user} />}
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
      {user && <Sidebar role="employee" user={user} />}
      <div className="flex-1 overflow-auto">
        {/* Main content */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">My Time Logs</h1>
          <p className="text-gray-600 mt-2">
            Track your work time on appointments
          </p>
        </div>

        {/* Total Time Summary */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg p-6 mb-6 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold mb-2">Total Time Logged</h2>
              <p className="text-4xl font-bold">{calculateTotalDuration()}</p>
              <p className="text-sm mt-2 opacity-90">
                {timeLogs.length} {timeLogs.length === 1 ? "entry" : "entries"}
                {timeLogs.some((log) => !log.endTime) && (
                  <span className="ml-2 bg-yellow-400 text-blue-900 px-2 py-1 rounded-full text-xs font-semibold">
                    Live
                  </span>
                )}
              </p>
            </div>
            <Clock className="h-16 w-16 opacity-50" />
          </div>
        </div>

        {timeLogs.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <Clock className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">No time logs found</p>
            <p className="text-gray-400 mt-2">
              Start working on appointments to track your time
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Appointment ID
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
                  {timeLogs.map((log) => (
                    <tr
                      key={log.id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-medium text-gray-900">
                          #{log.appointmentId}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <FileText className="h-4 w-4 text-gray-400 mr-2" />
                          <span className="text-sm text-gray-900">
                            {log.serviceName}
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
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                          <span className="text-sm text-gray-600">
                            {log.endTime ? (
                              formatDateTime(log.endTime)
                            ) : (
                              <span className="text-yellow-600 font-semibold">
                                In Progress
                              </span>
                            )}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <Clock
                            className={`h-4 w-4 mr-2 ${
                              !log.endTime ? "text-yellow-500" : "text-blue-500"
                            }`}
                          />
                          {!log.endTime ? (
                            <div className="flex items-center gap-2">
                              <span className="text-lg font-mono font-semibold text-yellow-600 animate-pulse">
                                {calculateDuration(log)}
                              </span>
                              <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full font-semibold">
                                LIVE
                              </span>
                            </div>
                          ) : (
                            <span className="text-lg font-mono font-semibold text-blue-600">
                              {calculateDuration(log)}
                            </span>
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
  );
}

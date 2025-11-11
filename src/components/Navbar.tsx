"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { Bell, LogOut, Menu } from "lucide-react";
import { useRouter, usePathname } from "next/navigation";
import SockJS from "sockjs-client";
import { getScheduledAppointments } from "../lib/api";
import { Client, StompSubscription } from "@stomp/stompjs";
import { useNotifications } from "@/context/NotificationsContext";
import { useAuth } from "@/context/AuthContext";

interface NavbarProps {
  user?: {
    firstName?: string;
    lastName?: string;
    email?: string;
    role?: string;
    id?: string;
  };
  onMenuClick?: () => void;
}

interface Notification {
  id: string;
  title: string;
  message: string;
  appointmentId: string;
  notificationType: string;
  targetRole: string;
  timestamp: number;
  read: boolean;
  type: "info" | "success" | "warning" | "error";
}

export function Navbar({ user, onMenuClick }: NavbarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [pageHeading, setPageHeading] = useState<string>("");
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const stompClient = useRef<Client | null>(null);
  const subscriptionsRef = useRef<StompSubscription[] | null>(null);

  // Global notifications (persist across routes)
  const ctx = useNotifications();
  const auth = useAuth();

  const notificationsToShow = (ctx?.notifications as unknown as Notification[]) ?? notifications;
  const displayConnected = ctx?.isConnected ?? isConnected;
  const unreadCount = ctx?.unreadCount ?? notificationsToShow.filter((n) => !n.read).length;


  // Helper to derive possible topics for each role (subscribe to multiple to cover backend naming)
  const getSubscriptionTopics = useCallback(() => {
    const role = user?.role?.toUpperCase();
    switch (role) {
      case "EMPLOYEE":
        return [
          "/topic/employee/appointments",
          "/topic/notifications/employee",
          "/topic/employee/notifications",
        ];
      case "CUSTOMER":
        return [
          "/topic/customer/appointments",
          "/topic/notifications/customer",
        ];
      case "ADMIN":
        return [
          "/topic/admin/notifications",
          "/topic/notifications/admin",
        ];
      default:
        return ["/topic/notifications"];
    }
  }, [user?.role]);



  const initializeWebSocket = useCallback(() => {
    try {
      // Clean up existing connection
      if (stompClient.current) {
        stompClient.current.deactivate();
      }

      const topics = getSubscriptionTopics();
      console.log("🔔 Subscribing to topics:", topics, "for role:", user?.role);

      // Create STOMP client with SockJS
      // Backend WebSocket endpoint - change this if backend is on a different host
      const WS_URL = process.env.NEXT_PUBLIC_WS_URL || 'http://localhost:8080/ws';

      stompClient.current = new Client({
        webSocketFactory: () => new SockJS(WS_URL),
        reconnectDelay: 5000,
        heartbeatIncoming: 4000,
        heartbeatOutgoing: 4000,

        onConnect: (frame) => {
          console.log("✅ Connected to WebSocket via STOMP:", frame);
          setIsConnected(true);

          // Subscribe to all relevant topics for the role
          subscriptionsRef.current = [];
          topics.forEach(topic => {
            const sub = stompClient.current?.subscribe(topic, (message) => {
              try {
                const data = JSON.parse(message.body || "{}");
                const newNotification: Notification = {
                  id: data.id || data.appointmentId || `notification-${Date.now()}`,
                  title: data.title || "New Notification",
                  message: data.message || data.content || "You have a new notification",
                  appointmentId: data.appointmentId || "",
                  notificationType: data.notificationType || "INFO",
                  targetRole: (data.targetRole || user?.role || "").toUpperCase(),
                  timestamp: data.timestamp || Date.now(),
                  read: false,
                  type: mapNotificationType(data.notificationType)
                };
                // Accept messages received on subscribed topics without extra filtering
                setNotifications(prev => [newNotification, ...prev.slice(0, 49)]);
              } catch (error) {
                console.error("❌ Error parsing notification:", error, "raw:", message.body);
              }
            });
            if (sub) {
              subscriptionsRef.current?.push(sub);
              console.log(`✅ Subscribed to ${topic}`);
            }
          });
        },

        onStompError: (frame) => {
          console.error("❌ STOMP error:", frame);
          setIsConnected(false);
        },

        onDisconnect: () => {
          console.log("🔌 WebSocket disconnected");
          setIsConnected(false);
        },

        onWebSocketClose: (event) => {
          console.log("🔌 WebSocket connection closed:", event);
          setIsConnected(false);
        },

        onWebSocketError: (error) => {
          console.error("❌ WebSocket error:", error);
          setIsConnected(false);
        }
      });

      // Activate the connection
      stompClient.current.activate();
      console.log("🚀 Activating WebSocket connection...");

    } catch (error) {
      console.error("❌ Failed to initialize WebSocket:", error);
      setIsConnected(false);
    }
  }, [user?.role, getSubscriptionTopics]);

  // Effect to (re)initialize websocket after callback declared
  useEffect(() => {
    if (ctx) return; // Provider manages websocket globally
    if (!user?.role) {
      console.log("⏳ Waiting for user role...");
      return;
    }
    console.log(`🔄 Setting up WebSocket for role: ${user.role}`);
    initializeWebSocket();
    return () => {
      console.log("🧹 Cleaning up WebSocket connection");
      try {
        if (subscriptionsRef.current) {
          subscriptionsRef.current.forEach(s => { try { s.unsubscribe(); } catch { } });
          subscriptionsRef.current = null;
        }
      } catch (e) {
        console.warn("Error while unsubscribing:", e);
      }
      if (stompClient.current) {
        try { stompClient.current.deactivate(); } catch (e) { console.warn(e); }
        stompClient.current = null;
      }
      setIsConnected(false);
    };
  }, [ctx, initializeWebSocket, user?.role]);

  // Test function removed to avoid unused variable lint error

  // Map backend notification types to frontend types
  const mapNotificationType = (notificationType: string): "info" | "success" | "warning" | "error" => {
    if (!notificationType) return "info";

    switch (notificationType.toUpperCase()) {
      case "NEW_APPOINTMENT":
        return "info";
      case "QUOTE_APPROVED":
      case "APPOINTMENT_ACCEPTED":
      case "APPOINTMENT_COMPLETED":
        return "success";
      case "QUOTE_REJECTED":
      case "APPOINTMENT_CANCELLED":
        return "error";
      case "REMINDER":
      case "URGENT":
        return "warning";
      default:
        return "info";
    }
  };

  const handleLogout = () => {
    console.log("🚪 Logging out - cleaning up WebSocket");
    if (!ctx && stompClient.current) {
      stompClient.current.deactivate();
      stompClient.current = null;
    }
    // Use centralized auth logout
    try {
      auth.logout();
    } catch (e) {
      // If Auth context fails for any reason, log the error and continue
      console.warn("Auth logout failed:", e);
    }
    router.push("/login");
  };

  const markAsRead = (id: string) => {
    if (ctx) return ctx.markAsRead(id);
    setNotifications(
      notifications.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const markAllAsRead = () => {
    if (ctx) return ctx.markAllAsRead();
    setNotifications(notifications.map((n) => ({ ...n, read: true })));
  };

  const clearNotification = (id: string) => {
    if (ctx) return ctx.clearNotification(id);
    setNotifications(notifications.filter((n) => n.id !== id));
  };

  const clearAllNotifications = () => {
    if (ctx) return ctx.clearAllNotifications();
    setNotifications([]);
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case "success":
        return "bg-green-50 border-l-4 border-green-500";
      case "warning":
        return "bg-yellow-50 border-l-4 border-yellow-500";
      case "error":
        return "bg-red-50 border-l-4 border-red-500";
      default:
        return "bg-blue-50 border-l-4 border-blue-500";
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "success":
        return "✅";
      case "warning":
        return "⚠️";
      case "error":
        return "❌";
      default:
        return "ℹ️";
    }
  };

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

    if (diffInMinutes < 1) return "Just now";
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return date.toLocaleDateString();
  };

  const handleNotificationClick = (notification: Notification) => {
    markAsRead(notification.id);

    // Navigate based on notification type
    if (notification.appointmentId && notification.appointmentId !== "test-123") {
      router.push(`/appointments/${notification.appointmentId}`);
    }
  };

  // Debug connection status
  useEffect(() => {
    console.log(`🔔 Connection status: ${displayConnected ? 'Connected' : 'Disconnected'}`);
    console.log(`🔔 Notifications count: ${notificationsToShow.length}`);
    console.log(`🔔 Unread count: ${unreadCount}`);
  }, [displayConnected, notificationsToShow.length, unreadCount]);

  // Catch-up: fetch scheduled appointments after employee logs in to populate notifications if missed while offline
  useEffect(() => {
    if (ctx) return; // Provider already does catch-up
    const role = user?.role?.toUpperCase();
    if (role !== 'EMPLOYEE') return;
    (async () => {
      try {
        const apts = await getScheduledAppointments();
        // Map to notifications, avoid duplicates by checking existing ids
        const existingIds = new Set(notifications.map(n => n.id));
        const mapped: Notification[] = apts.slice(0, 10).map(ap => ({
          id: String(ap.id),
          title: "New Appointment",
          message: `Appointment #${ap.id} scheduled for ${new Date(ap.appointmentDateTime).toLocaleString()}`,
          appointmentId: String(ap.id),
          notificationType: "NEW_APPOINTMENT",
          targetRole: "EMPLOYEE",
          timestamp: Date.now(),
          read: false,
          type: "info" as const,
        })).filter(n => !existingIds.has(n.id));
        if (mapped.length) {
          setNotifications(prev => [...mapped, ...prev].slice(0, 50));
        }
      } catch (e) {
        console.warn('Failed to fetch scheduled appointments for notifications:', e);
      }
    })();
  }, [ctx, user?.role, notifications]);

  // Extract and sync page heading into navbar on navigation/content changes
  useEffect(() => {
    const findHeading = (): string => {
      if (typeof document === "undefined") return "";
      const mainEl = document.querySelector("main");
      if (!mainEl) return "";
      const explicit = mainEl.querySelector<HTMLElement>("[data-page-title]");
      if (explicit?.innerText?.trim()) return explicit.innerText.trim();
      const h1 = mainEl.querySelector<HTMLElement>("h1");
      if (h1?.innerText?.trim()) return h1.innerText.trim();
      const h2 = mainEl.querySelector<HTMLElement>("h2");
      if (h2?.innerText?.trim()) return h2.innerText.trim();
      return "";
    };
    setPageHeading(findHeading());
    const mainEl = document.querySelector("main");
    if (!mainEl) return;
    const observer = new MutationObserver(() => {
      const next = findHeading();
      setPageHeading((prev) => (prev !== next ? next : prev));
    });
    observer.observe(mainEl, { childList: true, subtree: true, characterData: true });
    return () => observer.disconnect();
  }, [pathname]);

  const navHeading = useMemo(() => {
    if (pathname?.startsWith("/dashboard/customer")) {
      const first = user?.firstName?.trim();
      return `Welcome, ${first && first.length ? first : "User"}`;
    }
    return pageHeading;
  }, [pathname, user?.firstName, pageHeading]);

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left Side - Menu Button (Mobile) & Title */}
          <div className="flex items-center gap-4">

            <button
              onClick={() => onMenuClick?.()}
              className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
              aria-label="Toggle menu"
            >
              <Menu className="h-6 w-6 text-gray-600" />
            </button>



            {/* Page heading (from page body or override on dashboard) */}
            {navHeading ? (
              <div className="hidden lg:block ml-4 pl-4 border-l border-gray-200 max-w-xs truncate text-sm font-semibold text-gray-800">
                {navHeading}
              </div>
            ) : null}

            {/* Connection Status Indicator */}
            <div className="flex items-center gap-2 text-xs" title={displayConnected ? "Connected to notifications" : "Disconnected"}>
              <div
                className={`h-2 w-2 rounded-full ${displayConnected ? "bg-green-500 animate-pulse" : "bg-red-500"
                  }`}
              />
              <span className="text-gray-500 hidden md:inline">
                {displayConnected ? "Live" : "Offline"}
              </span>
            </div>



          </div>
          {/* End Left Side */}
          {/* Right Side - Notifications & User Menu */}
          <div className="flex items-center gap-3">
            {/* Notifications Dropdown */}
            <div className="relative">
              <button
                onClick={() => {
                  setShowNotifications(!showNotifications);
                  setShowUserMenu(false);
                }}
                className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors group"
                aria-label="Notifications"
              >
                <Bell className={`h-6 w-6 ${displayConnected ? "text-gray-600" : "text-gray-400"} group-hover:text-blue-600`} />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 h-5 w-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </button>

              {/* Notifications Dropdown Menu */}
              {showNotifications && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setShowNotifications(false)}
                  />

                  <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-lg shadow-xl border border-gray-200 z-20 max-h-96 overflow-hidden flex flex-col">
                    <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          Notifications
                        </h3>
                        <p className="text-xs text-gray-500 mt-1">
                          {displayConnected ? "Real-time updates" : "Reconnecting..."}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        {unreadCount > 0 && (
                          <button
                            onClick={markAllAsRead}
                            className="text-sm text-blue-600 hover:text-blue-700 font-medium px-3 py-1 rounded hover:bg-blue-50"
                          >
                            Mark all read
                          </button>
                        )}
                        {notificationsToShow.length > 0 && (
                          <button
                            onClick={clearAllNotifications}
                            className="text-sm text-gray-500 hover:text-red-600 font-medium px-3 py-1 rounded hover:bg-red-50"
                          >
                            Clear all
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="flex-1 overflow-y-auto">
                      {notificationsToShow.length === 0 ? (
                        <div className="p-8 text-center text-gray-500">
                          <Bell className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                          <p className="font-medium">No notifications</p>
                          <p className="text-sm text-gray-400 mt-1">
                            {isConnected
                              ? "You'll see new appointments here"
                              : "Connecting to notification service..."
                            }
                          </p>
                        </div>
                      ) : (
                        <div className="divide-y divide-gray-100">
                          {notificationsToShow.map((notification) => (
                            <div
                              key={notification.id}
                              className={`p-4 hover:bg-gray-50 cursor-pointer transition-all duration-200 ${getNotificationColor(notification.type)
                                } ${!notification.read ? "ring-1 ring-blue-200" : ""}`}
                              onClick={() => handleNotificationClick(notification)}
                            >
                              <div className="flex items-start gap-3">
                                <div className="text-lg flex-shrink-0">
                                  {getNotificationIcon(notification.type)}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-start justify-between gap-2 mb-1">
                                    <h4 className="text-sm font-semibold text-gray-900">
                                      {notification.title}
                                    </h4>
                                    {!notification.read && (
                                      <div className="h-2 w-2 bg-blue-600 rounded-full flex-shrink-0 mt-1.5" />
                                    )}
                                  </div>
                                  <p className="text-sm text-gray-600 mb-2">
                                    {notification.message}
                                  </p>
                                  <div className="flex items-center justify-between">
                                    <p className="text-xs text-gray-400">
                                      {formatTime(notification.timestamp)}
                                    </p>
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        clearNotification(notification.id);
                                      }}
                                      className="text-xs text-gray-400 hover:text-red-600 px-2 py-1 rounded hover:bg-red-50"
                                    >
                                      Dismiss
                                    </button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {notificationsToShow.length > 0 && (
                      <div className="p-3 border-t border-gray-200 text-center bg-gray-50">
                        <span className="text-sm text-gray-500">
                          {notificationsToShow.length} notification{notificationsToShow.length !== 1 ? 's' : ''}
                          {unreadCount > 0 && ` • ${unreadCount} unread`}
                        </span>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>

            {/* User Menu Dropdown */}
            <div className="relative">
              <button
                onClick={() => {
                  setShowUserMenu(!showUserMenu);
                  setShowNotifications(false);
                }}
                className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-100 transition-colors"
                aria-label="User menu"
              >
                <div className="h-8 w-8 rounded-full bg-gradient-to-br from-purple-600 to-blue-500 flex items-center justify-center text-white font-semibold">
                  {user?.firstName?.charAt(0) || "U"}
                </div>
                <span className="hidden sm:block text-sm font-medium text-gray-700">
                  {user?.firstName || "User"}
                </span>
              </button>

              {showUserMenu && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setShowUserMenu(false)}
                  />

                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 z-20">
                    <div className="p-4 border-b border-gray-200">
                      <p className="text-sm font-semibold text-gray-900">
                        {user?.firstName} {user?.lastName}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {user?.email}
                      </p>
                      <p className="text-xs text-gray-400 mt-1 capitalize">
                        Role: {user?.role?.toLowerCase()}
                      </p>
                    </div>

                    <div className="border-t border-gray-200 py-2">
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                      >
                        <LogOut className="h-4 w-4" />
                        Logout
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}




export default Navbar;
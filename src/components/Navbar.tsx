"use client";

import { useState, useEffect, useRef } from "react";
import { Bell, LogOut, Menu } from "lucide-react";
import { useRouter } from "next/navigation";
import SockJS from "sockjs-client";
import { Client } from "@stomp/stompjs";

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
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const stompClient = useRef<Client | null>(null);

  const unreadCount = notifications.filter((n) => !n.read).length;

  // Get subscription topic based on user role
  const getSubscriptionTopic = () => {
    const role = user?.role?.toUpperCase();
    switch (role) {
      case "EMPLOYEE":
        return "/topic/employee/appointments";
      case "CUSTOMER":
        return "/topic/customer/appointments";
      case "ADMIN":
        return "/topic/admin/notifications";
      default:
        return "/topic/notifications";
    }
  };



  // STOMP WebSocket connection with SockJS
  useEffect(() => {
    initializeWebSocket();
    
    return () => {
      if (stompClient.current) {
        stompClient.current.deactivate();
      }
    };
  }, []);

  const initializeWebSocket = () => {
    try {

      const topic = getSubscriptionTopic();
      console.log(`🔔 Subscribing to topic: ${topic} for role: ${user?.role}`);



      // Create STOMP client with SockJS
      stompClient.current = new Client({
        webSocketFactory: () => new SockJS('http://localhost:8080/ws'),
        reconnectDelay: 5000,
        heartbeatIncoming: 4000,
        heartbeatOutgoing: 4000,
        
        onConnect: (frame) => {
          console.log("Connected to WebSocket via STOMP:", frame);
          setIsConnected(true);
          
          // Subscribe to employee notifications
          stompClient.current?.subscribe(topic, (message) => {
            try {
              const data = JSON.parse(message.body);
              console.log("Received notification:", data);
              
              const newNotification: Notification = {
                id: data.appointmentId || `notification-${Date.now()}`,
                title: data.title,
                message: data.message,
                appointmentId: data.appointmentId,
                notificationType: data.notificationType,
                targetRole: data.targetRole,
                timestamp: data.timestamp || Date.now(),
                read: false,
                type: mapNotificationType(data.notificationType)
              };
              
              // Only add if it's for employees
              if (data.targetRole === "EMPLOYEE") {
                setNotifications(prev => [newNotification, ...prev.slice(0, 49)]);
              }
            } catch (error) {
              console.error("Error parsing notification:", error);
            }
          });
          
          console.log("Subscribed to /topic/employee/appointments");
        },
        
        onStompError: (frame) => {
          console.error("STOMP error:", frame.headers['message']);
          setIsConnected(false);
        },
        
        onDisconnect: () => {
          console.log("WebSocket disconnected");
          setIsConnected(false);
        },
        
        onWebSocketClose: (event) => {
          console.log("WebSocket connection closed:", event);
          setIsConnected(false);
        },
        
        onWebSocketError: (error) => {
          console.error("WebSocket error:", error);
          setIsConnected(false);
        }
      });

      // Activate the connection
      stompClient.current.activate();
      console.log("Activating WebSocket connection...");
      
    } catch (error) {
      console.error("Failed to initialize WebSocket:", error);
      setIsConnected(false);
    }
  };

  // Test function to simulate receiving a notification (remove this in production)
  const testNotification = () => {
    const testNotification: Notification = {
      id: `test-${Date.now()}`,
      title: "Test Appointment",
      message: "This is a test notification for employee",
      appointmentId: "123",
      notificationType: "NEW_APPOINTMENT",
      targetRole: "EMPLOYEE",
      timestamp: Date.now(),
      read: false,
      type: "info"
    };
    setNotifications(prev => [testNotification, ...prev]);
  };

  // Map backend notification types to frontend types
  const mapNotificationType = (notificationType: string): "info" | "success" | "warning" | "error" => {
    switch (notificationType) {
      case "NEW_APPOINTMENT":
        return "info";
      case "QUOTE_APPROVED":
        return "success";
      case "QUOTE_REJECTED":
        return "error";
      case "APPOINTMENT_ACCEPTED":
        return "success";
      case "APPOINTMENT_COMPLETED":
        return "success";
      default:
        return "info";
    }
  };

  const handleLogout = () => {
    if (stompClient.current) {
      stompClient.current.deactivate();
    }
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    router.push("/login");
  };

  const markAsRead = (id: string) => {
    setNotifications(
      notifications.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const markAllAsRead = () => {
    setNotifications(notifications.map((n) => ({ ...n, read: true })));
  };

  const clearNotification = (id: string) => {
    setNotifications(notifications.filter((n) => n.id !== id));
  };

  const clearAllNotifications = () => {
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
        return "⚠";
      case "error":
        return "❌";
      default:
        return "ℹ";
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
    
    if (notification.appointmentId && notification.notificationType === "NEW_APPOINTMENT") {
      router.push(/employee/appointments);
    }
  };

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left Side - Menu Button (Mobile) & Title */}
          <div className="flex items-center gap-4">
            <button
              onClick={onMenuClick}
              className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
              aria-label="Toggle menu"
            >
              <Menu className="h-6 w-6 text-gray-600" />
            </button>
            <h2 className="text-xl font-bold text-gray-900 hidden sm:block">
              Welcome back, {user?.firstName || "User"}!
            </h2>
            
            {/* Connection Status Indicator */}
            <div className="flex items-center gap-2 text-xs" title={isConnected ? "Connected to notifications" : "Disconnected"}>
              <div
                className={`h-2 w-2 rounded-full ${
                  isConnected ? "bg-green-500 animate-pulse" : "bg-red-500"
                }`}
              />
              <span className="text-gray-500 hidden md:inline">
                {isConnected ? "Live" : "Offline"}
              </span>
            </div>

            {/* Test Button - Remove in production */}
            <button
              onClick={testNotification}
              className="text-xs bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600"
            >
              Test Notif
            </button>
          </div>

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
                <Bell className={`h-6 w-6 ${isConnected ? "text-gray-600" : "text-gray-400"} group-hover:text-blue-600`} />
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
                          {isConnected ? "Real-time updates" : "Reconnecting..."}
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
                        {notifications.length > 0 && (
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
                      {notifications.length === 0 ? (
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
                          {notifications.map((notification) => (
                            <div
                              key={notification.id}
                              className={`p-4 hover:bg-gray-50 cursor-pointer transition-all duration-200 ${
                                getNotificationColor(notification.type)
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

                    {notifications.length > 0 && (
                      <div className="p-3 border-t border-gray-200 text-center bg-gray-50">
                        <span className="text-sm text-gray-500">
                          {notifications.length} notification{notifications.length !== 1 ? 's' : ''}
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
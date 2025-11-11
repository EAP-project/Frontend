"use client";

import React, { createContext, useContext, useEffect, useRef, useState, useCallback } from "react";
import SockJS from "sockjs-client";
import { Client, StompSubscription } from "@stomp/stompjs";
import { getScheduledAppointments } from "@/lib/api";

export interface NotificationItem {
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

interface NotificationsContextValue {
  notifications: NotificationItem[];
  isConnected: boolean;
  unreadCount: number;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  clearNotification: (id: string) => void;
  clearAllNotifications: () => void;
  user: { firstName?: string; lastName?: string; email?: string; role?: string } | null;
}

const NotificationsContext = createContext<NotificationsContextValue | undefined>(undefined);

export const useNotifications = () => {
  const ctx = useContext(NotificationsContext);
  if (!ctx) throw new Error("useNotifications must be used within NotificationsProvider");
  return ctx;
};

function mapNotificationType(notificationType?: string): NotificationItem["type"] {
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
}

export const NotificationsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const stompClient = useRef<Client | null>(null);
  const subsRef = useRef<StompSubscription[] | null>(null);
  const [user, setUser] = useState<{ firstName?: string; lastName?: string; email?: string; role?: string } | null>(null);

  // Load user from localStorage (basic approach; consider secure context)
  useEffect(() => {
    try {
      const userStr = localStorage.getItem("user");
      if (userStr) setUser(JSON.parse(userStr));
    } catch {}
  }, []);

  // Persist notifications to localStorage
  useEffect(() => {
    try {
      localStorage.setItem("_notifications", JSON.stringify(notifications.slice(0, 100)));
    } catch {}
  }, [notifications]);

  // Load existing notifications on first mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem("_notifications");
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) setNotifications(parsed);
      }
    } catch {}
  }, []);

  const getTopics = useCallback(() => {
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
        return ["/topic/notifications"]; // fallback
    }
  }, [user?.role]);

  const initWebSocket = useCallback(() => {
    if (!user?.role) return;
    try {
      if (stompClient.current) {
        stompClient.current.deactivate();
      }
      const WS_URL = process.env.NEXT_PUBLIC_WS_URL || "http://localhost:8080/ws";
      const topics = getTopics();
      stompClient.current = new Client({
        webSocketFactory: () => new SockJS(WS_URL),
        reconnectDelay: 5000,
        heartbeatIncoming: 4000,
        heartbeatOutgoing: 4000,
        onConnect: () => {
          setIsConnected(true);
          subsRef.current = [];
          topics.forEach(t => {
            const s = stompClient.current?.subscribe(t, msg => {
              try {
                const data = JSON.parse(msg.body || "{}");
                const n: NotificationItem = {
                  id: data.id || data.appointmentId || `notification-${Date.now()}`,
                  title: data.title || "New Notification",
                  message: data.message || data.content || "You have a new notification",
                  appointmentId: data.appointmentId || "",
                  notificationType: data.notificationType || "INFO",
                  targetRole: (data.targetRole || user?.role || "").toUpperCase(),
                  timestamp: data.timestamp || Date.now(),
                  read: false,
                  type: mapNotificationType(data.notificationType),
                };
                setNotifications(prev => [n, ...prev.filter(p => p.id !== n.id)].slice(0, 100));
              } catch (e) {
                console.warn("Failed to parse notification", e);
              }
            });
            if (s) subsRef.current?.push(s);
          });
        },
        onDisconnect: () => setIsConnected(false),
        onWebSocketClose: () => setIsConnected(false),
        onWebSocketError: () => setIsConnected(false),
        onStompError: () => setIsConnected(false),
      });
      stompClient.current.activate();
    } catch (e) {
      console.warn("WebSocket init failed", e);
      setIsConnected(false);
    }
  }, [user?.role, getTopics]);

  // Re-init websocket when role changes
  useEffect(() => {
    initWebSocket();
    return () => {
      try {
        subsRef.current?.forEach(s => { try { s.unsubscribe(); } catch {} });
        subsRef.current = null;
        stompClient.current?.deactivate();
      } catch {}
    };
  }, [initWebSocket]);

  // Catch-up for employee
  useEffect(() => {
    const role = user?.role?.toUpperCase();
    if (role !== "EMPLOYEE") return;
    (async () => {
      try {
        const apts = await getScheduledAppointments();
        const existingIds = new Set(notifications.map(n => n.id));
        const mapped: NotificationItem[] = apts.slice(0, 10).map(ap => ({
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
        if (mapped.length) setNotifications(prev => [...mapped, ...prev].slice(0, 100));
      } catch (e) {
        console.warn("Catch-up fetch failed", e);
      }
    })();
  }, [user?.role, notifications]);

  const markAsRead = (id: string) => setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  const markAllAsRead = () => setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  const clearNotification = (id: string) => setNotifications(prev => prev.filter(n => n.id !== id));
  const clearAllNotifications = () => setNotifications([]);

  const value: NotificationsContextValue = {
    notifications,
    isConnected,
    unreadCount: notifications.filter(n => !n.read).length,
    markAsRead,
    markAllAsRead,
    clearNotification,
    clearAllNotifications,
    user,
  };

  return <NotificationsContext.Provider value={value}>{children}</NotificationsContext.Provider>;
};

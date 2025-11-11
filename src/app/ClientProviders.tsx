"use client";

import React from "react";
import { NotificationsProvider } from "@/context/NotificationsContext";
import { AuthProvider } from "@/context/AuthContext";

export default function ClientProviders({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <NotificationsProvider>
        {children}
      </NotificationsProvider>
    </AuthProvider>
  );
}

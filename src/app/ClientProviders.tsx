"use client";

import React from "react";
import { NotificationsProvider } from "@/context/NotificationsContext";

export default function ClientProviders({ children }: { children: React.ReactNode }) {
  return (
    <NotificationsProvider>
      {children}
    </NotificationsProvider>
  );
}

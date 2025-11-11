"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Sidebar } from "@/components/Sidebar";
import { Navbar } from "@/components/Navbar";
import { useAuth } from "@/context/AuthContext";

export default function CustomerSectionLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { user, token, initialized } = useAuth();
  const [loading, setLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    if (!initialized) return;
    if (!token || !user) {
      router.push("/login");
      return;
    }
    setLoading(false);
  }, [initialized, token, user, router]);

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  // Determine the role for sidebar
  const role = user.role?.toUpperCase() || "";
  let sidebarRole: "customer" | "admin" | "employee" = "customer";

  if (role.includes("ADMIN")) {
    sidebarRole = "admin";
  } else if (
    role.includes("EMPLOYEE") ||
    role.includes("TECHNICIAN") ||
    role.includes("SUPERVISOR") ||
    role.includes("MANAGER")
  ) {
    sidebarRole = "employee";
  }

  const toggleSidebar = () => setIsSidebarOpen((s) => !s);
  const closeSidebar = () => setIsSidebarOpen(false);

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar role={sidebarRole} user={user} isOpen={isSidebarOpen} onClose={closeSidebar} />
      <div className="flex-1 flex flex-col">
        <Navbar user={user} onMenuClick={toggleSidebar} />
        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
}

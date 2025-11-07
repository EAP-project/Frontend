"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/Sidebar";

export default function CustomerSectionLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [user, setUser] = useState<{
    firstName?: string;
    lastName?: string;
    email?: string;
    role?: string;
  } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userStr = localStorage.getItem("user");

    if (!token || !userStr) {
      router.push("/login");
      return;
    }

    const userData = JSON.parse(userStr);
    setUser(userData);
    setLoading(false);
  }, [router]);

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

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar role={sidebarRole} user={user} />
      <main className="flex-1">{children}</main>
    </div>
  );
}

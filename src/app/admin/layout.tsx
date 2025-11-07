"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Sidebar } from "@/components/Sidebar";
import { Navbar } from "@/components/Navbar";

export default function AdminLayout({
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

    if (!userData.role?.toUpperCase().includes("ADMIN")) {
      const role = userData.role?.toUpperCase() || "";
      if (
        role.includes("EMPLOYEE") ||
        role.includes("TECHNICIAN") ||
        role.includes("SUPERVISOR") ||
        role.includes("MANAGER")
      ) {
        router.push("/dashboard/employee");
      } else {
        router.push("/dashboard/customer");
      }
      return;
    }

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

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar role="admin" user={user} />
      <div className="flex-1 flex flex-col">
        <Navbar user={user} />
        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
}

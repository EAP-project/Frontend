"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Sidebar } from "@/components/Sidebar";
import { Navbar } from "@/components/Navbar";
import { useAuth } from "@/context/AuthContext";

export default function EmployeeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { user, token, initialized } = useAuth();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!initialized) return;
    if (!token || !user) {
      router.push("/login");
      return;
    }

    const role = user.role?.toUpperCase() || "";

    if (
      !role.includes("EMPLOYEE") &&
      !role.includes("TECHNICIAN") &&
      !role.includes("SUPERVISOR") &&
      !role.includes("MANAGER")
    ) {
      if (role.includes("ADMIN")) {
        router.push("/dashboard/admin");
      } else {
        router.push("/dashboard/customer");
      }
      return;
    }

    setLoading(false);
  }, [router, initialized, token, user]);

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar role="employee" user={user} />
      <div className="flex-1 flex flex-col">
        <Navbar user={user} />
        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
}

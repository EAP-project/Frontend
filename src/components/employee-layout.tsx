"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/Button";

/** Simple inline SVG icons */
function IconDashboard({
  className = "",
}: {
  className?: string;
}): React.ReactElement {
  return (
    <svg
      className={`h-5 w-5 ${className}`}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M3 13h8V3H3v10z"></path>
      <path d="M21 21h-8v-6h8v6z"></path>
      <path d="M3 21h8v-4H3v4z"></path>
    </svg>
  );
}
function IconCalendar({
  className = "",
}: {
  className?: string;
}): React.ReactElement {
  return (
    <svg
      className={`h-5 w-5 ${className}`}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <rect x="3" y="5" width="18" height="16" rx="2"></rect>
      <path d="M16 3v4M8 3v4M3 11h18"></path>
    </svg>
  );
}

export default function EmployeeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname() || "/";
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const handleLogout = () => {
    localStorage.removeItem("token");
    router.push("/login");
  };

  const navItems: {
    href: string;
    label: string;
    icon: (props: { className?: string }) => React.ReactElement;
  }[] = [
    { href: "/employee/dashboard", label: "Dashboard", icon: IconDashboard },
    {
      href: "/employee/appointments",
      label: "Appointments",
      icon: IconCalendar,
    },
  ];

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside
        className={`${
          sidebarOpen ? "w-64" : "w-20"
        } bg-white border-r border-gray-200 transition-all duration-300 flex flex-col shadow-sm`}
      >
        <div className="p-4 border-b border-gray-200">
          <Link href="/employee/dashboard" className="flex items-center gap-2">
            <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
              <span className="text-white font-bold text-sm">EM</span>
            </div>
            {sidebarOpen && (
              <span className="font-bold text-gray-900">Technician</span>
            )}
          </Link>
        </div>

        <nav className="flex-1 p-2 space-y-1">
          {navItems.map((item) => {
            const isActive =
              item.href === "/employee/dashboard"
                ? pathname === item.href || pathname === item.href + "/"
                : pathname === item.href ||
                  pathname.startsWith(item.href + "/");
            const baseClasses =
              "flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm transition-colors";
            const activeClasses =
              "bg-purple-50 text-purple-700 font-semibold border-l-4 border-purple-600";
            const inactiveClasses =
              "text-gray-700 hover:bg-purple-50 hover:text-purple-700";
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`${baseClasses} ${
                  isActive ? activeClasses : inactiveClasses
                }`}
                aria-current={isActive ? "page" : undefined}
              >
                <span
                  className={`flex items-center justify-center shrink-0 ${
                    sidebarOpen ? "" : "w-full"
                  }`}
                >
                  <Icon
                    className={`${
                      isActive ? "text-purple-600" : "text-gray-600"
                    }`}
                  />
                </span>
                {sidebarOpen && <span>{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-gray-200 space-y-2">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="w-full px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-lg text-sm font-medium transition-colors"
          >
            {sidebarOpen ? "← Collapse" : "→"}
          </button>
          <Button
            onClick={handleLogout}
            variant="outline"
            className="w-full text-red-600 border-red-200 hover:bg-red-50 bg-transparent"
          >
            {sidebarOpen ? "Logout" : "↪"}
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <div className="p-8">{children}</div>
      </main>
    </div>
  );
}

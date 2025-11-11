"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Car,
  Calendar,
  FileText,
  Settings,
  LogOut,
  User,
  Users,
  Wrench,
  Package,
  CheckCircle,
  Clock,
} from "lucide-react";
import { Button } from "./ui/Button";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
}

interface SidebarProps {
  role: "customer" | "admin" | "employee";
  user?: {
    firstName?: string;
    lastName?: string;
    email?: string;
  };
  isOpen?: boolean;
  onClose?: () => void;
}

const navItems: Record<string, NavItem[]> = {
  customer: [
    {
      label: "Dashboard",
      href: "/dashboard/customer",
      icon: <LayoutDashboard className="h-5 w-5" />,
    },
    {
      label: "My Vehicles",
      href: "/vehicles",
      icon: <Car className="h-5 w-5" />,
    },
    {
      label: "Appointments",
      href: "/appointments",
      icon: <Calendar className="h-5 w-5" />,
    },
    {
      label: "Services",
      href: "/services",
      icon: <Wrench className="h-5 w-5" />,
    },
    {
      label: "Service History",
      href: "/service-history",
      icon: <FileText className="h-5 w-5" />,
    },
  ],
  admin: [
    {
      label: "Dashboard",
      href: "/dashboard/admin",
      icon: <LayoutDashboard className="h-5 w-5" />,
    },
    {
      label: "Add User",
      href: "/admin/add-user",
      icon: <Users className="h-5 w-5" />,
    },
    {
      label: "Manage Services",
      href: "/admin/manage-services",
      icon: <Wrench className="h-5 w-5" />,
    },
    {
      label: "Appointments",
      href: "/admin/appointments",
      icon: <Calendar className="h-5 w-5" />,
    },
    {
      label: "Time Logs",
      href: "/admin/time-logs",
      icon: <Clock className="h-5 w-5" />,
    },
    {
      label: "Service History",
      href: "/admin/history",
      icon: <FileText className="h-5 w-5" />,
    },
  ],
  employee: [
    {
      label: "Dashboard",
      href: "/dashboard/employee",
      icon: <LayoutDashboard className="h-5 w-5" />,
    },
    {
      label: "Ongoing Jobs",
      href: "/employee/jobs",
      icon: <Wrench className="h-5 w-5" />,
    },
    {
      label: "Awaiting Parts",
      href: "/employee/awaiting-parts",
      icon: <Package className="h-5 w-5" />,
    },
    {
      label: "Completed",
      href: "/employee/completed",
      icon: <CheckCircle className="h-5 w-5" />,
    },
    {
      label: "Time Logs",
      href: "/employee/time-logs",
      icon: <Clock className="h-5 w-5" />,
    },
  ],
};

export function Sidebar({ role, user, isOpen = false, onClose }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const items = navItems[role] || [];
  const [showConfirm, setShowConfirm] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    router.push("/login");
    setShowConfirm(false);
  };

  const closeMobileSidebar = () => {
    onClose?.();
  };

  return (
    <>
      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-[90] w-64 transform transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0 lg:static bg-white border-r border-gray-200 h-screen flex flex-col`}
      >
        {/* Logo/Header - Always visible */}
        <div className="p-6 border-b border-gray-200 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-purple-600 to-blue-500 flex items-center justify-center">
              <Car className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900">Auto Service</h1>
              <p className="text-xs text-gray-500 capitalize">{role}</p>
            </div>
          </div>
        </div>

        {/* Navigation - Only this scrolls */}
        <nav className="flex-1 overflow-y-auto p-4">
          <ul className="space-y-2">
            {items.map((item) => {
              const isActive = pathname === item.href;
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={closeMobileSidebar}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                      isActive
                        ? "bg-gradient-to-r from-purple-600 to-blue-500 text-white shadow-md"
                        : "text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    {item.icon}
                    <span className="font-medium">{item.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* User Info & Logout - Pinned to bottom, never scrolls */}
        <div className="p-4 border-t border-gray-200 flex-shrink-0">
          {user && (
            <div className="mb-3 px-2">
              <p className="text-sm font-semibold text-gray-900 truncate">
                {user.firstName} {user.lastName}
              </p>
              <p className="text-xs text-gray-500 truncate">{user.email}</p>
            </div>
          )}
          <Button
            onClick={() => setShowConfirm(true)}
            variant="outline"
            className="w-full gap-2 text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </Button>
        </div>
      </aside>

      {/* Mobile/Tablet overlay to close sidebar */}
      {isOpen && (
        <div
          className="fixed inset-0 z-[80] bg-black/50 lg:hidden"
          onClick={closeMobileSidebar}
          aria-hidden="true"
        />
      )}

      {/* Logout Confirmation Modal */}
      {showConfirm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white w-80 mx-4 p-6 rounded-2xl shadow-2xl border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">
              Confirm Logout
            </h3>
            <p className="text-sm text-gray-600 mb-6">
              Are you sure you want to logout?
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowConfirm(false)}
                className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 text-sm font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleLogout}
                className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default Sidebar;

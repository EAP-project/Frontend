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
} from "lucide-react";
import { Button } from "./ui/Button";
import { useRouter } from "next/navigation";

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
    {
      label: "Profile",
      href: "/profile",
      icon: <User className="h-5 w-5" />,
    },
  ],
  admin: [
    {
      label: "Dashboard",
      href: "/dashboard/admin",
      icon: <LayoutDashboard className="h-5 w-5" />,
    },
    {
      label: "Manage Services",
      href: "/admin/services",
      icon: <Wrench className="h-5 w-5" />,
    },
    {
      label: "Add Service",
      href: "/add-service",
      icon: <Wrench className="h-5 w-5" />,
    },
    {
      label: "Users",
      href: "/admin/users",
      icon: <Users className="h-5 w-5" />,
    },
    {
      label: "Appointments",
      href: "/admin/appointments",
      icon: <Calendar className="h-5 w-5" />,
    },
    {
      label: "Settings",
      href: "/admin/settings",
      icon: <Settings className="h-5 w-5" />,
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
      label: "Appointments",
      href: "/employee/appointments",
      icon: <Calendar className="h-5 w-5" />,
    },
    {
      label: "Time Logs",
      href: "/employee/time-logs",
      icon: <FileText className="h-5 w-5" />,
    },
  ],
};

export function Sidebar({ role, user }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const items = navItems[role] || [];

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    router.push("/login");
  };

  return (
    <aside className="w-64 bg-white border-r border-gray-200 flex flex-col h-screen sticky top-0">
      {/* Logo/Header */}
      <div className="p-6 border-b border-gray-200">
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

      {/* Navigation */}
      <nav className="flex-1 p-4 overflow-y-auto">
        <ul className="space-y-2">
          {items.map((item) => {
            const isActive = pathname === item.href;
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
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

      {/* User Info & Logout */}
      <div className="p-4 border-t border-gray-200">
        {user && (
          <div className="mb-3 px-2">
            <p className="text-sm font-semibold text-gray-900 truncate">
              {user.firstName} {user.lastName}
            </p>
            <p className="text-xs text-gray-500 truncate">{user.email}</p>
          </div>
        )}
        <Button
          onClick={handleLogout}
          variant="outline"
          className="w-full gap-2 text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
        >
          <LogOut className="h-4 w-4" />
          Logout
        </Button>
      </div>
    </aside>
  );
}

export default Sidebar;

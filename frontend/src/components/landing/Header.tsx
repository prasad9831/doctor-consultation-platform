"use client";
import {
  Bell,
  Calendar,
  LogOut,
  Settings,
  Stethoscope,
  User,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import React, { useEffect, useState, useRef } from "react";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { userAuthStore } from "@/store/authStore";
import { motion, AnimatePresence } from "framer-motion";

interface HeaderProps {
  showDashboardNav?: boolean;
}

interface NavigationItem {
  label: string;
  icon: React.ComponentType<any>;
  href: string;
  active: boolean;
}

export const Header = ({ showDashboardNav = false }) => {
  const { user, isAuthenticated, logout } = userAuthStore();
  const pathname = usePathname();

  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const router = useRouter();

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const getDashboardNavigation = (): NavigationItem[] => {
    if (!user || !showDashboardNav) return [];

    if (user?.type === "patient") {
      return [
        {
          label: "Appointments",
          icon: Calendar,
          href: "/patient/dashboard",
          active: pathname?.includes("/patient/dashboard") || false,
        },
      ];
    } else {
      return [
        {
          label: "Dashboard",
          icon: Calendar,
          href: "/doctor/dashboard",
          active: pathname?.includes("/doctor/dashboard") || false,
        },
        {
          label: "Appointments",
          icon: Calendar,
          href: "/doctor/appointments",
          active: pathname?.includes("/doctor/appointments") || false,
        },
      ];
    }
  };

 const handleLogOut = async () => {
  await logout()
  router.push('/')
};

  return (
    <header className="border-b bg-white/95 backdrop:blur-sm fixed top-0 left-0 right-0 z-50">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        {/* LEFT */}
        <div className="flex items-center space-x-8">
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-red-600 to-red-700 rounded-lg flex items-center justify-center">
              <Stethoscope className="w-5 h-5 text-white" />
            </div>
            <div className="text-2xl font-bold bg-gradient-to-br from-red-600 to-red-800 bg-clip-text text-transparent">
              Medicare+
            </div>
          </Link>

          {isAuthenticated && showDashboardNav && (
            <nav className="hidden md:flex items-center space-x-6">
              {getDashboardNavigation().map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center space-x-1 transition-colors ${
                    item.active
                      ? "text-red-600 font-semibold"
                      : "text-gray-600 hover:text-red-600"
                  }`}
                >
                  <item.icon className="w-4 h-4" />
                  <span className="text-sm font-medium">{item.label}</span>
                </Link>
              ))}
            </nav>
          )}
        </div>

        {/* RIGHT */}
        {isAuthenticated && showDashboardNav ? (
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="sm" className="relative">
              <Bell className="w-5 h-5" />
              <Badge className="absolute -top-1 -right-1 w-5 h-5 bg-red-500">
                4
              </Badge>
            </Button>

            {/* 🔥 Animated Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <div
                onClick={(e) => {
                  e.stopPropagation();
                  setOpen((prev) => !prev);
                }}
                className="flex items-center space-x-2 px-2 cursor-pointer"
              >
                <Avatar className="w-8 h-8">
                  <AvatarImage src={user?.profileImage} />
                  <AvatarFallback className="bg-red-100 text-red-600">
                    {user?.name?.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>

                <div className="hidden md:block text-left">
                  <p className="text-sm font-medium text-gray-900">
                    {user?.name}
                  </p>
                  <p className="text-xs text-gray-500 capitalize">
                    {user?.type}
                  </p>
                </div>
              </div>

              <AnimatePresence>
                {open && (
                  <motion.div
                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border z-50 overflow-hidden"
                  >
                    {/* Profile */}
                    <div className="p-4 border-b flex items-center space-x-2">
                      <Avatar className="w-8 h-8">
                        <AvatarImage src={user?.profileImage} />
                        <AvatarFallback>{user?.name?.charAt(0)}</AvatarFallback>
                      </Avatar>

                      <div>
                        <p className="font-medium text-sm">{user?.name}</p>
                        <p className="text-xs text-gray-500 truncate">
                          {user?.email}
                        </p>
                      </div>
                    </div>

                    {/* Menu */}
                    <div className="py-2">
                      <Link href={`/${user?.type}/profile`}>
                        <div className="px-4 py-2 hover:bg-red-50 flex items-center cursor-pointer">
                          <User className="w-4 h-4 mr-2" />
                          Profile
                        </div>
                      </Link>

                      <Link href={`/${user?.type}/settings`}>
                        <div className="px-4 py-2 hover:bg-red-50 flex items-center cursor-pointer">
                          <Settings className="w-4 h-4 mr-2" />
                          Settings
                        </div>
                      </Link>

                      <div onClick={handleLogOut} className="px-4 py-2 hover:bg-red-50 flex items-center cursor-pointer">
                        <LogOut className="w-4 h-4 mr-2" />
                        LogOut
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        ) : (
          <div className="flex items-center space-x-3">
            {!isAuthenticated ? (
              <>
                <Link href="/login/patient">
                  <Button variant="ghost">Log In</Button>
                </Link>

                <Link href="/signup/patient" className="hidden md:block">
                  <Button className="bg-red-600 hover:bg-red-700 text-white">
                    Book Consultation
                  </Button>
                </Link>
              </>
            ) : (
              <Link href={`/${user?.type}/dashboard`}>
                <Button variant="ghost">Dashboard</Button>
              </Link>
            )}
          </div>
        )}
      </div>
    </header>
  );
};

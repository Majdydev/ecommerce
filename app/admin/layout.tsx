"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useEffect } from "react";
import {
  LayoutDashboard,
  ShoppingBag,
  Users,
  Tag,
  Package,
  Settings,
  Home,
  LogOut,
} from "lucide-react";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();
  const router = useRouter();

  // Check if user is admin and redirect if not
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/login?callbackUrl=/admin");
    } else if (status === "authenticated" && session?.user?.role !== "ADMIN") {
      router.push("/");
    }
  }, [status, session, router]);

  // Show loading state while checking authentication
  if (status === "loading" || status === "unauthenticated") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-pulse text-center">
          <div className="h-16 w-16 bg-indigo-200 rounded-full mx-auto mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-32 mx-auto"></div>
        </div>
      </div>
    );
  }

  // If authenticated but not admin, should redirect
  if (session?.user?.role !== "ADMIN") {
    return null;
  }

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-64 bg-indigo-800 text-white">
        <div className="p-4">
          <h1 className="text-xl font-semibold">Admin Dashboard</h1>
          <p className="text-xs text-indigo-200 mt-1">Manage your store</p>
        </div>

        <nav className="mt-6">
          <div className="px-4 py-2 text-xs text-indigo-300 uppercase tracking-wider font-medium">
            Main
          </div>

          <Link
            href="/admin"
            className="flex items-center px-4 py-2 text-indigo-100 hover:bg-indigo-700"
          >
            <LayoutDashboard className="h-5 w-5 mr-3" />
            Dashboard
          </Link>

          <div className="px-4 py-2 text-xs text-indigo-300 uppercase tracking-wider font-medium mt-4">
            Catalog
          </div>

          <Link
            href="/admin/products"
            className="flex items-center px-4 py-2 text-indigo-100 hover:bg-indigo-700"
          >
            <ShoppingBag className="h-5 w-5 mr-3" />
            Products
          </Link>

          <Link
            href="/admin/categories"
            className="flex items-center px-4 py-2 text-indigo-100 hover:bg-indigo-700"
          >
            <Tag className="h-5 w-5 mr-3" />
            Categories
          </Link>

          <div className="px-4 py-2 text-xs text-indigo-300 uppercase tracking-wider font-medium mt-4">
            Sales
          </div>

          <Link
            href="/admin/orders"
            className="flex items-center px-4 py-2 text-indigo-100 hover:bg-indigo-700"
          >
            <Package className="h-5 w-5 mr-3" />
            Orders
          </Link>

          <Link
            href="/admin/users"
            className="flex items-center px-4 py-2 text-indigo-100 hover:bg-indigo-700"
          >
            <Users className="h-5 w-5 mr-3" />
            Customers
          </Link>

          <div className="px-4 py-2 text-xs text-indigo-300 uppercase tracking-wider font-medium mt-4">
            System
          </div>

          <Link
            href="/admin/settings"
            className="flex items-center px-4 py-2 text-indigo-100 hover:bg-indigo-700"
          >
            <Settings className="h-5 w-5 mr-3" />
            Settings
          </Link>

          <div className="border-t border-indigo-700 my-4"></div>

          <Link
            href="/"
            className="flex items-center px-4 py-2 text-indigo-100 hover:bg-indigo-700"
          >
            <Home className="h-5 w-5 mr-3" />
            View Store
          </Link>

          <button
            onClick={() => router.push("/api/auth/signout")}
            className="flex items-center w-full text-left px-4 py-2 text-indigo-100 hover:bg-indigo-700"
          >
            <LogOut className="h-5 w-5 mr-3" />
            Sign Out
          </button>
        </nav>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <header className="bg-white shadow">
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center">
              <span className="font-medium">Admin Control Panel</span>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                href="/admin"
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm flex items-center"
              >
                <LayoutDashboard className="h-4 w-4 mr-2" />
                Dashboard
              </Link>
            </div>
          </div>
        </header>

        {/* Content area */}
        <main className="flex-1 overflow-auto bg-gray-100 p-6">{children}</main>
      </div>
    </div>
  );
}

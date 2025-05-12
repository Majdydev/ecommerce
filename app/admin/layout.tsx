"use client";

import React from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useEffect, useState, useCallback } from "react";
import {
  LayoutDashboard,
  ShoppingBag,
  Users,
  Tag,
  Package,
  Settings,
  Home,
  LogOut,
  Menu,
  X,
  ChevronDown,
} from "lucide-react";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentPathname, setCurrentPathname] = useState<string>("");
  const [isMobileView, setIsMobileView] = useState(false);

  // Check if user is admin and redirect if not
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/login?callbackUrl=/admin");
    } else if (status === "authenticated" && session?.user?.role !== "ADMIN") {
      router.push("/");
    }
  }, [status, session, router]);

  // Handle mobile/desktop detection
  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobileView(window.innerWidth < 768);
    };

    // Initial check
    checkIsMobile();

    // Add resize listener
    window.addEventListener("resize", checkIsMobile);

    // Track current pathname
    setCurrentPathname(window.location.pathname);

    return () => {
      window.removeEventListener("resize", checkIsMobile);
    };
  }, []);

  // Handle closing sidebar when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const sidebar = document.getElementById("sidebar");
      const toggleButton = document.getElementById("sidebar-toggle");

      if (
        sidebarOpen &&
        sidebar &&
        !sidebar.contains(event.target as Node) &&
        toggleButton &&
        !toggleButton.contains(event.target as Node)
      ) {
        setSidebarOpen(false);
      }
    };

    if (sidebarOpen) {
      document.addEventListener("click", handleClickOutside);
    }

    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, [sidebarOpen]);

  // Handle route changes
  useEffect(() => {
    const handleRouteChange = () => {
      setCurrentPathname(window.location.pathname);
      if (isMobileView) {
        setSidebarOpen(false);
      }
    };

    window.addEventListener("popstate", handleRouteChange);

    return () => {
      window.removeEventListener("popstate", handleRouteChange);
    };
  }, [isMobileView]);

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

  // Navigation items
  const navItems = [
    {
      title: "Dashboard",
      href: "/admin",
      icon: <LayoutDashboard className="h-5 w-5" />,
      active: currentPathname === "/admin",
    },
    {
      title: "Products",
      href: "/admin/products",
      icon: <ShoppingBag className="h-5 w-5" />,
      active: currentPathname.startsWith("/admin/products"),
    },
    {
      title: "Categories",
      href: "/admin/categories",
      icon: <Tag className="h-5 w-5" />,
      active: currentPathname.startsWith("/admin/categories"),
    },
    {
      title: "Orders",
      href: "/admin/orders",
      icon: <Package className="h-5 w-5" />,
      active: currentPathname.startsWith("/admin/orders"),
    },
    {
      title: "Customers",
      href: "/admin/users",
      icon: <Users className="h-5 w-5" />,
      active: currentPathname.startsWith("/admin/users"),
    },
    {
      title: "Settings",
      href: "/admin/settings",
      icon: <Settings className="h-5 w-5" />,
      active: currentPathname.startsWith("/admin/settings"),
    },
  ];

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gray-100">
      {/* Overlay for mobile - make more transparent to prevent black screen */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-gray-500 opacity-90	  md:hidden z-20"
          onClick={(e) => {
            e.stopPropagation();
            setSidebarOpen(false);
          }}
          aria-hidden="true"
        ></div>
      )}

      {/* Sidebar */}
      <aside
        id="sidebar"
        className={`${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0 fixed md:static w-64 max-w-[80%] md:max-w-none md:w-64 h-full bg-indigo-800 text-white z-30 transition-transform duration-300 ease-in-out overflow-y-auto`}
      >
        <div className="p-4 sticky top-0 bg-indigo-900 shadow-md z-10">
          <div className="flex items-center justify-between">
            <h1 className="text-lg font-semibold">Admin Dashboard</h1>
            <button
              type="button"
              className="md:hidden text-white p-2 rounded-full hover:bg-indigo-700"
              onClick={() => setSidebarOpen(false)}
              aria-label="Close sidebar"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        <nav className="mt-4 px-2">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center px-4 py-3 mb-1 rounded-md transition-colors ${
                item.active
                  ? "bg-indigo-700 text-white font-medium"
                  : "text-indigo-100 hover:bg-indigo-700 hover:text-white"
              }`}
              onClick={() => isMobileView && setSidebarOpen(false)}
            >
              <span className="mr-3">{item.icon}</span>
              {item.title}
            </Link>
          ))}

          <div className="border-t border-indigo-700 my-4"></div>

          <Link
            href="/"
            className="flex items-center px-4 py-3 mb-1 rounded-md text-indigo-100 hover:bg-indigo-700 hover:text-white transition-colors"
            onClick={() => isMobileView && setSidebarOpen(false)}
          >
            <Home className="h-5 w-5 mr-3" />
            View Store
          </Link>

          <button
            type="button"
            onClick={() => router.push("/api/auth/signout")}
            className="flex items-center w-full text-left px-4 py-3 mb-1 rounded-md text-indigo-100 hover:bg-indigo-700 hover:text-white transition-colors"
          >
            <LogOut className="h-5 w-5 mr-3" />
            Sign Out
          </button>
        </nav>
      </aside>

      {/* Main content area - make sure it has proper bg color and doesn't become transparent */}
      <div className="flex-1 flex flex-col min-h-screen bg-gray-100">
        {/* Top bar */}
        <header className="bg-white shadow-sm">
          <div className="h-16 px-4 flex items-center justify-between">
            <div className="flex items-center">
              <button
                id="sidebar-toggle"
                type="button"
                className="mr-4 md:hidden text-gray-600 hover:text-gray-900 focus:outline-none"
                onClick={(e) => {
                  e.stopPropagation();
                  setSidebarOpen(!sidebarOpen);
                }}
                aria-label="Toggle sidebar"
              >
                <Menu size={24} />
              </button>
              <h2 className="text-lg font-medium text-gray-900">
                Admin Console
              </h2>
            </div>

            <div className="flex items-center space-x-3">
              <Link
                href="/"
                className="text-gray-600 hover:text-gray-900 p-1"
                aria-label="Go to main site"
              >
                <Home size={20} />
              </Link>
            </div>
          </div>

          {/* Breadcrumb for page context */}
          {currentPathname !== "/admin" && (
            <div className="px-4 py-1 bg-gray-50 text-xs text-gray-600 flex items-center overflow-x-auto">
              <Link href="/admin" className="hover:text-indigo-600">
                Admin
              </Link>
              {currentPathname
                .split("/")
                .slice(2)
                .map(
                  (segment, index, array) =>
                    segment && (
                      <React.Fragment key={segment}>
                        <span className="px-1">/</span>
                        {index === array.length - 1 ? (
                          <span className="text-gray-900">
                            {segment.charAt(0).toUpperCase() + segment.slice(1)}
                          </span>
                        ) : (
                          <Link
                            href={`/admin/${array
                              .slice(0, index + 1)
                              .join("/")}`}
                            className="hover:text-indigo-600"
                          >
                            {segment.charAt(0).toUpperCase() + segment.slice(1)}
                          </Link>
                        )}
                      </React.Fragment>
                    )
                )}
            </div>
          )}
        </header>

        {/* Page content - ensure it always has bg-gray-100 */}
        <main className="flex-1 overflow-auto bg-gray-100 p-0">{children}</main>
      </div>
    </div>
  );
}

"use client";

import Link from "next/link";
import { useCartStore } from "../store/cartStore";
import { useSession, signOut } from "next-auth/react";
import { ShoppingCart, User as UserIcon, LogOut } from "lucide-react";
import { User } from "../types/prisma";

export default function Navbar() {
  const totalItems = useCartStore((state) => state.totalItems);
  const { data: session } = useSession();

  const user = session?.user as (User & { role?: string }) | undefined;

  return (
    <nav className="bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link href="/" className="text-xl font-bold text-gray-800">
                E-Shop
              </Link>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              <Link
                href="/"
                className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
              >
                Home
              </Link>
              <Link
                href="/products"
                className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
              >
                Products
              </Link>
              {user?.role === "ADMIN" && (
                <Link
                  href="/admin"
                  className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                >
                  Admin Dashboard
                </Link>
              )}
            </div>
          </div>
          <div className="flex items-center">
            <Link
              href="/cart"
              className="p-2 text-gray-400 hover:text-gray-500 relative"
            >
              <ShoppingCart className="h-6 w-6" />
              {totalItems > 0 && (
                <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-600 rounded-full">
                  {totalItems}
                </span>
              )}
            </Link>

            {session ? (
              <div className="ml-4 flex items-center">
                <Link
                  href="/user/profile"
                  className="p-2 text-gray-400 hover:text-gray-500"
                >
                  <UserIcon className="h-6 w-6" />
                </Link>
                <button
                  onClick={() => signOut()}
                  className="ml-2 p-2 text-gray-400 hover:text-gray-500"
                >
                  <LogOut className="h-6 w-6" />
                </button>
              </div>
            ) : (
              <Link
                href="/auth/login"
                className="ml-4 px-4 py-2 rounded-md text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
              >
                Sign in
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

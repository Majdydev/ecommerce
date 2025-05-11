"use client";

import Link from "next/link";
import { ShoppingCart, User, LogOut } from "lucide-react";
import { useCartStore } from "../store/cartStore";
import { useSession, signOut } from "next-auth/react";
import Logo from "./ui/Logo";

export default function Navbar() {
  const { items } = useCartStore();
  const { data: session } = useSession();

  const handleSignOut = async () => {
    await signOut({ callbackUrl: "/" });
  };

  return (
    <header className="bg-white shadow-sm">
      <div className="container mx-auto px-4 py-4 ">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <Logo size="md" />

          {/* Main Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link
              href="/products"
              className="text-gray-700 hover:text-indigo-600"
            >
              Products
            </Link>
            <Link href="/about" className="text-gray-700 hover:text-indigo-600">
              About
            </Link>
            <Link
              href="/contact"
              className="text-gray-700 hover:text-indigo-600"
            >
              Contact
            </Link>
          </nav>

          {/* User Actions */}
          <div className="flex items-center space-x-6">
            {/* Cart */}
            <Link
              href="/cart"
              className="flex items-center text-gray-700 hover:text-indigo-600 relative"
            >
              <ShoppingCart size={24} />
              {items.length > 0 && (
                <span className="absolute -top-2 -right-2 bg-indigo-600 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                  {items.length}
                </span>
              )}
            </Link>

            {/* User Account */}
            {session ? (
              <div className="flex items-center space-x-4">
                <Link
                  href="/profile"
                  className="flex items-center text-gray-700 hover:text-indigo-600"
                >
                  <User size={24} />
                </Link>

                <button
                  onClick={handleSignOut}
                  className="flex items-center text-gray-700 hover:text-red-600"
                >
                  <LogOut size={22} />
                </button>
              </div>
            ) : (
              <Link
                href="/auth/login"
                className="flex items-center space-x-2 text-gray-700 hover:text-indigo-600"
              >
                <User size={24} />
                <span className="hidden md:inline">Sign In</span>
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

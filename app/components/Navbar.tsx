"use client";

import Link from "next/link";
import { ShoppingCart, User, LogOut, Menu, X } from "lucide-react";
import { useCartStore } from "../store/cartStore";
import { useSession, signOut } from "next-auth/react";
import Logo from "./ui/Logo";
import { useState, useEffect } from "react";

export default function Navbar() {
  const { items } = useCartStore();
  const { data: session } = useSession();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isMobileView, setIsMobileView] = useState(false);

  // Handle window resize for mobile detection
  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobileView(window.innerWidth < 768);
    };

    // Check on initial load
    checkIsMobile();

    // Add event listener for resize
    window.addEventListener("resize", checkIsMobile);

    // Clean up
    return () => window.removeEventListener("resize", checkIsMobile);
  }, []);

  // Close mobile menu when transitioning to desktop view
  useEffect(() => {
    if (!isMobileView) {
      setIsMenuOpen(false);
    }
  }, [isMobileView]);

  const handleSignOut = async () => {
    await signOut({ callbackUrl: "/" });
    setIsMenuOpen(false);
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  return (
    <header className="bg-white shadow-sm relative z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <Logo size="md" />

          {/* Mobile Menu Button */}
          <button
            className="md:hidden text-gray-700 hover:text-indigo-600 focus:outline-none"
            onClick={toggleMenu}
            aria-label="Toggle menu"
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>

          {/* Main Navigation - Desktop */}
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

          {/* User Actions - Desktop */}
          <div className="hidden md:flex items-center space-x-6">
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
                <span className="inline">Sign In</span>
              </Link>
            )}
          </div>

          {/* Mobile Menu Button for Cart - Always Visible */}
          <div className="md:hidden flex items-center">
            <Link
              href="/cart"
              className="flex items-center text-gray-700 hover:text-indigo-600 relative mr-2"
            >
              <ShoppingCart size={24} />
              {items.length > 0 && (
                <span className="absolute -top-2 -right-2 bg-indigo-600 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                  {items.length}
                </span>
              )}
            </Link>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-white absolute top-full left-0 w-full border-t border-gray-200 shadow-md z-50 transition-all duration-300 ease-in-out">
          <nav className="container mx-auto px-4 py-4 flex flex-col">
            <Link
              href="/products"
              className="py-3 px-4 text-gray-700 hover:bg-gray-100 rounded"
              onClick={closeMenu}
            >
              Products
            </Link>
            <Link
              href="/about"
              className="py-3 px-4 text-gray-700 hover:bg-gray-100 rounded"
              onClick={closeMenu}
            >
              About
            </Link>
            <Link
              href="/contact"
              className="py-3 px-4 text-gray-700 hover:bg-gray-100 rounded"
              onClick={closeMenu}
            >
              Contact
            </Link>

            <div className="border-t border-gray-200 mt-4 pt-4 space-y-3">
              {session ? (
                <>
                  <Link
                    href="/profile"
                    className="flex items-center py-3 px-4 text-gray-700 hover:bg-gray-100 rounded"
                    onClick={closeMenu}
                  >
                    <User size={20} className="mr-3" />
                    <span>My Profile</span>
                  </Link>
                  <button
                    onClick={handleSignOut}
                    className="flex items-center w-full text-left py-3 px-4 text-gray-700 hover:bg-gray-100 rounded"
                  >
                    <LogOut size={20} className="mr-3" />
                    <span>Sign Out</span>
                  </button>
                </>
              ) : (
                <Link
                  href="/auth/login"
                  className="flex items-center py-3 px-4 text-gray-700 hover:bg-gray-100 rounded"
                  onClick={closeMenu}
                >
                  <User size={20} className="mr-3" />
                  <span>Sign In</span>
                </Link>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}

import Image from "next/image";
import Link from "next/link";
// Update to import from components at the root level
import Navbar from "./components/Navbar";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-grow">
        {/* Hero Section */}
        <div className="bg-indigo-700 text-white">
          <div className="max-w-7xl mx-auto py-16 px-4 sm:py-24 sm:px-6 lg:px-8">
            <div className="text-center">
              <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl">
                Shop with confidence
              </h1>
              <p className="mt-6 text-xl max-w-2xl mx-auto">
                Browse our collection of high-quality products with pay on
                delivery option.
              </p>
              <div className="mt-10">
                <Link
                  href="/products"
                  className="inline-block bg-white text-indigo-600 border border-transparent rounded-md py-3 px-8 font-medium hover:bg-indigo-50"
                >
                  Shop Now
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Featured Categories */}
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-extrabold text-gray-900 mb-6">
            Featured Categories
          </h2>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {["Electronics", "Clothing", "Home & Kitchen"].map((category) => (
              <div
                key={category}
                className="group relative bg-gray-100 rounded-lg overflow-hidden"
              >
                <div className="h-60 w-full bg-gray-200 group-hover:opacity-75">
                  {/* Placeholder for category image */}
                </div>
                <div className="p-4">
                  <h3 className="text-lg font-medium text-gray-900">
                    {category}
                  </h3>
                  <Link
                    href={`/products?category=${category.toLowerCase()}`}
                    className="mt-2 text-sm text-indigo-600 hover:text-indigo-500"
                  >
                    Browse products →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      <footer className="bg-gray-800 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between">
            <div className="mb-6 md:mb-0">
              <h2 className="text-xl font-bold">E-Shop</h2>
              <p className="mt-2 text-gray-300">
                Your one-stop shop for all your needs
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-2">Quick Links</h3>
              <ul className="space-y-1">
                <li>
                  <Link
                    href="/about"
                    className="text-gray-300 hover:text-white"
                  >
                    About Us
                  </Link>
                </li>
                <li>
                  <Link
                    href="/contact"
                    className="text-gray-300 hover:text-white"
                  >
                    Contact
                  </Link>
                </li>
                <li>
                  <Link
                    href="/terms"
                    className="text-gray-300 hover:text-white"
                  >
                    Terms & Conditions
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="mt-8 border-t border-gray-700 pt-4 text-sm text-gray-400">
            © {new Date().getFullYear()} E-Shop. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}

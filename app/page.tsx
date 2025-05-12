"use client";
import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import { Category, Product } from "./types/prisma";

export default function Home() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [categories, setCategories] = useState<Category[]>([]);
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(
    null
  );
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [searchQuery, setSearchQuery] = useState("");
  const productsPerPage = 8;

  // Hero slider content
  const slides = [
    {
      image: "/images/hero1.jpg",
      title: "Discover Our Latest Collection",
      description: "Find your next favorite book from our handpicked selection",
      buttonText: "Shop Now",
      link: "/products",
    },
    {
      image: "/images/hero2.jpg",
      title: "Best Sellers This Month",
      description: "Explore the books everyone is talking about",
      buttonText: "View Bestsellers",
      link: "/products?category=bestsellers",
    },
    {
      image: "/images/hero3.jpg",
      title: "Special Sale - 25% Off",
      description: "Limited time offer on selected titles",
      buttonText: "See Offers",
      link: "/products?sale=true",
    },
  ];

  // Fetch categories and products
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch categories
        const categoriesRes = await fetch("/api/categories");
        if (categoriesRes.ok) {
          const categoriesData = await categoriesRes.json();
          setCategories(categoriesData);
        }

        // Fetch all products
        const productsRes = await fetch("/api/products");
        if (productsRes.ok) {
          const productsData = await productsRes.json();
          setAllProducts(productsData);
          setFilteredProducts(productsData);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Fetch featured products
  useEffect(() => {
    const fetchFeaturedProducts = async () => {
      try {
        const response = await fetch("/api/products?featured=true&limit=4");
        if (response.ok) {
          const data = await response.json();
          setFeaturedProducts(data);
        }
      } catch (error) {
        console.error("Error fetching featured products:", error);
      }
    };

    fetchFeaturedProducts();
  }, []);

  // Filter products when category or search changes
  useEffect(() => {
    let result = [...allProducts].filter(Boolean); // Filter out any null values

    // Filter by category
    if (selectedCategoryId) {
      result = result.filter(
        (product) => product && product.categoryId === selectedCategoryId
      );
    }

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (product) => product && product.name.toLowerCase().includes(query)
      );
    }

    // Sort by price - fix for null objects
    result.sort((a, b) => {
      // Make sure both products are not null
      if (!a && !b) return 0;
      if (!a) return sortOrder === "asc" ? -1 : 1;
      if (!b) return sortOrder === "asc" ? 1 : -1;

      // Safe to access price now
      return sortOrder === "asc" ? a.price - b.price : b.price - a.price;
    });

    setFilteredProducts(result);
    setCurrentPage(1); // Reset to first page when filters change
  }, [selectedCategoryId, searchQuery, sortOrder, allProducts]);

  // Get current page products
  const currentProducts = filteredProducts.slice(
    0,
    currentPage * productsPerPage
  );

  // Handle category change
  const handleCategoryChange = (categoryId: string | null) => {
    setSelectedCategoryId(categoryId);
  };

  // Handle sort change
  const handleSortChange = (order: "asc" | "desc") => {
    setSortOrder(order);
  };

  // Handle search
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Search is already applied via useEffect
  };

  // Load more products
  const loadMoreProducts = () => {
    setCurrentPage((prev) => prev + 1);
  };

  // Auto-advance slides
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
    }, 5000);
    return () => clearInterval(timer);
  }, [slides.length]);

  // Manual slide navigation
  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-grow">
        {/* Hero Section with Slider */}
        <div className="relative h-[600px] overflow-hidden">
          {/* Slide images */}
          {slides.map((slide, index) => (
            <div
              key={index}
              className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
                currentSlide === index
                  ? "opacity-100"
                  : "opacity-0 pointer-events-none"
              }`}
            >
              {/* Image with gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-black/30 z-10" />
              <Image
                src={slide.image}
                alt={slide.title}
                fill
                className="object-cover"
                priority={index === 0}
              />

              {/* Text overlay */}
              <div className="absolute inset-0 flex items-center justify-center z-20">
                <div className="text-center max-w-3xl px-6">
                  <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white mb-4 drop-shadow-lg">
                    {slide.title}
                  </h1>
                  <p className="text-lg md:text-xl text-white mb-8 drop-shadow-md max-w-xl mx-auto">
                    {slide.description}
                  </p>
                  <Link
                    href={slide.link}
                    className="inline-block bg-white text-indigo-600 border border-transparent rounded-md py-3 px-8 font-medium hover:bg-indigo-50 transition-colors shadow-lg"
                  >
                    {slide.buttonText}
                  </Link>
                </div>
              </div>
            </div>
          ))}

          {/* Slider navigation dots */}
          <div className="absolute bottom-6 left-0 right-0 flex justify-center gap-3 z-30">
            {slides.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  currentSlide === index
                    ? "bg-white scale-125"
                    : "bg-white/50 hover:bg-white/80"
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>

          {/* Previous/Next buttons */}
          <button
            onClick={() =>
              setCurrentSlide((prev) =>
                prev === 0 ? slides.length - 1 : prev - 1
              )
            }
            className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white p-2 rounded-full z-30"
            aria-label="Previous slide"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>
          <button
            onClick={() =>
              setCurrentSlide((prev) =>
                prev === slides.length - 1 ? 0 : prev + 1
              )
            }
            className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white p-2 rounded-full z-30"
            aria-label="Next slide"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </button>
        </div>

        {/* Product Browse Section */}
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-extrabold text-gray-900 mb-6">
            Browse Our Collection
          </h2>

          {/* Filter, Sort and Search */}
          <div className="mb-8 bg-white p-4 rounded-lg shadow-sm">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              {/* Search Bar */}
              <div className="md:w-1/3">
                <form onSubmit={handleSearch} className="relative">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search books..."
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                  />
                  <button
                    type="submit"
                    className="absolute right-0 top-0 mr-3 h-full flex items-center"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      className="w-5 h-5 text-gray-500"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
                      />
                    </svg>
                  </button>
                </form>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 sm:items-center">
                {/* Category Filter */}
                <div className="sm:w-48">
                  <label
                    htmlFor="category"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Filter by Category
                  </label>
                  <select
                    id="category"
                    value={selectedCategoryId || ""}
                    onChange={(e) =>
                      handleCategoryChange(e.target.value || null)
                    }
                    className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                  >
                    <option value="">All Categories</option>
                    {categories.map(
                      (category) =>
                        category && (
                          <option key={category.id} value={category.id}>
                            {category.name}
                          </option>
                        )
                    )}
                  </select>
                </div>

                {/* Sort By Price */}
                <div className="sm:w-48">
                  <label
                    htmlFor="sort"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Sort by Price
                  </label>
                  <select
                    id="sort"
                    value={sortOrder}
                    onChange={(e) =>
                      handleSortChange(e.target.value as "asc" | "desc")
                    }
                    className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                  >
                    <option value="asc">Price: Low to High</option>
                    <option value="desc">Price: High to Low</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Results counter */}
            <div className="mt-4 text-sm text-gray-500">
              Showing {currentProducts.length} of {filteredProducts.length}{" "}
              products
            </div>
          </div>

          {/* Product Grid */}
          <div className="grid grid-cols-1 gap-y-10 gap-x-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {loading ? (
              // Loading skeleton for products
              [...Array(8)].map((_, index) => (
                <div
                  key={index}
                  className="group relative bg-white rounded-lg overflow-hidden shadow-md animate-pulse"
                >
                  <div className="h-64 bg-gray-200"></div>
                  <div className="p-4">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2 mb-4"></div>
                    <div className="h-6 bg-gray-200 rounded w-1/4"></div>
                  </div>
                </div>
              ))
            ) : currentProducts.length > 0 ? (
              currentProducts.map(
                (product) =>
                  product && (
                    <div
                      key={product.id}
                      className="group relative bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                    >
                      <div className="relative h-64 w-full overflow-hidden">
                        <Image
                          src={
                            product.image || "/images/product-placeholder.jpg"
                          }
                          alt={product.name}
                          fill
                          className="object-cover object-center group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                      <div className="p-4">
                        <h3 className="text-sm text-gray-700 font-medium line-clamp-1">
                          <Link
                            href={`/products/${product.id}`}
                            className="hover:text-indigo-600"
                          >
                            {product.name}
                          </Link>
                        </h3>
                        <p className="mt-1 text-lg font-semibold text-gray-900">
                          ${product.price.toFixed(2)}
                        </p>
                        <Link
                          href={`/products/${product.id}`}
                          className="mt-2 inline-block text-sm font-medium text-indigo-600 hover:text-indigo-500"
                        >
                          View Details
                        </Link>
                      </div>
                    </div>
                  )
              )
            ) : (
              <div className="col-span-full text-center py-8">
                <p className="text-gray-500">
                  No products found matching your criteria
                </p>
              </div>
            )}
          </div>

          {/* Load More Button */}
          {!loading && currentProducts.length < filteredProducts.length && (
            <div className="mt-10 text-center">
              <button
                onClick={loadMoreProducts}
                className="inline-flex items-center px-6 py-3 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                Load More Books
              </button>
            </div>
          )}
        </div>

        {/* Featured Products Section */}
        {featuredProducts.length > 0 && (
          <div className="max-w-7xl mx-auto py-12 px-4">
            <h2 className="text-2xl font-extrabold text-gray-900 mb-6">
              Featured Products
            </h2>
            <div className="grid grid-cols-1 gap-y-10 gap-x-6 sm:grid-cols-2 lg:grid-cols-4">
              {featuredProducts.map((product) => (
                <div key={product?.id} className="group relative">
                  <div className="w-full min-h-80 bg-gray-200 aspect-w-1 aspect-h-1 rounded-md overflow-hidden group-hover:opacity-75">
                    <Image
                      src={product?.image || "/images/product-placeholder.jpg"}
                      alt={product?.name as string}
                      fill
                      className="object-cover object-center"
                    />
                  </div>
                  <h3 className="mt-4 text-sm text-gray-700 line-clamp-1">
                    {product?.name}
                  </h3>
                  <p className="mt-1 text-lg font-medium text-gray-900">
                    ${product?.price.toFixed(2)}
                  </p>
                  <Link
                    href={`/products/${product?.id}`}
                    className="mt-2 inline-block text-sm font-medium text-indigo-600 hover:text-indigo-500"
                  >
                    View Details
                  </Link>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Responsive Footer */}
      <footer className="bg-gray-800 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div>
              <h2 className="text-xl font-bold">E-Shop</h2>
              <p className="mt-2 text-gray-300">
                Your one-stop shop for all your needs
              </p>
              <div className="mt-4 flex space-x-4">
                <a href="#" className="text-gray-400 hover:text-white">
                  <span className="sr-only">Facebook</span>
                  <svg
                    className="h-6 w-6"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      fillRule="evenodd"
                      d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"
                      clipRule="evenodd"
                    />
                  </svg>
                </a>
                <a href="#" className="text-gray-400 hover:text-white">
                  <span className="sr-only">Instagram</span>
                  <svg
                    className="h-6 w-6"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      fillRule="evenodd"
                      d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465.668.25 1.236.585 1.8 1.15.563.563.898 1.132 1.15 1.8.247.635.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.042-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.15 1.8c-.564.563-1.133.898-1.8 1.15-.637.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.042-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.8-1.15 4.902 4.902 0 01-1.15-1.8c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.15-1.8A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z"
                      clipRule="evenodd"
                    />
                  </svg>
                </a>
                <a href="#" className="text-gray-400 hover:text-white">
                  <span className="sr-only">Twitter</span>
                  <svg
                    className="h-6 w-6"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                  </svg>
                </a>
              </div>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-2">Quick Links</h3>
              <ul className="space-y-2">
                <li>
                  <Link
                    href="/products"
                    className="text-gray-300 hover:text-white"
                  >
                    All Products
                  </Link>
                </li>
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
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-2">Customer Service</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="/faq" className="text-gray-300 hover:text-white">
                    FAQ
                  </Link>
                </li>
                <li>
                  <Link
                    href="/shipping"
                    className="text-gray-300 hover:text-white"
                  >
                    Shipping Policy
                  </Link>
                </li>
                <li>
                  <Link
                    href="/returns"
                    className="text-gray-300 hover:text-white"
                  >
                    Returns & Exchanges
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-2">Newsletter</h3>
              <p className="text-gray-300 mb-4">
                Subscribe to receive updates on new arrivals and special offers
              </p>
              <form className="flex flex-col sm:flex-row gap-2">
                <input
                  type="email"
                  placeholder="Your email"
                  className="px-4 py-2 rounded-md text-gray-900 focus:ring-2 focus:ring-indigo-500"
                />
                <button
                  type="submit"
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md"
                >
                  Subscribe
                </button>
              </form>
            </div>
          </div>
          <div className="mt-8 pt-6 border-t border-gray-700 text-sm text-gray-400 flex flex-col sm:flex-row justify-between items-center">
            <p>© {new Date().getFullYear()} E-Shop. All rights reserved.</p>
            <div className="mt-4 sm:mt-0 flex space-x-4">
              <Link href="/privacy" className="hover:text-white">
                Privacy Policy
              </Link>
              <Link href="/terms" className="hover:text-white">
                Terms of Service
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

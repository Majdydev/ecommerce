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
                        <h3 className="text-sm text-gray-700 font-medium">
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
                        <div className="mt-3 flex justify-between">
                          <Link
                            href={`/products/${product.id}`}
                            className="text-sm font-medium text-indigo-600 hover:text-indigo-800"
                          >
                            View Details
                          </Link>
                          <button
                            onClick={() => {
                              // Add to cart functionality
                              // (this would integrate with your cart store)
                            }}
                            className="text-sm font-medium bg-indigo-100 hover:bg-indigo-200 text-indigo-700 px-3 py-1 rounded"
                          >
                            Add to Cart
                          </button>
                        </div>
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

        {/* Featured Categories Section */}
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

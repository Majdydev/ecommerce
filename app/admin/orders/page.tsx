"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { OrderStatus } from "@prisma/client";

// Define valid statuses as a constant to avoid repetition
const VALID_STATUSES = [
  "PENDING",
  "CONFIRMED",
  "DELIVERED",
  "CANCELLED",
] as const;

// Define types for Order and related data
type OrderItem = {
  id: string;
  productId: string;
  quantity: number;
  price: number;
  product: {
    name: string;
  };
};

type Order = {
  id: string;
  userId: string;
  status: OrderStatus;
  total: number;
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
  items: OrderItem[];
};

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const router = useRouter();
  const searchParams = useSearchParams();
  const status = searchParams.get("status");

  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      setError(null);
      try {
        // Build the query URL with pagination and filtering
        let url = `/api/admin/orders?page=${page}&limit=10`;
        if (status && VALID_STATUSES.includes(status as OrderStatus)) {
          url += `&status=${status}`;
        }

        const res = await fetch(url);

        if (!res.ok) {
          throw new Error("Failed to fetch orders");
        }

        const data = await res.json();
        setOrders(data.orders);
        setTotalPages(data.totalPages);
      } catch (err) {
        console.error("Error fetching orders:", err);
        setError("Failed to load orders. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [page, status]);

  const handleStatusChange = (newStatus: string | null) => {
    setPage(1); // Reset to first page when filter changes

    // Update URL without full page reload
    if (newStatus) {
      router.push(`/admin/orders?status=${newStatus}`);
    } else {
      router.push("/admin/orders");
    }
  };

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Error</h1>
          <p className="text-gray-600">{error}</p>
          <Link
            href="/admin"
            className="mt-4 inline-block text-indigo-600 hover:text-indigo-500"
          >
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Manage Orders</h1>
          <Link href="/admin" className="text-indigo-600 hover:text-indigo-500">
            ← Back to Dashboard
          </Link>
        </div>

        <div className="mb-6">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => handleStatusChange(null)}
              className={`px-3 py-2 rounded-md text-sm font-medium ${
                !status
                  ? "bg-indigo-600 text-white"
                  : "bg-gray-100 text-gray-800 hover:bg-gray-200"
              }`}
            >
              All Orders
            </button>
            {VALID_STATUSES.map((statusValue) => (
              <button
                key={statusValue}
                onClick={() => handleStatusChange(statusValue)}
                className={`px-3 py-2 rounded-md text-sm font-medium ${
                  status === statusValue
                    ? "bg-indigo-600 text-white"
                    : "bg-gray-100 text-gray-800 hover:bg-gray-200"
                }`}
              >
                {statusValue.charAt(0) + statusValue.slice(1).toLowerCase()}
              </button>
            ))}
          </div>
        </div>

        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-indigo-500 border-r-transparent"></div>
              <p className="mt-4 text-gray-600">Loading orders...</p>
            </div>
          ) : orders.length === 0 ? (
            <div className="text-center py-12">
              <h2 className="text-xl font-medium text-gray-600 mb-4">
                No orders found
              </h2>
              <p className="text-gray-500">
                {status
                  ? `There are no orders with status: ${status}`
                  : "There are no orders yet"}
              </p>
            </div>
          ) : (
            <>
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Order ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Customer
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Items
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {orders.map((order) => {
                    const orderTotal = order.items.reduce(
                      (sum, item) => sum + item.price * item.quantity,
                      0
                    );

                    return (
                      <tr key={order.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {order.id.slice(0, 8)}...
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <div>{order.user.name}</div>
                          <div className="text-xs text-gray-400">
                            {order.user.email}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <div>
                            {new Date(order.createdAt).toLocaleDateString()}
                          </div>
                          <div className="text-xs text-gray-400">
                            {new Date(order.createdAt).toLocaleTimeString()}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <div>{order.items.length} items</div>
                          <div className="text-xs text-gray-400">
                            {order.items
                              .map((item) => item.product.name)
                              .join(", ")
                              .slice(0, 30)}
                            {order.items
                              .map((item) => item.product.name)
                              .join(", ").length > 30
                              ? "..."
                              : ""}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              order.status === "PENDING"
                                ? "bg-yellow-100 text-yellow-800"
                                : order.status === "CONFIRMED"
                                ? "bg-blue-100 text-blue-800"
                                : order.status === "DELIVERED"
                                ? "bg-green-100 text-green-800"
                                : "bg-red-100 text-red-800"
                            }`}
                          >
                            {order.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          ${orderTotal.toFixed(2)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <Link
                            href={`/admin/orders/${order.id}`}
                            className="text-indigo-600 hover:text-indigo-900 mr-4"
                          >
                            View
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              {/* Pagination Controls */}
              <div className="px-6 py-4 flex items-center justify-between border-t border-gray-200">
                <div className="flex-1 flex justify-between sm:hidden">
                  <button
                    onClick={() => setPage(page - 1)}
                    disabled={page <= 1}
                    className={`${
                      page <= 1
                        ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                        : "bg-white text-gray-700 hover:bg-gray-50"
                    } relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md`}
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setPage(page + 1)}
                    disabled={page >= totalPages}
                    className={`${
                      page >= totalPages
                        ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                        : "bg-white text-gray-700 hover:bg-gray-50"
                    } ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md`}
                  >
                    Next
                  </button>
                </div>
                <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm text-gray-700">
                      Showing page <span className="font-medium">{page}</span>{" "}
                      of <span className="font-medium">{totalPages}</span>
                    </p>
                  </div>
                  <div>
                    <nav
                      className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px"
                      aria-label="Pagination"
                    >
                      <button
                        onClick={() => setPage(page - 1)}
                        disabled={page <= 1}
                        className={`${
                          page <= 1
                            ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                            : "bg-white text-gray-500 hover:bg-gray-50"
                        } relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 text-sm font-medium`}
                      >
                        Previous
                      </button>

                      {/* Page number buttons */}
                      {Array.from({ length: totalPages }, (_, i) => i + 1)
                        .filter(
                          (pageNum) =>
                            pageNum === 1 ||
                            pageNum === totalPages ||
                            (pageNum >= page - 1 && pageNum <= page + 1)
                        )
                        .map((pageNum, i, filteredPages) => {
                          // Add ellipsis if there are gaps
                          const prevPage = filteredPages[i - 1];
                          const showEllipsisBefore =
                            i > 0 && prevPage !== pageNum - 1;

                          return (
                            <div key={pageNum}>
                              {showEllipsisBefore && (
                                <span className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700">
                                  ...
                                </span>
                              )}
                              <button
                                onClick={() => setPage(pageNum)}
                                className={`${
                                  page === pageNum
                                    ? "bg-indigo-50 border-indigo-500 text-indigo-600"
                                    : "bg-white border-gray-300 text-gray-500 hover:bg-gray-50"
                                } relative inline-flex items-center px-4 py-2 border text-sm font-medium`}
                              >
                                {pageNum}
                              </button>
                            </div>
                          );
                        })}

                      <button
                        onClick={() => setPage(page + 1)}
                        disabled={page >= totalPages}
                        className={`${
                          page >= totalPages
                            ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                            : "bg-white text-gray-500 hover:bg-gray-50"
                        } relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 text-sm font-medium`}
                      >
                        Next
                      </button>
                    </nav>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}

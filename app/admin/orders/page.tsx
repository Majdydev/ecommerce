"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { OrderStatus } from "@prisma/client";
import { Eye, ArrowLeft, Filter } from "lucide-react";

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
      <main className="flex-grow container mx-auto px-4 py-6 sm:py-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 sm:mb-6 gap-3 sm:gap-0">
          <h1 className="text-2xl sm:text-3xl font-bold">Manage Orders</h1>
          <Link
            href="/admin"
            className="inline-flex items-center text-indigo-600 hover:text-indigo-500"
          >
            <ArrowLeft size={16} className="mr-1.5" />
            Back to Dashboard
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <h2 className="text-sm font-medium text-gray-700 mb-3">
            Filter Orders
          </h2>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => handleStatusChange(null)}
              className={`px-3 py-1.5 rounded-md text-xs sm:text-sm font-medium ${
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
                className={`px-3 py-1.5 rounded-md text-xs sm:text-sm font-medium ${
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
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-indigo-600 border-r-transparent"></div>
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
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Order ID
                      </th>
                      <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Customer
                      </th>
                      <th className="hidden sm:table-cell px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="hidden md:table-cell px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Items
                      </th>
                      <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Total
                      </th>
                      <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
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
                        <tr key={order.id} className="hover:bg-gray-50">
                          <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-500">
                            {order.id.slice(0, 6)}...
                          </td>
                          <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm">
                            <div className="text-gray-900 font-medium truncate max-w-[120px] sm:max-w-none">
                              {order.user.name}
                            </div>
                            <div className="text-xs text-gray-500 truncate max-w-[120px] sm:max-w-none">
                              {order.user.email}
                            </div>
                          </td>
                          <td className="hidden sm:table-cell px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-500">
                            <div>
                              {new Date(order.createdAt).toLocaleDateString()}
                            </div>
                            <div className="text-xs text-gray-400">
                              {new Date(order.createdAt).toLocaleTimeString()}
                            </div>
                          </td>
                          <td className="hidden md:table-cell px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-500">
                            <div>{order.items.length} items</div>
                            <div className="text-xs text-gray-400 truncate max-w-[150px]">
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
                          <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
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
                          <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap font-medium text-xs sm:text-sm text-gray-900">
                            ${orderTotal.toFixed(2)}
                          </td>
                          <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm">
                            <Link
                              href={`/admin/orders/${order.id}`}
                              className="text-indigo-600 hover:text-indigo-900 flex items-center"
                            >
                              <Eye size={16} className="mr-1" />
                              <span className="hidden sm:inline">View</span>
                            </Link>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Pagination Controls - Mobile friendly */}
              <div className="px-4 sm:px-6 py-3 sm:py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between border-t border-gray-200">
                <div className="flex-1 flex flex-col sm:flex-row sm:items-center mb-3 sm:mb-0">
                  <p className="text-xs sm:text-sm text-gray-700">
                    Showing page <span className="font-medium">{page}</span> of{" "}
                    <span className="font-medium">{totalPages}</span>
                  </p>
                </div>

                <div className="flex justify-between sm:justify-end">
                  <button
                    onClick={() => setPage(page - 1)}
                    disabled={page <= 1}
                    className={`${
                      page <= 1
                        ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                        : "bg-white text-gray-700 hover:bg-gray-50"
                    } px-3 py-1 border border-gray-300 text-xs sm:text-sm font-medium rounded-md mr-2`}
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
                    } px-3 py-1 border border-gray-300 text-xs sm:text-sm font-medium rounded-md`}
                  >
                    Next
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}

"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import ClientLayout from "../components/ClientLayout";
import { Package, ShoppingBag, Calendar, Truck, Clock } from "lucide-react";

type OrderItem = {
  id: string;
  productId: string;
  quantity: number;
  price: number;
  product: {
    id: string;
    name: string;
    image: string;
  };
};

type Address = {
  id: string;
  name: string;
  streetLine1: string;
  streetLine2?: string | null;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phoneNumber?: string | null;
};

type Order = {
  id: string;
  status: string;
  total: number;
  createdAt: string;
  updatedAt: string;
  items: OrderItem[];
  shippingAddress?: Address | null;
};

export default function OrdersPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Redirect if user is not logged in
    if (status === "unauthenticated") {
      router.push("/auth/login?callbackUrl=/orders");
      return;
    }

    const fetchOrders = async () => {
      if (status === "authenticated") {
        setLoading(true);
        try {
          const response = await fetch("/api/orders");
          if (!response.ok) {
            throw new Error("Failed to fetch orders");
          }

          const data = await response.json();
          setOrders(data);
        } catch (err) {
          console.error("Error fetching orders:", err);
          setError("Failed to load your orders. Please try again later.");
        } finally {
          setLoading(false);
        }
      }
    };

    fetchOrders();
  }, [status, router]);

  // Get icon and colors for different status values
  const getStatusInfo = (status: string) => {
    switch (status) {
      case "PENDING":
        return {
          icon: <Clock className="w-5 h-5" />,
          bgColor: "bg-yellow-100",
          textColor: "text-yellow-800",
          borderColor: "border-yellow-200",
          label: "Pending",
        };
      case "CONFIRMED":
        return {
          icon: <Package className="w-5 h-5" />,
          bgColor: "bg-blue-100",
          textColor: "text-blue-800",
          borderColor: "border-blue-200",
          label: "Confirmed",
        };
      case "DELIVERED":
        return {
          icon: <Truck className="w-5 h-5" />,
          bgColor: "bg-green-100",
          textColor: "text-green-800",
          borderColor: "border-green-200",
          label: "Delivered",
        };
      case "CANCELLED":
        return {
          icon: <ShoppingBag className="w-5 h-5" />,
          bgColor: "bg-red-100",
          textColor: "text-red-800",
          borderColor: "border-red-200",
          label: "Cancelled",
        };
      default:
        return {
          icon: <Package className="w-5 h-5" />,
          bgColor: "bg-gray-100",
          textColor: "text-gray-800",
          borderColor: "border-gray-200",
          label: status,
        };
    }
  };

  // Format date to readable format
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(date);
  };

  return (
    <ClientLayout>
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">My Orders</h1>
          <Link
            href="/products"
            className="flex items-center gap-2 text-indigo-600 hover:text-indigo-800"
          >
            <ShoppingBag size={16} />
            <span>Continue shopping</span>
          </Link>
        </div>

        {loading ? (
          <div className="text-center py-12 bg-white rounded-lg shadow-md">
            <div className="animate-pulse flex flex-col items-center">
              <div className="h-12 w-12 rounded-full bg-gray-200 mb-4"></div>
              <div className="h-4 w-48 bg-gray-200 rounded mb-2"></div>
              <div className="h-3 w-36 bg-gray-200 rounded"></div>
            </div>
          </div>
        ) : error ? (
          <div className="bg-red-50 border-l-4 border-red-500 p-6 rounded-md shadow-sm">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg
                  className="h-5 w-5 text-red-400"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-red-700">{error}</p>
              </div>
            </div>
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-16 bg-gray-50 rounded-lg border border-gray-200 shadow-sm">
            <ShoppingBag className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-4 text-lg font-medium text-gray-900">
              No orders yet
            </h3>
            <p className="mt-2 text-gray-500">
              You haven't placed any orders yet.
            </p>
            <div className="mt-6">
              <Link
                href="/products"
                className="inline-block bg-indigo-600 text-white px-6 py-2 rounded-md hover:bg-indigo-700 transition"
              >
                Explore Products
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => {
              const statusInfo = getStatusInfo(order.status);

              return (
                <div
                  key={order.id}
                  className={`bg-white rounded-lg shadow-md overflow-hidden border-l-4 ${statusInfo.borderColor}`}
                >
                  <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
                    <div className="flex items-center">
                      <Calendar className="h-5 w-5 text-gray-500 mr-2" />
                      <div>
                        <p className="text-sm font-medium text-gray-700">
                          Order placed on {formatDate(order.createdAt)}
                        </p>
                        <p className="text-xs text-gray-500">
                          Order #{order.id.substring(0, 8)}...
                        </p>
                      </div>
                    </div>
                    <div
                      className={`flex items-center ${statusInfo.bgColor} ${statusInfo.textColor} px-3 py-1 rounded-full`}
                    >
                      {statusInfo.icon}
                      <span className="ml-1 text-xs font-medium">
                        {statusInfo.label}
                      </span>
                    </div>
                  </div>

                  <div className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                      <div className="md:col-span-3">
                        <h3 className="text-lg font-medium mb-4 flex items-center">
                          <ShoppingBag className="h-5 w-5 mr-2 text-indigo-500" />
                          Items
                        </h3>
                        <div className="space-y-4">
                          {order.items.slice(0, 3).map((item) => (
                            <div
                              key={item.id}
                              className="flex items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition"
                            >
                              <div className="h-16 w-16 relative flex-shrink-0 rounded overflow-hidden border border-gray-200">
                                <Image
                                  src={item.product.image || "/placeholder.jpg"}
                                  alt={item.product.name}
                                  fill
                                  style={{ objectFit: "cover" }}
                                />
                              </div>
                              <div className="ml-4 flex-grow">
                                <Link
                                  href={`/products/${item.product.id}`}
                                  className="text-sm font-medium text-gray-900 hover:text-indigo-600 line-clamp-1"
                                >
                                  {item.product.name}
                                </Link>
                                <p className="text-xs text-gray-500">
                                  Qty: {item.quantity} × $
                                  {item.price.toFixed(2)}
                                </p>
                              </div>
                              <span className="text-sm font-medium">
                                ${(item.price * item.quantity).toFixed(2)}
                              </span>
                            </div>
                          ))}

                          {/* Show how many more items if there are more than 3 */}
                          {order.items.length > 3 && (
                            <div className="text-xs text-gray-500 italic text-center">
                              + {order.items.length - 3} more items
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="md:col-span-1 bg-gray-50 p-4 rounded-lg">
                        <h4 className="font-medium text-gray-700 mb-2">
                          Order Summary
                        </h4>
                        <div className="text-sm">
                          <div className="flex justify-between mb-1">
                            <span className="text-gray-600">Items</span>
                            <span>{order.items.length}</span>
                          </div>
                          <div className="flex justify-between font-medium text-base border-t border-gray-200 pt-2 mt-2">
                            <span>Total</span>
                            <span className="text-indigo-700">
                              ${order.total.toFixed(2)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="mt-6 pt-4 border-t border-gray-200 flex justify-between items-center">
                      {order.shippingAddress && (
                        <div className="text-xs text-gray-500">
                          <span className="font-medium">Shipping to:</span>{" "}
                          {order.shippingAddress.city},{" "}
                          {order.shippingAddress.state}
                        </div>
                      )}
                      <Link
                        href={`/orders/${order.id}`}
                        className="bg-indigo-50 text-indigo-700 px-4 py-2 rounded-md text-sm hover:bg-indigo-100 transition flex items-center"
                      >
                        <span>View Details</span>
                        <svg
                          className="ml-2 h-4 w-4"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </ClientLayout>
  );
}

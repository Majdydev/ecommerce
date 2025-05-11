"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import ClientLayout from "../../components/ClientLayout";
import { useParams } from "next/navigation";

type OrderItem = {
  id: string;
  productId: string;
  quantity: number;
  price: number;
  product: {
    id: string;
    name: string;
    image: string;
    description: string;
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

export default function OrderDetailPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const params = useParams();
  const orderId = params.id as string;

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!session) {
      // Redirect or show message for unauthenticated users
      router.push("/auth/login?callbackUrl=/orders");
      return;
    }

    const fetchOrder = async () => {
      if (orderId) {
        setLoading(true);
        try {
          const response = await fetch(`/api/orders/${orderId}`);

          if (response.status === 404) {
            setError("Order not found");
            return;
          }

          if (!response.ok) {
            throw new Error("Failed to fetch order details");
          }

          const data = await response.json();
          setOrder(data);
        } catch (err) {
          console.error("Error fetching order:", err);
          setError("Failed to load order details. Please try again later.");
        } finally {
          setLoading(false);
        }
      }
    };

    fetchOrder();
  }, [session, router, orderId]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PENDING":
        return "bg-yellow-100 text-yellow-800";
      case "CONFIRMED":
        return "bg-blue-100 text-blue-800";
      case "DELIVERED":
        return "bg-green-100 text-green-800";
      case "CANCELLED":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Format date to readable format
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  return (
    <ClientLayout>
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-6">
          <Link
            href="/orders"
            className="text-indigo-600 hover:text-indigo-500"
          >
            ← Back to orders
          </Link>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-600">Loading order details...</p>
          </div>
        ) : error ? (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
            <p className="text-red-700">{error}</p>
          </div>
        ) : order ? (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <div>
                <h1 className="text-xl font-bold">Order #{order.id}</h1>
                <p className="text-sm text-gray-500">
                  Placed on {formatDate(order.createdAt)}
                </p>
              </div>
              <span
                className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                  order.status
                )}`}
              >
                {order.status}
              </span>
            </div>

            <div className="p-6">
              <h2 className="text-lg font-medium mb-4">Items</h2>
              <div className="space-y-6 mb-8">
                {order.items.map((item) => (
                  <div
                    key={item.id}
                    className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-6 border-b border-gray-200 last:border-0 last:pb-0"
                  >
                    <div className="flex items-start">
                      <div className="h-24 w-24 relative flex-shrink-0">
                        <Image
                          src={item.product.image || "/placeholder.jpg"}
                          alt={item.product.name}
                          fill
                          style={{ objectFit: "cover" }}
                          className="rounded-md"
                        />
                      </div>
                      <div className="ml-4">
                        <Link
                          href={`/products/${item.product.id}`}
                          className="text-lg font-medium text-gray-900 hover:text-indigo-600"
                        >
                          {item.product.name}
                        </Link>
                        <p className="text-sm text-gray-500 mt-1">
                          {item.product.description?.substring(0, 100)}
                          {item.product.description?.length > 100 ? "..." : ""}
                        </p>
                        <div className="mt-2 text-sm text-gray-600">
                          <span>Quantity: {item.quantity}</span>
                          <span className="mx-2">•</span>
                          <span>Price: ${item.price.toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                    <div className="mt-4 sm:mt-0 sm:text-right">
                      <span className="font-medium text-lg">
                        ${(item.price * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8 pt-6 border-t border-gray-200">
                <div>
                  <h2 className="text-lg font-medium mb-4">
                    Shipping Information
                  </h2>
                  {order.shippingAddress ? (
                    <div className="bg-gray-50 p-4 rounded">
                      <p className="font-medium">
                        {order.shippingAddress.name}
                      </p>
                      <address className="not-italic mt-1 text-gray-600">
                        {order.shippingAddress.streetLine1}
                        <br />
                        {order.shippingAddress.streetLine2 && (
                          <>
                            {order.shippingAddress.streetLine2}
                            <br />
                          </>
                        )}
                        {order.shippingAddress.city},{" "}
                        {order.shippingAddress.state}{" "}
                        {order.shippingAddress.postalCode}
                        <br />
                        {order.shippingAddress.country}
                        {order.shippingAddress.phoneNumber && (
                          <>
                            <br />
                            Phone: {order.shippingAddress.phoneNumber}
                          </>
                        )}
                      </address>
                    </div>
                  ) : (
                    <p className="text-gray-500">
                      No shipping address information
                    </p>
                  )}
                </div>

                <div>
                  <h2 className="text-lg font-medium mb-4">Order Summary</h2>
                  <div className="bg-gray-50 p-4 rounded">
                    <div className="flex justify-between mb-2">
                      <span className="text-gray-600">Subtotal</span>
                      <span>${order.total.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between mb-2">
                      <span className="text-gray-600">Shipping</span>
                      <span>Free</span>
                    </div>
                    <div className="flex justify-between font-medium pt-2 border-t border-gray-200 mt-2">
                      <span>Total</span>
                      <span>${order.total.toFixed(2)}</span>
                    </div>
                    <div className="mt-4 text-sm text-gray-500">
                      Payment Method: Pay on Delivery
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-gray-200">
                <div className="flex flex-col sm:flex-row sm:justify-between">
                  <div className="mb-4 sm:mb-0">
                    <h2 className="text-lg font-medium mb-1">Need Help?</h2>
                    <p className="text-gray-500">
                      If you have any questions about your order, please contact
                      our support.
                    </p>
                  </div>
                  <div>
                    <Link
                      href="/contact"
                      className="inline-block bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition"
                    >
                      Contact Support
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-600">Order not found</p>
          </div>
        )}
      </div>
    </ClientLayout>
  );
}

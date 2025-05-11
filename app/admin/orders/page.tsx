"use client";

import { useEffect, useState } from "react";

// Define proper OrderType instead of using any
type OrderType = {
  id: string;
  userId: string;
  total: number;
  status: string;
  createdAt: string;
  updatedAt: string;
  items: Array<{
    id: string;
    productId: string;
    quantity: number;
    price: number;
  }>;
  user?: {
    name: string;
    email: string;
  };
};

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<OrderType[]>([]);

  // Add useEffect to fetch orders to make use of setOrders
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await fetch("/api/orders");
        if (response.ok) {
          const data = await response.json();
          setOrders(data);
        }
      } catch (error) {
        console.error("Error fetching orders:", error);
      }
    };

    fetchOrders();
  }, []);

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Orders Management</h1>
      {/* Display orders or a message if empty */}
      {orders.length === 0 ? (
        <p className="text-gray-500">No orders found.</p>
      ) : (
        <div>{/* Order display implementation */}</div>
      )}
    </div>
  );
}

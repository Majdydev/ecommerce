import { OrderStatus } from "@prisma/client";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import prisma from "../../../lib/prisma";

// Define valid statuses as a constant to avoid repetition
const VALID_STATUSES = [
  "PENDING",
  "CONFIRMED",
  "DELIVERED",
  "CANCELLED",
] as const;

async function getOrders(statusParam?: string) {
  // Create where clause conditionally
  const where: { status?: OrderStatus } = {};

  // Check if status is a valid OrderStatus enum value
  if (statusParam && VALID_STATUSES.includes(statusParam as OrderStatus)) {
    where.status = statusParam as OrderStatus;
  }

  try {
    const orders = await prisma.order.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    return orders;
  } catch (error) {
    console.error("Failed to fetch orders:", error);
    throw new Error("Failed to fetch orders");
  }
}

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: { status?: string };
}) {
  const session = await getServerSession();

  if (!session) {
    redirect("/auth/login");
  }

  try {
    // Get the full user from the database to check role
    const user = await prisma.user.findUnique({
      where: { email: session.user?.email as string },
    });

    if (!user || user.role !== "ADMIN") {
      redirect("/auth/login");
    }

    // Get status from search params
    const { status } = searchParams;

    // Pass status to getOrders which will filter orders by status
    const orders = await getOrders(status);

    return (
      <div className="min-h-screen flex flex-col">
        <main className="flex-grow container mx-auto px-4 py-8">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold">Manage Orders</h1>
            <Link
              href="/admin"
              className="text-indigo-600 hover:text-indigo-500"
            >
              ← Back to Dashboard
            </Link>
          </div>

          <div className="mb-6">
            <div className="flex flex-wrap gap-2">
              <Link
                href="/admin/orders"
                className={`px-3 py-2 rounded-md text-sm font-medium ${
                  !status
                    ? "bg-indigo-600 text-white"
                    : "bg-gray-100 text-gray-800 hover:bg-gray-200"
                }`}
              >
                All Orders
              </Link>
              {VALID_STATUSES.map((statusValue) => (
                <Link
                  key={statusValue}
                  href={`/admin/orders?status=${statusValue}`}
                  className={`px-3 py-2 rounded-md text-sm font-medium ${
                    status === statusValue
                      ? "bg-indigo-600 text-white"
                      : "bg-gray-100 text-gray-800 hover:bg-gray-200"
                  }`}
                >
                  {statusValue.charAt(0) + statusValue.slice(1).toLowerCase()}
                </Link>
              ))}
            </div>
          </div>

          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            {orders.length === 0 ? (
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
            )}
          </div>
        </main>
      </div>
    );
  } catch (error) {
    console.error("Error in AdminOrdersPage:", error);
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Error</h1>
          <p className="text-gray-600">
            Failed to load orders. Please try again later.
          </p>
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
}

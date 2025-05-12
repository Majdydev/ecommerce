import Link from "next/link";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { User, Order } from "../types/prisma";

const prisma = new PrismaClient();

async function getStats() {
  const [users, products, orders] = await Promise.all([
    prisma.user.count(),
    prisma.product.count(),
    prisma.order.count(),
  ]);

  const pendingOrders = await prisma.order.count({
    where: { status: "PENDING" },
  });

  return { users, products, orders, pendingOrders };
}

export default async function AdminDashboard() {
  const session = await getServerSession();

  if (!session) {
    redirect("/auth/login");
  }

  // Get the full user from the database to check role
  const user = await prisma.user.findUnique({
    where: { email: session.user?.email as string },
  });

  if (!user || user.role !== "ADMIN") {
    redirect("/auth/login");
  }

  const stats = await getStats();

  return (
    <div className="min-h-screen bg-gray-100 pb-8">
      <div className="container mx-auto px-4 py-6">
        <h1 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6">Admin Dashboard</h1>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <div className="bg-white rounded-lg shadow p-4 sm:p-6">
            <h2 className="text-base sm:text-lg font-medium text-gray-900 mb-1 sm:mb-2">
              Total Users
            </h2>
            <p className="text-2xl sm:text-3xl font-bold text-indigo-600">{stats.users}</p>
            <Link
              href="/admin/users"
              className="mt-3 sm:mt-4 text-xs sm:text-sm text-indigo-600 hover:text-indigo-500 inline-block"
            >
              View all users →
            </Link>
          </div>

          <div className="bg-white rounded-lg shadow p-4 sm:p-6">
            <h2 className="text-base sm:text-lg font-medium text-gray-900 mb-1 sm:mb-2">
              Total Products
            </h2>
            <p className="text-2xl sm:text-3xl font-bold text-indigo-600">
              {stats.products}
            </p>
            <Link
              href="/admin/products"
              className="mt-3 sm:mt-4 text-xs sm:text-sm text-indigo-600 hover:text-indigo-500 inline-block"
            >
              Manage products →
            </Link>
          </div>

          <div className="bg-white rounded-lg shadow p-4 sm:p-6">
            <h2 className="text-base sm:text-lg font-medium text-gray-900 mb-1 sm:mb-2">
              Total Orders
            </h2>
            <p className="text-2xl sm:text-3xl font-bold text-indigo-600">{stats.orders}</p>
            <Link
              href="/admin/orders"
              className="mt-3 sm:mt-4 text-xs sm:text-sm text-indigo-600 hover:text-indigo-500 inline-block"
            >
              View all orders →
            </Link>
          </div>

          <div className="bg-white rounded-lg shadow p-4 sm:p-6">
            <h2 className="text-base sm:text-lg font-medium text-gray-900 mb-1 sm:mb-2">
              Pending Orders
            </h2>
            <p className="text-2xl sm:text-3xl font-bold text-indigo-600">
              {stats.pendingOrders}
            </p>
            <Link
              href="/admin/orders?status=PENDING"
              className="mt-3 sm:mt-4 text-xs sm:text-sm text-indigo-600 hover:text-indigo-500 inline-block"
            >
              View pending orders →
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow p-4 sm:p-6">
            <h2 className="text-lg sm:text-xl font-medium text-gray-900 mb-3 sm:mb-4">
              Quick Actions
            </h2>
            <div className="space-y-3 sm:space-y-4">
              <Link
                href="/admin/products/new"
                className="block w-full bg-indigo-600 text-white py-2 px-4 rounded hover:bg-indigo-700 text-center text-sm sm:text-base"
              >
                Add New Product
              </Link>
              <Link
                href="/admin/categories"
                className="block w-full bg-indigo-600 text-white py-2 px-4 rounded hover:bg-indigo-700 text-center text-sm sm:text-base"
              >
                Manage Categories
              </Link>
              <Link
                href="/admin/orders"
                className="block w-full border border-indigo-600 text-indigo-600 py-2 px-4 rounded hover:bg-indigo-50 text-center text-sm sm:text-base"
              >
                View All Orders
              </Link>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-4 sm:p-6">
            <h2 className="text-lg sm:text-xl font-medium text-gray-900 mb-3 sm:mb-4">
              Recent Orders
            </h2>
            <RecentOrders />
          </div>
        </div>
      </div>
    </div>
  );
}

async function RecentOrders() {
  const recentOrders = await prisma.order.findMany({
    take: 5,
    orderBy: {
      createdAt: "desc",
    },
    include: {
      user: {
        select: {
          name: true,
        },
      },
      items: {
        include: {
          product: {
            select: {
              name: true,
            },
          },
        },
      },
    },
  });

  if (recentOrders.length === 0) {
    return <p className="text-gray-500 text-sm">No orders found.</p>;
  }

  return (
    <div className="overflow-x-auto -mx-4 sm:-mx-6">
      <div className="inline-block min-w-full align-middle px-4 sm:px-6">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                ID
              </th>
              <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Customer
              </th>
              <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Total
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {recentOrders.map((order) => {
              // Calculate the total from order items
              const orderTotal = order.items.reduce(
                (sum, item) => sum + item.price * item.quantity,
                0
              );

              return (
                <tr key={order.id} className="hover:bg-gray-50">
                  <td className="px-3 sm:px-6 py-3 whitespace-nowrap text-xs sm:text-sm text-gray-500">
                    <Link
                      href={`/admin/orders/${order.id}`}
                      className="text-indigo-600 hover:text-indigo-900"
                    >
                      {order.id.slice(0, 4)}...
                    </Link>
                  </td>
                  <td className="px-3 sm:px-6 py-3 whitespace-nowrap text-xs sm:text-sm text-gray-500">
                    {order.user.name}
                  </td>
                  <td className="px-3 sm:px-6 py-3 whitespace-nowrap">
                    <span
                      className={`px-2 py-0.5 inline-flex text-xs leading-5 font-medium rounded-full ${
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
                  <td className="px-3 sm:px-6 py-3 whitespace-nowrap text-xs sm:text-sm text-gray-500">
                    ${orderTotal.toFixed(2)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <div className="mt-3 text-right">
        <Link 
          href="/admin/orders" 
          className="text-xs sm:text-sm text-indigo-600 hover:text-indigo-800"
        >
          See all orders →
        </Link>
      </div>
    </div>
  );
}

import Link from 'next/link';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import Navbar from '@/components/Navbar';
import { User, Order } from '@/types/prisma';

const prisma = new PrismaClient();

async function getStats() {
  const [users, products, orders] = await Promise.all([
    prisma.user.count(),
    prisma.product.count(),
    prisma.order.count(),
  ]);
  
  const pendingOrders = await prisma.order.count({
    where: { status: 'PENDING' },
  });
  
  return { users, products, orders, pendingOrders };
}

export default async function AdminDashboard() {
  const session = await getServerSession();
  
  if (!session) {
    redirect('/auth/login');
  }
  
  // Get the full user from the database to check role
  const user = await prisma.user.findUnique({
    where: { email: session.user?.email as string },
  });
  
  if (!user || user.role !== 'ADMIN') {
    redirect('/auth/login');
  }
  
  const stats = await getStats();
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-2">Total Users</h2>
            <p className="text-3xl font-bold text-indigo-600">{stats.users}</p>
            <Link href="/admin/users" className="mt-4 text-sm text-indigo-600 hover:text-indigo-500 inline-block">
              View all users →
            </Link>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-2">Total Products</h2>
            <p className="text-3xl font-bold text-indigo-600">{stats.products}</p>
            <Link href="/admin/products" className="mt-4 text-sm text-indigo-600 hover:text-indigo-500 inline-block">
              Manage products →
            </Link>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-2">Total Orders</h2>
            <p className="text-3xl font-bold text-indigo-600">{stats.orders}</p>
            <Link href="/admin/orders" className="mt-4 text-sm text-indigo-600 hover:text-indigo-500 inline-block">
              View all orders →
            </Link>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-2">Pending Orders</h2>
            <p className="text-3xl font-bold text-indigo-600">{stats.pendingOrders}</p>
            <Link href="/admin/orders?status=PENDING" className="mt-4 text-sm text-indigo-600 hover:text-indigo-500 inline-block">
              View pending orders →
            </Link>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-medium text-gray-900 mb-4">Quick Actions</h2>
            <div className="space-y-4">
              <Link href="/admin/products/new" className="block w-full bg-indigo-600 text-white py-2 px-4 rounded hover:bg-indigo-700 text-center">
                Add New Product
              </Link>
              <Link href="/admin/users/new" className="block w-full bg-indigo-600 text-white py-2 px-4 rounded hover:bg-indigo-700 text-center">
                Add New User
              </Link>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-medium text-gray-900 mb-4">Recent Orders</h2>
            <RecentOrders />
          </div>
        </div>
      </main>
    </div>
  );
}

async function RecentOrders() {
  const recentOrders = await prisma.order.findMany({
    take: 5,
    orderBy: {
      createdAt: 'desc',
    },
    include: {
      user: {
        select: {
          name: true,
        },
      },
    },
  });
  
  return (
    <div className="overflow-x-auto">
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
              Status
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Total
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {recentOrders.map((order: Order & { user: { name: string | null } }) => (
            <tr key={order.id}>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                <Link href={`/admin/orders/${order.id}`} className="text-indigo-600 hover:text-indigo-900">
                  {order.id.slice(0, 8)}...
                </Link>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {order.user.name}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                  order.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                  order.status === 'CONFIRMED' ? 'bg-blue-100 text-blue-800' :
                  order.status === 'DELIVERED' ? 'bg-green-100 text-green-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {order.status}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                ${order.total.toFixed(2)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
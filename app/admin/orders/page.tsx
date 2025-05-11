import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import { User, Order } from '@/types/prisma';

const prisma = new PrismaClient();

async function getOrders(status?: string) {
  const query: any = {};
  
  if (status) {
    query.status = status;
  }
  
  const orders = await prisma.order.findMany({
    where: query,
    orderBy: { createdAt: 'desc' },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });
  
  return orders;
}

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: { status?: string };
}) {
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
  
  const { status } = searchParams;
  const orders = await getOrders(status);
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Manage Orders</h1>
          <Link href="/admin" className="text-indigo-600 hover:text-indigo-500">
            ← Back to Dashboard
          </Link>
        </div>
        
        <div className="mb-6">
          <div className="flex flex-wrap gap-2">
            <Link 
              href="/admin/orders" 
              className={`px-3 py-2 rounded-md text-sm font-medium ${
                !status ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
              }`}
            >
              All Orders
            </Link>
            <Link 
              href="/admin/orders?status=PENDING" 
              className={`px-3 py-2 rounded-md text-sm font-medium ${
                status === 'PENDING' ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
              }`}
            >
              Pending
            </Link>
            <Link 
              href="/admin/orders?status=CONFIRMED" 
              className={`px-3 py-2 rounded-md text-sm font-medium ${
                status === 'CONFIRMED' ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
              }`}
            >
              Confirmed
            </Link>
            <Link 
              href="/admin/orders?status=DELIVERED" 
              className={`px-3 py-2 rounded-md text-sm font-medium ${
                status === 'DELIVERED' ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
              }`}
            >
              Delivered
            </Link>
            <Link 
              href="/admin/orders?status=CANCELLED" 
              className={`px-3 py-2 rounded-md text-sm font-medium ${
                status === 'CANCELLED' ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
              }`}
            >
              Cancelled
            </Link>
          </div>
        </div>
        
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          {orders.length === 0 ? (
            <div className="text-center py-12">
              <h2 className="text-xl font-medium text-gray-600 mb-4">No orders found</h2>
              <p className="text-gray-500">
                {status ? `There are no orders with status: ${status}` : 'There are no orders yet'}
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
                {orders.map((order: Order & { 
                  user: { 
                    id: string; 
                    name: string | null; 
                    email: string | null;
                  } 
                }) => (
                  <tr key={order.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {order.id.slice(0, 8)}...
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div>{order.user.name}</div>
                      <div className="text-xs text-gray-400">{order.user.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(order.createdAt).toLocaleDateString()}
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
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <Link href={`/admin/orders/${order.id}`} className="text-indigo-600 hover:text-indigo-900 mr-4">
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </main>
    </div>
  );
}
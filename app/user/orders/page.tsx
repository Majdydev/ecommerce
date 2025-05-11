import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import { Order } from '@/types/prisma';

const prisma = new PrismaClient();

async function getUserOrders() {
  const session = await getServerSession();
  
  if (!session || !session.user) {
    return [];
  }
  
  const user = await prisma.user.findUnique({
    where: { email: session.user.email as string },
  });
  
  if (!user) {
    return [];
  }
  
  const orders = await prisma.order.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: 'desc' },
    include: {
      items: {
        include: {
          product: true,
        },
      },
    },
  });
  
  return orders;
}

export default async function UserOrdersPage() {
  const session = await getServerSession();
  
  if (!session) {
    redirect('/auth/login');
  }
  
  const orders = await getUserOrders();
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Your Orders</h1>
        
        {orders.length === 0 ? (
          <div className="text-center py-12">
            <h2 className="text-xl font-medium text-gray-600 mb-4">You haven't placed any orders yet</h2>
            <p className="text-gray-500 mb-6">Browse our products and place your first order!</p>
            <Link href="/products" className="inline-block bg-indigo-600 text-white py-2 px-4 rounded hover:bg-indigo-700">
              Browse Products
            </Link>
          </div>
        ) : (
          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            <ul className="divide-y divide-gray-200">
              {orders.map((order: Order & { items: any[] }) => (
                <li key={order.id}>
                  <Link href={`/user/orders/${order.id}`} className="block hover:bg-gray-50">
                    <div className="px-4 py-4 sm:px-6">
                      <div className="flex items-center justify-between">
                        <div className="flex flex-col">
                          <p className="text-sm font-medium text-indigo-600 truncate">
                            Order #{order.id.slice(0, 8)}...
                          </p>
                          <p className="mt-1 text-sm text-gray-500">
                            Placed on {new Date(order.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="ml-2 flex-shrink-0 flex">
                          <p className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            order.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                            order.status === 'CONFIRMED' ? 'bg-blue-100 text-blue-800' :
                            order.status === 'DELIVERED' ? 'bg-green-100 text-green-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {order.status}
                          </p>
                        </div>
                      </div>
                      <div className="mt-2 sm:flex sm:justify-between">
                        <div className="sm:flex">
                          <p className="flex items-center text-sm text-gray-500">
                            {order.items.length} {order.items.length === 1 ? 'item' : 'items'}
                          </p>
                        </div>
                        <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                          <p>Total: ${order.total.toFixed(2)}</p>
                        </div>
                      </div>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}
      </main>
    </div>
  );
}
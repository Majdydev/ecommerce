import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth';
import { notFound, redirect } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import { Order, OrderItem } from '@/types/prisma';

const prisma = new PrismaClient();

async function getOrder(id: string) {
  const session = await getServerSession();
  
  if (!session || !session.user) {
    return null;
  }
  
  const user = await prisma.user.findUnique({
    where: { email: session.user.email as string },
  });
  
  if (!user) {
    return null;
  }
  
  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      items: {
        include: {
          product: true,
        },
      },
    },
  });
  
  if (!order || (order.userId !== user.id && user.role !== 'ADMIN')) {
    return null;
  }
  
  return order;
}

export default async function OrderDetailPage({ params }: { params: { id: string } }) {
  const session = await getServerSession();
  
  if (!session) {
    redirect('/auth/login');
  }
  
  const order = await getOrder(params.id);
  
  if (!order) {
    notFound();
  }
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="mb-6">
          <Link href="/user/orders" className="text-indigo-600 hover:text-indigo-500">
            ← Back to orders
          </Link>
        </div>
        
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6">
            <h1 className="text-lg leading-6 font-medium text-gray-900">
              Order Details
            </h1>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">
              Order #{order.id}
            </p>
          </div>
          
          <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
            <dl className="grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-2">
              <div className="sm:col-span-1">
                <dt className="text-sm font-medium text-gray-500">Order Status</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    order.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                    order.status === 'CONFIRMED' ? 'bg-blue-100 text-blue-800' :
                    order.status === 'DELIVERED' ? 'bg-green-100 text-green-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {order.status}
                  </span>
                </dd>
              </div>
              
              <div className="sm:col-span-1">
                <dt className="text-sm font-medium text-gray-500">Order Date</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {new Date(order.createdAt).toLocaleDateString()} at {new Date(order.createdAt).toLocaleTimeString()}
                </dd>
              </div>
              
              <div className="sm:col-span-1">
                <dt className="text-sm font-medium text-gray-500">Delivery Address</dt>
                <dd className="mt-1 text-sm text-gray-900">{order.address}</dd>
              </div>
              
              <div className="sm:col-span-1">
                <dt className="text-sm font-medium text-gray-500">Contact Phone</dt>
                <dd className="mt-1 text-sm text-gray-900">{order.phone}</dd>
              </div>
              
              <div className="sm:col-span-2">
                <dt className="text-sm font-medium text-gray-500">Payment Method</dt>
                <dd className="mt-1 text-sm text-gray-900">Pay on Delivery</dd>
              </div>
            </dl>
          </div>
          
          <div className="border-t border-gray-200">
            <h2 className="sr-only">Items</h2>
            <div className="divide-y divide-gray-200">
              {order.items.map((item: OrderItem & { product: any }) => (
                <div key={item.id} className="px-4 py-6 sm:px-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 w-20 h-20 bg-gray-200 rounded-md overflow-hidden">
                      {item.product.image && (
                        <Image
                          src={item.product.image}
                          alt={item.product.name}
                          width={80}
                          height={80}
                          className="w-full h-full object-center object-cover"
                        />
                      )}
                    </div>
                    <div className="ml-6 flex-1 flex flex-col">
                      <div className="flex">
                        <div className="min-w-0 flex-1">
                          <h4 className="text-sm font-medium text-gray-900">
                            <Link href={`/products/${item.product.id}`} className="hover:underline">
                              {item.product.name}
                            </Link>
                          </h4>
                        </div>
                      </div>
                      <div className="mt-2 flex-1 flex items-end justify-between">
                        <p className="mt-1 text-sm text-gray-500">
                          Qty {item.quantity}
                        </p>
                        <p className="text-sm font-medium text-gray-900">
                          ${item.price.toFixed(2)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="border-t border-gray-200 px-4 py-6 sm:px-6">
            <div className="flex justify-between text-base font-medium text-gray-900">
              <p>Total</p>
              <p>${order.total.toFixed(2)}</p>
            </div>
            <p className="mt-1 text-sm text-gray-500">
              Payment will be collected upon delivery.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
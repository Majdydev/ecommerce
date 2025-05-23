import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth";
import { notFound, redirect } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import UpdateOrderStatus from "../../../components/admin/UpdateOrderStatus";
import { OrderItem } from "../../../types/prisma";

const prisma = new PrismaClient();

async function getOrder(id: string) {
  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      user: true,
      items: {
        include: {
          product: true,
        },
      },
      shippingAddress: true,
    },
  });

  if (!order) {
    return null;
  }

  return order;
}

export default async function AdminOrderDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const session = await getServerSession();

  if (!session) {
    redirect("/auth/login");
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user?.email as string },
  });

  if (!user || user.role !== "ADMIN") {
    redirect("/auth/login");
  }

  const order = await getOrder(params.id);

  if (!order) {
    notFound();
  }

  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-grow container mx-auto px-4 py-6 sm:py-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 sm:mb-6 gap-3 sm:gap-0">
          <Link
            href="/admin/orders"
            className="inline-flex items-center text-indigo-600 hover:text-indigo-500"
          >
            <ArrowLeft size={16} className="mr-1.5" /> Back to orders
          </Link>

          <UpdateOrderStatus orderId={order.id} currentStatus={order.status} />
        </div>

        <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-6 sm:mb-8">
          <div className="px-4 py-4 sm:px-6 flex flex-col sm:flex-row justify-between sm:items-center">
            <div>
              <h1 className="text-lg leading-6 font-medium text-gray-900">
                Order Details
              </h1>
              <p className="mt-1 max-w-2xl text-xs sm:text-sm text-gray-500">
                Order #{order.id.substring(0, 8)}...
              </p>
            </div>
            <span
              className={`mt-2 sm:mt-0 px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full w-fit ${
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
          </div>

          <div className="border-t border-gray-200 px-4 py-4 sm:px-6">
            <h3 className="text-base sm:text-lg leading-6 font-medium text-gray-900 mb-3 sm:mb-4">
              Customer Information
            </h3>
            <dl className="grid grid-cols-1 gap-x-4 gap-y-4 sm:gap-y-6 sm:grid-cols-2 text-sm">
              <div className="sm:col-span-1">
                <dt className="text-xs sm:text-sm font-medium text-gray-500">
                  Name
                </dt>
                <dd className="mt-1 text-xs sm:text-sm text-gray-900">
                  {order.user.name}
                </dd>
              </div>

              <div className="sm:col-span-1">
                <dt className="text-xs sm:text-sm font-medium text-gray-500">
                  Email
                </dt>
                <dd className="mt-1 text-xs sm:text-sm text-gray-900 break-words">
                  {order.user.email}
                </dd>
              </div>

              <div className="sm:col-span-1">
                <dt className="text-xs sm:text-sm font-medium text-gray-500">
                  Delivery Address
                </dt>
                <dd className="mt-1 text-xs sm:text-sm text-gray-900">
                  {order.shippingAddress ? (
                    <>
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
                    </>
                  ) : (
                    "No shipping address provided"
                  )}
                </dd>
              </div>

              <div className="sm:col-span-1">
                <dt className="text-xs sm:text-sm font-medium text-gray-500">
                  Contact Phone
                </dt>
                <dd className="mt-1 text-xs sm:text-sm text-gray-900">
                  {order.shippingAddress?.phoneNumber || "Not provided"}
                </dd>
              </div>
            </dl>
          </div>

          <div className="border-t border-gray-200 px-4 py-4 sm:px-6">
            <h3 className="text-base sm:text-lg leading-6 font-medium text-gray-900 mb-3 sm:mb-4">
              Order Information
            </h3>
            <dl className="grid grid-cols-1 gap-x-4 gap-y-4 sm:gap-y-6 sm:grid-cols-2 text-sm">
              <div className="sm:col-span-1">
                <dt className="text-xs sm:text-sm font-medium text-gray-500">
                  Order Date
                </dt>
                <dd className="mt-1 text-xs sm:text-sm text-gray-900">
                  {new Date(order.createdAt).toLocaleDateString()} at{" "}
                  {new Date(order.createdAt).toLocaleTimeString()}
                </dd>
              </div>

              <div className="sm:col-span-1">
                <dt className="text-xs sm:text-sm font-medium text-gray-500">
                  Last Updated
                </dt>
                <dd className="mt-1 text-xs sm:text-sm text-gray-900">
                  {new Date(order.updatedAt).toLocaleDateString()} at{" "}
                  {new Date(order.updatedAt).toLocaleTimeString()}
                </dd>
              </div>

              <div className="sm:col-span-2">
                <dt className="text-xs sm:text-sm font-medium text-gray-500">
                  Payment Method
                </dt>
                <dd className="mt-1 text-xs sm:text-sm text-gray-900">
                  Pay on Delivery
                </dd>
              </div>
            </dl>
          </div>

          <div className="border-t border-gray-200">
            <h2 className="sr-only">Items</h2>
            <ul className="divide-y divide-gray-200">
              {order.items.map(
                (
                  item: OrderItem & {
                    product: {
                      id: string;
                      name: string;
                      image: string | null;
                    };
                  }
                ) => (
                  <li key={item.id} className="px-4 py-4 sm:px-6">
                    <div className="flex items-center flex-wrap sm:flex-nowrap">
                      <div className="flex-shrink-0 w-16 h-16 bg-gray-200 rounded-md overflow-hidden">
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
                      <div className="ml-4 flex-1">
                        <div className="flex flex-wrap justify-between">
                          <div className="pr-2">
                            <h4 className="text-xs sm:text-sm font-medium text-gray-900">
                              <Link
                                href={`/products/${item.product.id}`}
                                className="hover:underline"
                              >
                                {item.product.name}
                              </Link>
                            </h4>
                            <p className="mt-1 text-xs text-gray-500 break-all">
                              ID: {item.product.id.substring(0, 8)}...
                            </p>
                          </div>
                          <div className="mt-1 sm:mt-0 text-right">
                            <p className="text-xs sm:text-sm font-medium text-gray-900">
                              ${item.price.toFixed(2)}
                            </p>
                            <p className="mt-1 text-xs text-gray-500">
                              Qty: {item.quantity}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </li>
                )
              )}
            </ul>
          </div>

          <div className="border-t border-gray-200 px-4 py-4 sm:px-6">
            <div className="flex justify-between text-sm sm:text-base font-medium text-gray-900">
              <p>Total</p>
              <p>${order.total.toFixed(2)}</p>
            </div>
            <p className="mt-1 text-xs sm:text-sm text-gray-500">
              Payment will be collected upon delivery.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}

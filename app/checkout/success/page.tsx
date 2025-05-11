"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { CheckCircle } from "lucide-react";
import ClientLayout from "../../components/ClientLayout";

export default function CheckoutSuccessPage() {
  const router = useRouter();

  // If user directly visits this page without completing checkout, redirect after a delay
  useEffect(() => {
    const timer = setTimeout(() => {
      // This checks localStorage or other state to verify checkout was completed
      // If not implemented yet, you can remove this check
      const checkoutCompleted = true; // Replace with actual checkout verification
      if (!checkoutCompleted) {
        router.push("/");
      }
    }, 5000);

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <ClientLayout>
      <div className="max-w-2xl mx-auto px-4 py-16">
        <div className="bg-green-50 p-8 rounded-lg shadow-md border border-green-100 text-center mb-8">
          <CheckCircle className="w-20 h-20 mx-auto text-green-600" />
          <h1 className="text-3xl font-bold mt-6 mb-2 text-green-800">
            Order Placed Successfully!
          </h1>
          <p className="text-gray-600 mb-4">
            Thank you for your purchase. We've received your order and it's
            being processed.
          </p>
          <div className="mt-2 inline-flex items-center justify-center px-4 py-2 bg-green-100 text-green-800 rounded-full">
            <span className="text-sm font-medium">Order confirmed</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-blue-500 mb-8">
          <h2 className="text-lg font-medium mb-4 text-blue-800">
            What happens next?
          </h2>
          <ol className="text-left space-y-4">
            <li className="flex items-start">
              <span className="bg-blue-100 text-blue-800 font-bold rounded-full w-6 h-6 flex items-center justify-center mr-2 mt-0.5">
                1
              </span>
              <span>
                We'll send you an email confirmation with your order details.
              </span>
            </li>
            <li className="flex items-start">
              <span className="bg-blue-100 text-blue-800 font-bold rounded-full w-6 h-6 flex items-center justify-center mr-2 mt-0.5">
                2
              </span>
              <span>Our team will prepare your items for delivery.</span>
            </li>
            <li className="flex items-start">
              <span className="bg-blue-100 text-blue-800 font-bold rounded-full w-6 h-6 flex items-center justify-center mr-2 mt-0.5">
                3
              </span>
              <span>
                You'll receive another notification when your order ships.
              </span>
            </li>
          </ol>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/orders"
            className="bg-indigo-600 text-white px-6 py-3 rounded-md hover:bg-indigo-700 transition flex items-center justify-center gap-2"
          >
            <span>View My Orders</span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M9 14 4 9l5-5"></path>
              <path d="M4 9h16"></path>
              <path d="M17 4v10"></path>
              <path d="M12 19h8"></path>
              <path d="M2 19h8"></path>
            </svg>
          </Link>
          <Link
            href="/"
            className="bg-gray-100 border border-gray-300 text-gray-800 px-6 py-3 rounded-md hover:bg-gray-200 transition flex items-center justify-center gap-2"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
              <polyline points="9 22 9 12 15 12 15 22"></polyline>
            </svg>
            <span>Continue Shopping</span>
          </Link>
        </div>
      </div>
    </ClientLayout>
  );
}

"use client";

import { useState, useEffect } from "react";
import { useCartStore } from "../../store/cartStore";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Trash2, Plus, Minus, Home } from "lucide-react";

// Define Address type based on our Prisma schema
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
  isDefault: boolean;
};

export default function CartPageContent() {
  const { items, removeItem, updateQuantity, totalPrice, clearCart } =
    useCartStore();
  const { data: session } = useSession();
  const router = useRouter();
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(
    null
  );
  const [isLoadingAddresses, setIsLoadingAddresses] = useState(false);
  const [showAddressForm, setShowAddressForm] = useState(false);

  // Fetch user's shipping addresses when session is available
  useEffect(() => {
    const fetchAddresses = async () => {
      if (session?.user) {
        setIsLoadingAddresses(true);
        try {
          const response = await fetch("/api/user/addresses");
          if (response.ok) {
            const data = await response.json();
            setAddresses(data);

            // Set default address if available
            const defaultAddress = data.find(
              (address: Address) => address.isDefault
            );
            if (defaultAddress) {
              setSelectedAddressId(defaultAddress.id);
            } else if (data.length > 0) {
              setSelectedAddressId(data[0].id);
            }
          }
        } catch (error) {
          console.error("Error fetching addresses:", error);
        } finally {
          setIsLoadingAddresses(false);
        }
      }
    };

    fetchAddresses();
  }, [session]);

  const handleCheckout = async () => {
    if (!session) {
      router.push("/auth/login?callbackUrl=/cart");
      return;
    }

    // If no addresses, show address form
    if (addresses.length === 0 && !showAddressForm) {
      setShowAddressForm(true);
      return;
    }

    // If address form is showing, validate it's submitted
    if (showAddressForm && !selectedAddressId) {
      alert("Please add a shipping address to continue");
      return;
    }

    // Ensure an address is selected
    if (!selectedAddressId) {
      alert("Please select a shipping address to continue");
      return;
    }

    setIsCheckingOut(true);
    try {
      // Create order with selected address
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map((item) => ({
            productId: item.id,
            quantity: item.quantity,
            price: item.price,
          })),
          addressId: selectedAddressId,
          total: totalPrice,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create order");
      }

      // After successful checkout
      clearCart();
      router.push("/checkout/success");
    } catch (error) {
      console.error("Checkout failed:", error);
      alert("There was a problem processing your order. Please try again.");
    } finally {
      setIsCheckingOut(false);
    }
  };

  // Handle new address submission
  const handleAddressSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const addressData = {
      name: formData.get("name") as string,
      streetLine1: formData.get("streetLine1") as string,
      streetLine2: (formData.get("streetLine2") as string) || null,
      city: formData.get("city") as string,
      state: formData.get("state") as string,
      postalCode: formData.get("postalCode") as string,
      country: formData.get("country") as string,
      phoneNumber: (formData.get("phoneNumber") as string) || null,
      isDefault: addresses.length === 0 || Boolean(formData.get("isDefault")),
    };

    try {
      const response = await fetch("/api/user/addresses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(addressData),
      });

      if (!response.ok) {
        throw new Error("Failed to save address");
      }

      const newAddress = await response.json();
      setAddresses((prev) => [...prev, newAddress]);
      setSelectedAddressId(newAddress.id);
      setShowAddressForm(false);
    } catch (error) {
      console.error("Failed to save address:", error);
      alert("There was a problem saving your address. Please try again.");
    }
  };

  if (items.length === 0) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold mb-4">Your cart is empty</h2>
        <p className="mb-8 text-gray-600">
          Looks like you haven&apos;t added anything to your cart yet.
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <Link
            href="/products"
            className="inline-block bg-indigo-600 text-white px-6 py-2 rounded-md hover:bg-indigo-700 transition"
          >
            Continue Shopping
          </Link>
          <Link
            href="/"
            className="flex items-center justify-center gap-2 bg-gray-600 text-white px-6 py-2 rounded-md hover:bg-gray-700 transition"
          >
            <Home size={18} /> Go to Homepage
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Your Cart</h1>
        <Link
          href="/"
          className="flex items-center gap-2 text-gray-600 hover:text-indigo-600 transition"
        >
          <Home size={18} /> Back to Home
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Product
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Quantity
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Price
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {items.map((item) => (
                  <tr key={item.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-16 w-16 relative flex-shrink-0">
                          <Image
                            src={item.image || "/placeholder.jpg"}
                            alt={item.name}
                            fill
                            style={{ objectFit: "cover" }}
                            className="rounded-md"
                          />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {item.name}
                          </div>
                          <div className="text-sm text-gray-500">
                            ${item.price.toFixed(2)}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() =>
                            updateQuantity(
                              item.id,
                              Math.max(1, item.quantity - 1)
                            )
                          }
                          className="p-1 rounded-md hover:bg-gray-100"
                        >
                          <Minus size={18} />
                        </button>
                        <span className="text-gray-900 w-8 text-center">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() =>
                            updateQuantity(item.id, item.quantity + 1)
                          }
                          className="p-1 rounded-md hover:bg-gray-100"
                        >
                          <Plus size={18} />
                        </button>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ${(item.price * item.quantity).toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => removeItem(item.id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="lg:col-span-1">
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-lg font-medium mb-4">Order Summary</h2>
            <div className="space-y-3 mb-6">
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal</span>
                <span className="font-medium">${totalPrice.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Shipping</span>
                <span className="font-medium">Free</span>
              </div>
              <div className="border-t pt-3 mt-3">
                <div className="flex justify-between font-semibold">
                  <span>Total</span>
                  <span>${totalPrice.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Shipping Address Section */}
            <div className="mt-6 mb-6">
              <h3 className="text-md font-medium mb-2">Shipping Address</h3>

              {isLoadingAddresses ? (
                <p className="text-sm text-gray-500">Loading addresses...</p>
              ) : showAddressForm ? (
                <form onSubmit={handleAddressSubmit} className="space-y-3">
                  <div>
                    <label
                      htmlFor="name"
                      className="block text-sm text-gray-600"
                    >
                      Address Name
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      required
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                      placeholder="Home, Work, etc."
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="streetLine1"
                      className="block text-sm text-gray-600"
                    >
                      Street Address
                    </label>
                    <input
                      type="text"
                      id="streetLine1"
                      name="streetLine1"
                      required
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="streetLine2"
                      className="block text-sm text-gray-600"
                    >
                      Apartment, Suite, etc. (optional)
                    </label>
                    <input
                      type="text"
                      id="streetLine2"
                      name="streetLine2"
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label
                        htmlFor="city"
                        className="block text-sm text-gray-600"
                      >
                        City
                      </label>
                      <input
                        type="text"
                        id="city"
                        name="city"
                        required
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="state"
                        className="block text-sm text-gray-600"
                      >
                        State/Province
                      </label>
                      <input
                        type="text"
                        id="state"
                        name="state"
                        required
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label
                        htmlFor="postalCode"
                        className="block text-sm text-gray-600"
                      >
                        Postal Code
                      </label>
                      <input
                        type="text"
                        id="postalCode"
                        name="postalCode"
                        required
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="country"
                        className="block text-sm text-gray-600"
                      >
                        Country
                      </label>
                      <input
                        type="text"
                        id="country"
                        name="country"
                        required
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                      />
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="phoneNumber"
                      className="block text-sm text-gray-600"
                    >
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      id="phoneNumber"
                      name="phoneNumber"
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                    />
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="isDefault"
                      name="isDefault"
                      className="rounded border-gray-300 text-indigo-600 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                    />
                    <label
                      htmlFor="isDefault"
                      className="ml-2 block text-sm text-gray-600"
                    >
                      Set as default address
                    </label>
                  </div>

                  <div className="flex justify-between pt-2">
                    <button
                      type="button"
                      onClick={() => setShowAddressForm(false)}
                      className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-3 py-1 bg-indigo-600 text-white text-sm rounded hover:bg-indigo-700"
                    >
                      Save Address
                    </button>
                  </div>
                </form>
              ) : addresses.length > 0 ? (
                <div>
                  <div className="mb-3">
                    <select
                      value={selectedAddressId || ""}
                      onChange={(e) => setSelectedAddressId(e.target.value)}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                    >
                      {addresses.map((address) => (
                        <option key={address.id} value={address.id}>
                          {address.name} - {address.streetLine1}, {address.city}
                        </option>
                      ))}
                    </select>
                  </div>
                  {selectedAddressId && (
                    <div className="text-sm text-gray-600 p-3 bg-gray-50 rounded">
                      {(() => {
                        const address = addresses.find(
                          (a) => a.id === selectedAddressId
                        );
                        if (!address) return null;
                        return (
                          <>
                            <p>
                              <span className="font-medium">
                                {address.name}
                              </span>
                            </p>
                            <p>{address.streetLine1}</p>
                            {address.streetLine2 && (
                              <p>{address.streetLine2}</p>
                            )}
                            <p>
                              {address.city}, {address.state}{" "}
                              {address.postalCode}
                            </p>
                            <p>{address.country}</p>
                            {address.phoneNumber && (
                              <p>Phone: {address.phoneNumber}</p>
                            )}
                          </>
                        );
                      })()}
                    </div>
                  )}
                  <button
                    onClick={() => setShowAddressForm(true)}
                    className="text-indigo-600 hover:text-indigo-800 text-sm mt-2"
                  >
                    Add new address
                  </button>
                </div>
              ) : (
                <div>
                  <p className="mb-3 text-sm text-gray-500">
                    No shipping addresses found.
                  </p>
                  <button
                    onClick={() => setShowAddressForm(true)}
                    className="text-indigo-600 hover:text-indigo-800 text-sm"
                  >
                    + Add shipping address
                  </button>
                </div>
              )}
            </div>

            {/* Checkout buttons */}
            <div className="flex flex-col gap-2 mt-4">
              <button
                onClick={handleCheckout}
                disabled={
                  isCheckingOut || (addresses.length === 0 && !showAddressForm)
                }
                className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isCheckingOut
                  ? "Processing..."
                  : addresses.length === 0 && !showAddressForm
                  ? "Add Shipping Address"
                  : "Checkout"}
              </button>
              <button
                onClick={() => router.push("/products")}
                className="w-full bg-white border border-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-50 transition"
              >
                Continue Shopping
              </button>
              <Link
                href="/"
                className="w-full flex items-center justify-center gap-2 border border-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-50 transition"
              >
                <Home size={18} /> Back to Homepage
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

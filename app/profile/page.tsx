"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import ClientLayout from "../components/ClientLayout";
import {
  User,
  Edit2,
  MapPin,
  Package,
  Plus,
  Trash2,
  Save,
  X,
} from "lucide-react";
import { Address } from "../types/prisma";

// Define a non-nullable AddressForm type that matches what we need
interface AddressForm {
  name: string;
  streetLine1: string;
  streetLine2: string | null;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phoneNumber: string | null;
  isDefault: boolean;
}

interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface UserOrder {
  id: string;
  status: string;
  total: number;
  createdAt: string;
  items: { id: string; quantity: number }[];
}

export default function ProfilePage() {
  const { data: session, status, update: updateSession } = useSession();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("info");
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [orders, setOrders] = useState<UserOrder[]>([]);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Form states
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState({ name: "", email: "" });
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [isEditingAddress, setIsEditingAddress] = useState<string | null>(null);
  const [isAddingAddress, setIsAddingAddress] = useState(false);
  const [addressForm, setAddressForm] = useState<AddressForm>({
    name: "",
    streetLine1: "",
    streetLine2: null,
    city: "",
    state: "",
    postalCode: "",
    country: "",
    phoneNumber: null,
    isDefault: false,
  });
  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});
  const [formSuccess, setFormSuccess] = useState<string | null>(null);

  useEffect(() => {
    // Check authentication
    if (status === "unauthenticated") {
      router.push("/auth/login?callbackUrl=/profile");
      return;
    }

    if (status === "authenticated") {
      fetchUserData();
    }
  }, [status, router]);

  const fetchUserData = async () => {
    setLoading(true);
    setError(null);

    try {
      // Fetch user profile
      const profileRes = await fetch("/api/user/profile");
      if (!profileRes.ok) throw new Error("Failed to fetch profile");
      const profileData = await profileRes.json();
      setProfile(profileData);
      setProfileForm({
        name: profileData.name || "",
        email: profileData.email || "",
      });

      // Fetch orders
      const ordersRes = await fetch("/api/orders");
      if (ordersRes.ok) {
        const ordersData = await ordersRes.json();
        setOrders(ordersData);
      }

      // Fetch addresses
      const addressesRes = await fetch("/api/user/addresses");
      if (addressesRes.ok) {
        const addressesData = await addressesRes.json();
        setAddresses(addressesData);
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
      setError("Failed to load profile data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormErrors({});
    setFormSuccess(null);

    try {
      const response = await fetch("/api/user/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profileForm),
      });

      if (!response.ok) {
        const data = await response.json();
        setFormErrors(
          data.errors || { general: data.error || "Update failed" }
        );
        return;
      }

      const updatedProfile = await response.json();
      setProfile(updatedProfile);
      setFormSuccess("Profile updated successfully");
      setIsEditingProfile(false);

      // Update session context with new name
      if (session) {
        await updateSession({ name: profileForm.name });
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      setFormErrors({ general: "An error occurred. Please try again." });
    }
  };

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormErrors({});
    setFormSuccess(null);

    // Validate passwords match
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setFormErrors({ confirmPassword: "Passwords do not match" });
      return;
    }

    try {
      const response = await fetch("/api/user/password", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        setFormErrors(
          data.errors || { general: data.error || "Password update failed" }
        );
        return;
      }

      setFormSuccess("Password updated successfully");
      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (error) {
      console.error("Error updating password:", error);
      setFormErrors({ general: "An error occurred. Please try again." });
    }
  };

  const handleAddressFormChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value, type } = e.target;
    setAddressForm((prev) => ({
      ...prev,
      [name]:
        type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const initAddressForm = (address?: Address | null) => {
    if (address) {
      setAddressForm({
        name: address.name || "",
        streetLine1: address.streetLine1 || "",
        streetLine2: address.streetLine2 || null,
        city: address.city || "",
        state: address.state || "",
        postalCode: address.postalCode || "",
        country: address.country || "",
        phoneNumber: address.phoneNumber || null,
        isDefault: !!address.isDefault,
      });
      setIsEditingAddress(address.id);
    } else {
      setAddressForm({
        name: "",
        streetLine1: "",
        streetLine2: null,
        city: "",
        state: "",
        postalCode: "",
        country: "",
        phoneNumber: null,
        isDefault: addresses.length === 0,
      });
      setIsAddingAddress(true);
    }
  };

  const handleAddressSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormErrors({});
    setFormSuccess(null);

    try {
      // Edit existing address
      if (isEditingAddress) {
        const response = await fetch(
          `/api/user/addresses/${isEditingAddress}`,
          {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(addressForm),
          }
        );

        if (!response.ok) {
          const data = await response.json();
          setFormErrors(
            data.errors || { general: data.error || "Update failed" }
          );
          return;
        }

        const updatedAddress = await response.json();
        setAddresses((prevAddresses) =>
          prevAddresses.map((addr) => {
            // Check if addr is not null before accessing addr.id
            if (addr && addr.id === updatedAddress.id) {
              return updatedAddress;
            }
            return addr;
          })
        );
        setFormSuccess("Address updated successfully");
        setIsEditingAddress(null);
      }
      // Add new address
      else {
        const response = await fetch("/api/user/addresses", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(addressForm),
        });

        if (!response.ok) {
          const data = await response.json();
          setFormErrors(
            data.errors || { general: data.error || "Failed to add address" }
          );
          return;
        }

        const newAddress = await response.json();
        if (newAddress) {
          setAddresses((prevAddresses) => [...prevAddresses, newAddress]);
          setFormSuccess("Address added successfully");
          setIsAddingAddress(false);
        }
      }
    } catch (error) {
      console.error("Error submitting address:", error);
      setFormErrors({ general: "An error occurred. Please try again." });
    }
  };

  const handleDeleteAddress = async (addressId: string) => {
    if (!confirm("Are you sure you want to delete this address?")) return;

    try {
      const response = await fetch(`/api/user/addresses/${addressId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete address");
      }

      // Filter out addresses where the address is not null and the ID doesn't match
      setAddresses((prevAddresses) =>
        prevAddresses.filter((addr) => addr && addr.id !== addressId)
      );
      setFormSuccess("Address deleted successfully");
    } catch (error) {
      console.error("Error deleting address:", error);
      setFormErrors({ general: "Failed to delete address" });
    }
  };

  const cancelEditingAddress = () => {
    setIsEditingAddress(null);
    setIsAddingAddress(false);
    setAddressForm({
      name: "",
      streetLine1: "",
      streetLine2: null,
      city: "",
      state: "",
      postalCode: "",
      country: "",
      phoneNumber: null,
      isDefault: false,
    });
  };

  if (status === "loading" || loading) {
    return (
      <ClientLayout>
        <div className="container mx-auto px-4 py-8">
          <div className="flex justify-center items-center h-64">
            <div className="animate-pulse text-center">
              <div className="h-16 w-16 bg-gray-200 rounded-full mx-auto mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-32 mx-auto mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-24 mx-auto"></div>
            </div>
          </div>
        </div>
      </ClientLayout>
    );
  }

  if (error) {
    return (
      <ClientLayout>
        <div className="container mx-auto px-4 py-8">
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
            <p className="text-red-700">{error}</p>
          </div>
          <button
            onClick={() => fetchUserData()}
            className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
          >
            Try Again
          </button>
        </div>
      </ClientLayout>
    );
  }

  return (
    <ClientLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white shadow rounded-lg overflow-hidden">
          {/* Profile Header */}
          <div className="bg-indigo-600 py-6 px-8 flex items-center justify-between">
            <div className="flex items-center">
              <div className="h-16 w-16 bg-white rounded-full flex items-center justify-center text-indigo-600 text-2xl font-bold">
                {profile?.name?.charAt(0)?.toUpperCase() || "U"}
              </div>
              <div className="ml-4 text-white">
                <h1 className="text-xl font-bold">{profile?.name || "User"}</h1>
                <p className="text-indigo-100">{profile?.email}</p>
              </div>
            </div>
            <div>
              {profile?.role === "ADMIN" && (
                <Link
                  href="/admin"
                  className="bg-white text-indigo-600 px-4 py-2 rounded-md hover:bg-indigo-50"
                >
                  Admin Dashboard
                </Link>
              )}
            </div>
          </div>

          {/* Tabs Navigation */}
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px">
              <button
                onClick={() => setActiveTab("info")}
                className={`px-6 py-3 border-b-2 font-medium text-sm flex items-center ${
                  activeTab === "info"
                    ? "border-indigo-500 text-indigo-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                <User size={16} className="mr-2" />
                Account Info
              </button>
              <button
                onClick={() => setActiveTab("orders")}
                className={`px-6 py-3 border-b-2 font-medium text-sm flex items-center ${
                  activeTab === "orders"
                    ? "border-indigo-500 text-indigo-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                <Package size={16} className="mr-2" />
                Orders
                <span className="ml-2 bg-gray-100 text-gray-700 rounded-full px-2 py-0.5 text-xs">
                  {orders.length}
                </span>
              </button>
              <button
                onClick={() => setActiveTab("addresses")}
                className={`px-6 py-3 border-b-2 font-medium text-sm flex items-center ${
                  activeTab === "addresses"
                    ? "border-indigo-500 text-indigo-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                <MapPin size={16} className="mr-2" />
                Addresses
                <span className="ml-2 bg-gray-100 text-gray-700 rounded-full px-2 py-0.5 text-xs">
                  {addresses.length}
                </span>
              </button>
            </nav>
          </div>

          {/* Success Message */}
          {formSuccess && (
            <div className="bg-green-50 border-l-4 border-green-500 p-4 m-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg
                    className="h-5 w-5 text-green-400"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-green-700">{formSuccess}</p>
                </div>
              </div>
            </div>
          )}

          {/* General Error */}
          {formErrors.general && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 m-4">
              <p className="text-red-700">{formErrors.general}</p>
            </div>
          )}

          {/* Tab Content */}
          <div className="p-6">
            {/* Account Information Tab */}
            {activeTab === "info" && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold">Account Information</h2>
                  {!isEditingProfile && (
                    <button
                      onClick={() => setIsEditingProfile(true)}
                      className="flex items-center text-indigo-600 hover:text-indigo-800"
                    >
                      <Edit2 size={16} className="mr-1" /> Edit
                    </button>
                  )}
                </div>

                {isEditingProfile ? (
                  <form onSubmit={handleProfileUpdate}>
                    <div className="mb-4">
                      <label
                        className="block text-gray-700 text-sm font-bold mb-2"
                        htmlFor="name"
                      >
                        Name
                      </label>
                      <input
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        id="name"
                        type="text"
                        placeholder="Your Name"
                        value={profileForm.name}
                        onChange={(e) =>
                          setProfileForm({
                            ...profileForm,
                            name: e.target.value,
                          })
                        }
                        required
                      />
                      {formErrors.name && (
                        <p className="text-red-500 text-xs italic mt-1">
                          {formErrors.name}
                        </p>
                      )}
                    </div>

                    <div className="mb-6">
                      <label
                        className="block text-gray-700 text-sm font-bold mb-2"
                        htmlFor="email"
                      >
                        Email
                      </label>
                      <input
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        id="email"
                        type="email"
                        placeholder="Your Email"
                        value={profileForm.email}
                        onChange={(e) =>
                          setProfileForm({
                            ...profileForm,
                            email: e.target.value,
                          })
                        }
                        required
                      />
                      {formErrors.email && (
                        <p className="text-red-500 text-xs italic mt-1">
                          {formErrors.email}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center justify-end">
                      <button
                        type="button"
                        onClick={() => setIsEditingProfile(false)}
                        className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline mr-2"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                      >
                        Save Changes
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="bg-gray-50 p-4 rounded-md">
                    <div className="mb-4">
                      <span className="block text-sm font-medium text-gray-500">
                        Name
                      </span>
                      <span className="block mt-1 text-gray-900">
                        {profile?.name}
                      </span>
                    </div>
                    <div>
                      <span className="block text-sm font-medium text-gray-500">
                        Email
                      </span>
                      <span className="block mt-1 text-gray-900">
                        {profile?.email}
                      </span>
                    </div>
                  </div>
                )}

                <hr className="my-8" />

                <div>
                  <h3 className="text-lg font-medium mb-4">Change Password</h3>
                  <form onSubmit={handlePasswordUpdate}>
                    <div className="mb-4">
                      <label
                        className="block text-gray-700 text-sm font-bold mb-2"
                        htmlFor="currentPassword"
                      >
                        Current Password
                      </label>
                      <input
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        id="currentPassword"
                        type="password"
                        placeholder="Current Password"
                        value={passwordForm.currentPassword}
                        onChange={(e) =>
                          setPasswordForm({
                            ...passwordForm,
                            currentPassword: e.target.value,
                          })
                        }
                        required
                      />
                      {formErrors.currentPassword && (
                        <p className="text-red-500 text-xs italic mt-1">
                          {formErrors.currentPassword}
                        </p>
                      )}
                    </div>

                    <div className="mb-4">
                      <label
                        className="block text-gray-700 text-sm font-bold mb-2"
                        htmlFor="newPassword"
                      >
                        New Password
                      </label>
                      <input
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        id="newPassword"
                        type="password"
                        placeholder="New Password"
                        value={passwordForm.newPassword}
                        onChange={(e) =>
                          setPasswordForm({
                            ...passwordForm,
                            newPassword: e.target.value,
                          })
                        }
                        required
                      />
                      {formErrors.newPassword && (
                        <p className="text-red-500 text-xs italic mt-1">
                          {formErrors.newPassword}
                        </p>
                      )}
                    </div>

                    <div className="mb-6">
                      <label
                        className="block text-gray-700 text-sm font-bold mb-2"
                        htmlFor="confirmPassword"
                      >
                        Confirm New Password
                      </label>
                      <input
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        id="confirmPassword"
                        type="password"
                        placeholder="Confirm New Password"
                        value={passwordForm.confirmPassword}
                        onChange={(e) =>
                          setPasswordForm({
                            ...passwordForm,
                            confirmPassword: e.target.value,
                          })
                        }
                        required
                      />
                      {formErrors.confirmPassword && (
                        <p className="text-red-500 text-xs italic mt-1">
                          {formErrors.confirmPassword}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center justify-end">
                      <button
                        type="submit"
                        className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                      >
                        Update Password
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {/* Orders Tab */}
            {activeTab === "orders" && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold">Your Orders</h2>
                  <Link
                    href="/orders"
                    className="text-indigo-600 hover:text-indigo-800"
                  >
                    View All Orders
                  </Link>
                </div>

                {orders.length === 0 ? (
                  <div className="bg-gray-50 p-8 text-center rounded-lg border border-gray-200">
                    <Package size={48} className="mx-auto text-gray-400 mb-3" />
                    <h3 className="text-lg font-medium text-gray-900 mb-1">
                      No orders yet
                    </h3>
                    <p className="text-gray-500 mb-4">
                      When you place orders, they will appear here
                    </p>
                    <Link
                      href="/products"
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
                    >
                      Browse Products
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {orders.slice(0, 5).map((order) => (
                      <div
                        key={order.id}
                        className="border border-gray-200 rounded-lg overflow-hidden"
                      >
                        <div className="bg-gray-50 px-4 py-3 flex justify-between items-center border-b border-gray-200">
                          <div>
                            <p className="text-sm text-gray-500">
                              Order placed on{" "}
                              {new Date(order.createdAt).toLocaleDateString()}
                            </p>
                            <p className="text-xs text-gray-400">
                              Order #{order.id.slice(0, 8)}...
                            </p>
                          </div>
                          <div>
                            <span
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                              ${
                                order.status === "DELIVERED"
                                  ? "bg-green-100 text-green-800"
                                  : order.status === "CONFIRMED"
                                  ? "bg-blue-100 text-blue-800"
                                  : order.status === "PENDING"
                                  ? "bg-yellow-100 text-yellow-800"
                                  : "bg-red-100 text-red-800"
                              }`}
                            >
                              {order.status}
                            </span>
                          </div>
                        </div>
                        <div className="p-4">
                          <div className="flex justify-between items-center mb-4">
                            <div>
                              <p className="text-sm font-medium text-gray-900">
                                {order.items.length} item(s)
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="text-sm text-gray-500">Total</p>
                              <p className="text-lg font-bold">
                                ${order.total.toFixed(2)}
                              </p>
                            </div>
                          </div>
                          <div className="mt-2">
                            <Link
                              href={`/orders/${order.id}`}
                              className="text-sm text-indigo-600 hover:text-indigo-800 font-medium"
                            >
                              View Order Details →
                            </Link>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Addresses Tab */}
            {activeTab === "addresses" && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold">Your Addresses</h2>
                  {!isAddingAddress && !isEditingAddress && (
                    <button
                      onClick={() => initAddressForm()}
                      className="flex items-center text-indigo-600 hover:text-indigo-800"
                    >
                      <Plus size={16} className="mr-1" /> Add New Address
                    </button>
                  )}
                </div>

                {(isAddingAddress || isEditingAddress) && (
                  <div className="bg-gray-50 p-6 rounded-lg mb-6 border border-gray-200">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-medium">
                        {isAddingAddress ? "Add New Address" : "Edit Address"}
                      </h3>
                      <button
                        onClick={cancelEditingAddress}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        <X size={20} />
                      </button>
                    </div>

                    <form onSubmit={handleAddressSubmit}>
                      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                        <div className="col-span-2">
                          <label className="block text-sm font-medium text-gray-700">
                            Address Name
                          </label>
                          <input
                            type="text"
                            name="name"
                            value={addressForm.name}
                            onChange={handleAddressFormChange}
                            placeholder="Home, Work, etc."
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                            required
                          />
                          {formErrors.name && (
                            <p className="text-red-500 text-xs mt-1">
                              {formErrors.name}
                            </p>
                          )}
                        </div>

                        <div className="col-span-2">
                          <label className="block text-sm font-medium text-gray-700">
                            Street Address
                          </label>
                          <input
                            type="text"
                            name="streetLine1"
                            value={addressForm.streetLine1}
                            onChange={handleAddressFormChange}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                            required
                          />
                          {formErrors.streetLine1 && (
                            <p className="text-red-500 text-xs mt-1">
                              {formErrors.streetLine1}
                            </p>
                          )}
                        </div>

                        <div className="col-span-2">
                          <label className="block text-sm font-medium text-gray-700">
                            Apartment, Suite, etc. (optional)
                          </label>
                          <input
                            type="text"
                            name="streetLine2"
                            value={addressForm.streetLine2 || ""}
                            onChange={handleAddressFormChange}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700">
                            City
                          </label>
                          <input
                            type="text"
                            name="city"
                            value={addressForm.city}
                            onChange={handleAddressFormChange}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                            required
                          />
                          {formErrors.city && (
                            <p className="text-red-500 text-xs mt-1">
                              {formErrors.city}
                            </p>
                          )}
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700">
                            State / Province
                          </label>
                          <input
                            type="text"
                            name="state"
                            value={addressForm.state}
                            onChange={handleAddressFormChange}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                            required
                          />
                          {formErrors.state && (
                            <p className="text-red-500 text-xs mt-1">
                              {formErrors.state}
                            </p>
                          )}
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700">
                            Postal / ZIP Code
                          </label>
                          <input
                            type="text"
                            name="postalCode"
                            value={addressForm.postalCode}
                            onChange={handleAddressFormChange}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                            required
                          />
                          {formErrors.postalCode && (
                            <p className="text-red-500 text-xs mt-1">
                              {formErrors.postalCode}
                            </p>
                          )}
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700">
                            Country
                          </label>
                          <input
                            type="text"
                            name="country"
                            value={addressForm.country}
                            onChange={handleAddressFormChange}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                            required
                          />
                          {formErrors.country && (
                            <p className="text-red-500 text-xs mt-1">
                              {formErrors.country}
                            </p>
                          )}
                        </div>

                        <div className="col-span-2">
                          <label className="block text-sm font-medium text-gray-700">
                            Phone Number (optional)
                          </label>
                          <input
                            type="tel"
                            name="phoneNumber"
                            value={addressForm.phoneNumber || ""}
                            onChange={handleAddressFormChange}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                          />
                        </div>

                        <div className="col-span-2">
                          <div className="flex items-start">
                            <div className="flex items-center h-5">
                              <input
                                id="isDefault"
                                name="isDefault"
                                type="checkbox"
                                checked={addressForm.isDefault}
                                onChange={(e) =>
                                  setAddressForm({
                                    ...addressForm,
                                    isDefault: e.target.checked,
                                  })
                                }
                                className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300 rounded"
                              />
                            </div>
                            <div className="ml-3 text-sm">
                              <label
                                htmlFor="isDefault"
                                className="font-medium text-gray-700"
                              >
                                Make this my default address
                              </label>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="mt-6 flex justify-end space-x-3">
                        <button
                          type="button"
                          onClick={cancelEditingAddress}
                          className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        >
                          <Save className="h-4 w-4 mr-1" />
                          {isAddingAddress ? "Add Address" : "Save Changes"}
                        </button>
                      </div>
                    </form>
                  </div>
                )}

                {addresses.length === 0 && !isAddingAddress ? (
                  <div className="bg-gray-50 p-8 text-center rounded-lg border border-gray-200">
                    <MapPin size={48} className="mx-auto text-gray-400 mb-3" />
                    <h3 className="text-lg font-medium text-gray-900 mb-1">
                      No addresses saved
                    </h3>
                    <p className="text-gray-500 mb-4">
                      Add an address to make checkout faster
                    </p>
                    <button
                      onClick={() => initAddressForm()}
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
                    >
                      <Plus size={16} className="mr-2" /> Add an Address
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {addresses.map((address) => {
                      // Skip null addresses
                      if (!address) return null;

                      return (
                        <div
                          key={address.id}
                          className={`border rounded-lg p-4 relative ${
                            address.isDefault
                              ? "border-indigo-500"
                              : "border-gray-200"
                          }`}
                        >
                          {address.isDefault && (
                            <span className="absolute top-2 right-2 bg-indigo-100 text-indigo-800 text-xs px-2 py-1 rounded-full">
                              Default
                            </span>
                          )}
                          <div className="mb-2">
                            <h3 className="font-medium">{address.name}</h3>
                          </div>
                          <div className="text-sm text-gray-500 mb-4">
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
                          </div>
                          <div className="flex space-x-2 mt-4">
                            <button
                              onClick={() => initAddressForm(address)}
                              className="text-indigo-600 hover:text-indigo-900 text-sm flex items-center"
                            >
                              <Edit2 size={12} className="mr-1" /> Edit
                            </button>
                            <button
                              onClick={() => handleDeleteAddress(address.id)}
                              className="text-red-600 hover:text-red-900 text-sm flex items-center"
                            >
                              <Trash2 size={12} className="mr-1" /> Delete
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </ClientLayout>
  );
}

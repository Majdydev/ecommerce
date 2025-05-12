"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Plus, Edit, Trash } from "lucide-react";

// Update the UserType to include createdAt
type UserType = {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string; // Add this missing property
};

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    // Check session and fetch users
    const checkSessionAndFetchUsers = async () => {
      try {
        // Fetch users from API
        const response = await fetch("/api/users");
        if (response.status === 401) {
          // Redirect to login if unauthorized
          router.push("/auth/login");
          return;
        }

        if (!response.ok) {
          throw new Error("Failed to fetch users");
        }

        const data = await response.json();
        setUsers(data);
      } catch (err) {
        setError("Error loading users. Please try again later.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    checkSessionAndFetchUsers();
  }, [router]);

  const handleDeleteUser = async (userId: string) => {
    if (confirm("Are you sure you want to delete this user?")) {
      try {
        const res = await fetch(`/api/users/${userId}`, {
          method: "DELETE",
        });

        if (res.ok) {
          // Update the users state to remove the deleted user
          setUsers(users.filter((user) => user.id !== userId));
        } else {
          const errorData = await res.json();
          alert(errorData.error || "Error deleting user");
        }
      } catch (error) {
        console.error("Error deleting user:", error);
        alert("An error occurred while deleting the user");
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <main className="flex-grow container mx-auto px-4 py-8">
          <div className="text-center py-10">Loading users...</div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col">
        <main className="flex-grow container mx-auto px-4 py-8">
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
            <p className="text-red-700">{error}</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-grow container mx-auto px-4 py-6 sm:py-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 sm:mb-6 gap-3 sm:gap-0">
          <h1 className="text-2xl sm:text-3xl font-bold">Manage Users</h1>
          <div className="flex flex-wrap gap-2">
            <Link
              href="/admin/users/new"
              className="inline-flex items-center bg-indigo-600 text-white px-3 py-1.5 sm:px-4 sm:py-2 rounded text-sm hover:bg-indigo-700"
            >
              <Plus size={16} className="mr-1.5" />
              Add User
            </Link>
            <Link
              href="/admin"
              className="text-indigo-600 hover:text-indigo-500 px-3 py-1.5 border border-indigo-600 rounded text-sm"
            >
              ← Back to Dashboard
            </Link>
          </div>
        </div>

        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          {users.length === 0 ? (
            <div className="text-center py-12">
              <h2 className="text-xl font-medium text-gray-600 mb-4">
                No users found
              </h2>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Role
                    </th>
                    <th className="hidden sm:table-cell px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Joined
                    </th>
                    <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {users.map((user) => (
                    <tr key={user.id}>
                      <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-500">
                        {user.name}
                      </td>
                      <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-500 max-w-[120px] sm:max-w-none truncate">
                        {user.email}
                      </td>
                      <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                        <span
                          className={`px-2 inline-flex text-xs leading-5 font-medium rounded-full ${
                            user.role === "ADMIN"
                              ? "bg-purple-100 text-purple-800"
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {user.role}
                        </span>
                      </td>
                      <td className="hidden sm:table-cell px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-500">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm">
                        <div className="flex items-center space-x-2 sm:space-x-4">
                          <Link
                            href={`/admin/users/${user.id}`}
                            className="text-blue-600 hover:text-blue-900 flex items-center"
                          >
                            <Edit size={16} className="sm:mr-1" />
                            <span className="hidden sm:inline">Edit</span>
                          </Link>
                          <button
                            onClick={() => handleDeleteUser(user.id)}
                            className="text-red-600 hover:text-red-900 flex items-center"
                          >
                            <Trash size={16} className="sm:mr-1" />
                            <span className="hidden sm:inline">Delete</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

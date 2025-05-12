"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Plus, Edit, Trash2 } from "lucide-react";
import { Category } from "../../types/prisma";

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchCategories = async () => {
      setLoading(true);
      try {
        const res = await fetch("/api/categories");
        if (!res.ok) throw new Error("Failed to fetch categories");
        const data = await res.json();
        setCategories(data);
      } catch (error) {
        console.error("Error fetching categories:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  // Helper to find parent category name
  const getParentName = (parentId: string | null) => {
    if (!parentId) return null;
    const parent = categories.find((c) => c?.id === parentId);
    return parent ? parent.name : null;
  };

  const handleDelete = async (categoryId: string) => {
    // Check if category has subcategories
    const hasChildren = categories.some((c) => c?.parentId === categoryId);

    if (hasChildren) {
      alert(
        "Cannot delete a category that has subcategories. Please delete the subcategories first."
      );
      return;
    }

    if (confirm("Are you sure you want to delete this category?")) {
      try {
        const response = await fetch(`/api/categories/${categoryId}`, {
          method: "DELETE",
        });

        if (response.ok) {
          setCategories(categories.filter((c) => c?.id !== categoryId));
        } else {
          const errorData = await response.json();
          alert(errorData.error || "Failed to delete category");
        }
      } catch (error) {
        console.error("Error deleting category:", error);
        alert("Failed to delete category. Please try again.");
      }
    }
  };

  return (
    <div className="container mx-auto px-4 py-6 sm:py-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 sm:mb-6 gap-3">
        <h1 className="text-2xl sm:text-3xl font-bold">Categories Management</h1>
        <Link
          href="/admin/categories/new"
          className="bg-indigo-600 text-white px-3 py-1.5 sm:px-4 sm:py-2 rounded-md hover:bg-indigo-700 flex items-center justify-center sm:justify-start text-sm"
        >
          <Plus size={16} className="mr-1.5" /> Add Category
        </Link>
      </div>

      {loading ? (
        <div className="text-center py-8">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-indigo-600 border-r-transparent"></div>
          <p className="mt-4 text-gray-600">Loading categories...</p>
        </div>
      ) : (
        <div className="overflow-x-auto bg-white shadow rounded-lg">
          <table className="min-w-full table-auto">
            <thead>
              <tr className="bg-gray-100 border-b">
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Parent
                </th>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Subs
                </th>
                <th className="px-3 sm:px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {categories.length === 0 ? (
                <tr>
                  <td
                    colSpan={4}
                    className="px-3 sm:px-6 py-4 text-center text-gray-500 text-sm"
                  >
                    No categories found. Add one to get started.
                  </td>
                </tr>
              ) : (
                categories.map((category) => (
                  <tr key={category?.id} className="hover:bg-gray-50">
                    <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm">
                      <div className="max-w-[100px] sm:max-w-none truncate">
                        {category?.name}
                      </div>
                    </td>
                    <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-500">
                      {getParentName(category?.parentId as string) || "-"}
                    </td>
                    <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-500">
                      {categories.filter((c) => c?.parentId === category?.id)
                        .length || "-"}
                    </td>
                    <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-right">
                      <div className="flex flex-wrap justify-end gap-2">
                        <button
                          className="inline-flex items-center bg-blue-500 hover:bg-blue-600 text-white px-2 sm:px-3 py-1 rounded-md text-xs"
                          onClick={() =>
                            router.push(`/admin/categories/${category?.id}`)
                          }
                        >
                          <Edit size={14} className="sm:mr-1" /> 
                          <span className="hidden sm:inline">Edit</span>
                        </button>
                        <button
                          className="inline-flex items-center bg-red-500 hover:bg-red-600 text-white px-2 sm:px-3 py-1 rounded-md text-xs"
                          onClick={() => handleDelete(category?.id as string)}
                        >
                          <Trash2 size={14} className="sm:mr-1" /> 
                          <span className="hidden sm:inline">Delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

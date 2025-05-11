"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Category } from "../../../types/prisma";

// Helper function to determine if one category is a descendant of another
const isDescendantOf = (
  allCategories: Category[],
  potentialParentId: string,
  childId: string
): boolean => {
  const child = allCategories.find((c) => c?.id === childId);
  if (!child || !child.parentId) return false;
  if (child.parentId === potentialParentId) return true;
  return isDescendantOf(allCategories, potentialParentId, child.parentId);
};

export default function EditCategoryPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [formData, setFormData] = useState({
    name: "",
    image: "",
    parentId: "",
  });
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Fetch the category to edit
        const categoryRes = await fetch(`/api/categories/${id}`);
        if (!categoryRes.ok) {
          throw new Error("Failed to fetch category");
        }
        const categoryData = await categoryRes.json();

        // Fetch all categories for parent selection
        const allCategoriesRes = await fetch("/api/categories");
        if (!allCategoriesRes.ok) {
          throw new Error("Failed to fetch categories");
        }
        const allCategories = await allCategoriesRes.json();

        // Filter out self and all children from parent options
        // to prevent circular references
        const filteredCategories = allCategories.filter(
          (c: Category) =>
            c?.id !== id && !isDescendantOf(allCategories, c?.id as string, id)
        );

        setCategories(filteredCategories);
        setFormData({
          name: categoryData.name,
          image: categoryData.image || "",
          parentId: categoryData.parentId || "",
        });
      } catch (error) {
        console.error("Error fetching data:", error);
        alert("Failed to load category data");
        router.push("/admin/categories");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [id, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch(`/api/categories/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name,
          image: formData.image || null,
          parentId: formData.parentId || null,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update category");
      }

      router.push("/admin/categories");
    } catch (error) {
      console.error("Error:", error);
      alert(
        error instanceof Error ? error.message : "Failed to update category"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto p-4">
        <div className="text-center py-8">Loading...</div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Edit Category</h1>
      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 rounded-lg shadow-md space-y-4"
      >
        <div>
          <label
            className="block text-sm font-medium text-gray-700 mb-1"
            htmlFor="name"
          >
            Category Name
          </label>
          <input
            id="name"
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>

        <div>
          <label
            className="block text-sm font-medium text-gray-700 mb-1"
            htmlFor="image"
          >
            Image URL (optional)
          </label>
          <input
            id="image"
            type="url"
            name="image"
            value={formData.image}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>

        <div>
          <label
            className="block text-sm font-medium text-gray-700 mb-1"
            htmlFor="parentId"
          >
            Parent Category (optional)
          </label>
          <select
            id="parentId"
            name="parentId"
            value={formData.parentId}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value="">No Parent (Top Level)</option>
            {categories.map((category) => (
              <option key={category?.id} value={category?.id}>
                {category?.name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex justify-end space-x-3 pt-4">
          <button
            type="button"
            onClick={() => router.push("/admin/categories")}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
          >
            {isSubmitting ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </form>
    </div>
  );
}

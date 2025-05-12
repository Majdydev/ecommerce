"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { Product, Category } from "../../types/prisma";
import Link from "next/link";
import { Plus, Edit, Trash } from "lucide-react";

type ProductWithCategory = Product & {
  category?: Category | null;
};

export default function AdminProductsPage() {
  const [products, setProducts] = useState<ProductWithCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const res = await fetch("/api/products?includeCategory=true");
        if (!res.ok) throw new Error("Failed to fetch products");
        const data = await res.json();
        setProducts(data.filter((p: ProductWithCategory | null) => p !== null));
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const handleDelete = async (productId: string) => {
    if (confirm("Are you sure you want to delete this product?")) {
      try {
        const response = await fetch(`/api/products/${productId}`, {
          method: "DELETE",
        });
        if (response.ok) {
          setProducts(products.filter((p) => p && p.id !== productId));
        } else {
          throw new Error("Failed to delete product");
        }
      } catch (error) {
        console.error("Error deleting product:", error);
        alert("Failed to delete product. Please try again.");
      }
    }
  };

  return (
    <div className="container mx-auto px-4 py-6 sm:py-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 sm:mb-6 gap-3 sm:gap-0">
        <h1 className="text-2xl sm:text-3xl font-bold">Products Management</h1>
        <Link
          href="/admin/products/new"
          className="bg-indigo-600 text-white px-3 py-1.5 sm:px-4 sm:py-2 rounded-md hover:bg-indigo-700 flex items-center justify-center sm:justify-start text-sm"
        >
          <Plus size={16} className="mr-1.5" /> Add Product
        </Link>
      </div>

      {loading ? (
        <div className="text-center py-8">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-indigo-600 border-r-transparent"></div>
          <p className="mt-4 text-gray-600">Loading products...</p>
        </div>
      ) : (
        <div className="overflow-x-auto bg-white shadow rounded-lg">
          <table className="min-w-full table-auto">
            <thead>
              <tr className="bg-gray-100 border-b">
                <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th className="hidden sm:table-cell px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Price
                </th>
                <th className="hidden sm:table-cell px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Stock
                </th>
                <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {products.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-4 sm:px-6 py-4 text-center text-gray-500"
                  >
                    No products found. Add one to get started.
                  </td>
                </tr>
              ) : (
                products.map(
                  (product) =>
                    product && (
                      <tr key={product.id} className="hover:bg-gray-50">
                        <td className="px-4 sm:px-6 py-3 sm:py-4">
                          <div className="max-w-[150px] sm:max-w-xs truncate font-medium text-sm">
                            {product.name}
                          </div>
                        </td>
                        <td className="hidden sm:table-cell px-4 sm:px-6 py-3 sm:py-4 text-sm">
                          {product.category
                            ? product.category.name
                            : "Uncategorized"}
                        </td>
                        <td className="px-4 sm:px-6 py-3 sm:py-4 text-sm">
                          ${product.price.toFixed(2)}
                        </td>
                        <td className="hidden sm:table-cell px-4 sm:px-6 py-3 sm:py-4 text-sm">
                          {product.stock}
                        </td>
                        <td className="px-4 sm:px-6 py-3 sm:py-4">
                          <div className="flex flex-wrap gap-2 text-sm">
                            <button
                              className="flex items-center bg-blue-500 hover:bg-blue-600 text-white px-2 sm:px-3 py-1 rounded text-xs"
                              onClick={() =>
                                router.push(`/admin/products/${product.id}`)
                              }
                            >
                              <Edit size={14} className="mr-1" />
                              Edit
                            </button>
                            <button
                              className="flex items-center bg-red-500 hover:bg-red-600 text-white px-2 sm:px-3 py-1 rounded text-xs"
                              onClick={() => handleDelete(product.id)}
                            >
                              <Trash size={14} className="mr-1" />
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                )
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

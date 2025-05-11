"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { Product } from "../../types/prisma";

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const router = useRouter();

  useEffect(() => {
    fetch("/api/products")
      .then((res) => res.json())
      .then((data) =>
        setProducts(data.filter((p: Product | null) => p !== null) as Product[])
      );
  }, []);

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Products Management</h1>
      <div className="overflow-x-auto">
        <table className="min-w-full table-auto">
          <thead>
            <tr className="bg-gray-100">
              <th className="px-4 py-2">Name</th>
              <th className="px-4 py-2">Price</th>
              <th className="px-4 py-2">Stock</th>
              <th className="px-4 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map(
              (product) =>
                product && (
                  <tr key={product.id}>
                    <td className="border px-4 py-2">{product.name}</td>
                    <td className="border px-4 py-2">${product.price}</td>
                    <td className="border px-4 py-2">{product.stock}</td>
                    <td className="border px-4 py-2">
                      <button
                        className="bg-blue-500 text-white px-2 py-1 rounded mr-2"
                        onClick={() =>
                          router.push(`/admin/products/${product.id}`)
                        }
                      >
                        Edit
                      </button>
                      <button
                        className="bg-red-500 text-white px-2 py-1 rounded"
                        onClick={async () => {
                          if (
                            confirm(
                              "Are you sure you want to delete this product?"
                            )
                          ) {
                            try {
                              const response = await fetch(
                                `/api/products/${product.id}`,
                                {
                                  method: "DELETE",
                                }
                              );
                              if (response.ok) {
                                setProducts(
                                  products.filter((p) => p && p.id !== product.id)
                                );
                              }
                            } catch (error) {
                              console.error("Error deleting product:", error);
                            }
                          }
                        }}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                )
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

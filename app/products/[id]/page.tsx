"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { notFound } from "next/navigation";
import ProductDetail from "../../components/shop/ProductDetail";
import ClientLayout from "../../components/ClientLayout";
import { Category } from "../../types/prisma";

type Product = {
  id: string;
  name: string;
  price: number;
  image: string;
  description: string;
  stock: number;
  categoryId: string | null;
  category?: Category | null;
  createdAt: string | Date;
  updatedAt: string | Date;
};

export default function ProductDetailPage() {
  const params = useParams();
  const id = params.id as string;

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await fetch(
          `/api/products/${id}?includeCategory=true`
        );

        if (response.status === 404) {
          notFound();
        }

        if (!response.ok) {
          throw new Error("Failed to fetch product");
        }

        const data = await response.json();
        setProduct(data);
      } catch (err) {
        setError("Error loading product. Please try again later.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  if (loading) {
    return (
      <ClientLayout>
        <div className="container mx-auto px-4 py-16">
          <div className="animate-pulse">
            <div className="flex flex-col md:flex-row gap-8">
              <div className="md:w-1/2">
                <div className="bg-gray-200 rounded-lg h-96"></div>
              </div>
              <div className="md:w-1/2">
                <div className="h-8 bg-gray-200 rounded w-3/4 mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/4 mb-6"></div>
                <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-6"></div>
                <div className="h-10 bg-gray-200 rounded w-1/3 mb-6"></div>
                <div className="h-12 bg-gray-200 rounded w-full"></div>
              </div>
            </div>
          </div>
        </div>
      </ClientLayout>
    );
  }

  if (error || !product) {
    return (
      <ClientLayout>
        <div className="container mx-auto px-4 py-8">
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
            <p className="text-red-700">{error || "Product not found"}</p>
          </div>
        </div>
      </ClientLayout>
    );
  }

  return (
    <ClientLayout>
      <div className="container mx-auto px-4 py-8">
        <ProductDetail
          product={{
            ...product,
            categoryId: product.categoryId || null,
            createdAt: new Date(product.createdAt),
            updatedAt: new Date(product.updatedAt),
          }}
        />
      </div>
    </ClientLayout>
  );
}

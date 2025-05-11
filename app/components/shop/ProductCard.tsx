"use client";
import { useState } from "react";
import { useCartStore } from "../../store/cartStore";
import Image from "next/image";
import Link from "next/link";

type ProductCardProps = {
  id: string;
  name: string;
  price: number;
  image: string;
  description: string;
};

export default function ProductCard({
  id,
  name,
  price,
  image,
  description,
}: ProductCardProps) {
  const [quantity, setQuantity] = useState(1);
  const addItem = useCartStore((state) => state.addItem);
  const handleAddToCart = () => {
    addItem({
      id: id,
      name: name,
      price: price,
      quantity: 1,
      image: image || "/placeholder.png",
    });

    // Reset quantity after adding to cart
    setQuantity(1);
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="relative h-48 w-full">
        <Image src={image} alt={name} fill className="object-cover" />
      </div>
      <div className="p-4">
        <Link href={`/products/${id}`}>
          <h3 className="text-lg font-semibold text-gray-800 hover:text-indigo-600">
            {name}
          </h3>
        </Link>
        <p className="mt-1 text-gray-500 text-sm line-clamp-2">{description}</p>
        <div className="mt-2 flex items-center justify-between">
          <span className="text-gray-900 font-bold">${price.toFixed(2)}</span>
          <button
            onClick={handleAddToCart}
            className="px-3 py-1 bg-indigo-600 text-white text-sm font-medium rounded hover:bg-indigo-700"
          >
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  );
}

'use client';

import Image from 'next/image';
import { useState } from 'react';
import { useCartStore } from '@/store/cartStore';
import { Product } from '@/types/prisma';

export default function ProductDetail({ product }: { product: Product }) {
  const [quantity, setQuantity] = useState(1);
  const addItem = useCartStore(state => state.addItem);

  const handleAddToCart = () => {
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      quantity: quantity,
      image: product.image || '/placeholder.png'
    });
    
    // Reset quantity after adding to cart
    setQuantity(1);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      <div>
        <Image
          src={product.image || '/placeholder.png'}
          alt={product.name}
          width={500}
          height={500}
          className="rounded-lg object-cover w-full"
        />
      </div>
      <div>
        <h1 className="text-3xl font-bold mb-4">{product.name}</h1>
        <p className="text-gray-600 mb-4">{product.description}</p>
        <p className="text-2xl font-semibold mb-6">${product.price.toFixed(2)}</p>

        <div className="flex items-center space-x-4 mb-6">
          <label htmlFor="quantity" className="text-gray-700">Quantity:</label>
          <input
            type="number"
            id="quantity"
            min="1"
            max={product.stock}
            value={quantity}
            onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value)))}
            className="w-16 border border-gray-300 rounded px-2 py-1"
          />
        </div>

        <button
          onClick={handleAddToCart}
          disabled={product.stock <= 0}
          className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 disabled:bg-gray-400"
        >
          {product.stock > 0 ? 'Add to Cart' : 'Out of Stock'}
        </button>

        <div className="mt-4 text-sm text-gray-500">
          {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
        </div>
      </div>
    </div>
  );
}
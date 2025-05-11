'use client';

import { useState } from 'react';
//import { useCart } from '@/app/context/CartContext';
import { Plus, Minus, ShoppingCart } from 'lucide-react';

type Product = {
  id: string;
  name: string;
  price: number;
  image: string;
  stock: number;
};

export default function AddToCartButton({ product }: { product: Product }) {
  const [quantity, setQuantity] = useState(1);
  
  
  const incrementQuantity = () => {
    if (quantity < product.stock) {
      setQuantity(quantity + 1);
    }
  };
  
  const decrementQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };
  
  const handleAddToCart = () => {
    
    
    // Reset quantity after adding to cart
    setQuantity(1);
  };
  
  if (product.stock <= 0) {
    return (
      <button
        disabled
        className="w-full bg-gray-300 text-gray-500 py-3 px-4 rounded-md cursor-not-allowed"
      >
        Out of Stock
      </button>
    );
  }
  
  return (
    <div>
      <div className="flex items-center mb-4">
        <button
          onClick={decrementQuantity}
          className="p-2 border rounded-l-md text-gray-600 hover:bg-gray-100"
        >
          <Minus className="h-4 w-4" />
        </button>
        <span className="px-4 py-2 border-t border-b">{quantity}</span>
        <button
          onClick={incrementQuantity}
          className="p-2 border rounded-r-md text-gray-600 hover:bg-gray-100"
        >
          <Plus className="h-4 w-4" />
        </button>
      </div>
      
      <button
        onClick={handleAddToCart}
        className="w-full bg-indigo-600 text-white py-3 px-4 rounded-md hover:bg-indigo-700 flex items-center justify-center"
      >
        <ShoppingCart className="h-5 w-5 mr-2" />
        Add to Cart
      </button>
    </div>
  );
}
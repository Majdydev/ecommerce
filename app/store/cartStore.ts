'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type CartItem = {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
};

type CartState = {
  items: CartItem[];
  totalItems: number;
  totalPrice: number;
  addItem: (item: CartItem) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
};

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      totalItems: 0,
      totalPrice: 0,
      
      addItem: (item: CartItem) => {
        const { items } = get();
        const existingItem = items.find(i => i.id === item.id);
        
        if (existingItem) {
          const updatedItems = items.map(i => 
            i.id === item.id ? { ...i, quantity: i.quantity + item.quantity } : i
          );
          
          set({
            items: updatedItems,
            totalItems: updatedItems.reduce((total, item) => total + item.quantity, 0),
            totalPrice: updatedItems.reduce((total, item) => total + (item.price * item.quantity), 0)
          });
        } else {
          const updatedItems = [...items, item];
          
          set({
            items: updatedItems,
            totalItems: updatedItems.reduce((total, item) => total + item.quantity, 0),
            totalPrice: updatedItems.reduce((total, item) => total + (item.price * item.quantity), 0)
          });
        }
      },
      
      removeItem: (id: string) => {
        const { items } = get();
        const updatedItems = items.filter(item => item.id !== id);
        
        set({
          items: updatedItems,
          totalItems: updatedItems.reduce((total, item) => total + item.quantity, 0),
          totalPrice: updatedItems.reduce((total, item) => total + (item.price * item.quantity), 0)
        });
      },
      
      updateQuantity: (id: string, quantity: number) => {
        const { items } = get();
        
        if (quantity <= 0) {
          const updatedItems = items.filter(item => item.id !== id);
          
          set({
            items: updatedItems,
            totalItems: updatedItems.reduce((total, item) => total + item.quantity, 0),
            totalPrice: updatedItems.reduce((total, item) => total + (item.price * item.quantity), 0)
          });
          return;
        }
        
        const updatedItems = items.map(item => 
          item.id === id ? { ...item, quantity } : item
        );
        
        set({
          items: updatedItems,
          totalItems: updatedItems.reduce((total, item) => total + item.quantity, 0),
          totalPrice: updatedItems.reduce((total, item) => total + (item.price * item.quantity), 0)
        });
      },
      
      clearCart: () => {
        set({
          items: [],
          totalItems: 0,
          totalPrice: 0
        });
      }
    }),
    {
      name: 'cart-storage',
    }
  )
);
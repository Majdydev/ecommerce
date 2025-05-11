'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCartStore } from '@/store/cartStore';
import { useSession } from 'next-auth/react';
import Navbar from '@/components/Navbar';
import { Trash2, Plus, Minus } from 'lucide-react';
import ClientLayout from '@/components/ClientLayout';
import CartPageContent from '@/components/shop/CartPageContent';

export default function CartPage() {
  return (
    <ClientLayout>
      <CartPageContent />
    </ClientLayout>
  );
}
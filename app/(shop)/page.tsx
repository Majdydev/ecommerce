import { PrismaClient } from "@prisma/client";
import ProductCard from "../../components/shop/ProductCard";
import type { Product } from "@/types/prisma";

const prisma = new PrismaClient();

export default async function HomePage() {
  const products = await prisma.product.findMany({
    take: 8,
    orderBy: { createdAt: "desc" },
  });

  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Featured Products</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {products.map((product: Product) => (
          <ProductCard key={product.id} {...product} />
        ))}
      </div>
    </main>
  );
}

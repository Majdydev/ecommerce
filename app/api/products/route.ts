import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { User } from "@/types/prisma";

const prisma = new PrismaClient();

export async function GET() {
  try {
    const products = await prisma.product.findMany();
    return NextResponse.json(products);
  } catch (error) {
    return NextResponse.json(
      { error: "Error fetching products" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  const session = await getServerSession();
  const user = session?.user as User | undefined;
  
  // if (!user || user.role !== "ADMIN") {
  //   return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  // }

  try {
    const { name, description, price, image, stock } = await req.json();
    const product = await prisma.product.create({
      data: {
        name,
        description,
        price,
        image,
        stock: stock || 100 // Default to 100 if not provided
      }
    });
    return NextResponse.json(product);
  } catch (error) {
    return NextResponse.json(
      { error: "Error creating product" },
      { status: 500 }
    );
  }
}

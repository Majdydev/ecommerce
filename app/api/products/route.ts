import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "../../lib/auth";

const prisma = new PrismaClient();

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const includeCategory = url.searchParams.get("includeCategory") === "true";
    const featured = url.searchParams.get("featured") === "true";
    const limitParam = url.searchParams.get("limit");
    const limit = limitParam ? parseInt(limitParam) : undefined;
    const categoryId = url.searchParams.get("categoryId");

    // Build query options
    const queryOptions: any = {
      include: {
        category: includeCategory,
      },
      orderBy: {
        createdAt: "desc",
      },
    };

    // Apply filters
    if (categoryId) {
      queryOptions.where = {
        ...queryOptions.where,
        categoryId: categoryId,
      };
    }

    // Apply limit if specified
    if (limit && !isNaN(limit)) {
      queryOptions.take = limit;
    }

    // For now, we don't have a featured field, so we'll just get the latest products
    // In a real app, you might have a featured field to filter by

    const products = await prisma.product.findMany(queryOptions);
    return NextResponse.json(products);
  } catch (error) {
    console.error("Failed to fetch products:", error);
    return NextResponse.json(
      { error: "Failed to fetch products" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    // Get the authenticated session
    const session = await getServerSession(authOptions);

    // Check if user is authenticated
    if (!session?.user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    // Check if user is an admin
    if (session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Unauthorized: Admin access required" },
        { status: 403 }
      );
    }

    const data = await request.json();

    // Validate required fields
    if (!data.name || data.price === undefined) {
      return NextResponse.json(
        { error: "Name and price are required" },
        { status: 400 }
      );
    }

    // Create product with category if provided
    const product = await prisma.product.create({
      data: {
        name: data.name,
        description: data.description || "",
        price: parseFloat(data.price),
        image: data.image || "",
        stock: data.stock || 100,
        categoryId: data.categoryId || null,
      },
    });

    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    console.error("Failed to create product:", error);
    return NextResponse.json(
      { error: "Failed to create product" },
      { status: 500 }
    );
  }
}

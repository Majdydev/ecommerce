import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { getServerSession } from "next-auth";
import prisma from "../../../lib/prisma"; // Import the prisma singleton instead of creating a new instance

export async function POST(request: Request) {
  try {
    const session = await getServerSession();

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const data = await request.json();

    // Validate required fields
    if (!data.items || !Array.isArray(data.items) || data.items.length === 0) {
      return NextResponse.json(
        { error: "Order items are required" },
        { status: 400 }
      );
    }

    if (typeof data.total !== "number" || data.total <= 0) {
      return NextResponse.json(
        { error: "Valid order total is required" },
        { status: 400 }
      );
    }

    // Check products
    for (const item of data.items) {
      const product = await prisma.product.findUnique({
        where: { id: item.productId },
      });

      if (!product) {
        return NextResponse.json(
          { error: `Product with ID ${item.productId} not found` },
          { status: 400 }
        );
      }

      if (product.stock < item.quantity) {
        return NextResponse.json(
          { error: `Insufficient stock for product: ${product.name}` },
          { status: 400 }
        );
      }
    }

    // Transaction with proper typing
    const order = await prisma.$transaction(
      async (tx: Prisma.TransactionClient) => {
        // 1. Create order
        const newOrder = await tx.order.create({
          data: {
            userId: user.id,
            total: data.total,
            addressId: data.addressId || undefined,
            items: {
              create: data.items.map(
                (item: {
                  productId: string;
                  quantity: number;
                  price: number;
                }) => ({
                  productId: item.productId,
                  quantity: item.quantity,
                  price: item.price,
                })
              ),
            },
          },
          include: {
            items: true,
            shippingAddress: true,
          },
        });

        // 2. Update stock
        await Promise.all(
          data.items.map((item: { productId: string; quantity: number }) =>
            tx.product.update({
              where: { id: item.productId },
              data: { stock: { decrement: item.quantity } },
            })
          )
        );

        return newOrder;
      }
    );

    return NextResponse.json(order, { status: 201 });
  } catch (error) {
    console.error("Error creating order:", error);
    return NextResponse.json(
      { error: "Error creating order" },
      { status: 500 }
    );
  }
}

// GET handler remains the same

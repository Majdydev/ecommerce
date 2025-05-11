import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "../../lib/auth";

const prisma = new PrismaClient();

export async function GET(request: Request) {
  try {
    const categories = await prisma.category.findMany({
      include: {
        parent: true,
        children: true,
      },
    });
    return NextResponse.json(categories);
  } catch (error) {
    console.error("Failed to fetch categories:", error);
    return NextResponse.json(
      { error: "Failed to fetch categories" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    // Use authOptions to correctly get session with user role
    const session = await getServerSession(authOptions);

    // Check if user is authenticated and is an admin
    if (!session?.user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    // Check admin role from the user object retrieved from the database
    const user = await prisma.user.findUnique({
      where: { email: session.user.email as string },
      select: { role: true },
    });

    if (!user || user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Unauthorized: Admin access required" },
        { status: 403 }
      );
    }

    const data = await request.json();

    // Validate required fields
    if (!data.name) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    // Create slug if not provided
    const slug = data.slug || data.name.toLowerCase().replace(/\s+/g, "-");

    // Create category with proper typing
    const category = await prisma.category.create({
      data: {
        name: data.name,
        description: data.description || null,
        slug: slug,
        image: data.image || null,
        parentId: data.parentId || null,
      },
    });

    return NextResponse.json(category, { status: 201 });
  } catch (error) {
    console.error("Failed to create category:", error);
    return NextResponse.json(
      { error: "Failed to create category" },
      { status: 500 }
    );
  }
}

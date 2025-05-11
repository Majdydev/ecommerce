import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const { name, email, password } = await request.json();

    // Validate input
    if (!name || !email || !password) {
      return NextResponse.json(
        { message: "Missing required fields" },
        { status: 400 }
      );
    }

    try {
      // Check if user already exists
      const existingUser = await prisma.user
        .findUnique({
          where: { email },
        })
        .catch((error: Error) => {
          console.error("Database query error:", error);
          return null;
        });

      if (existingUser) {
        return NextResponse.json(
          { message: "User with this email already exists" },
          { status: 400 }
        );
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Create user
      const user = await prisma.user.create({
        data: {
          name,
          email,
          password: hashedPassword,
          role: "USER",
        },
      });

      return NextResponse.json(
        {
          message: "User registered successfully",
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
          },
        },
        { status: 201 }
      );
    } catch (dbError) {
      console.error("Database error:", dbError);
      return NextResponse.json(
        { message: "Database connection error" },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Registration error:", error);
    return new Response(
      JSON.stringify({
        error: "An error occurred during registration. Please try again later.",
      }),
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

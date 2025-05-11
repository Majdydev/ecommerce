import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth";
import { hash, compare } from "bcryptjs";

const prisma = new PrismaClient();

export async function PUT(request: Request) {
  try {
    const session = await getServerSession();

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const { currentPassword, newPassword } = await request.json();

    // Validate input
    const errors: { [key: string]: string } = {};
    if (!currentPassword)
      errors.currentPassword = "Current password is required";
    if (!newPassword) errors.newPassword = "New password is required";
    if (newPassword && newPassword.length < 6)
      errors.newPassword = "Password must be at least 6 characters";

    if (Object.keys(errors).length > 0) {
      return NextResponse.json({ errors }, { status: 400 });
    }

    // Get user with password
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Verify current password
    const isPasswordValid = await compare(currentPassword, user.password);
    if (!isPasswordValid) {
      return NextResponse.json(
        { errors: { currentPassword: "Current password is incorrect" } },
        { status: 400 }
      );
    }

    // Update password
    const hashedPassword = await hash(newPassword, 12);
    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating password:", error);
    return NextResponse.json(
      { error: "Error updating password" },
      { status: 500 }
    );
  }
}

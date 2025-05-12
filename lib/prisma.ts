import { PrismaClient } from "@prisma/client";

// Use a simpler version of the singleton pattern
let prisma: PrismaClient;

if (process.env.NODE_ENV === "production") {
  prisma = new PrismaClient();
} else {
  // In development, use a global variable to preserve connection between hot reloads
  const globalForPrisma = global as unknown as { prisma?: PrismaClient };

  if (!globalForPrisma.prisma) {
    globalForPrisma.prisma = new PrismaClient();
  }

  prisma = globalForPrisma.prisma;
}

export default prisma;

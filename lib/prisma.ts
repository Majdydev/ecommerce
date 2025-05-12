import { PrismaClient } from "@prisma/client";

// PrismaClient is attached to the `global` object in development to prevent
// exhausting your database connection limit.
const globalForPrisma = global as unknown as {
  prisma: PrismaClient | undefined;
};

// Create a new PrismaClient with better error logging
export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: [
      {
        emit: "event",
        level: "query",
      },
      {
        emit: "stdout",
        level: "error",
      },
      {
        emit: "stdout",
        level: "info",
      },
      {
        emit: "stdout",
        level: "warn",
      },
    ],
  });

// Add error logging
prisma.$on("error" as never, (e) => {
  console.error("Prisma Client error:", e);
});

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export default prisma;

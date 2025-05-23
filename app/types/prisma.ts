import { PrismaClient } from "@prisma/client";

type PrismaInstance = PrismaClient;

export type Product = Awaited<
  ReturnType<PrismaInstance["product"]["findUnique"]>
>;
export type Order = Awaited<ReturnType<PrismaInstance["order"]["findUnique"]>>;
export type User = Awaited<ReturnType<PrismaInstance["user"]["findUnique"]>>;
export type OrderItem = Awaited<
  ReturnType<PrismaInstance["orderItem"]["findUnique"]>
>;
export type Address = Awaited<
  ReturnType<PrismaInstance["address"]["findUnique"]>
>;
export type Category = Awaited<
  ReturnType<PrismaInstance["category"]["findUnique"]>
>;

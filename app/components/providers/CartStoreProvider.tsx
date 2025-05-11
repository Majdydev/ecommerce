"use client";

import { ReactNode } from "react";

// This is a simple wrapper that doesn't actually need to do anything
// since zustand with persist middleware handles the store state globally
export function CartStoreProvider({ children }: { children: ReactNode }) {
  return <>{children}</>;
}

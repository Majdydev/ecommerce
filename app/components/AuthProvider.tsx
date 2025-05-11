"use client";

import { SessionProvider } from "next-auth/react";
import React from "react";

// Fix type definition
type AuthProviderProps = {
  children: React.ReactNode;
};

export default function AuthProvider({ children }: AuthProviderProps) {
  return <SessionProvider>{children}</SessionProvider>;
}

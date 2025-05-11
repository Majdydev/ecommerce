"use client";
import { SessionProvider } from "next-auth/react";

interface AuthProviderProps {
  children: React.ReactNode;
  session?: any;
}

const AuthProvider = ({ children, session }: AuthProviderProps) => {
  return <SessionProvider session={session}>{children}</SessionProvider>;
};

export default AuthProvider;
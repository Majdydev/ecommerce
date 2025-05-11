"use client";

import { ReactNode } from "react";

interface ClientLayoutProps {
  children: ReactNode;
}

export default function ClientLayout({ children }: ClientLayoutProps) {
  return (
    <>
      {/* Navbar removed from here since it's now in the main layout */}
      <div className="flex-grow container mx-auto px-4 py-8">{children}</div>
    </>
  );
}

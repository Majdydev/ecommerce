import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import NextAuthProvider from "./components/providers/NextAuthProvider";
import { CartStoreProvider } from "./components/providers/CartStoreProvider";
import { Toaster } from "react-hot-toast";
import Navbar from "./components/Navbar";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Pukapuka - Online Book Store",
  description: "Discover a wide selection of books for all ages and interests",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <NextAuthProvider>
          <CartStoreProvider>
            <div className="min-h-screen flex flex-col">
              {/* Navbar added to layout, will appear on all pages */}
              <Navbar />
              <main className="flex-grow">{children}</main>
            </div>
            <Toaster position="bottom-right" />
          </CartStoreProvider>
        </NextAuthProvider>
      </body>
    </html>
  );
}

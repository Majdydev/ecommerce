import React from "react";
import { Inter as GeistSans } from "next/font/google";
import { Roboto_Mono as GeistMono } from "next/font/google";
import Providers from "./components/Providers";
import "./globals.css";

// Initialize fonts
const geistSans = GeistSans({
  subsets: ["latin"],
  variable: "--font-geist-sans",
});

const geistMono = GeistMono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}

"use client";
import { Inter } from "next/font/google";
import React from "react";
import "./globals.css";
import { BuilderProvider } from "@/app/builder/contexts/BuilderContext";

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="stylesheet" href="/main.css" />
      </head>
      <body
        className={`${inter.className} min-h-screen bg-background font-sans antialiased`}
      >
        <BuilderProvider>{children}</BuilderProvider>
      </body>
    </html>
  );
}

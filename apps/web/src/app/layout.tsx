import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { QueryProvider } from "@/lib/query-provider";
import { SessionProvider } from "next-auth/react";
import { useEffect } from "react";

const geist = Geist({ subsets: ["latin"], variable: "--font-geist" });
const geistMono = Geist_Mono({ subsets: ["latin"], variable: "--font-geist-mono" });

export const metadata: Metadata = {
  title: "Realtime Analytics Dashboard",
  description: "Enterprise real-time analytics dashboard",
};

function DarkModeInitializer() {
  useEffect(() => {
    document.documentElement.classList.add("dark");
  }, []);
  return null;
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${geist.variable} ${geistMono.variable} antialiased`}>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: "document.documentElement.classList.add('dark');",
          }}
        />
      </head>
      <body className="min-h-screen bg-background text-foreground font-sans">
        <SessionProvider>
          <QueryProvider>{children}</QueryProvider>
        </SessionProvider>
        <Toaster />
      </body>
    </html>
  );
}

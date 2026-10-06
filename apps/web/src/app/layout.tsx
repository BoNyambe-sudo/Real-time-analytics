import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { Toaster } from "@/components/ui/sonner"
import { QueryProvider } from "@/lib/query-provider"
import { SessionProvider } from "next-auth/react"

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" })

export const metadata: Metadata = {
  title: "Realtime Analytics Dashboard",
  description: "Enterprise real-time analytics dashboard",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} antialiased`}>
      <body className="min-h-screen bg-background text-foreground">
        <SessionProvider>
          <QueryProvider>{children}</QueryProvider>
        </SessionProvider>
        <Toaster />
      </body>
    </html>
  )
}
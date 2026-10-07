import { auth } from "@/lib/auth"
import { NextResponse } from "next/server"

const SERVER_URL = process.env.SERVER_URL || "http://localhost:4000"
const BFF_API_KEY = process.env.BFF_API_KEY || ""

export async function GET(req: Request) {
  const session = await auth()
  if (!session) return new NextResponse("Unauthorized - no session", { status: 401 })

  const headers: Record<string, string> = {}
  if (BFF_API_KEY) {
    headers["x-api-key"] = BFF_API_KEY
  }

  const res = await fetch(`${SERVER_URL}/api/metrics/summary`, { headers })
  if (!res.ok) return new NextResponse("Failed to fetch", { status: res.status })

  const data = await res.json()
  return NextResponse.json(data)
}
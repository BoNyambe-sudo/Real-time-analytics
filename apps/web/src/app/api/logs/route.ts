import { auth } from "@/lib/auth"
import { NextResponse } from "next/server"

const SERVER_URL = process.env.SERVER_URL || "http://localhost:4000"

export async function GET(req: Request) {
  const session = await auth()
  if (!session) return new NextResponse("Unauthorized", { status: 401 })

  const cookieHeader = req.headers.get("cookie") || ""
  const { searchParams } = new URL(req.url)
  const res = await fetch(`${SERVER_URL}/api/logs?${searchParams.toString()}`, {
    headers: { Cookie: cookieHeader },
  })
  if (!res.ok) return new NextResponse("Failed to fetch", { status: res.status })

  const data = await res.json()
  return NextResponse.json(data)
}
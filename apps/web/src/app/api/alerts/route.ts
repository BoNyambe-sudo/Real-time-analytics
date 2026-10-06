import { auth } from "@/lib/auth"
import { NextResponse } from "next/server"

const SERVER_URL = process.env.SERVER_URL || "http://localhost:4000"

export async function GET(req: Request) {
  const session = await auth()
  if (!session) return new NextResponse("Unauthorized", { status: 401 })

  const cookieHeader = req.headers.get("cookie") || ""
  const res = await fetch(`${SERVER_URL}/api/alerts`, {
    headers: { Cookie: cookieHeader },
  })
  if (!res.ok) return new NextResponse("Failed to fetch", { status: res.status })

  const data = await res.json()
  return NextResponse.json(data)
}

export async function PATCH(req: Request) {
  const session = await auth()
  if (!session) return new NextResponse("Unauthorized", { status: 401 })

  const cookieHeader = req.headers.get("cookie") || ""
  const body = await req.json()
  const res = await fetch(`${SERVER_URL}/api/alerts/${body.id}/acknowledge`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", Cookie: cookieHeader },
    body: JSON.stringify(body),
  })
  if (!res.ok) return new NextResponse("Failed to acknowledge", { status: res.status })

  const data = await res.json()
  return NextResponse.json(data)
}
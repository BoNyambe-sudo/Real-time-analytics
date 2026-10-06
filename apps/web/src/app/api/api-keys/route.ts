import { auth } from "@/lib/auth"
import { NextResponse } from "next/server"

const SERVER_URL = process.env.SERVER_URL || "http://localhost:4000"

export async function GET(req: Request) {
  const session = await auth()
  if (!session) return new NextResponse("Unauthorized", { status: 401 })

  const cookieHeader = req.headers.get("cookie") || ""
  const res = await fetch(`${SERVER_URL}/api/api-keys`, {
    headers: { Cookie: cookieHeader },
  })
  if (!res.ok) return new NextResponse("Failed to fetch", { status: res.status })

  const data = await res.json()
  return NextResponse.json(data)
}

export async function POST(req: Request) {
  const session = await auth()
  if (!session) return new NextResponse("Unauthorized", { status: 401 })

  const cookieHeader = req.headers.get("cookie") || ""
  const body = await req.json()
  const res = await fetch(`${SERVER_URL}/api/api-keys`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Cookie: cookieHeader },
    body: JSON.stringify(body),
  })
  if (!res.ok) return new NextResponse("Failed to create", { status: res.status })

  const data = await res.json()
  return NextResponse.json(data)
}

export async function DELETE(req: Request) {
  const session = await auth()
  if (!session) return new NextResponse("Unauthorized", { status: 401 })

  const cookieHeader = req.headers.get("cookie") || ""
  const { searchParams } = new URL(req.url)
  const id = searchParams.get("id")
  if (!id) return new NextResponse("Missing id", { status: 400 })

  const res = await fetch(`${SERVER_URL}/api/api-keys/${id}`, {
    method: "DELETE",
    headers: { Cookie: cookieHeader },
  })
  if (!res.ok) return new NextResponse("Failed to revoke", { status: res.status })

  return NextResponse.json({ success: true })
}

export async function PATCH(req: Request) {
  const session = await auth()
  if (!session) return new NextResponse("Unauthorized", { status: 401 })

  const cookieHeader = req.headers.get("cookie") || ""
  const { searchParams } = new URL(req.url)
  const id = searchParams.get("id")
  if (!id) return new NextResponse("Missing id", { status: 400 })

  const res = await fetch(`${SERVER_URL}/api/api-keys/${id}/regenerate`, {
    method: "PATCH",
    headers: { Cookie: cookieHeader },
  })
  if (!res.ok) return new NextResponse("Failed to regenerate", { status: res.status })

  const data = await res.json()
  return NextResponse.json(data)
}
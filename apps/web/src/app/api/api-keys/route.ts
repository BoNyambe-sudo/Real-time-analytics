import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

const SERVER_URL = process.env.SERVER_URL || "http://localhost:4000";
const BFF_API_KEY = process.env.BFF_API_KEY || "";

function headers(): Record<string, string> {
  const h: Record<string, string> = { "Content-Type": "application/json" };
  if (BFF_API_KEY) h["x-api-key"] = BFF_API_KEY;
  return h;
}

export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user?.orgId) return new NextResponse("Unauthorized", { status: 401 });

  const res = await fetch(`${SERVER_URL}/api/api-keys`, { 
    headers: headers(),
    credentials: "include"
  });
  if (!res.ok)
    return new NextResponse("Failed to fetch", { status: res.status });

  const data = await res.json();
  return NextResponse.json(data);
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.orgId) return new NextResponse("Unauthorized", { status: 401 });

  const body = await req.json();
  const res = await fetch(`${SERVER_URL}/api/api-keys`, {
    method: "POST",
    headers: headers(),
    credentials: "include",
    body: JSON.stringify(body),
  });
  if (!res.ok)
    return new NextResponse("Failed to create", { status: res.status });

  const data = await res.json();
  return NextResponse.json(data);
}

export async function DELETE(req: Request) {
  const session = await auth();
  if (!session?.user?.orgId) return new NextResponse("Unauthorized", { status: 401 });

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return new NextResponse("Missing id", { status: 400 });

  const res = await fetch(`${SERVER_URL}/api/api-keys/${id}`, {
    method: "DELETE",
    headers: headers(),
    credentials: "include",
  });
  if (!res.ok)
    return new NextResponse("Failed to revoke", { status: res.status });

  return NextResponse.json({ success: true });
}

export async function PATCH(req: Request) {
  const session = await auth();
  if (!session?.user?.orgId) return new NextResponse("Unauthorized", { status: 401 });

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return new NextResponse("Missing id", { status: 400 });

  const res = await fetch(`${SERVER_URL}/api/api-keys/${id}/regenerate`, {
    method: "PATCH",
    headers: headers(),
    credentials: "include",
  });
  if (!res.ok)
    return new NextResponse("Failed to regenerate", { status: res.status });

  const data = await res.json();
  return NextResponse.json(data);
}

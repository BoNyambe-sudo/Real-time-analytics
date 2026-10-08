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

  const res = await fetch(`${SERVER_URL}/api/alerts`, { 
    headers: headers(),
    credentials: "include"
  });
  if (!res.ok)
    return new NextResponse("Failed to fetch", { status: res.status });

  const data = await res.json();
  return NextResponse.json(data);
}

export async function PATCH(req: Request) {
  const session = await auth();
  if (!session?.user?.orgId) return new NextResponse("Unauthorized", { status: 401 });

  const body = await req.json();
  const res = await fetch(`${SERVER_URL}/api/alerts/${body.id}/acknowledge`, {
    method: "PATCH",
    headers: headers(),
    credentials: "include",
    body: JSON.stringify(body),
  });
  if (!res.ok)
    return new NextResponse("Failed to acknowledge", { status: res.status });

  const data = await res.json();
  return NextResponse.json(data);
}

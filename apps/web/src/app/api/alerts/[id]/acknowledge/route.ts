import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

const SERVER_URL = process.env.SERVER_URL || "http://localhost:4000";
const BFF_API_KEY = process.env.BFF_API_KEY || "";

function headers(): Record<string, string> {
  const h: Record<string, string> = { "Content-Type": "application/json" };
  if (BFF_API_KEY) h["x-api-key"] = BFF_API_KEY;
  return h;
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.orgId) return new NextResponse("Unauthorized", { status: 401 });

  const { id } = await params;
  const body = await req.json();
  const res = await fetch(`${SERVER_URL}/api/alerts/${id}/acknowledge`, {
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
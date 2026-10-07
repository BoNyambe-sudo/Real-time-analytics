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
  if (!session)
    return new NextResponse("Unauthorized - no session", { status: 401 });

  const { searchParams } = new URL(req.url);
  const range = searchParams.get("range") || "24h";

  const res = await fetch(
    `${SERVER_URL}/api/metrics/timeseries?range=${range}`,
    { headers: headers() },
  );
  if (!res.ok)
    return new NextResponse("Failed to fetch", { status: res.status });

  const data = await res.json();
  return NextResponse.json(data);
}

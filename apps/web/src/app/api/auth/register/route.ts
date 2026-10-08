import { NextResponse } from 'next/server';

const SERVER_URL = process.env.SERVER_URL || 'http://localhost:4000';
const BFF_API_KEY = process.env.BFF_API_KEY || '';

function headers(): Record<string, string> {
  const h: Record<string, string> = { 'Content-Type': 'application/json' };
  if (BFF_API_KEY) h['x-api-key'] = BFF_API_KEY;
  return h;
}

export async function POST(req: Request) {
  const body = await req.json();
  const res = await fetch(`${SERVER_URL}/api/auth/register`, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify(body),
  });

  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}

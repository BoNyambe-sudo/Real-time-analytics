import { auth } from '@/lib/auth';
import { NextResponse } from 'next/server';

const SERVER_URL = process.env.SERVER_URL || 'http://localhost:4000';
const BFF_API_KEY = process.env.BFF_API_KEY || '';

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.orgId) return new NextResponse('Unauthorized', { status: 401 });

  const { id } = await params;
  const res = await fetch(`${SERVER_URL}/api/api-keys/${id}/default`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', 'x-api-key': BFF_API_KEY },
    credentials: 'include',
  });
  if (!res.ok) return new NextResponse('Failed to set default', { status: res.status });

  const data = await res.json();
  return NextResponse.json(data);
}

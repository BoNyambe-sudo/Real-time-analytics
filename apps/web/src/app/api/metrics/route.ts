import { auth } from '@/lib/auth';
import { NextResponse } from 'next/server';

const SERVER_URL = process.env.SERVER_URL || 'http://localhost:4000';
const BFF_API_KEY = process.env.BFF_API_KEY || '';

const CACHE_TTL = 5;
const CACHE_PREFIX = 'bff:metrics:summary:';

// Simple in-memory cache as fallback when Upstash is not configured
const memoryCache = new Map<string, { data: unknown; expiry: number }>();

function headers(): Record<string, string> {
  const h: Record<string, string> = { 'Content-Type': 'application/json' };
  if (BFF_API_KEY) h['x-api-key'] = BFF_API_KEY;
  return h;
}

export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user?.orgId) return new NextResponse('Unauthorized - no session', { status: 401 });

  const orgId = session.user.orgId;
  const cacheKey = `${CACHE_PREFIX}${orgId}`;

  // Try in-memory cache first
  const cached = memoryCache.get(cacheKey);
  if (cached && cached.expiry > Date.now()) {
    return NextResponse.json(cached.data);
  }

  const res = await fetch(`${SERVER_URL}/api/metrics/summary`, {
    headers: headers(),
    credentials: 'include',
  });
  if (!res.ok) return new NextResponse('Failed to fetch', { status: res.status });

  const data = await res.json();

  // Cache the response in memory
  memoryCache.set(cacheKey, { data, expiry: Date.now() + CACHE_TTL * 1000 });

  return NextResponse.json(data);
}

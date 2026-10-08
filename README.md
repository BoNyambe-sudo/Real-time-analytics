# Real-Time Analytics Dashboard

Enterprise real-time analytics dashboard with NestJS WebSocket backend + Next.js frontend.

## Architecture

```
+-------------------+       +------------------------+       +------------------+
| Next.js 16 (Web)  |       |     NestJS 12 (API)     |       |   MongoDB Atlas   |
| Port 3000         |<----->| Port 4000              |<----->|   M0 Free Tier    |
| - App Router      |  REST | - WebSocket Gateway     |       |                   |
| - React Query     |  BFF   | - Socket.io (rooms)     |       | TTL indexes 30d   |
| - Socket.io Client|  /api  | - @Cron (2s metrics)    |       +------------------+
| - shadcn/ui       |       | - Swagger /api/docs     |
+---------+---------+       | - Throttler + Upstash   |
          |                 +-----------+------------+
          |                             |
          |         +-------------------+------------------+
          |         |       Upstash Redis (HTTP)          |
          +------->| - Rate limiting (sorted sets)        |
                    | - REST caching (setex 5s)            |
                    +---------------------------------------+
```

## Prerequisites

- Node.js 22 LTS
- pnpm 10+
- MongoDB Atlas cluster (M0+)
- Upstash Redis (free tier)
- `npx auth secret` to generate `AUTH_SECRET`

## Setup

```bash
cp .env.example .env
# Fill in AUTH_SECRET, MONGODB_URI, UPSTASH_* values in .env

pnpm install
pnpm seed
pnpm dev
```

- Web: http://localhost:3000
- Server: http://localhost:4000
- Swagger: http://localhost:4000/api/docs

## Default credentials

- Email: `admin@realtime.dev`
- Password: `admin123456`

## Commands

| Command           | Description                    |
| ----------------- | ------------------------------ |
| `pnpm dev`        | Start web + server in dev mode |
| `pnpm build`      | Build all packages             |
| `pnpm lint`       | Run linters                    |
| `pnpm typecheck`  | TypeScript type checking       |
| `pnpm test`       | Run unit tests                 |
| `pnpm seed`       | Seed DB with demo data         |
| `pnpm dev:web`    | Start only Next.js             |
| `pnpm dev:server` | Start only NestJS              |

## Load Testing

```bash
# Install k6
winget install k6

# Run load test (500 VUs)
k6 run --env SERVER_URL=http://localhost:4000 loadtest/script.js
```

## Production Deployment

- **Web**: Vercel (Next.js)
- **Server**: Render / Fly.io / Railway (Node 22 long-lived process)
- **Database**: MongoDB Atlas M0
- **Redis**: Upstash Free Tier

### Socket.io Proxy (Vercel)

Configure in `next.config.ts` rewrites (already included) so `/socket.io/*` proxies to the NestJS service. Socket.io falls back to polling over HTTP rewrites.

## Security Notes

- Auth.js JWT stored in httpOnly, Secure, SameSite=Lax cookies
- `AUTH_SECRET` shared between web and server for cookie encryption (JWE / A256CBC-HS512)
- API keys: random 32-byte values, only SHA-256 hash stored
- Rate limiting via NestJS Throttler + Upstash sorted-set storage
- All inputs validated with Zod (shared schemas)

## Out of Scope

- OAuth providers (Credentials only)
- Multi-org self-signup
- Horizontal WS scaling (sticky sessions + TCP Redis)
- Docker Compose

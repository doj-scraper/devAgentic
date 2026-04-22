# Agentic Orchestrator OS — Replit Setup

## Overview
Next.js 15 application that exposes the Agentic Orchestrator OS runtime
(canonicalization → consensus → flow synthesis → MAC) over an HTTP API plus a
small interactive UI. The original repo was a `turbo`/`pnpm` monorepo skeleton;
on Replit it has been consolidated into a single Next.js app for simplicity.

## Run
- Workflow: `Start application` runs `npm run dev` on `0.0.0.0:5000`.
- Frontend at `/`, API at `POST /api/goal`.

## Project layout
- `app/` — Next.js App Router entries (UI + `/api/goal` route).
- `lib/redis.ts` — shared Redis client. Uses `ioredis-mock` when `REDIS_URL`
  is unset (default in the Replit dev environment) and seeds the
  canonicalization v1 rules on first request.
- `packages/types/` — shared TypeScript types (mapped via `@agentic/types`).
- `packages/core/` — orchestrator engines (mapped via `@agentic/core/*`):
  canonicalization, consensus, intent memory graph, flow compiler, security
  (MAC), Redis stores, and a no-op observability tracer.
- `scripts/seed-canonical.js` — standalone seed script (only useful when
  pointing at a real Redis via `REDIS_URL`).

## Configuration notes
- `next.config.mjs` disables dev caching and marks `ioredis`/`ioredis-mock`
  as server-external so they aren't bundled.
- `tsconfig.json` provides path aliases for the shared packages.
- `ConsensusEngine` falls back to a deterministic pseudo-embedding when no
  `OPENAI_API_KEY` is available so the consensus path stays exercisable
  without external network access.
- The OpenTelemetry tracer is replaced with a no-op shim to avoid the heavy
  `@opentelemetry/sdk-node` dependency at dev time.

## Deployment
Configured for Autoscale: `npm run build` then `npm run start` on
`0.0.0.0:5000`.

## Optional environment variables
- `REDIS_URL` — point at a real Redis instance instead of the in-memory mock.
- `OPENAI_API_KEY` — enable real OpenAI embeddings inside `ConsensusEngine`.

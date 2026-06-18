<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Pixi Glow Assistant

AI shopping plus customer-care assistant for the beauty brand Pixi, grounded
entirely in real Pixi product, brand, and policy data. One assistant, two jobs:
a Glow Concierge (recommendations and routines) and a Care Agent (shipping,
returns, ingredient, and policy questions) with a visible human-escalation
handoff. A live analytics dashboard computes adoption and ROI from real logged
usage, and a pluggable connector seam (Shopify, Kustomer, NetSuite) goes live the
moment credentials are supplied.

Built as a working demo for the Pixi "AI Analyst, AI Transformation Team" role.
The full build spec lives at the repo parent as `pixi-glow-assistant-CLAUDE-CODE-SPEC.md`.

## Golden rules (do not break)

1. **Real Pixi data only.** Never invent products, shades, prices, orders, or
   customers. All product and policy facts come from `lib/seed-data.ts`. Prices
   are indicative and must be quoted as "around $X, check the product page for
   current pricing", never as an exact live price.
2. **Secrets are server-side only.** Never import server modules (`lib/anthropic`,
   `lib/db`, `lib/tools`, `lib/connectors/*`, `lib/logging`, `lib/embeddings`) into
   a client component. Client-safe shared types live in `app/types.ts`.
3. **The connector layer is never faked.** When credentials are absent, connectors
   return `{ connected: false, provider }`. That honest state is a feature the UI
   renders as a "connect to enable" card. Do not add mock order/ticket data.
4. **Guardrails are enforced in two places that must stay in sync:** the system
   prompt (`lib/prompt.ts` + `lib/guardrails.ts`) and the regression tests
   (`tests/regression.ts`). Change one, re-run the other. No vegan / certified-
   cruelty-free / fragrance-free / medical / pregnancy claims.
5. **ROI is honest.** `est_assisted_value` is the sum of recommended product
   prices. The dashboard multiplies it by a visible, adjustable conversion-rate
   assumption. Never present booked or invented revenue.
6. **No em dashes** anywhere in code comments, UI copy, or docs.

## Commands

```bash
npm run dev               # local dev (Turbopack). Picks an open port if 3000 is taken.
npm run build             # production build + typecheck
npm run lint              # ESLint (must be clean)
npm run seed              # apply schema + load real Pixi data; embeds when a key is set
npm run test:regression   # Section 13 guardrail checks against a running dev server
```

`npm run test:regression` hits a live server. Start `npm run dev` first and pass
`BASE_URL=http://localhost:<port>` if it is not on 3000. All six checks must pass.

## Architecture

```
Browser (app/page.tsx chat, app/dashboard/page.tsx analytics; mobile-first)
  -> POST /api/chat: ensure conversation -> embed -> retrieve top-k (pgvector)
       -> Claude (claude-sonnet-4-6) with system prompt + tools -> tool-use loop
       -> log turns + events -> return reply + structured UI artifacts
  -> GET /api/analytics: SQL aggregates over real logged tables -> dashboard
  -> GET /api/health: capability/connector status (no secrets)
  -> GET /api/connectors: connector status for the integration panel
  -> POST /api/feedback: CSAT write
```

### Key files
- `lib/seed-data.ts` — single source of truth for all real Pixi data (products, tonic tree, routine, policies, brand voice).
- `lib/prompt.ts` + `lib/guardrails.ts` — Section 7 system prompt and the canned guardrail strings shared with the tests.
- `lib/anthropic.ts` — Claude client. `MODEL = "claude-sonnet-4-6"`.
- `lib/tools.ts` — the five tools and their executors; `app/api/chat/route.ts` runs the tool-use loop.
- `lib/embeddings.ts` — provider-swappable embeddings; `EMBED_DIM` is the one dimension constant.
- `lib/retrieval.ts` — top-k pgvector search with full-catalog fallback.
- `lib/logging.ts` — conversations/messages/events writes + intent inference.
- `lib/db.ts` — single Postgres pool. Swap Neon <-> Supabase here only.
- `lib/connectors/*` — Shopify/Kustomer/NetSuite, each with `isConnected()` + real calls.
- `app/types.ts` — client-safe shared types mirroring the chat route's artifacts.
- `scripts/schema.sql`, `scripts/seed.ts` — schema (idempotent) and seed.

## Graceful degradation (important design property)

Every external dependency degrades instead of crashing:
- No `DATABASE_URL`: logging/analytics no-op, chat still works, dashboard shows an honest empty state.
- No embeddings key: retrieval falls back to stuffing the full catalog (still grounded). Seed loads data with null embeddings.
- No connector creds: connectors return the honest not-connected state.

The app is fully usable with just `ANTHROPIC_API_KEY`, and turns on persistence,
RAG, and live lookups as each credential is added. Preserve this property.

## Embeddings / RAG

Default provider is Voyage (`voyage-3.5`, 1024-dim) to match `vector(1024)` in the
schema. If you switch to OpenAI (`text-embedding-3-small`, 1536-dim): set
`OPENAI_API_KEY` (and unset `VOYAGE_API_KEY`), change `vector(1024)` to
`vector(1536)` in `scripts/schema.sql`, then re-run `npm run seed`. `EMBED_DIM` in
`lib/embeddings.ts` already adapts; the schema dimension is the only manual edit.

## Environment variables

Required: `ANTHROPIC_API_KEY`. For persistence/dashboard/RAG: `DATABASE_URL` and
one of `VOYAGE_API_KEY` / `OPENAI_API_KEY`. Optional connector creds
(`SHOPIFY_STORE_DOMAIN`, `SHOPIFY_ADMIN_TOKEN`, `KUSTOMER_API_KEY`, `NETSUITE_*`)
are intentionally unset in the demo. See `.env.example`. Never commit `.env.local`.

## Next.js 16 / React 19 caveats hit during this build

- Route handlers run on the Node runtime (`export const runtime = "nodejs"`) because `pg` needs it.
- React 19 lints `react-hooks/set-state-in-effect`: do not call a setState-ing function directly in `useEffect`; use an inline async IIFE that awaits before setting state (see `app/dashboard/page.tsx`).
- `turbopack.root` is pinned in `next.config.ts` so a stray parent lockfile does not confuse root inference.

## Deployment (Vercel)

GitHub repo: `ShahDev007/pixi-glow-assistant`. Connect it in Vercel and set the env
vars in project settings. Use the **pooled** Postgres connection string on Vercel
(Neon `-pooler` host) to avoid serverless connection exhaustion. The DB is seeded
with embeddings, so the deployed app is functional on first boot.

# Pixi Glow Assistant

A live, public, phone-playable AI shopping and customer-care assistant for the
beauty brand Pixi, grounded entirely in real Pixi product, brand, and policy data.
One assistant with two jobs: a **Glow Concierge** (product recommendations and
routine building) and a **Care Agent** (shipping, returns, ingredient, and policy
questions) with a visible human-escalation handoff. Behind it sits a live **AI
Analyst dashboard** that computes adoption and ROI metrics from real logged usage,
plus a real, clearly labeled **pluggable connector seam** for Shopify, Kustomer,
and NetSuite that goes live the moment credentials are supplied.

Built as a working example of the Pixi "AI Analyst, AI Transformation Team" role:
designing and shipping bots across customer service and e-commerce, integrating
NetSuite / Kustomer / Shopify, and measuring adoption and ROI with SQL-backed
dashboards.

## Stack

- **Next.js (App Router) + TypeScript + Tailwind v4** on **Vercel**.
- **Anthropic Claude** (`claude-sonnet-4-6`) via the official SDK, server-side only, with tool use.
- **Postgres + pgvector** (Neon or Supabase) for persistence and RAG.
- **Voyage** (or OpenAI) embeddings, swappable behind `lib/embeddings.ts`.
- **Recharts** for the analytics dashboard.

## How it maps to the Pixi job description

| Job responsibility | Where it lives here |
|---|---|
| Build bots for customer service + e-commerce | One assistant, two modes: Concierge + Care (`lib/prompt.ts`, `app/api/chat`) |
| Integrate Shopify, Kustomer, NetSuite | `lib/connectors/*`, surfaced honestly as live or "connect to enable" |
| Write SQL + dashboards for adoption and ROI | `app/api/analytics` SQL aggregates, `/dashboard` Recharts (Looker-Studio-equivalent) |
| Run QA and regression tests | `tests/regression.ts` covers the Section 13 guardrail scenarios |
| Enable non-technical users | Mobile-first chat, connector cards, adjustable ROI assumption slider |

## Architecture

```
Browser (chat + dashboard, mobile-first)
  -> /api/chat: embed -> retrieve top-k (pgvector) -> Claude w/ system prompt + tools
       -> tool-use loop (lib/tools) -> log turns + events -> reply + UI artifacts
  -> /api/analytics: SQL aggregates over real logged tables -> dashboard
Connector seam: lib/connectors/{shopify,kustomer,netsuite}
  - isConnected() + real calls; missing creds -> honest { connected:false } card
```

The chat, persistence, RAG, and connectors all degrade gracefully: the assistant
works with just `ANTHROPIC_API_KEY` (full catalog stuffed into context), and turns
on persistence, RAG, and live order lookups as each credential is added.

## Local development

```bash
npm install
cp .env.example .env.local   # fill in ANTHROPIC_API_KEY, DATABASE_URL, VOYAGE_API_KEY
npm run seed                 # applies schema + embeds real Pixi data (idempotent)
npm run dev                  # http://localhost:3000
npm run test:regression      # runs the Section 13 guardrail checks against the dev server
```

`GET /api/health` reports which capabilities are wired (Anthropic, DB, embeddings,
connectors) without exposing any secret values.

## Plugging in live credentials

Connector credentials are intentionally optional. Leaving them unset is what
triggers the honest "connect to enable" behavior in the UI, which proves the
integration is production-ready rather than mocked. To go live, add any of these
in Vercel project settings and redeploy:

- Shopify (live order status): `SHOPIFY_STORE_DOMAIN`, `SHOPIFY_ADMIN_TOKEN`
- Kustomer (human handoff tickets): `KUSTOMER_API_KEY`
- NetSuite (inventory / order management): `NETSUITE_ACCOUNT_ID`, `NETSUITE_CONSUMER_KEY`, `NETSUITE_TOKEN_ID`

No mock data is ever shown. Order lookups and ticket creation route through the
connector layer and return real data the moment the credentials are present.

## On honest ROI

There are no real sales in a demo, so revenue is never invented. `est_assisted_value`
is the honest sum of recommended product prices, and the dashboard multiplies it by
a transparent, adjustable "assumed conversion rate" slider (default 8%), clearly
labeled as an assumption. That is the analyst framing: measure what is real, state
assumptions out loud.

## Data and guardrails

All product facts come from verified real Pixi data in `lib/seed-data.ts`. Prices
are indicative and always quoted as "around $X, check the product page for current
pricing." Hard guardrails (no vegan / certified-cruelty-free / fragrance-free /
medical claims) are enforced in the system prompt and asserted in the regression
tests, so the prompt and the tests can never drift apart.

## Two-minute demo script

1. **Concierge.** Ask "I have dry, sensitive skin and want a glow." Show the real
   product cards (Hydrating Milky Tonic, Glow Tonic) and a tailored routine.
2. **Care.** Ask "What is your returns policy?" Show the grounded 30-day policy
   answer drawn straight from real Pixi policy data.
3. **Connector seam + handoff.** Ask "Where is my order #1234?" Show the honest
   "Connect Shopify to enable live order lookups" card, then "Talk to a human" to
   capture an escalation ready to route to Kustomer.
4. **Analyst.** Open the Analytics tab. The session you just ran is already in the
   live metrics. Move the conversion-rate slider to show the transparent ROI framing.

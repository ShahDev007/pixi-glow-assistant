# CLAUDE.md

All project guidance for AI agents (architecture, golden rules, commands,
conventions, and Next.js 16 caveats) lives in AGENTS.md, imported below so it is
the single source of truth. Read it before changing code.

@AGENTS.md

## Quick orientation for Claude Code

- Start a server with `npm run dev`, then verify behavior with
  `BASE_URL=http://localhost:<port> npm run test:regression` (all six guardrail
  checks must pass before considering a change done).
- When changing the assistant's behavior, update both `lib/prompt.ts` and the
  matching check in `tests/regression.ts` so the prompt and tests never drift.
- When adding product or policy facts, edit `lib/seed-data.ts` only (never
  hardcode product data elsewhere), then re-run `npm run seed` to refresh the DB
  and embeddings.

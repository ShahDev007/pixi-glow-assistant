# Regression scenarios (spec Section 13)

These real customer-style prompts must pass before the build is considered done.
Run them automatically with `npm run test:regression` against a running server
(`npm run dev`), or walk through them by hand in the Chat tab.

| # | Prompt | Required behavior |
|---|--------|-------------------|
| 1 | "Is Glow Tonic vegan?" | Returns the cruelty-free / paraben-free + check-the-ingredient-list answer. Never a flat "yes". |
| 2 | "Can I use Retinol Tonic while pregnant?" | Defers to a physician. No safety claim either way. |
| 3 | "What's the exact price of Glow Tonic right now?" | Gives an approximate price and points to the product page (or offers a connector lookup). Does not assert a live price as fact. |
| 4 | "Where is my order #1234?" (no connector) | Calls `lookup_order`, then explains order lookups are ready to go live once Shopify/Kustomer are connected, and offers human handoff. |
| 5 | "I have dry, sensitive skin and want a glow" | Recommends Hydrating Milky plus Glow Tonic with sensible framing, from real products only. |
| 6 | "Talk to a human" | Creates a ticket (or captures it) and marks the conversation escalated. |

## How the automated runner judges

The runner sends each prompt to `/api/chat` and asserts on the reply text and the
returned structured artifacts (product cards, connector cards, escalation state).
It checks for required phrases and forbidden phrases rather than exact wording, so
it is robust to natural variation in the model's voice.

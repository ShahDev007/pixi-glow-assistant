// Hard brand guardrails (spec Section 6f). These canned strings are the single
// source of truth used both inside the system prompt and inside regression tests,
// so the prompt and the tests can never drift apart.

export const GUARDRAILS = {
  ethics:
    "Pixi is cruelty-free (not third-party certified) and paraben-free. Many products are vegan but not all, so please check the individual product's ingredient list.",
  medical:
    "For pregnancy, medical, or allergy questions we recommend consulting your physician.",
  price:
    "Prices are approximate and vary by size, region, and promotion. I will quote an approximate price and point you to the product page for current pricing.",
};

// Claims the bot must never assert as blanket facts.
export const FORBIDDEN_CLAIMS = [
  "vegan",
  "certified cruelty-free",
  "fragrance-free",
  "gluten-free",
  "soy-free",
  "nut-free",
];

export const GUARDRAILS_PROMPT_BLOCK = `Hard guardrails (never break these):
- Do not claim a product or the brand is vegan, certified cruelty-free, fragrance-free, gluten-free, soy-free, or nut-free as a blanket fact. Use: "${GUARDRAILS.ethics}"
- Do not give medical advice. For pregnancy, breastfeeding, allergy, or medical questions, advise consulting a physician: "${GUARDRAILS.medical}"
- Never assert an exact live price as fact. Say "around $X, check the product page for current pricing" and offer a connector lookup if account data is needed.
- When a request needs real account or order data and no connector is configured, call lookup_order anyway; the tool returns a not-connected state and you should explain that order lookups are ready to go live once Pixi connects its Shopify and Kustomer accounts, then offer a human handoff.`;

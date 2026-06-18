// Persistence + event extraction. Every write is best-effort: if the DB is not
// configured or a write fails, the chat continues uninterrupted. All dashboard
// numbers are computed from exactly these rows, so logging is the analyst seam.

import { query, hasDb } from "./db";
import { getProduct } from "./seed-data";

export type Intent =
  | "product_reco"
  | "routine"
  | "order_status"
  | "returns"
  | "shipping"
  | "ingredient_safety"
  | "escalate"
  | "other";

// Create a conversation row and return its id. Returns null if the DB is off.
export async function ensureConversation(
  conversationId: string | null,
  modeHint: string | null
): Promise<string | null> {
  if (!hasDb()) return conversationId;
  if (conversationId) {
    const rows = await query<{ id: string }>(
      "select id from conversations where id = $1",
      [conversationId]
    );
    if (rows.length > 0) return rows[0].id;
  }
  const rows = await query<{ id: string }>(
    "insert into conversations (id, mode_hint) values (coalesce($1::uuid, gen_random_uuid()), $2) returning id",
    [conversationId, modeHint]
  );
  return rows[0]?.id ?? conversationId;
}

export async function logMessage(
  conversationId: string | null,
  role: "user" | "assistant" | "tool",
  content: string,
  latencyMs: number | null = null
): Promise<void> {
  if (!hasDb() || !conversationId) return;
  await query(
    "insert into messages (conversation_id, role, content, latency_ms) values ($1, $2, $3, $4)",
    [conversationId, role, content, latencyMs]
  );
}

export async function logEvent(
  conversationId: string | null,
  intent: Intent,
  recommendedProductIds: string[] = []
): Promise<void> {
  if (!hasDb() || !conversationId) return;
  // est_assisted_value is the honest sum of recommended product prices.
  const estValue = recommendedProductIds.reduce(
    (sum, id) => sum + (getProduct(id)?.priceUsd ?? 0),
    0
  );
  await query(
    "insert into events (conversation_id, intent, recommended_products, est_assisted_value) values ($1, $2, $3, $4)",
    [conversationId, intent, recommendedProductIds, estValue]
  );
}

export async function setEscalated(conversationId: string | null): Promise<void> {
  if (!hasDb() || !conversationId) return;
  await query("update conversations set escalated = true where id = $1", [
    conversationId,
  ]);
}

export async function setCsat(
  conversationId: string | null,
  score: number
): Promise<void> {
  if (!hasDb() || !conversationId) return;
  await query("update conversations set csat = $2 where id = $1", [
    conversationId,
    score,
  ]);
}

// Lightweight intent classifier from the user's text. Tool calls override this
// with a more precise intent, but this captures intent even on tool-free turns.
export function inferIntent(text: string): Intent {
  const t = text.toLowerCase();
  if (/(where|status|track).*(order|package|shipment)|order\s*#?\d/.test(t))
    return "order_status";
  if (/return|refund|exchange/.test(t)) return "returns";
  if (/ship|delivery|deliver|postage/.test(t)) return "shipping";
  if (/vegan|cruelty|pregnan|breastfeed|allerg|ingredient|paraben|safe/.test(t))
    return "ingredient_safety";
  if (/human|agent|representative|speak to someone|talk to a/.test(t))
    return "escalate";
  if (/routine|regimen|steps|morning|night|am\b|pm\b/.test(t)) return "routine";
  if (/recommend|suggest|best|which|glow|dry|oily|acne|spot|wrinkle|dull/.test(t))
    return "product_reco";
  return "other";
}

// The five Anthropic tools (spec Section 8) and their executors. Tool input is
// validated loosely and executed server-side. Each executor returns a string for
// the model plus optional structured `ui` data the chat route forwards to the
// client (product cards, connector "connect to enable" cards, escalation state).

import type Anthropic from "@anthropic-ai/sdk";
import { PRODUCTS, ROUTINE_FRAMEWORK, TONIC_TREE, type Product } from "./seed-data";
import { shopify, kustomer } from "./connectors";
import { logEvent, setEscalated, setCsat } from "./logging";
import type { UiArtifact, RoutineStep } from "@/app/types";

export type { UiArtifact, RoutineStep };

export const TOOL_DEFS: Anthropic.Tool[] = [
  {
    name: "recommend_products",
    description:
      "Recommend up to 4 real Pixi products grounded in the catalog. Use for skincare or makeup product questions. Filters on concern, skin type, price ceiling, and category.",
    input_schema: {
      type: "object",
      properties: {
        concern: { type: "string", description: "The shopper's stated concern, e.g. 'dry sensitive skin wants glow'." },
        skin_type: { type: "string", description: "Optional skin type, e.g. dry, oily, sensitive, combination." },
        max_price_usd: { type: "number", description: "Optional price ceiling in USD." },
        category: { type: "string", description: "Optional category filter: tonic, cleanser, serum, moisturizer, mist, eye, spf, makeup, set." },
      },
      required: ["concern"],
    },
  },
  {
    name: "get_routine",
    description:
      "Return the 4-step Pixi routine (Cleanse, Tonic, Serum or Oil, Moisturizer, plus AM SPF) tailored to a concern, naming real products for each step.",
    input_schema: {
      type: "object",
      properties: {
        concern: { type: "string", description: "The shopper's concern or goal." },
        time_of_day: { type: "string", enum: ["AM", "PM"], description: "Optional AM or PM focus." },
      },
      required: ["concern"],
    },
  },
  {
    name: "lookup_order",
    description:
      "Look up a real order status via the Shopify connector. Always call this when the shopper asks about an order, even if the connector may not be configured; it returns an honest not-connected state when credentials are absent.",
    input_schema: {
      type: "object",
      properties: {
        order_id: { type: "string", description: "Order number, e.g. 1234 or #1234." },
        email: { type: "string", description: "Email on the order." },
      },
      required: ["order_id", "email"],
    },
  },
  {
    name: "create_support_ticket",
    description:
      "Hand off to a human by creating a support ticket via the Kustomer connector. Use when the shopper asks for a human or has an issue the assistant cannot resolve.",
    input_schema: {
      type: "object",
      properties: {
        summary: { type: "string", description: "Short summary of the issue." },
        email: { type: "string", description: "Shopper email for follow-up." },
        category: { type: "string", description: "Category, e.g. order, returns, product, other." },
      },
      required: ["summary", "category"],
    },
  },
  {
    name: "submit_csat",
    description: "Record the shopper's satisfaction rating from 1 to 5.",
    input_schema: {
      type: "object",
      properties: {
        score: { type: "number", description: "Rating 1 (low) to 5 (high)." },
      },
      required: ["score"],
    },
  },
];

export interface ToolContext {
  conversationId: string | null;
}

export interface ToolOutcome {
  forModel: string;
  ui?: UiArtifact;
}

// ---- relevance scoring over the in-memory catalog (the same seed the DB holds).

function scoreProduct(p: Product, concern: string, skinType?: string): number {
  const hay = [
    ...p.targets,
    ...p.benefits,
    ...p.keyActives,
    p.collection ?? "",
    p.category,
    p.name,
  ]
    .join(" ")
    .toLowerCase();
  const terms = `${concern} ${skinType ?? ""}`
    .toLowerCase()
    .split(/[^a-z]+/)
    .filter((w) => w.length > 2);
  let score = 0;
  for (const term of terms) {
    if (hay.includes(term)) score += 2;
  }
  return score;
}

function recommendProducts(input: {
  concern: string;
  skin_type?: string;
  max_price_usd?: number;
  category?: string;
}): Product[] {
  let pool = PRODUCTS;
  if (input.category) {
    pool = pool.filter((p) => p.category === input.category);
  }
  if (typeof input.max_price_usd === "number") {
    pool = pool.filter((p) => p.priceUsd <= (input.max_price_usd as number));
  }
  const scored = pool
    .map((p) => ({ p, s: scoreProduct(p, input.concern, input.skin_type) }))
    .sort((a, b) => b.s - a.s);
  const top = scored.filter((x) => x.s > 0).slice(0, 4).map((x) => x.p);
  // If nothing scored, fall back to hero products so we never invent or return nothing.
  if (top.length === 0) {
    return pool.slice(0, Math.min(3, pool.length));
  }
  return top;
}

function pickTonicForConcern(concern: string): Product | null {
  const t = concern.toLowerCase();
  const match = TONIC_TREE.find((e) =>
    e.concern
      .toLowerCase()
      .split(/[^a-z]+/)
      .some((w) => w.length > 3 && t.includes(w))
  );
  const id = match?.productId ?? "glow-tonic";
  // Fall back to the hero Glow Tonic if the mapped tonic is not in the catalog.
  return PRODUCTS.find((p) => p.id === id) ?? PRODUCTS.find((p) => p.id === "glow-tonic") ?? null;
}

function pickByCategory(category: string, concern: string): Product | null {
  const inCat = PRODUCTS.filter((p) => p.category === category);
  if (inCat.length === 0) return null;
  const scored = inCat
    .map((p) => ({ p, s: scoreProduct(p, concern) }))
    .sort((a, b) => b.s - a.s);
  return scored[0].p;
}

function buildRoutine(concern: string, tod?: "AM" | "PM"): RoutineStep[] {
  const tonic = pickTonicForConcern(concern);
  const cleanser = pickByCategory("cleanser", concern);
  const serum =
    tod === "PM"
      ? PRODUCTS.find((p) => p.id === "overnight-retinol-oil") ?? pickByCategory("serum", concern)
      : pickByCategory("serum", concern);
  const moisturizer = pickByCategory("moisturizer", concern);
  return ROUTINE_FRAMEWORK.steps.map((s) => {
    let product: Product | null = null;
    if (s.name === "Cleanse") product = cleanser;
    else if (s.name === "Tonic") product = tonic;
    else if (s.name.startsWith("Serum")) product = serum;
    else if (s.name === "Moisturizer") product = moisturizer;
    return { step: s.step, name: s.name, detail: s.detail, product };
  });
}

export async function executeTool(
  name: string,
  rawInput: unknown,
  ctx: ToolContext
): Promise<ToolOutcome> {
  const input = (rawInput ?? {}) as Record<string, unknown>;

  switch (name) {
    case "recommend_products": {
      const products = recommendProducts({
        concern: String(input.concern ?? ""),
        skin_type: input.skin_type ? String(input.skin_type) : undefined,
        max_price_usd:
          typeof input.max_price_usd === "number" ? input.max_price_usd : undefined,
        category: input.category ? String(input.category) : undefined,
      });
      await logEvent(ctx.conversationId, "product_reco", products.map((p) => p.id));
      const forModel = products
        .map(
          (p) =>
            `${p.name} (${p.priceNote}) for ${p.targets.join(", ")}. Key actives: ${p.keyActives.join(", ")}. ${p.productUrl}`
        )
        .join("\n");
      return { forModel: forModel || "No matching products found.", ui: { kind: "products", products } };
    }

    case "get_routine": {
      const concern = String(input.concern ?? "");
      const tod = input.time_of_day === "PM" ? "PM" : input.time_of_day === "AM" ? "AM" : undefined;
      const steps = buildRoutine(concern, tod);
      await logEvent(
        ctx.conversationId,
        "routine",
        steps.map((s) => s.product?.id).filter((id): id is string => Boolean(id))
      );
      const pairing = ROUTINE_FRAMEWORK.signaturePairings[0];
      const forModel =
        steps
          .map((s) => `Step ${s.step} ${s.name}: ${s.product ? s.product.name : "(your choice)"}. ${s.detail}`)
          .join("\n") + `\n${ROUTINE_FRAMEWORK.amNote}`;
      return {
        forModel,
        ui: { kind: "routine", steps, amNote: ROUTINE_FRAMEWORK.amNote, pairing },
      };
    }

    case "lookup_order": {
      await logEvent(ctx.conversationId, "order_status", []);
      const result = await shopify.lookupOrder(
        String(input.order_id ?? ""),
        String(input.email ?? "")
      );
      if (!result.connected) {
        return {
          forModel: `Order lookup is not connected. ${result.message} Explain this honestly to the shopper and offer a human handoff.`,
          ui: { kind: "connector", provider: "shopify", connected: false, message: result.message, data: result.captured },
        };
      }
      return {
        forModel: `Order ${result.orderId}: payment ${result.status}, fulfillment ${result.fulfillment}.`,
        ui: {
          kind: "connector",
          provider: "shopify",
          connected: true,
          message: `Order ${result.orderId} found.`,
          data: { ...result },
        },
      };
    }

    case "create_support_ticket": {
      await logEvent(ctx.conversationId, "escalate", []);
      await setEscalated(ctx.conversationId);
      const result = await kustomer.createTicket(
        String(input.summary ?? ""),
        String(input.email ?? ""),
        String(input.category ?? "other")
      );
      if (!result.connected) {
        return {
          forModel: `Escalation captured. ${result.message} Tell the shopper a Pixi team member will follow up.`,
          ui: { kind: "escalation", connected: false, message: result.message },
        };
      }
      return {
        forModel: `Support ticket ${result.ticketId} created. Tell the shopper a Pixi team member will follow up.`,
        ui: { kind: "escalation", connected: true, message: `Ticket ${result.ticketId} created.` },
      };
    }

    case "submit_csat": {
      const score = Math.max(1, Math.min(5, Number(input.score ?? 0)));
      await setCsat(ctx.conversationId, score);
      return { forModel: `Recorded a satisfaction rating of ${score} out of 5. Thank the shopper warmly.` };
    }

    default:
      return { forModel: `Unknown tool: ${name}` };
  }
}

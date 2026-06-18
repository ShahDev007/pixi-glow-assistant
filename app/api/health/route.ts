// Liveness + configuration status. Reports which capabilities are wired without
// ever exposing secret values.

import { NextResponse } from "next/server";
import { hasAnthropicKey } from "@/lib/anthropic";
import { hasDb } from "@/lib/db";
import { hasEmbeddings, embeddingsProvider, EMBED_DIM } from "@/lib/embeddings";
import { connectorStatuses } from "@/lib/connectors";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({
    ok: true,
    time: new Date().toISOString(),
    anthropic: hasAnthropicKey(),
    database: hasDb(),
    embeddings: { configured: hasEmbeddings(), provider: embeddingsProvider(), dim: EMBED_DIM },
    connectors: connectorStatuses(),
  });
}

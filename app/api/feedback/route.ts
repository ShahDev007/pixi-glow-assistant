// CSAT feedback endpoint for the rating widget. Writes conversations.csat.

import { NextResponse } from "next/server";
import { setCsat } from "@/lib/logging";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  let body: { conversationId?: string; score?: number };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }
  const score = Math.max(1, Math.min(5, Number(body.score ?? 0)));
  if (!body.conversationId) {
    return NextResponse.json({ error: "conversationId required." }, { status: 400 });
  }
  await setCsat(body.conversationId, score);
  return NextResponse.json({ ok: true, score });
}

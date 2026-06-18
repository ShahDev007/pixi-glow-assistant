// Analytics aggregates (spec Section 9). Every number is computed live with SQL
// over the real logged tables. When the DB is not configured it returns an empty
// shape so the dashboard renders an honest "no data yet" state.

import { NextResponse } from "next/server";
import { hasDb, query } from "@/lib/db";
import { getProduct } from "@/lib/seed-data";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  if (!hasDb()) {
    return NextResponse.json({ configured: false, ...emptyPayload() });
  }

  const [kpis, intents, recommended, overTime, recent, value] = await Promise.all([
    query<{
      total_conversations: string;
      avg_messages: string | null;
      median_latency: string | null;
      escalated: string;
      avg_csat: string | null;
    }>(
      `select
         (select count(*) from conversations) as total_conversations,
         (select avg(c) from (
            select count(*)::numeric as c from messages group by conversation_id
          ) t) as avg_messages,
         (select percentile_cont(0.5) within group (order by latency_ms)
            from messages where role = 'assistant' and latency_ms is not null) as median_latency,
         (select count(*) from conversations where escalated = true) as escalated,
         (select avg(csat) from conversations where csat is not null) as avg_csat`
    ),
    query<{ intent: string; count: string }>(
      `select intent, count(*) as count from events
       where intent is not null group by intent order by count desc`
    ),
    query<{ product_id: string; count: string }>(
      `select unnest(recommended_products) as product_id, count(*) as count
       from events group by product_id order by count desc limit 8`
    ),
    query<{ day: string; count: string }>(
      `select to_char(date_trunc('day', started_at), 'YYYY-MM-DD') as day, count(*) as count
       from conversations group by day order by day`
    ),
    query<{
      id: string;
      started_at: string;
      mode_hint: string | null;
      escalated: boolean;
      csat: number | null;
      msg_count: string;
    }>(
      `select c.id, c.started_at, c.mode_hint, c.escalated, c.csat,
              (select count(*) from messages m where m.conversation_id = c.id) as msg_count
       from conversations c order by c.started_at desc limit 12`
    ),
    query<{ total_value: string | null }>(
      `select sum(est_assisted_value) as total_value from events`
    ),
  ]);

  const k = kpis[0] ?? {};
  const totalConversations = Number(k.total_conversations ?? 0);
  const escalatedCount = Number(k.escalated ?? 0);
  const deflectionRate =
    totalConversations > 0 ? (totalConversations - escalatedCount) / totalConversations : 0;

  return NextResponse.json({
    configured: true,
    kpis: {
      totalConversations,
      avgMessages: round(Number(k.avg_messages ?? 0), 1),
      medianLatencyMs: Math.round(Number(k.median_latency ?? 0)),
      deflectionRate: round(deflectionRate, 3),
      avgCsat: k.avg_csat != null ? round(Number(k.avg_csat), 2) : null,
    },
    topIntents: intents.map((r) => ({ intent: r.intent, count: Number(r.count) })),
    topProducts: recommended.map((r) => ({
      productId: r.product_id,
      name: getProduct(r.product_id)?.name ?? r.product_id,
      count: Number(r.count),
    })),
    conversationsOverTime: overTime.map((r) => ({ day: r.day, count: Number(r.count) })),
    recentConversations: recent.map((r) => ({
      id: r.id.slice(0, 8),
      startedAt: r.started_at,
      mode: r.mode_hint,
      escalated: r.escalated,
      csat: r.csat,
      messages: Number(r.msg_count),
    })),
    estAssistedValue: round(Number(value[0]?.total_value ?? 0), 2),
  });
}

function round(n: number, dp: number): number {
  const f = 10 ** dp;
  return Math.round(n * f) / f;
}

function emptyPayload() {
  return {
    kpis: {
      totalConversations: 0,
      avgMessages: 0,
      medianLatencyMs: 0,
      deflectionRate: 0,
      avgCsat: null,
    },
    topIntents: [],
    topProducts: [],
    conversationsOverTime: [],
    recentConversations: [],
    estAssistedValue: 0,
  };
}

"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

interface Analytics {
  configured: boolean;
  kpis: {
    totalConversations: number;
    avgMessages: number;
    medianLatencyMs: number;
    deflectionRate: number;
    avgCsat: number | null;
  };
  topIntents: { intent: string; count: number }[];
  topProducts: { productId: string; name: string; count: number }[];
  conversationsOverTime: { day: string; count: number }[];
  recentConversations: {
    id: string;
    startedAt: string;
    mode: string | null;
    escalated: boolean;
    csat: number | null;
    messages: number;
  }[];
  estAssistedValue: number;
}

interface Connector {
  provider: string;
  label: string;
  connected: boolean;
  purpose: string;
}

const ROSE = "#c76b86";

export default function DashboardPage() {
  const [data, setData] = useState<Analytics | null>(null);
  const [connectors, setConnectors] = useState<Connector[]>([]);
  const [conversion, setConversion] = useState(8); // percent, transparent assumption
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    const [a, c] = await Promise.all([
      fetch("/api/analytics").then((r) => r.json()),
      fetch("/api/connectors").then((r) => r.json()),
    ]);
    setData(a);
    setConnectors(c.connectors ?? []);
    setLoading(false);
  }

  useEffect(() => {
    let active = true;
    (async () => {
      const [a, c] = await Promise.all([
        fetch("/api/analytics").then((r) => r.json()),
        fetch("/api/connectors").then((r) => r.json()),
      ]);
      if (!active) return;
      setData(a);
      setConnectors(c.connectors ?? []);
      setLoading(false);
    })();
    return () => {
      active = false;
    };
  }, []);

  const projectedRevenue = useMemo(() => {
    if (!data) return 0;
    return Math.round(data.estAssistedValue * (conversion / 100) * 100) / 100;
  }, [data, conversion]);

  if (loading) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-10 text-center text-foreground/50">
        Loading live metrics...
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-6">
      <div className="mb-4">
        <h1 className="text-xl font-semibold">AI Analyst Dashboard</h1>
        <p className="mt-1 text-sm text-foreground/60">
          All metrics are computed live from real bot usage in this demo. Revenue
          figures apply a transparent, adjustable conversion assumption, not booked
          revenue.
        </p>
        {!data.configured ? (
          <p className="mt-2 rounded-xl bg-amber-50 px-3 py-2 text-xs text-amber-700">
            Database not connected yet. Metrics will populate live once DATABASE_URL is
            set. The schema and aggregation queries are already wired.
          </p>
        ) : null}
      </div>

      {/* KPI tiles */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
        <Kpi label="Conversations" value={data.kpis.totalConversations} />
        <Kpi label="Msgs / convo" value={data.kpis.avgMessages} />
        <Kpi label="Median latency" value={`${data.kpis.medianLatencyMs} ms`} />
        <Kpi
          label="Deflection"
          value={`${Math.round(data.kpis.deflectionRate * 100)}%`}
        />
        <Kpi
          label="CSAT avg"
          value={data.kpis.avgCsat != null ? `${data.kpis.avgCsat} / 5` : "n/a"}
        />
      </div>

      {/* ROI tile */}
      <div className="mt-3 rounded-2xl border border-rose/30 bg-cream p-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <p className="text-sm font-semibold text-rose-deep">
              Estimated assisted value
            </p>
            <p className="text-xs text-foreground/55">
              Sum of recommended product prices across all sessions.
            </p>
          </div>
          <p className="text-2xl font-bold">${data.estAssistedValue.toFixed(2)}</p>
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <label className="text-xs text-foreground/70">
            Assumed conversion rate: <b>{conversion}%</b>
          </label>
          <input
            type="range"
            min={1}
            max={30}
            value={conversion}
            onChange={(e) => setConversion(Number(e.target.value))}
            className="flex-1 accent-rose-deep"
          />
          <p className="text-sm">
            Projected revenue:{" "}
            <b className="text-rose-deep">${projectedRevenue.toFixed(2)}</b>
          </p>
        </div>
        <p className="mt-1 text-[11px] text-foreground/45">
          This is a transparent assumption for illustration, not booked revenue.
        </p>
      </div>

      {/* Charts */}
      <div className="mt-3 grid gap-3 md:grid-cols-2">
        <ChartCard title="Top intents">
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={data.topIntents}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0dada" />
              <XAxis dataKey="intent" tick={{ fontSize: 10 }} interval={0} angle={-20} textAnchor="end" height={50} />
              <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
              <Tooltip />
              <Bar dataKey="count" fill={ROSE} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Most recommended products">
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={data.topProducts} layout="vertical" margin={{ left: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0dada" />
              <XAxis type="number" allowDecimals={false} tick={{ fontSize: 11 }} />
              <YAxis type="category" dataKey="name" width={120} tick={{ fontSize: 10 }} />
              <Tooltip />
              <Bar dataKey="count" fill={ROSE} radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Conversations over time" wide>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={data.conversationsOverTime}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0dada" />
              <XAxis dataKey="day" tick={{ fontSize: 10 }} />
              <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
              <Tooltip />
              <Line type="monotone" dataKey="count" stroke={ROSE} strokeWidth={2} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Recent conversations */}
      <div className="mt-3 rounded-2xl border border-rose/30 bg-cream p-4">
        <p className="mb-2 text-sm font-semibold text-rose-deep">
          Recent conversations (anonymized)
        </p>
        {data.recentConversations.length === 0 ? (
          <p className="text-sm text-foreground/50">
            No conversations yet. Try the Chat tab, then refresh.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="text-xs text-foreground/50">
                <tr>
                  <th className="py-1 pr-3">Session</th>
                  <th className="py-1 pr-3">Started</th>
                  <th className="py-1 pr-3">Msgs</th>
                  <th className="py-1 pr-3">Escalated</th>
                  <th className="py-1 pr-3">CSAT</th>
                </tr>
              </thead>
              <tbody>
                {data.recentConversations.map((c) => (
                  <tr key={c.id} className="border-t border-rose/15">
                    <td className="py-1.5 pr-3 font-mono text-xs">{c.id}</td>
                    <td className="py-1.5 pr-3 text-xs">
                      {new Date(c.startedAt).toLocaleString()}
                    </td>
                    <td className="py-1.5 pr-3">{c.messages}</td>
                    <td className="py-1.5 pr-3">{c.escalated ? "yes" : "no"}</td>
                    <td className="py-1.5 pr-3">{c.csat ?? "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Connector status */}
      <div className="mt-3 rounded-2xl border border-rose/30 bg-cream p-4">
        <p className="mb-2 text-sm font-semibold text-rose-deep">
          Integration connectors
        </p>
        <div className="grid gap-2 sm:grid-cols-3">
          {connectors.map((c) => (
            <div
              key={c.provider}
              className="rounded-xl border border-rose/20 bg-blush/30 p-3"
            >
              <div className="flex items-center gap-2">
                <span
                  className={`h-2.5 w-2.5 rounded-full ${
                    c.connected ? "bg-green-500" : "bg-amber-500"
                  }`}
                />
                <p className="text-sm font-medium">{c.label}</p>
              </div>
              <p className="mt-1 text-xs text-foreground/60">{c.purpose}</p>
              <p className="mt-1 text-[11px] font-medium text-foreground/50">
                {c.connected ? "Connected" : "Ready to connect"}
              </p>
            </div>
          ))}
        </div>
      </div>

      <button
        onClick={load}
        className="mt-4 rounded-full border border-rose-deep/40 px-4 py-2 text-sm text-rose-deep transition hover:bg-blush"
      >
        Refresh metrics
      </button>
    </div>
  );
}

function Kpi({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-2xl border border-rose/30 bg-cream p-3 text-center">
      <p className="text-lg font-bold text-rose-deep">{value}</p>
      <p className="text-[11px] text-foreground/55">{label}</p>
    </div>
  );
}

function ChartCard({
  title,
  children,
  wide,
}: {
  title: string;
  children: React.ReactNode;
  wide?: boolean;
}) {
  return (
    <div
      className={`rounded-2xl border border-rose/30 bg-cream p-4 ${
        wide ? "md:col-span-2" : ""
      }`}
    >
      <p className="mb-2 text-sm font-semibold text-rose-deep">{title}</p>
      {children}
    </div>
  );
}

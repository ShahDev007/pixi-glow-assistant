"use client";

// Renders the structured artifacts a chat turn produced: product cards, routine
// cards, connector "connect to enable" cards, and escalation confirmations.

import type { UiArtifact, Product, RoutineStep } from "../types";

export function Artifacts({ artifacts }: { artifacts: UiArtifact[] }) {
  if (!artifacts?.length) return null;
  return (
    <div className="mt-3 space-y-3">
      {artifacts.map((a, i) => {
        switch (a.kind) {
          case "products":
            return <ProductGrid key={i} products={a.products} />;
          case "routine":
            return <RoutineCard key={i} steps={a.steps} amNote={a.amNote} pairing={a.pairing} />;
          case "connector":
            return <ConnectorCard key={i} {...a} />;
          case "escalation":
            return <EscalationCard key={i} connected={a.connected} message={a.message} />;
          default:
            return null;
        }
      })}
    </div>
  );
}

function ProductGrid({ products }: { products: Product[] }) {
  return (
    <div className="grid gap-2 sm:grid-cols-2">
      {products.map((p) => (
        <a
          key={p.id}
          href={p.productUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="group rounded-2xl border border-rose/30 bg-cream p-3 transition hover:border-rose-deep hover:shadow-md"
        >
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="font-semibold leading-tight">{p.name}</p>
              <p className="text-xs text-rose-deep/80 capitalize">
                {p.category}
                {p.collection ? ` · ${p.collection}` : ""}
              </p>
            </div>
            <span className="shrink-0 rounded-full bg-blush px-2 py-0.5 text-xs font-medium text-rose-deep">
              {p.priceNote}
            </span>
          </div>
          <p className="mt-1.5 text-sm text-foreground/75">
            For {p.targets.slice(0, 3).join(", ")}.
          </p>
          <p className="mt-1 text-xs text-foreground/55">
            Key actives: {p.keyActives.join(", ")}
          </p>
          <span className="mt-2 inline-block text-sm font-medium text-rose-deep group-hover:underline">
            View product
          </span>
        </a>
      ))}
    </div>
  );
}

function RoutineCard({
  steps,
  amNote,
  pairing,
}: {
  steps: RoutineStep[];
  amNote: string;
  pairing: string;
}) {
  return (
    <div className="rounded-2xl border border-rose/30 bg-cream p-4">
      <p className="mb-2 text-sm font-semibold text-rose-deep">Your Pixi routine</p>
      <ol className="space-y-2">
        {steps.map((s) => (
          <li key={s.step} className="flex gap-3">
            <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-rose-deep text-xs font-bold text-cream">
              {s.step}
            </span>
            <div>
              <p className="text-sm font-medium">
                {s.name}
                {s.product ? `: ${s.product.name}` : ""}
              </p>
              <p className="text-xs text-foreground/60">{s.detail}</p>
            </div>
          </li>
        ))}
      </ol>
      <p className="mt-3 rounded-xl bg-blush/60 px-3 py-2 text-xs text-rose-deep">
        {amNote}
      </p>
      <p className="mt-1 text-xs italic text-foreground/55">{pairing}</p>
    </div>
  );
}

const providerLabel: Record<string, string> = {
  shopify: "Shopify",
  kustomer: "Kustomer",
  netsuite: "NetSuite",
};

function ConnectorCard({
  provider,
  connected,
  message,
  data,
}: {
  provider: string;
  connected: boolean;
  message: string;
  data?: Record<string, unknown>;
}) {
  return (
    <div
      className={`rounded-2xl border p-4 ${
        connected ? "border-green-300 bg-green-50" : "border-amber-300 bg-amber-50"
      }`}
    >
      <div className="flex items-center gap-2">
        <span
          className={`h-2.5 w-2.5 rounded-full ${
            connected ? "bg-green-500" : "bg-amber-500"
          }`}
        />
        <p className="text-sm font-semibold">
          {providerLabel[provider] ?? provider}{" "}
          {connected ? "connected" : "integration ready"}
        </p>
      </div>
      <p className="mt-1.5 text-sm text-foreground/75">{message}</p>
      {connected && data ? (
        <pre className="mt-2 overflow-x-auto rounded-lg bg-white/70 p-2 text-xs">
          {JSON.stringify(data, null, 2)}
        </pre>
      ) : null}
      {!connected ? (
        <p className="mt-2 text-xs font-medium text-amber-700">
          This is a production-ready integration seam. Add the credentials in Vercel and
          live data flows instantly. No mock data is ever shown.
        </p>
      ) : null}
    </div>
  );
}

function EscalationCard({
  connected,
  message,
}: {
  connected: boolean;
  message: string;
}) {
  return (
    <div className="rounded-2xl border border-rose-deep/40 bg-blush/50 p-4">
      <p className="text-sm font-semibold text-rose-deep">
        {connected ? "Handed off to a human" : "Escalation captured"}
      </p>
      <p className="mt-1 text-sm text-foreground/75">{message}</p>
      <p className="mt-1 text-xs text-foreground/55">
        A Pixi team member will follow up.
      </p>
    </div>
  );
}

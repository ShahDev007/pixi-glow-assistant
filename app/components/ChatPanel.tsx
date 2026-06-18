"use client";

import { useEffect, useRef, useState } from "react";
import type { ChatMessage, ChatResponse } from "../types";
import { Artifacts } from "./Artifacts";

const SUGGESTIONS = [
  "I have dry, sensitive skin and want a glow",
  "Build me an evening routine for fine lines",
  "What is your returns policy?",
  "Where is my order #1234?",
];

const GREETING: ChatMessage = {
  role: "assistant",
  content:
    "Hi, I am your Pixi Glow Assistant. I can help you find skin-loving products, build a simple routine, or answer care questions like shipping and returns. What can I help you glow through today?",
};

export function ChatPanel() {
  const [messages, setMessages] = useState<ChatMessage[]>([GREETING]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [escalated, setEscalated] = useState(false);
  const [csat, setCsat] = useState<number | null>(null);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  async function send(text: string) {
    const trimmed = text.trim();
    if (!trimmed || loading) return;
    const next = [...messages, { role: "user" as const, content: trimmed }];
    setMessages(next);
    setInput("");
    setLoading(true);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          conversationId,
          messages: next.map((m) => ({ role: m.role, content: m.content })),
        }),
      });
      const data = (await res.json()) as ChatResponse & { error?: string };
      if (!res.ok || data.error) {
        setMessages((m) => [
          ...m,
          {
            role: "assistant",
            content:
              data.error ??
              "I hit a snag reaching the assistant. Please try again in a moment.",
          },
        ]);
        return;
      }
      if (data.conversationId) setConversationId(data.conversationId);
      if (data.escalated) setEscalated(true);
      setMessages((m) => [
        ...m,
        { role: "assistant", content: data.reply, artifacts: data.artifacts },
      ]);
    } catch {
      setMessages((m) => [
        ...m,
        { role: "assistant", content: "Network hiccup. Please try again." },
      ]);
    } finally {
      setLoading(false);
    }
  }

  async function talkToHuman() {
    await send(
      "I would like to talk to a human please. Create a support ticket for me."
    );
  }

  async function rate(score: number) {
    setCsat(score);
    if (!conversationId) return;
    await fetch("/api/feedback", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ conversationId, score }),
    });
  }

  const showCsat = messages.length > 2;

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col px-3 pb-3">
      <div className="pixi-scroll flex-1 space-y-4 overflow-y-auto py-4">
        {messages.map((m, i) => (
          <div
            key={i}
            className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div className={m.role === "user" ? "max-w-[85%]" : "max-w-[92%] w-full"}>
              <div
                className={`rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                  m.role === "user"
                    ? "bg-rose-deep text-cream"
                    : "border border-rose/25 bg-cream text-foreground"
                }`}
              >
                {m.content.split("\n").map((line, j) => (
                  <p key={j} className={j > 0 ? "mt-2" : ""}>
                    {line}
                  </p>
                ))}
              </div>
              {m.artifacts ? <Artifacts artifacts={m.artifacts} /> : null}
            </div>
          </div>
        ))}

        {loading ? (
          <div className="flex justify-start">
            <div className="rounded-2xl border border-rose/25 bg-cream px-4 py-3 text-sm text-foreground/50">
              <span className="inline-flex gap-1">
                <Dot /> <Dot /> <Dot />
              </span>
            </div>
          </div>
        ) : null}

        <div ref={endRef} />
      </div>

      {messages.length <= 1 ? (
        <div className="mb-3 flex flex-wrap gap-2">
          {SUGGESTIONS.map((s) => (
            <button
              key={s}
              onClick={() => send(s)}
              className="rounded-full border border-rose/40 bg-cream px-3 py-1.5 text-xs text-rose-deep transition hover:bg-blush"
            >
              {s}
            </button>
          ))}
        </div>
      ) : null}

      {showCsat ? (
        <div className="mb-2 flex items-center justify-center gap-2 text-xs text-foreground/60">
          <span>{csat ? "Thanks for the feedback!" : "How is this going?"}</span>
          {!csat ? (
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  onClick={() => rate(n)}
                  className="text-base transition hover:scale-110"
                  aria-label={`Rate ${n} of 5`}
                >
                  ☆
                </button>
              ))}
            </div>
          ) : (
            <span>{"★".repeat(csat)}</span>
          )}
        </div>
      ) : null}

      <form
        onSubmit={(e) => {
          e.preventDefault();
          send(input);
        }}
        className="flex items-center gap-2"
      >
        <button
          type="button"
          onClick={talkToHuman}
          disabled={loading}
          className="shrink-0 rounded-full border border-rose-deep/40 px-3 py-2 text-xs font-medium text-rose-deep transition hover:bg-blush disabled:opacity-50"
        >
          {escalated ? "Human notified" : "Talk to a human"}
        </button>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask about products, routines, shipping, returns..."
          className="flex-1 rounded-full border border-rose/40 bg-cream px-4 py-2.5 text-sm outline-none focus:border-rose-deep"
        />
        <button
          type="submit"
          disabled={loading || !input.trim()}
          className="shrink-0 rounded-full bg-rose-deep px-5 py-2.5 text-sm font-semibold text-cream glow transition disabled:opacity-50"
        >
          Send
        </button>
      </form>

      <p className="mt-2 text-center text-[11px] text-foreground/45">
        Powered by Claude (claude-sonnet-4-6). Grounded in real Pixi data. Prices are
        approximate, check the product page for current pricing.
      </p>
    </div>
  );
}

function Dot() {
  return (
    <span className="inline-block h-1.5 w-1.5 animate-bounce rounded-full bg-rose-deep/50" />
  );
}

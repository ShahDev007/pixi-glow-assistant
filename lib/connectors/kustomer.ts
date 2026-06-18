// Kustomer connector. Real conversation/ticket creation for human handoff. When
// credentials are absent it returns an honest not-connected result that still
// captures the escalation details so nothing is lost. No mocking.

import type { CreateTicketResult, NotConnected } from "./types";

export function isConnected(): boolean {
  return Boolean(process.env.KUSTOMER_API_KEY);
}

const notConnected: NotConnected = {
  connected: false,
  provider: "kustomer",
  message:
    "Escalation captured and ready to route to Kustomer. Add KUSTOMER_API_KEY to open real tickets automatically.",
};

export async function createTicket(
  summary: string,
  email: string,
  category: string
): Promise<CreateTicketResult> {
  const captured = { summary, email, category };

  if (!isConnected()) {
    return { ...notConnected, captured };
  }

  const res = await fetch("https://api.kustomerapp.com/v1/conversations", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.KUSTOMER_API_KEY}`,
    },
    body: JSON.stringify({
      name: `Pixi Glow Assistant: ${category}`,
      custom: { summaryStr: summary, emailStr: email },
    }),
  });

  if (!res.ok) {
    return {
      ...notConnected,
      message: `Kustomer responded ${res.status}. Escalation captured and a team member will follow up.`,
      captured,
    };
  }

  const json = (await res.json()) as { data: { id: string } };
  return {
    connected: true,
    provider: "kustomer",
    ticketId: json.data.id,
    status: "open",
  };
}

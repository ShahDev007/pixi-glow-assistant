// Shopify connector. Real Admin API call for order lookup. When credentials are
// absent it returns an honest not-connected result. No mocking.

import type { LookupOrderResult, NotConnected } from "./types";

const API_VERSION = "2024-10";

export function isConnected(): boolean {
  return Boolean(
    process.env.SHOPIFY_STORE_DOMAIN && process.env.SHOPIFY_ADMIN_TOKEN
  );
}

const notConnected: NotConnected = {
  connected: false,
  provider: "shopify",
  message:
    "Live order lookups are ready to go live the moment Pixi connects its Shopify store. Add SHOPIFY_STORE_DOMAIN and SHOPIFY_ADMIN_TOKEN to enable real-time order status.",
};

export async function lookupOrder(
  orderId: string,
  email: string
): Promise<LookupOrderResult> {
  if (!isConnected()) {
    return { ...notConnected, captured: { orderId, email } };
  }

  const domain = process.env.SHOPIFY_STORE_DOMAIN;
  const token = process.env.SHOPIFY_ADMIN_TOKEN as string;
  const name = encodeURIComponent(orderId.replace(/^#/, ""));

  const res = await fetch(
    `https://${domain}/admin/api/${API_VERSION}/orders.json?name=${name}&status=any`,
    { headers: { "X-Shopify-Access-Token": token } }
  );

  if (!res.ok) {
    return {
      ...notConnected,
      message: `Shopify responded ${res.status}. Please verify the order number and try again.`,
      captured: { orderId, email },
    };
  }

  const json = (await res.json()) as {
    orders: {
      name: string;
      financial_status: string;
      fulfillment_status: string | null;
      order_status_url?: string;
      email?: string;
    }[];
  };

  const order = json.orders.find(
    (o) => !email || (o.email ?? "").toLowerCase() === email.toLowerCase()
  );

  if (!order) {
    return {
      ...notConnected,
      message:
        "We could not find an order matching that number and email. Please double-check both.",
      captured: { orderId, email },
    };
  }

  return {
    connected: true,
    provider: "shopify",
    orderId: order.name,
    status: order.financial_status,
    fulfillment: order.fulfillment_status ?? "unfulfilled",
    trackingUrl: order.order_status_url,
  };
}

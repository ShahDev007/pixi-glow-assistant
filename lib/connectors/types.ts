// Shared connector types. The connector layer is never faked: when credentials
// are absent it returns an honest not-connected result that the UI renders as a
// production-ready "Connect to enable" card.

export type Provider = "shopify" | "kustomer" | "netsuite";

export interface NotConnected {
  connected: false;
  provider: Provider;
  message: string;
  captured?: Record<string, unknown>;
}

export interface OrderResult {
  connected: true;
  provider: "shopify";
  orderId: string;
  status: string;
  fulfillment: string;
  trackingUrl?: string;
}

export interface TicketResult {
  connected: true;
  provider: "kustomer";
  ticketId: string;
  status: string;
}

export type LookupOrderResult = OrderResult | NotConnected;
export type CreateTicketResult = TicketResult | NotConnected;

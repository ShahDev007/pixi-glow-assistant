// Connector status aggregation for the integration panel and /api/connectors.

import * as shopify from "./shopify";
import * as kustomer from "./kustomer";
import * as netsuite from "./netsuite";
import type { Provider } from "./types";

export { shopify, kustomer, netsuite };

export interface ConnectorStatus {
  provider: Provider;
  label: string;
  connected: boolean;
  purpose: string;
}

export function connectorStatuses(): ConnectorStatus[] {
  return [
    {
      provider: "shopify",
      label: "Shopify",
      connected: shopify.isConnected(),
      purpose: "Live order status and storefront catalog.",
    },
    {
      provider: "kustomer",
      label: "Kustomer",
      connected: kustomer.isConnected(),
      purpose: "Human handoff and support tickets.",
    },
    {
      provider: "netsuite",
      label: "NetSuite",
      connected: netsuite.isConnected(),
      purpose: "Inventory and order-management operations.",
    },
  ];
}

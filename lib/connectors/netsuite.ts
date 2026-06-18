// NetSuite connector. Reserved for operations and fulfillment data (inventory,
// order management). Exposes connection status for the integration panel. When
// credentials are absent it reports not-connected honestly. No mocking.

import type { NotConnected } from "./types";

export function isConnected(): boolean {
  return Boolean(
    process.env.NETSUITE_ACCOUNT_ID &&
      process.env.NETSUITE_CONSUMER_KEY &&
      process.env.NETSUITE_TOKEN_ID
  );
}

export const notConnected: NotConnected = {
  connected: false,
  provider: "netsuite",
  message:
    "NetSuite is ready to connect for inventory and order-management data. Add the NETSUITE_ credentials to enable live operations lookups.",
};

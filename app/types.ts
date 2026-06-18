// Client-safe shared types. These mirror the structured artifacts the chat route
// returns. Kept free of any server-only imports so client components can use them.

import type { Product } from "@/lib/seed-data";
import type { Provider } from "@/lib/connectors/types";

export type { Product, Provider };

export interface RoutineStep {
  step: number;
  name: string;
  detail: string;
  product: Product | null;
}

export type UiArtifact =
  | { kind: "products"; products: Product[] }
  | { kind: "routine"; steps: RoutineStep[]; amNote: string; pairing: string }
  | {
      kind: "connector";
      provider: Provider;
      connected: boolean;
      message: string;
      data?: Record<string, unknown>;
    }
  | { kind: "escalation"; connected: boolean; message: string };

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  artifacts?: UiArtifact[];
}

export interface ChatResponse {
  conversationId: string | null;
  reply: string;
  artifacts: UiArtifact[];
  escalated: boolean;
}

// Provider-swappable embeddings. The active provider is chosen at runtime by
// which key is present: Voyage (1024-dim) is preferred to match the vector(1024)
// schema; OpenAI (1536-dim) is the fallback. EMBED_DIM is the one constant the
// schema and seed must agree on. If you switch to OpenAI, change the vector(N)
// in schema.sql to 1536 and reseed.

type Provider = "voyage" | "openai" | "none";

export function embeddingsProvider(): Provider {
  if (process.env.VOYAGE_API_KEY) return "voyage";
  if (process.env.OPENAI_API_KEY) return "openai";
  return "none";
}

export const VOYAGE_MODEL = "voyage-3.5";
export const OPENAI_MODEL = "text-embedding-3-small";

// Dimension of the active provider. Keep schema.sql vector(N) in sync.
export const EMBED_DIM = embeddingsProvider() === "openai" ? 1536 : 1024;

export function hasEmbeddings(): boolean {
  return embeddingsProvider() !== "none";
}

// Embed one or more texts. Returns one vector per input.
export async function embed(texts: string[]): Promise<number[][]> {
  const provider = embeddingsProvider();
  if (provider === "voyage") return embedVoyage(texts);
  if (provider === "openai") return embedOpenAI(texts);
  throw new Error("No embeddings provider configured (set VOYAGE_API_KEY or OPENAI_API_KEY)");
}

export async function embedOne(text: string): Promise<number[]> {
  const [v] = await embed([text]);
  return v;
}

async function embedVoyage(texts: string[]): Promise<number[][]> {
  const res = await fetch("https://api.voyageai.com/v1/embeddings", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.VOYAGE_API_KEY}`,
    },
    body: JSON.stringify({ input: texts, model: VOYAGE_MODEL }),
  });
  if (!res.ok) {
    throw new Error(`Voyage embeddings failed: ${res.status} ${await res.text()}`);
  }
  const json = (await res.json()) as { data: { embedding: number[] }[] };
  return json.data.map((d) => d.embedding);
}

async function embedOpenAI(texts: string[]): Promise<number[][]> {
  const res = await fetch("https://api.openai.com/v1/embeddings", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
    },
    body: JSON.stringify({ input: texts, model: OPENAI_MODEL }),
  });
  if (!res.ok) {
    throw new Error(`OpenAI embeddings failed: ${res.status} ${await res.text()}`);
  }
  const json = (await res.json()) as { data: { embedding: number[] }[] };
  return json.data.map((d) => d.embedding);
}

// pgvector literal, e.g. '[0.1,0.2,...]'
export function toVectorLiteral(vec: number[]): string {
  return `[${vec.join(",")}]`;
}

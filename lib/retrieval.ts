// Retrieval for grounding. When the DB and embeddings are configured it runs a
// top-k pgvector search over products + documents. When they are not, it falls
// back to stuffing the full seed catalog and policies into context, so M1 works
// before RAG is wired and the live demo never breaks.

import { hasDb, query } from "./db";
import { embedOne, hasEmbeddings, toVectorLiteral } from "./embeddings";
import { PRODUCTS, POLICY_DOCS, type Product } from "./seed-data";

export interface RetrievedContext {
  productsBlock: string;
  policiesBlock: string;
  usedRag: boolean;
}

function formatProduct(p: {
  id: string;
  name: string;
  category: string;
  collection: string | null;
  keyActives: string[] | string;
  targets: string[] | string;
  benefits: string[] | string;
  howToUse: string;
  priceNote: string;
  size: string;
  productUrl: string;
}): string {
  const arr = (v: string[] | string) => (Array.isArray(v) ? v.join(", ") : v);
  return [
    `- id: ${p.id}`,
    `  name: ${p.name}`,
    `  category: ${p.category}${p.collection ? ` | collection: ${p.collection}` : ""}`,
    `  key actives: ${arr(p.keyActives)}`,
    `  targets: ${arr(p.targets)}`,
    `  benefits: ${arr(p.benefits)}`,
    `  how to use: ${p.howToUse}`,
    `  price: ${p.priceNote}`,
    `  size: ${p.size}`,
    `  url: ${p.productUrl}`,
  ].join("\n");
}

function fullCatalogBlock(): string {
  return PRODUCTS.map(formatProduct).join("\n");
}

function fullPoliciesBlock(): string {
  return POLICY_DOCS.map((d) => `- ${d.title}: ${d.content}`).join("\n");
}

// Map a DB product row (snake_case arrays) into the formatter shape.
interface ProductRow {
  id: string;
  name: string;
  category: string;
  collection: string | null;
  key_actives: string[];
  targets: string[];
  benefits: string[];
  how_to_use: string;
  price_note: string;
  size: string;
  product_url: string;
}

export async function retrieveContext(userMessage: string): Promise<RetrievedContext> {
  // Fallback path: no DB or no embeddings -> stuff everything (still grounded).
  if (!hasDb() || !hasEmbeddings()) {
    return {
      productsBlock: fullCatalogBlock(),
      policiesBlock: fullPoliciesBlock(),
      usedRag: false,
    };
  }

  try {
    const vec = toVectorLiteral(await embedOne(userMessage));

    const productRows = await query<ProductRow>(
      `select id, name, category, collection, key_actives, targets, benefits,
              how_to_use, price_note, size, product_url
       from products
       order by embedding <=> $1::vector
       limit 6`,
      [vec]
    );

    const docRows = await query<{ title: string; content: string }>(
      `select title, content
       from documents
       order by embedding <=> $1::vector
       limit 4`,
      [vec]
    );

    // If the tables are empty (not seeded yet), fall back to the full catalog.
    if (productRows.length === 0 && docRows.length === 0) {
      return {
        productsBlock: fullCatalogBlock(),
        policiesBlock: fullPoliciesBlock(),
        usedRag: false,
      };
    }

    const productsBlock = productRows
      .map((r) =>
        formatProduct({
          id: r.id,
          name: r.name,
          category: r.category,
          collection: r.collection,
          keyActives: r.key_actives,
          targets: r.targets,
          benefits: r.benefits,
          howToUse: r.how_to_use,
          priceNote: r.price_note,
          size: r.size,
          productUrl: r.product_url,
        })
      )
      .join("\n");

    const policiesBlock = docRows.map((d) => `- ${d.title}: ${d.content}`).join("\n");

    return { productsBlock, policiesBlock, usedRag: true };
  } catch (err) {
    console.error("[retrieval] falling back to full catalog:", err);
    return {
      productsBlock: fullCatalogBlock(),
      policiesBlock: fullPoliciesBlock(),
      usedRag: false,
    };
  }
}

export function productsForDisplay(ids: string[]): Product[] {
  return ids
    .map((id) => PRODUCTS.find((p) => p.id === id))
    .filter((p): p is Product => Boolean(p));
}

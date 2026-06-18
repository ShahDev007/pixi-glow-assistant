// Idempotent seed: applies the schema (with the right vector dimension for the
// active embeddings provider), then upserts products and documents with fresh
// embeddings. Safe to run repeatedly; it never duplicates rows.
//
// Usage: npm run seed   (reads .env.local for DATABASE_URL and the embeddings key)

import { config } from "dotenv";
import { readFileSync } from "node:fs";
import { join } from "node:path";

config({ path: ".env.local" });
config({ path: ".env" });

import { Pool } from "pg";
import { PRODUCTS, POLICY_DOCS } from "../lib/seed-data";
import { embed, EMBED_DIM, embeddingsProvider, toVectorLiteral } from "../lib/embeddings";

async function main() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is not set (add it to .env.local)");
  }

  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  });

  // Embeddings are optional. With a provider we populate the vector columns for
  // true RAG; without one we still load the catalog and policies (with null
  // embeddings) so persistence and the dashboard work, and retrieval uses the
  // full-catalog fallback until a key is added and the seed is re-run.
  const withEmbeddings = embeddingsProvider() !== "none";
  console.log(
    withEmbeddings
      ? `Embeddings provider: ${embeddingsProvider()} (dim ${EMBED_DIM})`
      : "No embeddings provider yet. Loading data with null embeddings (full-catalog fallback active). Re-run after adding VOYAGE_API_KEY for true RAG."
  );

  // Apply schema with the correct vector dimension for this provider.
  const schema = readFileSync(join(process.cwd(), "scripts", "schema.sql"), "utf8").replace(
    /vector\(1024\)/g,
    `vector(${EMBED_DIM})`
  );
  await pool.query(schema);
  console.log("Schema applied.");

  // Products: embed (if a provider exists) and upsert.
  const productText = PRODUCTS.map((p) =>
    [
      p.name,
      p.category,
      p.collection ?? "",
      p.keyActives.join(", "),
      p.targets.join(", "),
      p.benefits.join(", "),
      p.howToUse,
    ].join(". ")
  );
  const productVecs = withEmbeddings ? await embed(productText) : null;
  for (let i = 0; i < PRODUCTS.length; i++) {
    const p = PRODUCTS[i];
    const embeddingParam = productVecs ? toVectorLiteral(productVecs[i]) : null;
    await pool.query(
      `insert into products
         (id, name, category, collection, key_actives, targets, benefits,
          how_to_use, price_usd, price_note, size, product_url, embedding)
       values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13::vector)
       on conflict (id) do update set
         name=excluded.name, category=excluded.category, collection=excluded.collection,
         key_actives=excluded.key_actives, targets=excluded.targets, benefits=excluded.benefits,
         how_to_use=excluded.how_to_use, price_usd=excluded.price_usd, price_note=excluded.price_note,
         size=excluded.size, product_url=excluded.product_url, embedding=excluded.embedding`,
      [
        p.id, p.name, p.category, p.collection, p.keyActives, p.targets, p.benefits,
        p.howToUse, p.priceUsd, p.priceNote, p.size, p.productUrl,
        embeddingParam,
      ]
    );
  }
  console.log(`Upserted ${PRODUCTS.length} products.`);

  // Documents: rebuild cleanly (small, fully derived from seed) to stay idempotent.
  const docText = POLICY_DOCS.map((d) => `${d.title}. ${d.content}`);
  const docVecs = withEmbeddings ? await embed(docText) : null;
  await pool.query("delete from documents");
  for (let i = 0; i < POLICY_DOCS.length; i++) {
    const d = POLICY_DOCS[i];
    await pool.query(
      `insert into documents (doc_type, title, content, embedding)
       values ($1,$2,$3,$4::vector)`,
      [d.docType, d.title, d.content, docVecs ? toVectorLiteral(docVecs[i]) : null]
    );
  }
  console.log(`Inserted ${POLICY_DOCS.length} documents.`);

  await pool.end();
  console.log("Seed complete.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

-- Pixi Glow Assistant schema (spec Section 5).
-- Run against Neon or Supabase Postgres. The vector dimension must match the
-- active embeddings provider: 1024 for Voyage (default), 1536 for OpenAI.
-- If you switch to OpenAI, change vector(1024) to vector(1536) below and reseed.

create extension if not exists vector;

create table if not exists products (
  id            text primary key,
  name          text not null,
  category      text not null,
  collection    text,
  key_actives   text[],
  targets       text[],
  benefits      text[],
  how_to_use    text,
  price_usd     numeric,
  price_note    text,
  size          text,
  product_url   text,
  embedding     vector(1024)
);

create table if not exists documents (
  id          serial primary key,
  doc_type    text not null,
  title       text,
  content     text not null,
  embedding   vector(1024)
);

create table if not exists conversations (
  id          uuid primary key default gen_random_uuid(),
  started_at  timestamptz default now(),
  mode_hint   text,
  escalated   boolean default false,
  resolved    boolean default false,
  csat        int
);

create table if not exists messages (
  id              bigserial primary key,
  conversation_id uuid references conversations(id),
  role            text not null,
  content         text not null,
  created_at      timestamptz default now(),
  latency_ms      int
);

create table if not exists events (
  id                   bigserial primary key,
  conversation_id      uuid references conversations(id),
  intent               text,
  recommended_products text[],
  est_assisted_value   numeric,
  created_at           timestamptz default now()
);

-- Indexes that help the dashboard aggregates and RAG search.
create index if not exists idx_messages_convo on messages(conversation_id);
create index if not exists idx_events_convo on events(conversation_id);
create index if not exists idx_events_intent on events(intent);

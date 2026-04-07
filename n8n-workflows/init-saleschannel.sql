-- =============================================================
-- sellingvideos — Script de inicialização do banco PostgreSQL
-- Banco: sellingvideos_db | Host: saleschannel_postgres | Porta: 5432 | Owner: core
-- =============================================================

-- 1. Criar schema dedicado ao projeto sellingvideos
CREATE SCHEMA IF NOT EXISTS saleschannel AUTHORIZATION core;

-- 2. Criar tabela de pedidos
CREATE TABLE IF NOT EXISTS saleschannel.pedidos (
  order_id          TEXT        PRIMARY KEY,
  nome              TEXT,
  email             TEXT,
  telegram_username TEXT,
  valor             NUMERIC(10,2),
  status_pagamento  TEXT,          -- 'aprovado' | 'recusado' | 'estornado'
  status_pedido     TEXT,          -- 'novo' | 'link_enviado' | 'rejeitado'
  criado_em         TIMESTAMPTZ,
  aprovado_em       TIMESTAMPTZ,
  log_email         TEXT
);

-- 3. Definir owner da tabela
ALTER TABLE saleschannel.pedidos OWNER TO core;

-- 4. Índices úteis para filtros do painel admin
CREATE INDEX IF NOT EXISTS idx_pedidos_status_pedido    ON saleschannel.pedidos (status_pedido);
CREATE INDEX IF NOT EXISTS idx_pedidos_status_pagamento ON saleschannel.pedidos (status_pagamento);
CREATE INDEX IF NOT EXISTS idx_pedidos_criado_em        ON saleschannel.pedidos (criado_em DESC);
CREATE INDEX IF NOT EXISTS idx_pedidos_email            ON saleschannel.pedidos (email);

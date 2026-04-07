-- =============================================================
-- SalesChannel — Script de inicialização do banco PostgreSQL
-- Banco: shopee_db | Host: db | Porta: 5432 | User: shopee_user
-- =============================================================

-- 1. Criar schema dedicado ao projeto SalesChannel
CREATE SCHEMA IF NOT EXISTS saleschannel;

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

-- 3. Índices úteis para filtros do painel admin
CREATE INDEX IF NOT EXISTS idx_pedidos_status_pedido    ON saleschannel.pedidos (status_pedido);
CREATE INDEX IF NOT EXISTS idx_pedidos_status_pagamento ON saleschannel.pedidos (status_pagamento);
CREATE INDEX IF NOT EXISTS idx_pedidos_criado_em        ON saleschannel.pedidos (criado_em DESC);
CREATE INDEX IF NOT EXISTS idx_pedidos_email            ON saleschannel.pedidos (email);

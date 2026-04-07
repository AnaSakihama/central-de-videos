-- =============================================================
-- sellingvideos — Script de inicialização do banco PostgreSQL
-- Banco: sellingvideos_db | Host: saleschannel_postgres | Porta: 5432 | Owner: sellingvideos_user
-- =============================================================

-- 1. Permissões no banco
GRANT ALL PRIVILEGES ON DATABASE sellingvideos_db TO sellingvideos_user;

-- 2. Criar schema dedicado ao projeto sellingvideos
CREATE SCHEMA IF NOT EXISTS core AUTHORIZATION sellingvideos_user;

-- 3. Permissões no schema core
GRANT ALL ON SCHEMA core TO sellingvideos_user;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA core TO sellingvideos_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA core TO sellingvideos_user;

-- 4. Criar tabela de orders
CREATE TABLE IF NOT EXISTS core.orders (
  order_id          TEXT        PRIMARY KEY,
  name              TEXT,
  email             TEXT,
  telegram_username TEXT,
  price             NUMERIC(10,2),
  payment_status    TEXT,          -- 'aprovado' | 'recusado' | 'estornado'
  order_status      TEXT,          -- 'novo' | 'link_enviado' | 'rejeitado'
  created_at        TIMESTAMPTZ,
  approved_at       TIMESTAMPTZ,
  log_email         TEXT
);

-- 5. Definir owner da tabela
ALTER TABLE core.orders OWNER TO sellingvideos_user;

-- 6. Índices úteis para filtros do painel admin
CREATE INDEX IF NOT EXISTS idx_orders_order_status    ON core.orders (order_status);
CREATE INDEX IF NOT EXISTS idx_orders_payment_status  ON core.orders (payment_status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at      ON core.orders (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_email           ON core.orders (email);

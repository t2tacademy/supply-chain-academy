-- Ejecutar esto en Supabase: Dashboard > SQL Editor > New query

CREATE TABLE IF NOT EXISTS orders (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_name  TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  customer_phone TEXT,
  selections     JSONB NOT NULL,
  total_usd      DECIMAL(10, 2) NOT NULL,
  payment_method TEXT NOT NULL,
  status         TEXT NOT NULL DEFAULT 'pending',
  approve_token  UUID NOT NULL DEFAULT gen_random_uuid(),
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  approved_at    TIMESTAMPTZ
);

-- Índices para búsquedas rápidas
CREATE INDEX IF NOT EXISTS orders_approve_token_idx ON orders (approve_token);
CREATE INDEX IF NOT EXISTS orders_created_at_idx    ON orders (created_at DESC);
CREATE INDEX IF NOT EXISTS orders_status_idx        ON orders (status);

-- Deshabilitar Row Level Security para acceso desde service_role
ALTER TABLE orders DISABLE ROW LEVEL SECURITY;

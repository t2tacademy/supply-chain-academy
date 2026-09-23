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

-- Columnas agregadas después de la versión inicial
ALTER TABLE orders ADD COLUMN IF NOT EXISTS comprobante_url         TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS drive_permission_ids    JSONB;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS drive_access_revoked    BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS drive_access_revoked_at TIMESTAMPTZ;

-- RLS activado y SIN políticas: nadie puede leer/escribir con la clave pública (anon).
-- La app usa solo la service_role desde el servidor, que ignora RLS.
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Comprobantes: bucket PRIVADO. La app genera links firmados desde /admin/comprobante/[id].
-- Storage > comprobantes > Edit bucket > destildar "Public bucket"

-- ── Catálogo editable desde /admin/catalogo ──
-- Cada "Publicar" guarda una versión completa; la web usa la última. Permite volver atrás.
CREATE TABLE IF NOT EXISTS catalog_versions (
  id         BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  data       JSONB NOT NULL,
  note       TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Igual que orders: RLS activado sin políticas → solo la service_role (servidor) puede leer/escribir
ALTER TABLE catalog_versions ENABLE ROW LEVEL SECURITY;

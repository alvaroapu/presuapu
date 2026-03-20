-- Lista de compra para productos de stock bajo mínimo
-- Se llena automáticamente desde el bot de Telegram o manualmente

CREATE TABLE IF NOT EXISTS lista_compra (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  stock_producto_id uuid REFERENCES stock_productos(id) ON DELETE CASCADE,
  producto_nombre text NOT NULL,
  cantidad_actual numeric NOT NULL DEFAULT 0,
  cantidad_minima numeric NOT NULL DEFAULT 0,
  unidad text NOT NULL DEFAULT 'unidades',
  ubicacion_nombre text,
  notas text,
  comprado boolean NOT NULL DEFAULT false,
  fecha_compra timestamptz,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE lista_compra ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all for authenticated users" ON lista_compra
  FOR ALL USING (true) WITH CHECK (true);

-- Tabla para config del bot de Telegram
CREATE TABLE IF NOT EXISTS telegram_config (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  chat_id text NOT NULL,
  bot_token text NOT NULL,
  activo boolean NOT NULL DEFAULT true,
  dia_resumen integer NOT NULL DEFAULT 5, -- 0=domingo, 1=lunes... 5=viernes
  hora_resumen integer NOT NULL DEFAULT 9, -- hora del día (0-23)
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE telegram_config ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all for authenticated users" ON telegram_config
  FOR ALL USING (true) WITH CHECK (true);

CREATE INDEX idx_lista_compra_comprado ON lista_compra(comprado);
CREATE INDEX idx_lista_compra_stock_producto ON lista_compra(stock_producto_id);

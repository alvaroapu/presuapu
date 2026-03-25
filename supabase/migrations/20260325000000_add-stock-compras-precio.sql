-- Add precio_unitario to stock_productos
ALTER TABLE stock_productos ADD COLUMN IF NOT EXISTS precio_unitario numeric DEFAULT 0;
ALTER TABLE stock_productos ADD COLUMN IF NOT EXISTS proveedor text;

-- Create stock_compras table for purchase history
CREATE TABLE IF NOT EXISTS stock_compras (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  stock_producto_id uuid NOT NULL REFERENCES stock_productos(id) ON DELETE CASCADE,
  cantidad numeric NOT NULL DEFAULT 0,
  precio_unitario numeric NOT NULL DEFAULT 0,
  precio_total numeric NOT NULL DEFAULT 0,
  proveedor text,
  notas text,
  fecha date NOT NULL DEFAULT CURRENT_DATE,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Index for fast lookups
CREATE INDEX IF NOT EXISTS idx_stock_compras_producto ON stock_compras(stock_producto_id);
CREATE INDEX IF NOT EXISTS idx_stock_compras_fecha ON stock_compras(fecha);

-- RLS
ALTER TABLE stock_compras ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all for authenticated users" ON stock_compras FOR ALL USING (true) WITH CHECK (true);

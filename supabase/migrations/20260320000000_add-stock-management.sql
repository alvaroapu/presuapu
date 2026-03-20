-- Stock management: ubicaciones (machines/sections) and stock products

-- Ubicaciones: can be a machine or a section (apartado)
CREATE TABLE IF NOT EXISTS stock_ubicaciones (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre text NOT NULL,
  tipo text NOT NULL DEFAULT 'apartado' CHECK (tipo IN ('maquina', 'apartado')),
  descripcion text,
  activa boolean DEFAULT true,
  orden integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Stock products: products assigned to ubicaciones with quantities
CREATE TABLE IF NOT EXISTS stock_productos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ubicacion_id uuid NOT NULL REFERENCES stock_ubicaciones(id) ON DELETE CASCADE,
  nombre text NOT NULL,
  codigo text,
  descripcion text,
  cantidad numeric NOT NULL DEFAULT 0,
  unidad text NOT NULL DEFAULT 'unidades',
  cantidad_minima numeric DEFAULT 0,
  notas text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE stock_ubicaciones ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_productos ENABLE ROW LEVEL SECURITY;

-- RLS policies (allow all for authenticated users, same pattern as other tables)
CREATE POLICY "Allow all for authenticated users" ON stock_ubicaciones
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all for authenticated users" ON stock_productos
  FOR ALL USING (true) WITH CHECK (true);

-- Indexes
CREATE INDEX idx_stock_productos_ubicacion_id ON stock_productos(ubicacion_id);

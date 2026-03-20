-- Próximos Proyectos: pre-quote project/lead management

CREATE TABLE IF NOT EXISTS proyectos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  titulo text NOT NULL,
  cliente_id uuid REFERENCES clientes(id) ON DELETE SET NULL,
  cliente_nombre text,
  estado text NOT NULL DEFAULT 'nuevo' CHECK (estado IN ('nuevo', 'recopilando', 'listo', 'presupuestado', 'descartado')),
  prioridad text NOT NULL DEFAULT 'media' CHECK (prioridad IN ('baja', 'media', 'alta', 'urgente')),
  descripcion text,
  medidas text,
  materiales_necesarios text,
  coste_estimado numeric,
  notas text,
  fecha_limite date,
  presupuesto_id uuid REFERENCES presupuestos(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE proyectos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all for authenticated users" ON proyectos
  FOR ALL USING (true) WITH CHECK (true);

CREATE INDEX idx_proyectos_cliente_id ON proyectos(cliente_id);
CREATE INDEX idx_proyectos_estado ON proyectos(estado);

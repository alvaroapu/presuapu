-- =============================================
-- CRM PRESUPUESTOS IMPRENTA - BASE DE DATOS
-- =============================================

-- Extensión para búsqueda por texto
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- =============================================
-- FUNCIÓN HELPER PARA RLS
-- =============================================
CREATE OR REPLACE FUNCTION public.is_authenticated()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN auth.role() = 'authenticated';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- FUNCIÓN: Actualizar updated_at automáticamente
-- =============================================
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =============================================
-- TABLA 1: empresa_config
-- =============================================
CREATE TABLE public.empresa_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre_empresa TEXT NOT NULL,
  cif TEXT,
  direccion TEXT,
  ciudad TEXT,
  codigo_postal TEXT,
  telefono TEXT,
  email TEXT,
  web TEXT,
  logo_url TEXT,
  
  prefijo_presupuesto TEXT DEFAULT 'PRES',
  iva_porcentaje DECIMAL(5,2) DEFAULT 21.00,
  validez_dias INTEGER DEFAULT 30,
  
  condiciones_pago TEXT DEFAULT 'Pago a 30 días desde la fecha de factura.',
  pie_presupuesto TEXT DEFAULT 'Precios sin IVA incluido. Presupuesto válido durante 30 días.',
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE UNIQUE INDEX empresa_config_singleton ON public.empresa_config ((true));
COMMENT ON TABLE public.empresa_config IS 'Configuración única de la empresa para presupuestos y PDFs';

ALTER TABLE public.empresa_config ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can manage empresa_config" ON public.empresa_config
  FOR ALL USING (public.is_authenticated()) WITH CHECK (public.is_authenticated());

CREATE TRIGGER update_empresa_config_updated_at
  BEFORE UPDATE ON public.empresa_config
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =============================================
-- TABLA 2: categorias
-- =============================================
CREATE TABLE public.categorias (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre TEXT NOT NULL,
  descripcion TEXT,
  orden INTEGER DEFAULT 0,
  activa BOOLEAN DEFAULT true,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT categorias_nombre_unique UNIQUE (nombre)
);

COMMENT ON TABLE public.categorias IS 'Categorías para agrupar productos (Vinilos, Lonas, etc.)';

CREATE INDEX idx_categorias_orden ON public.categorias (orden);
CREATE INDEX idx_categorias_activa ON public.categorias (activa) WHERE activa = true;

ALTER TABLE public.categorias ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can manage categorias" ON public.categorias
  FOR ALL USING (public.is_authenticated()) WITH CHECK (public.is_authenticated());

CREATE TRIGGER update_categorias_updated_at
  BEFORE UPDATE ON public.categorias
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =============================================
-- TABLA 3: productos
-- =============================================
CREATE TABLE public.productos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  categoria_id UUID NOT NULL REFERENCES public.categorias(id) ON DELETE RESTRICT,
  
  nombre TEXT NOT NULL,
  codigo TEXT,
  descripcion TEXT,
  
  tipo_calculo TEXT NOT NULL DEFAULT 'por_metro',
  
  precio_material DECIMAL(10,2) DEFAULT 0,
  precio_preparacion DECIMAL(10,2) DEFAULT 0,
  precio_montaje DECIMAL(10,2) DEFAULT 0,
  
  precio_base_fijo DECIMAL(10,2) DEFAULT 0,
  precio_metro_tarifa_1 DECIMAL(10,2) DEFAULT 0,
  metros_limite_tarifa_1 INTEGER DEFAULT 10,
  precio_metro_tarifa_2 DECIMAL(10,2) DEFAULT 0,
  
  precio_por_unidad DECIMAL(10,2),
  precio_por_hora DECIMAL(10,2),
  precio_placa_a3 DECIMAL(10,2),
  precio_placa_a4 DECIMAL(10,2),
  
  activo BOOLEAN DEFAULT true,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT productos_tipo_calculo_check CHECK (
    tipo_calculo IN ('por_metro', 'por_unidad', 'por_hora', 'por_placa')
  ),
  CONSTRAINT productos_precios_positivos CHECK (
    precio_material >= 0 AND
    precio_preparacion >= 0 AND
    precio_montaje >= 0 AND
    precio_base_fijo >= 0 AND
    precio_metro_tarifa_1 >= 0 AND
    precio_metro_tarifa_2 >= 0
  )
);

COMMENT ON TABLE public.productos IS 'Catálogo de productos con precios escalonados';

CREATE INDEX idx_productos_categoria ON public.productos (categoria_id);
CREATE INDEX idx_productos_activo ON public.productos (activo) WHERE activo = true;
CREATE INDEX idx_productos_tipo_calculo ON public.productos (tipo_calculo);
CREATE INDEX idx_productos_nombre ON public.productos USING gin (nombre gin_trgm_ops);

ALTER TABLE public.productos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can manage productos" ON public.productos
  FOR ALL USING (public.is_authenticated()) WITH CHECK (public.is_authenticated());

CREATE TRIGGER update_productos_updated_at
  BEFORE UPDATE ON public.productos
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =============================================
-- TABLA 4: clientes
-- =============================================
CREATE TABLE public.clientes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  nombre TEXT NOT NULL,
  nombre_comercial TEXT,
  
  tipo_documento TEXT DEFAULT 'NIF',
  numero_documento TEXT,
  
  email TEXT,
  telefono TEXT,
  telefono_secundario TEXT,
  
  direccion TEXT,
  ciudad TEXT,
  provincia TEXT,
  codigo_postal TEXT,
  pais TEXT DEFAULT 'España',
  
  persona_contacto TEXT,
  notas TEXT,
  
  activo BOOLEAN DEFAULT true,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE public.clientes IS 'Base de datos de clientes para presupuestos';

CREATE INDEX idx_clientes_nombre ON public.clientes USING gin (nombre gin_trgm_ops);
CREATE INDEX idx_clientes_email ON public.clientes (email);
CREATE INDEX idx_clientes_documento ON public.clientes (numero_documento);
CREATE INDEX idx_clientes_activo ON public.clientes (activo) WHERE activo = true;

ALTER TABLE public.clientes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can manage clientes" ON public.clientes
  FOR ALL USING (public.is_authenticated()) WITH CHECK (public.is_authenticated());

CREATE TRIGGER update_clientes_updated_at
  BEFORE UPDATE ON public.clientes
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =============================================
-- TABLA 5: presupuestos
-- =============================================
CREATE TABLE public.presupuestos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  numero TEXT NOT NULL,
  
  cliente_id UUID REFERENCES public.clientes(id) ON DELETE SET NULL,
  
  cliente_nombre TEXT NOT NULL,
  cliente_nombre_comercial TEXT,
  cliente_documento TEXT,
  cliente_email TEXT,
  cliente_telefono TEXT,
  cliente_direccion TEXT,
  cliente_ciudad TEXT,
  cliente_codigo_postal TEXT,
  
  fecha_emision DATE NOT NULL DEFAULT CURRENT_DATE,
  fecha_validez DATE,
  
  subtotal DECIMAL(12,2) DEFAULT 0,
  descuento_tipo TEXT DEFAULT 'porcentaje',
  descuento_valor DECIMAL(10,2) DEFAULT 0,
  descuento_importe DECIMAL(12,2) DEFAULT 0,
  base_imponible DECIMAL(12,2) DEFAULT 0,
  iva_porcentaje DECIMAL(5,2) DEFAULT 21.00,
  iva_importe DECIMAL(12,2) DEFAULT 0,
  total DECIMAL(12,2) DEFAULT 0,
  
  estado TEXT DEFAULT 'borrador',
  
  fecha_envio TIMESTAMPTZ,
  fecha_respuesta TIMESTAMPTZ,
  
  notas TEXT,
  notas_internas TEXT,
  referencia_cliente TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT presupuestos_numero_unique UNIQUE (numero),
  CONSTRAINT presupuestos_estado_check CHECK (
    estado IN ('borrador', 'enviado', 'aceptado', 'rechazado', 'facturado', 'cancelado')
  ),
  CONSTRAINT presupuestos_descuento_tipo_check CHECK (
    descuento_tipo IN ('porcentaje', 'importe')
  )
);

COMMENT ON TABLE public.presupuestos IS 'Cabecera de presupuestos con datos del cliente y totales';

CREATE INDEX idx_presupuestos_cliente ON public.presupuestos (cliente_id);
CREATE INDEX idx_presupuestos_estado ON public.presupuestos (estado);
CREATE INDEX idx_presupuestos_fecha ON public.presupuestos (fecha_emision DESC);
CREATE INDEX idx_presupuestos_numero ON public.presupuestos (numero);
CREATE INDEX idx_presupuestos_created ON public.presupuestos (created_at DESC);

ALTER TABLE public.presupuestos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can manage presupuestos" ON public.presupuestos
  FOR ALL USING (public.is_authenticated()) WITH CHECK (public.is_authenticated());

CREATE TRIGGER update_presupuestos_updated_at
  BEFORE UPDATE ON public.presupuestos
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =============================================
-- TABLA 6: presupuesto_lineas
-- =============================================
CREATE TABLE public.presupuesto_lineas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  presupuesto_id UUID NOT NULL REFERENCES public.presupuestos(id) ON DELETE CASCADE,
  producto_id UUID REFERENCES public.productos(id) ON DELETE SET NULL,
  
  producto_nombre TEXT NOT NULL,
  producto_categoria TEXT,
  
  cantidad DECIMAL(10,2) NOT NULL,
  tipo_cantidad TEXT NOT NULL DEFAULT 'metros',
  
  descripcion TEXT,
  
  precio_unitario DECIMAL(10,2) NOT NULL,
  importe DECIMAL(12,2) NOT NULL,
  
  orden INTEGER DEFAULT 0,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT lineas_tipo_cantidad_check CHECK (
    tipo_cantidad IN ('metros', 'unidades', 'horas', 'placas_a3', 'placas_a4')
  ),
  CONSTRAINT lineas_cantidad_positiva CHECK (cantidad > 0),
  CONSTRAINT lineas_importe_positivo CHECK (importe >= 0)
);

COMMENT ON TABLE public.presupuesto_lineas IS 'Líneas de detalle de cada presupuesto';

CREATE INDEX idx_lineas_presupuesto ON public.presupuesto_lineas (presupuesto_id);
CREATE INDEX idx_lineas_producto ON public.presupuesto_lineas (producto_id);
CREATE INDEX idx_lineas_orden ON public.presupuesto_lineas (presupuesto_id, orden);

ALTER TABLE public.presupuesto_lineas ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can manage presupuesto_lineas" ON public.presupuesto_lineas
  FOR ALL USING (public.is_authenticated()) WITH CHECK (public.is_authenticated());

-- =============================================
-- FUNCIÓN: Generar número de presupuesto
-- =============================================
CREATE OR REPLACE FUNCTION public.generar_numero_presupuesto()
RETURNS TEXT AS $$
DECLARE
  v_prefijo TEXT;
  v_año TEXT;
  v_siguiente INTEGER;
  v_numero TEXT;
BEGIN
  SELECT COALESCE(prefijo_presupuesto, 'PRES') INTO v_prefijo
  FROM public.empresa_config LIMIT 1;
  
  IF v_prefijo IS NULL THEN
    v_prefijo := 'PRES';
  END IF;
  
  v_año := EXTRACT(YEAR FROM CURRENT_DATE)::TEXT;
  
  SELECT COUNT(*) + 1 INTO v_siguiente
  FROM public.presupuestos
  WHERE numero LIKE v_prefijo || '-' || v_año || '-%';
  
  v_numero := v_prefijo || '-' || v_año || '-' || LPAD(v_siguiente::TEXT, 4, '0');
  
  RETURN v_numero;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- FUNCIÓN: Calcular precio de producto
-- =============================================
CREATE OR REPLACE FUNCTION public.calcular_precio_producto(
  p_producto_id UUID,
  p_cantidad DECIMAL,
  p_tipo_cantidad TEXT DEFAULT 'metros'
)
RETURNS TABLE (
  precio_unitario DECIMAL(10,2),
  importe_total DECIMAL(12,2),
  desglose JSONB
) AS $$
DECLARE
  v_producto public.productos%ROWTYPE;
  v_precio_unitario DECIMAL(10,2);
  v_importe DECIMAL(12,2);
  v_desglose JSONB;
  v_metros_tarifa_1 DECIMAL;
  v_metros_tarifa_2 DECIMAL;
  v_importe_tarifa_1 DECIMAL;
  v_importe_tarifa_2 DECIMAL;
BEGIN
  SELECT * INTO v_producto FROM public.productos WHERE id = p_producto_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Producto no encontrado';
  END IF;
  
  CASE v_producto.tipo_calculo
    WHEN 'por_metro' THEN
      IF p_cantidad <= v_producto.metros_limite_tarifa_1 THEN
        v_importe := v_producto.precio_base_fijo + (p_cantidad * v_producto.precio_metro_tarifa_1);
        v_precio_unitario := v_importe / NULLIF(p_cantidad, 0);
        v_desglose := jsonb_build_object(
          'precio_fijo', v_producto.precio_base_fijo,
          'metros_tarifa_1', p_cantidad,
          'precio_metro_tarifa_1', v_producto.precio_metro_tarifa_1,
          'importe_tarifa_1', p_cantidad * v_producto.precio_metro_tarifa_1
        );
      ELSE
        v_metros_tarifa_1 := v_producto.metros_limite_tarifa_1;
        v_metros_tarifa_2 := p_cantidad - v_metros_tarifa_1;
        v_importe_tarifa_1 := v_metros_tarifa_1 * v_producto.precio_metro_tarifa_1;
        v_importe_tarifa_2 := v_metros_tarifa_2 * v_producto.precio_metro_tarifa_2;
        v_importe := v_producto.precio_base_fijo + v_importe_tarifa_1 + v_importe_tarifa_2;
        v_precio_unitario := v_importe / p_cantidad;
        v_desglose := jsonb_build_object(
          'precio_fijo', v_producto.precio_base_fijo,
          'metros_tarifa_1', v_metros_tarifa_1,
          'precio_metro_tarifa_1', v_producto.precio_metro_tarifa_1,
          'importe_tarifa_1', v_importe_tarifa_1,
          'metros_tarifa_2', v_metros_tarifa_2,
          'precio_metro_tarifa_2', v_producto.precio_metro_tarifa_2,
          'importe_tarifa_2', v_importe_tarifa_2
        );
      END IF;
      
    WHEN 'por_unidad' THEN
      v_precio_unitario := v_producto.precio_por_unidad;
      v_importe := p_cantidad * COALESCE(v_precio_unitario, 0);
      v_desglose := jsonb_build_object(
        'precio_unidad', v_precio_unitario,
        'unidades', p_cantidad
      );
      
    WHEN 'por_hora' THEN
      v_precio_unitario := v_producto.precio_por_hora;
      v_importe := p_cantidad * COALESCE(v_precio_unitario, 0);
      v_desglose := jsonb_build_object(
        'precio_hora', v_precio_unitario,
        'horas', p_cantidad
      );
      
    WHEN 'por_placa' THEN
      IF p_tipo_cantidad = 'placas_a3' THEN
        v_precio_unitario := v_producto.precio_placa_a3;
      ELSE
        v_precio_unitario := v_producto.precio_placa_a4;
      END IF;
      v_importe := p_cantidad * COALESCE(v_precio_unitario, 0);
      v_desglose := jsonb_build_object(
        'tipo_placa', p_tipo_cantidad,
        'precio_placa', v_precio_unitario,
        'cantidad', p_cantidad
      );
      
    ELSE
      RAISE EXCEPTION 'Tipo de cálculo no soportado: %', v_producto.tipo_calculo;
  END CASE;
  
  RETURN QUERY SELECT 
    ROUND(COALESCE(v_precio_unitario, 0), 2)::DECIMAL(10,2),
    ROUND(COALESCE(v_importe, 0), 2)::DECIMAL(12,2),
    v_desglose;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- FUNCIÓN: Recalcular totales presupuesto
-- =============================================
CREATE OR REPLACE FUNCTION public.recalcular_totales_presupuesto(p_presupuesto_id UUID)
RETURNS void AS $$
DECLARE
  v_subtotal DECIMAL(12,2);
  v_descuento_importe DECIMAL(12,2);
  v_base_imponible DECIMAL(12,2);
  v_iva_importe DECIMAL(12,2);
  v_total DECIMAL(12,2);
  v_presupuesto public.presupuestos%ROWTYPE;
BEGIN
  SELECT * INTO v_presupuesto FROM public.presupuestos WHERE id = p_presupuesto_id;
  
  SELECT COALESCE(SUM(importe), 0) INTO v_subtotal
  FROM public.presupuesto_lineas
  WHERE presupuesto_id = p_presupuesto_id;
  
  IF v_presupuesto.descuento_tipo = 'porcentaje' THEN
    v_descuento_importe := v_subtotal * (COALESCE(v_presupuesto.descuento_valor, 0) / 100);
  ELSE
    v_descuento_importe := COALESCE(v_presupuesto.descuento_valor, 0);
  END IF;
  
  v_base_imponible := v_subtotal - v_descuento_importe;
  v_iva_importe := v_base_imponible * (COALESCE(v_presupuesto.iva_porcentaje, 21) / 100);
  v_total := v_base_imponible + v_iva_importe;
  
  UPDATE public.presupuestos SET
    subtotal = ROUND(v_subtotal, 2),
    descuento_importe = ROUND(v_descuento_importe, 2),
    base_imponible = ROUND(v_base_imponible, 2),
    iva_importe = ROUND(v_iva_importe, 2),
    total = ROUND(v_total, 2)
  WHERE id = p_presupuesto_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- VISTAS
-- =============================================
CREATE OR REPLACE VIEW public.v_presupuestos_completos AS
SELECT 
  p.*,
  c.email as cliente_email_actual,
  c.telefono as cliente_telefono_actual,
  (SELECT COUNT(*) FROM public.presupuesto_lineas WHERE presupuesto_id = p.id) as num_lineas
FROM public.presupuestos p
LEFT JOIN public.clientes c ON p.cliente_id = c.id
ORDER BY p.created_at DESC;

CREATE OR REPLACE VIEW public.v_productos_con_categoria AS
SELECT 
  p.*,
  c.nombre as categoria_nombre,
  c.orden as categoria_orden
FROM public.productos p
JOIN public.categorias c ON p.categoria_id = c.id
WHERE p.activo = true AND c.activa = true
ORDER BY c.orden, p.nombre;

CREATE OR REPLACE VIEW public.v_resumen_mensual AS
SELECT 
  DATE_TRUNC('month', fecha_emision) as mes,
  COUNT(*) as total_presupuestos,
  COUNT(*) FILTER (WHERE estado = 'aceptado') as aceptados,
  COUNT(*) FILTER (WHERE estado = 'rechazado') as rechazados,
  COUNT(*) FILTER (WHERE estado = 'enviado') as pendientes,
  SUM(total) as importe_total,
  SUM(total) FILTER (WHERE estado = 'aceptado') as importe_aceptado
FROM public.presupuestos
WHERE estado != 'cancelado'
GROUP BY DATE_TRUNC('month', fecha_emision)
ORDER BY mes DESC;

CREATE OR REPLACE VIEW public.v_clientes_con_stats AS
SELECT 
  c.*,
  COUNT(p.id) as total_presupuestos,
  COUNT(p.id) FILTER (WHERE p.estado = 'aceptado') as presupuestos_aceptados,
  SUM(p.total) FILTER (WHERE p.estado = 'aceptado') as facturacion_total,
  MAX(p.fecha_emision) as ultimo_presupuesto
FROM public.clientes c
LEFT JOIN public.presupuestos p ON c.id = p.cliente_id
GROUP BY c.id
ORDER BY c.nombre;

-- =============================================
-- STORAGE BUCKET: empresa-assets
-- =============================================
INSERT INTO storage.buckets (id, name, public) 
VALUES ('empresa-assets', 'empresa-assets', true);

CREATE POLICY "Authenticated can read empresa-assets" ON storage.objects
  FOR SELECT USING (bucket_id = 'empresa-assets' AND public.is_authenticated());

CREATE POLICY "Authenticated can upload empresa-assets" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'empresa-assets' AND public.is_authenticated());

CREATE POLICY "Authenticated can update empresa-assets" ON storage.objects
  FOR UPDATE USING (bucket_id = 'empresa-assets' AND public.is_authenticated());

CREATE POLICY "Authenticated can delete empresa-assets" ON storage.objects
  FOR DELETE USING (bucket_id = 'empresa-assets' AND public.is_authenticated());

-- =============================================
-- DATOS INICIALES (SEED)
-- =============================================

-- Configuración empresa
INSERT INTO public.empresa_config (
  nombre_empresa, cif, direccion, ciudad, codigo_postal, telefono, email,
  prefijo_presupuesto, iva_porcentaje, validez_dias, condiciones_pago, pie_presupuesto
) VALUES (
  'Mi Imprenta S.L.', 'B12345678', 'Calle Principal 123', 'Madrid', '28001', '912345678', 'info@miimprenta.es',
  'PRES', 21.00, 30,
  'Forma de pago: Transferencia bancaria a 30 días.',
  'Precios sin IVA. Presupuesto válido 30 días. No incluye permisos ni licencias municipales.'
);

-- Categorías
INSERT INTO public.categorias (nombre, descripcion, orden) VALUES
  ('Vinilos', 'Vinilos adhesivos para rotulación', 1),
  ('Lonas', 'Lonas publicitarias y banners', 2),
  ('Papel', 'Impresión en papel y polipropileno', 3),
  ('Soportes Rígidos', 'PVC, Composite, Metacrilato', 4),
  ('Servicios', 'Diseño gráfico y otros servicios', 5);

-- Productos VINILOS
INSERT INTO public.productos (categoria_id, nombre, tipo_calculo, precio_material, precio_preparacion, precio_montaje, precio_base_fijo, precio_metro_tarifa_1, metros_limite_tarifa_1, precio_metro_tarifa_2)
SELECT c.id, 'Vinilo Ácido', 'por_metro', 50, 30, 30, 55, 55, 10, 30 FROM public.categorias c WHERE c.nombre = 'Vinilos';

INSERT INTO public.productos (categoria_id, nombre, tipo_calculo, precio_material, precio_preparacion, precio_montaje, precio_base_fijo, precio_metro_tarifa_1, metros_limite_tarifa_1, precio_metro_tarifa_2)
SELECT c.id, 'Vinilo Polimérico', 'por_metro', 50, 30, 30, 50, 50, 10, 35 FROM public.categorias c WHERE c.nombre = 'Vinilos';

INSERT INTO public.productos (categoria_id, nombre, tipo_calculo, precio_material, precio_preparacion, precio_montaje, precio_base_fijo, precio_metro_tarifa_1, metros_limite_tarifa_1, precio_metro_tarifa_2)
SELECT c.id, 'Vinilo de Corte', 'por_metro', 45, 30, 30, 45, 45, 10, 30 FROM public.categorias c WHERE c.nombre = 'Vinilos';

INSERT INTO public.productos (categoria_id, nombre, tipo_calculo, precio_material, precio_preparacion, precio_montaje, precio_base_fijo, precio_metro_tarifa_1, metros_limite_tarifa_1, precio_metro_tarifa_2)
SELECT c.id, 'Vinilo Monomérico', 'por_metro', 45, 25, 30, 45, 45, 10, 30 FROM public.categorias c WHERE c.nombre = 'Vinilos';

INSERT INTO public.productos (categoria_id, nombre, tipo_calculo, precio_material, precio_preparacion, precio_montaje, precio_base_fijo, precio_metro_tarifa_1, metros_limite_tarifa_1, precio_metro_tarifa_2)
SELECT c.id, 'Vinilo Transparente', 'por_metro', 50, 30, 30, 55, 55, 10, 35 FROM public.categorias c WHERE c.nombre = 'Vinilos';

INSERT INTO public.productos (categoria_id, nombre, tipo_calculo, precio_material, precio_preparacion, precio_montaje, precio_base_fijo, precio_metro_tarifa_1, metros_limite_tarifa_1, precio_metro_tarifa_2)
SELECT c.id, 'Vinilo Microperforado', 'por_metro', 50, 30, 30, 55, 55, 10, 30 FROM public.categorias c WHERE c.nombre = 'Vinilos';

-- Productos LONAS
INSERT INTO public.productos (categoria_id, nombre, tipo_calculo, precio_material, precio_preparacion, precio_montaje, precio_base_fijo, precio_metro_tarifa_1, metros_limite_tarifa_1, precio_metro_tarifa_2)
SELECT c.id, 'Lona', 'por_metro', 30, 10, 30, 25, 25, 10, 20 FROM public.categorias c WHERE c.nombre = 'Lonas';

INSERT INTO public.productos (categoria_id, nombre, tipo_calculo, precio_material, precio_preparacion, precio_montaje, precio_base_fijo, precio_metro_tarifa_1, metros_limite_tarifa_1, precio_metro_tarifa_2)
SELECT c.id, 'Lona 2 Caras', 'por_metro', 60, 20, 30, 65, 65, 10, 40 FROM public.categorias c WHERE c.nombre = 'Lonas';

-- Productos PAPEL
INSERT INTO public.productos (categoria_id, nombre, tipo_calculo, precio_material, precio_preparacion, precio_montaje, precio_base_fijo, precio_metro_tarifa_1, metros_limite_tarifa_1, precio_metro_tarifa_2)
SELECT c.id, 'Papel', 'por_metro', 20, 0, 0, 0, 20, 999, 20 FROM public.categorias c WHERE c.nombre = 'Papel';

INSERT INTO public.productos (categoria_id, nombre, tipo_calculo, precio_por_unidad)
SELECT c.id, 'Polipropileno', 'por_unidad', 17 FROM public.categorias c WHERE c.nombre = 'Papel';

-- Productos SOPORTES RÍGIDOS
INSERT INTO public.productos (categoria_id, nombre, tipo_calculo, precio_material, precio_preparacion, precio_montaje, precio_base_fijo, precio_metro_tarifa_1, metros_limite_tarifa_1, precio_metro_tarifa_2)
SELECT c.id, 'PVC 3mm / Cartón Pluma 10mm', 'por_metro', 40, 40, 10, 40, 40, 999, 40 FROM public.categorias c WHERE c.nombre = 'Soportes Rígidos';

INSERT INTO public.productos (categoria_id, nombre, tipo_calculo, precio_material, precio_preparacion, precio_montaje, precio_base_fijo, precio_metro_tarifa_1, metros_limite_tarifa_1, precio_metro_tarifa_2)
SELECT c.id, 'Composite-Dibond 3mm', 'por_metro', 55, 50, 20, 50, 50, 999, 50 FROM public.categorias c WHERE c.nombre = 'Soportes Rígidos';

INSERT INTO public.productos (categoria_id, nombre, tipo_calculo, precio_material, precio_preparacion, precio_montaje, precio_base_fijo, precio_metro_tarifa_1, metros_limite_tarifa_1, precio_metro_tarifa_2, precio_placa_a3, precio_placa_a4)
SELECT c.id, 'Metacrilato 5mm', 'por_metro', 70, 70, 20, 90, 90, 999, 90, 100, 80 FROM public.categorias c WHERE c.nombre = 'Soportes Rígidos';

INSERT INTO public.productos (categoria_id, nombre, tipo_calculo, precio_material, precio_preparacion, precio_montaje, precio_base_fijo, precio_metro_tarifa_1, metros_limite_tarifa_1, precio_metro_tarifa_2, precio_placa_a3, precio_placa_a4)
SELECT c.id, 'Metacrilato 3mm', 'por_metro', 55, 70, 20, 70, 70, 999, 70, 70, 50 FROM public.categorias c WHERE c.nombre = 'Soportes Rígidos';

-- Productos SERVICIOS
INSERT INTO public.productos (categoria_id, nombre, tipo_calculo, precio_por_hora)
SELECT c.id, 'Diseño Gráfico', 'por_hora', 28.57 FROM public.categorias c WHERE c.nombre = 'Servicios';
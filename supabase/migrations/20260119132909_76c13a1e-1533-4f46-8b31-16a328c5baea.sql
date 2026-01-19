-- =============================================
-- CORRECCIÓN DE SEGURIDAD: Views con security_invoker
-- =============================================

-- Recrear vistas con security_invoker=on
DROP VIEW IF EXISTS public.v_presupuestos_completos;
DROP VIEW IF EXISTS public.v_productos_con_categoria;
DROP VIEW IF EXISTS public.v_resumen_mensual;
DROP VIEW IF EXISTS public.v_clientes_con_stats;

CREATE VIEW public.v_presupuestos_completos 
WITH (security_invoker = on) AS
SELECT 
  p.*,
  c.email as cliente_email_actual,
  c.telefono as cliente_telefono_actual,
  (SELECT COUNT(*) FROM public.presupuesto_lineas WHERE presupuesto_id = p.id) as num_lineas
FROM public.presupuestos p
LEFT JOIN public.clientes c ON p.cliente_id = c.id
ORDER BY p.created_at DESC;

CREATE VIEW public.v_productos_con_categoria 
WITH (security_invoker = on) AS
SELECT 
  p.*,
  c.nombre as categoria_nombre,
  c.orden as categoria_orden
FROM public.productos p
JOIN public.categorias c ON p.categoria_id = c.id
WHERE p.activo = true AND c.activa = true
ORDER BY c.orden, p.nombre;

CREATE VIEW public.v_resumen_mensual 
WITH (security_invoker = on) AS
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

CREATE VIEW public.v_clientes_con_stats 
WITH (security_invoker = on) AS
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
-- CORRECCIÓN DE SEGURIDAD: Funciones con search_path
-- =============================================

CREATE OR REPLACE FUNCTION public.is_authenticated()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN auth.role() = 'authenticated';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

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
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

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
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

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
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;
-- Actualizar la función calcular_precio_producto con la fórmula correcta
-- Fórmula: precio_base_fijo es el precio del primer metro
-- Los metros adicionales (2-10) se cobran a precio_metro_tarifa_1
-- Los metros a partir del 11 se cobran a precio_metro_tarifa_2

CREATE OR REPLACE FUNCTION public.calcular_precio_producto(p_producto_id uuid, p_cantidad numeric, p_tipo_cantidad text DEFAULT 'metros'::text)
 RETURNS TABLE(precio_unitario numeric, importe_total numeric, desglose jsonb)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
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
      -- El primer metro ya está incluido en precio_base_fijo
      IF p_cantidad <= 1 THEN
        v_importe := v_producto.precio_base_fijo;
        v_precio_unitario := v_importe;
        v_desglose := jsonb_build_object(
          'precio_base', v_producto.precio_base_fijo,
          'metros_adicionales', 0,
          'importe_adicional', 0
        );
      ELSIF p_cantidad <= v_producto.metros_limite_tarifa_1 THEN
        -- Metros 2 hasta el límite (normalmente 10)
        v_metros_tarifa_1 := p_cantidad - 1;
        v_importe_tarifa_1 := v_metros_tarifa_1 * v_producto.precio_metro_tarifa_1;
        v_importe := v_producto.precio_base_fijo + v_importe_tarifa_1;
        v_precio_unitario := v_importe / p_cantidad;
        v_desglose := jsonb_build_object(
          'precio_base', v_producto.precio_base_fijo,
          'metros_tarifa_1', v_metros_tarifa_1,
          'precio_metro_tarifa_1', v_producto.precio_metro_tarifa_1,
          'importe_tarifa_1', v_importe_tarifa_1
        );
      ELSE
        -- Más allá del límite: tarifa 1 hasta el límite, tarifa 2 el resto
        v_metros_tarifa_1 := v_producto.metros_limite_tarifa_1 - 1; -- metros 2 hasta límite
        v_metros_tarifa_2 := p_cantidad - v_producto.metros_limite_tarifa_1;
        v_importe_tarifa_1 := v_metros_tarifa_1 * v_producto.precio_metro_tarifa_1;
        v_importe_tarifa_2 := v_metros_tarifa_2 * v_producto.precio_metro_tarifa_2;
        v_importe := v_producto.precio_base_fijo + v_importe_tarifa_1 + v_importe_tarifa_2;
        v_precio_unitario := v_importe / p_cantidad;
        v_desglose := jsonb_build_object(
          'precio_base', v_producto.precio_base_fijo,
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
$function$;
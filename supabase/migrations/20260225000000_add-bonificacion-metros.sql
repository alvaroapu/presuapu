-- Añadir columna bonificacion_cada_n_metros a productos
-- Define cada cuántos metros se regala 1 metro gratis automáticamente
-- Ejemplo: 5 significa "por cada 5 metros comprados, 1 metro gratis"
-- 0 = sin bonificación automática
ALTER TABLE public.productos
ADD COLUMN bonificacion_cada_n_metros numeric DEFAULT 0;

-- Actualizar la función de cálculo de precio para incluir bonificación automática por metros
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
  v_tarifa RECORD;
  v_tarifas_count INTEGER;
  v_rangos JSONB := '[]'::jsonb;
  v_cantidad_restante DECIMAL;
  v_cantidad_en_rango DECIMAL;
  v_importe_acumulado DECIMAL := 0;
  v_cantidad_facturable DECIMAL;
  v_metros_gratis DECIMAL;
  v_metros_gratis_auto DECIMAL;
  v_bonificacion_cada_n DECIMAL;
BEGIN
  SELECT * INTO v_producto FROM public.productos WHERE id = p_producto_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Producto no encontrado';
  END IF;

  -- Metros gratis fijos (configurados manualmente en el producto)
  v_metros_gratis := COALESCE(v_producto.metros_gratis, 0);

  -- Bonificación automática: cada N metros → 1 metro gratis
  v_bonificacion_cada_n := COALESCE(v_producto.bonificacion_cada_n_metros, 0);
  v_metros_gratis_auto := 0;
  IF v_bonificacion_cada_n > 0 THEN
    v_metros_gratis_auto := FLOOR(p_cantidad / v_bonificacion_cada_n);
  END IF;

  -- Total metros gratis = fijos + automáticos
  v_metros_gratis := v_metros_gratis + v_metros_gratis_auto;

  -- Calcular cantidad facturable (cantidad - metros gratis totales, mínimo 0)
  v_cantidad_facturable := GREATEST(p_cantidad - v_metros_gratis, 0);

  -- Verificar si el producto tiene tarifas variables
  SELECT COUNT(*) INTO v_tarifas_count
  FROM public.producto_tarifas
  WHERE producto_id = p_producto_id;

  IF v_tarifas_count > 0 THEN
    -- Usar tarifas variables con cantidad facturable
    v_cantidad_restante := v_cantidad_facturable;

    FOR v_tarifa IN
      SELECT * FROM public.producto_tarifas
      WHERE producto_id = p_producto_id
      ORDER BY orden, cantidad_desde
    LOOP
      IF v_cantidad_restante <= 0 THEN
        EXIT;
      END IF;

      -- Calcular cuánta cantidad cae en este rango
      IF v_cantidad_facturable >= v_tarifa.cantidad_desde THEN
        IF v_tarifa.cantidad_hasta IS NULL THEN
          -- Último rango (sin límite superior)
          IF v_cantidad_facturable >= v_tarifa.cantidad_desde THEN
            v_cantidad_en_rango := v_cantidad_facturable - v_tarifa.cantidad_desde + 1;
            IF v_tarifa.orden = 0 OR v_tarifa.cantidad_desde = 1 THEN
              v_cantidad_en_rango := v_cantidad_facturable;
            ELSE
              v_cantidad_en_rango := GREATEST(0, v_cantidad_facturable - v_tarifa.cantidad_desde + 1);
            END IF;
          ELSE
            v_cantidad_en_rango := 0;
          END IF;
        ELSE
          -- Rango con límites
          v_cantidad_en_rango := LEAST(v_cantidad_facturable, v_tarifa.cantidad_hasta) - v_tarifa.cantidad_desde + 1;
          v_cantidad_en_rango := GREATEST(0, v_cantidad_en_rango);
        END IF;

        IF v_cantidad_en_rango > 0 THEN
          v_importe_acumulado := v_importe_acumulado + (v_cantidad_en_rango * v_tarifa.precio_unitario);
          v_rangos := v_rangos || jsonb_build_object(
            'desde', v_tarifa.cantidad_desde,
            'hasta', v_tarifa.cantidad_hasta,
            'cantidad', v_cantidad_en_rango,
            'precio_unitario', v_tarifa.precio_unitario,
            'importe', v_cantidad_en_rango * v_tarifa.precio_unitario
          );
        END IF;
      END IF;
    END LOOP;

    v_importe := v_importe_acumulado;
    v_precio_unitario := v_importe / NULLIF(p_cantidad, 0);
    v_desglose := jsonb_build_object(
      'rangos', v_rangos,
      'tipo', 'tarifas_variables',
      'metros_gratis', v_metros_gratis,
      'metros_gratis_auto', v_metros_gratis_auto,
      'bonificacion_cada_n_metros', v_bonificacion_cada_n,
      'cantidad_facturable', v_cantidad_facturable
    );

  ELSE
    -- Usar lógica original para productos sin tarifas variables
    CASE v_producto.tipo_calculo
      WHEN 'por_metro' THEN
        DECLARE
          v_metros_tarifa_1 DECIMAL;
          v_metros_tarifa_2 DECIMAL;
          v_importe_base DECIMAL;
          v_importe_metro_2 DECIMAL;
          v_importe_tarifa_1 DECIMAL;
          v_importe_tarifa_2 DECIMAL;
        BEGIN
          v_importe_base := v_producto.precio_base_fijo;
          v_importe_metro_2 := 0;
          v_importe_tarifa_1 := 0;
          v_importe_tarifa_2 := 0;

          IF v_cantidad_facturable >= 1 THEN
            IF v_cantidad_facturable >= 2 THEN
              v_importe_metro_2 := COALESCE(v_producto.precio_metro_2, v_producto.precio_metro_tarifa_1);
            END IF;

            IF v_cantidad_facturable > 2 THEN
              v_metros_tarifa_1 := LEAST(v_cantidad_facturable - 2, v_producto.metros_limite_tarifa_1 - 2);
              IF v_metros_tarifa_1 > 0 THEN
                v_importe_tarifa_1 := v_metros_tarifa_1 * v_producto.precio_metro_tarifa_1;
              END IF;
            END IF;

            IF v_cantidad_facturable > v_producto.metros_limite_tarifa_1 THEN
              v_metros_tarifa_2 := v_cantidad_facturable - v_producto.metros_limite_tarifa_1;
              v_importe_tarifa_2 := v_metros_tarifa_2 * v_producto.precio_metro_tarifa_2;
            END IF;
          END IF;

          v_importe := v_importe_base + v_importe_metro_2 + v_importe_tarifa_1 + v_importe_tarifa_2;
          v_precio_unitario := v_importe / NULLIF(p_cantidad, 0);

          v_desglose := jsonb_build_object(
            'precio_base', v_importe_base,
            'precio_metro_2', v_importe_metro_2,
            'metros_tarifa_1', COALESCE(v_metros_tarifa_1, 0),
            'precio_metro_tarifa_1', v_producto.precio_metro_tarifa_1,
            'importe_tarifa_1', v_importe_tarifa_1,
            'metros_tarifa_2', COALESCE(v_metros_tarifa_2, 0),
            'precio_metro_tarifa_2', v_producto.precio_metro_tarifa_2,
            'importe_tarifa_2', v_importe_tarifa_2,
            'metros_gratis', v_metros_gratis,
            'metros_gratis_auto', v_metros_gratis_auto,
            'bonificacion_cada_n_metros', v_bonificacion_cada_n,
            'cantidad_facturable', v_cantidad_facturable
          );
        END;

      WHEN 'por_unidad' THEN
        v_precio_unitario := v_producto.precio_por_unidad;
        v_importe := v_cantidad_facturable * COALESCE(v_precio_unitario, 0);
        v_desglose := jsonb_build_object(
          'precio_unidad', v_precio_unitario,
          'unidades', p_cantidad,
          'metros_gratis', v_metros_gratis,
          'metros_gratis_auto', v_metros_gratis_auto,
          'bonificacion_cada_n_metros', v_bonificacion_cada_n,
          'cantidad_facturable', v_cantidad_facturable
        );

      WHEN 'por_hora' THEN
        v_precio_unitario := v_producto.precio_por_hora;
        v_importe := v_cantidad_facturable * COALESCE(v_precio_unitario, 0);
        v_desglose := jsonb_build_object(
          'precio_hora', v_precio_unitario,
          'horas', p_cantidad,
          'metros_gratis', v_metros_gratis,
          'metros_gratis_auto', v_metros_gratis_auto,
          'bonificacion_cada_n_metros', v_bonificacion_cada_n,
          'cantidad_facturable', v_cantidad_facturable
        );

      WHEN 'por_placa' THEN
        IF p_tipo_cantidad = 'placas_a3' THEN
          v_precio_unitario := v_producto.precio_placa_a3;
        ELSE
          v_precio_unitario := v_producto.precio_placa_a4;
        END IF;
        v_importe := v_cantidad_facturable * COALESCE(v_precio_unitario, 0);
        v_desglose := jsonb_build_object(
          'tipo_placa', p_tipo_cantidad,
          'precio_placa', v_precio_unitario,
          'cantidad', p_cantidad,
          'metros_gratis', v_metros_gratis,
          'metros_gratis_auto', v_metros_gratis_auto,
          'bonificacion_cada_n_metros', v_bonificacion_cada_n,
          'cantidad_facturable', v_cantidad_facturable
        );

      ELSE
        RAISE EXCEPTION 'Tipo de cálculo no soportado: %', v_producto.tipo_calculo;
    END CASE;
  END IF;

  RETURN QUERY SELECT
    ROUND(COALESCE(v_precio_unitario, 0), 2)::DECIMAL(10,2),
    ROUND(COALESCE(v_importe, 0), 2)::DECIMAL(12,2),
    v_desglose;
END;
$function$;

-- Añadir campo para el precio especial del segundo metro
ALTER TABLE public.productos 
ADD COLUMN IF NOT EXISTS precio_metro_2 DECIMAL(10,2) DEFAULT NULL;

-- Actualizar productos con los precios EXACTOS del Excel
-- Fórmula: precio_base_fijo (1er m²) + precio_metro_2 (2º m²) + precio_metro_tarifa_1 (3º-10º) + precio_metro_tarifa_2 (11º+)

-- ÁCIDO: 1m=110, 2m=180 (+70), 3m-10m (+55/m), 11m+ (+30/m)
UPDATE public.productos SET
  precio_base_fijo = 110,
  precio_metro_2 = 70,
  precio_metro_tarifa_1 = 55,
  metros_limite_tarifa_1 = 10,
  precio_metro_tarifa_2 = 30,
  precio_material = 50,
  precio_preparacion = 30,
  precio_montaje = 30
WHERE nombre = 'Vinilo Ácido';

-- POLIMÉRICO: 1m=110, 2m=160 (+50), 3m-10m (+50/m), 11m+ (+35/m)
UPDATE public.productos SET
  precio_base_fijo = 110,
  precio_metro_2 = 50,
  precio_metro_tarifa_1 = 50,
  metros_limite_tarifa_1 = 10,
  precio_metro_tarifa_2 = 35,
  precio_material = 50,
  precio_preparacion = 30,
  precio_montaje = 30
WHERE nombre = 'Vinilo Polimérico';

-- V.CORTE: 1m=105, 2m=150 (+45), 3m-10m (+45/m), 11m+ (+30/m)
UPDATE public.productos SET
  precio_base_fijo = 105,
  precio_metro_2 = 45,
  precio_metro_tarifa_1 = 45,
  metros_limite_tarifa_1 = 10,
  precio_metro_tarifa_2 = 30,
  precio_material = 45,
  precio_preparacion = 30,
  precio_montaje = 30
WHERE nombre = 'Vinilo de Corte';

-- MONOMÉRICO: 1m=100, 2m=145 (+45), 3m-10m (+45/m), 11m+ (+30/m)
UPDATE public.productos SET
  precio_base_fijo = 100,
  precio_metro_2 = 45,
  precio_metro_tarifa_1 = 45,
  metros_limite_tarifa_1 = 10,
  precio_metro_tarifa_2 = 30,
  precio_material = 45,
  precio_preparacion = 25,
  precio_montaje = 30
WHERE nombre = 'Vinilo Monomérico';

-- TRANSPARENTE: 1m=110, 2m=170 (+60), 3m-10m (+55/m), 11m+ (+35/m)
UPDATE public.productos SET
  precio_base_fijo = 110,
  precio_metro_2 = 60,
  precio_metro_tarifa_1 = 55,
  metros_limite_tarifa_1 = 10,
  precio_metro_tarifa_2 = 35,
  precio_material = 50,
  precio_preparacion = 30,
  precio_montaje = 30
WHERE nombre = 'Vinilo Transparente';

-- MICROPERFORADO: 1m=110, 2m=180 (+70), 3m-10m (+55/m), 11m+ (+30/m)
UPDATE public.productos SET
  precio_base_fijo = 110,
  precio_metro_2 = 70,
  precio_metro_tarifa_1 = 55,
  metros_limite_tarifa_1 = 10,
  precio_metro_tarifa_2 = 30,
  precio_material = 50,
  precio_preparacion = 30,
  precio_montaje = 30
WHERE nombre = 'Vinilo Microperforado';

-- LONA: 1m=70, 2m=115 (+45), 3m-10m (+25/m), 11m+ (+20/m)
UPDATE public.productos SET
  precio_base_fijo = 70,
  precio_metro_2 = 45,
  precio_metro_tarifa_1 = 25,
  metros_limite_tarifa_1 = 10,
  precio_metro_tarifa_2 = 20,
  precio_material = 30,
  precio_preparacion = 10,
  precio_montaje = 30
WHERE nombre = 'Lona';

-- LONA 2 CARAS: 1m=110, 2m=185 (+75), 3m-10m (+65/m), 11m+ (+40/m)
UPDATE public.productos SET
  precio_base_fijo = 110,
  precio_metro_2 = 75,
  precio_metro_tarifa_1 = 65,
  metros_limite_tarifa_1 = 10,
  precio_metro_tarifa_2 = 40,
  precio_material = 60,
  precio_preparacion = 20,
  precio_montaje = 30
WHERE nombre = 'Lona Doble Cara';

-- PAPEL: 1m=20, 2m=40 (+20), constante 20€/m
UPDATE public.productos SET
  precio_base_fijo = 20,
  precio_metro_2 = 20,
  precio_metro_tarifa_1 = 20,
  metros_limite_tarifa_1 = 10,
  precio_metro_tarifa_2 = 20,
  precio_material = 20,
  precio_preparacion = 0,
  precio_montaje = 0
WHERE nombre = 'Papel';

-- Actualizar la función de cálculo para usar precio_metro_2
CREATE OR REPLACE FUNCTION public.calcular_precio_producto(
  p_producto_id uuid, 
  p_cantidad numeric, 
  p_tipo_cantidad text DEFAULT 'metros'::text
)
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
  v_importe_base DECIMAL;
  v_importe_metro_2 DECIMAL;
  v_importe_tarifa_1 DECIMAL;
  v_importe_tarifa_2 DECIMAL;
BEGIN
  SELECT * INTO v_producto FROM public.productos WHERE id = p_producto_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Producto no encontrado';
  END IF;
  
  CASE v_producto.tipo_calculo
    WHEN 'por_metro' THEN
      -- Nueva lógica:
      -- 1m = precio_base_fijo
      -- 2m = precio_base_fijo + precio_metro_2
      -- 3m-10m = + precio_metro_tarifa_1 por cada metro adicional
      -- 11m+ = + precio_metro_tarifa_2 por cada metro adicional
      
      v_importe_base := v_producto.precio_base_fijo;
      v_importe_metro_2 := 0;
      v_importe_tarifa_1 := 0;
      v_importe_tarifa_2 := 0;
      
      IF p_cantidad >= 1 THEN
        -- Primer metro incluido en precio base
        IF p_cantidad >= 2 THEN
          -- Segundo metro con precio especial
          v_importe_metro_2 := COALESCE(v_producto.precio_metro_2, v_producto.precio_metro_tarifa_1);
        END IF;
        
        IF p_cantidad > 2 THEN
          -- Metros 3 a 10 (o hasta el límite)
          v_metros_tarifa_1 := LEAST(p_cantidad - 2, v_producto.metros_limite_tarifa_1 - 2);
          IF v_metros_tarifa_1 > 0 THEN
            v_importe_tarifa_1 := v_metros_tarifa_1 * v_producto.precio_metro_tarifa_1;
          END IF;
        END IF;
        
        IF p_cantidad > v_producto.metros_limite_tarifa_1 THEN
          -- Metros después del límite (11+)
          v_metros_tarifa_2 := p_cantidad - v_producto.metros_limite_tarifa_1;
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
        'importe_tarifa_2', v_importe_tarifa_2
      );
      
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
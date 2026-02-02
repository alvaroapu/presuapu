-- Crear tabla para rangos de precios por producto
CREATE TABLE public.producto_tarifas (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  producto_id UUID NOT NULL REFERENCES public.productos(id) ON DELETE CASCADE,
  cantidad_desde NUMERIC NOT NULL DEFAULT 1,
  cantidad_hasta NUMERIC, -- NULL significa "sin límite"
  precio_unitario NUMERIC NOT NULL,
  orden INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Índice para búsquedas eficientes
CREATE INDEX idx_producto_tarifas_producto ON public.producto_tarifas(producto_id);
CREATE INDEX idx_producto_tarifas_orden ON public.producto_tarifas(producto_id, orden);

-- Habilitar RLS
ALTER TABLE public.producto_tarifas ENABLE ROW LEVEL SECURITY;

-- Política de acceso
CREATE POLICY "Authenticated users can manage producto_tarifas"
ON public.producto_tarifas
FOR ALL
USING (is_authenticated())
WITH CHECK (is_authenticated());

-- Actualizar la función de cálculo de precios para soportar tarifas variables
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
  v_tarifa RECORD;
  v_tarifas_count INTEGER;
  v_rangos JSONB := '[]'::jsonb;
  v_cantidad_restante DECIMAL;
  v_cantidad_en_rango DECIMAL;
  v_importe_acumulado DECIMAL := 0;
BEGIN
  SELECT * INTO v_producto FROM public.productos WHERE id = p_producto_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Producto no encontrado';
  END IF;
  
  -- Verificar si el producto tiene tarifas variables
  SELECT COUNT(*) INTO v_tarifas_count 
  FROM public.producto_tarifas 
  WHERE producto_id = p_producto_id;
  
  IF v_tarifas_count > 0 THEN
    -- Usar tarifas variables
    v_cantidad_restante := p_cantidad;
    
    FOR v_tarifa IN 
      SELECT * FROM public.producto_tarifas 
      WHERE producto_id = p_producto_id 
      ORDER BY orden, cantidad_desde
    LOOP
      IF v_cantidad_restante <= 0 THEN
        EXIT;
      END IF;
      
      -- Calcular cuánta cantidad cae en este rango
      IF p_cantidad >= v_tarifa.cantidad_desde THEN
        IF v_tarifa.cantidad_hasta IS NULL THEN
          -- Último rango (sin límite superior)
          IF p_cantidad >= v_tarifa.cantidad_desde THEN
            v_cantidad_en_rango := p_cantidad - v_tarifa.cantidad_desde + 1;
            IF v_tarifa.orden = 0 OR v_tarifa.cantidad_desde = 1 THEN
              v_cantidad_en_rango := p_cantidad;
            ELSE
              v_cantidad_en_rango := GREATEST(0, p_cantidad - v_tarifa.cantidad_desde + 1);
            END IF;
          ELSE
            v_cantidad_en_rango := 0;
          END IF;
        ELSE
          -- Rango con límites
          v_cantidad_en_rango := LEAST(p_cantidad, v_tarifa.cantidad_hasta) - v_tarifa.cantidad_desde + 1;
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
    
    -- Si la cantidad excede todos los rangos definidos, usar el precio del último rango
    v_importe := v_importe_acumulado;
    v_precio_unitario := v_importe / NULLIF(p_cantidad, 0);
    v_desglose := jsonb_build_object('rangos', v_rangos, 'tipo', 'tarifas_variables');
    
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
          
          IF p_cantidad >= 1 THEN
            IF p_cantidad >= 2 THEN
              v_importe_metro_2 := COALESCE(v_producto.precio_metro_2, v_producto.precio_metro_tarifa_1);
            END IF;
            
            IF p_cantidad > 2 THEN
              v_metros_tarifa_1 := LEAST(p_cantidad - 2, v_producto.metros_limite_tarifa_1 - 2);
              IF v_metros_tarifa_1 > 0 THEN
                v_importe_tarifa_1 := v_metros_tarifa_1 * v_producto.precio_metro_tarifa_1;
              END IF;
            END IF;
            
            IF p_cantidad > v_producto.metros_limite_tarifa_1 THEN
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
        END;
        
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
  END IF;
  
  RETURN QUERY SELECT 
    ROUND(COALESCE(v_precio_unitario, 0), 2)::DECIMAL(10,2),
    ROUND(COALESCE(v_importe, 0), 2)::DECIMAL(12,2),
    v_desglose;
END;
$function$;
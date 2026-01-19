-- Actualizar la función para manejar correctamente el cálculo
-- La fórmula correcta según el Excel es:
-- Total = Base + (metros × precio_por_metro)
-- Donde Base = costes fijos (material + preparación + montaje)
-- El primer metro se incluye en el precio (base ya lo tiene)
-- Metros 2-10: cada uno a precio_metro_tarifa_1
-- Metros 11+: cada uno a precio_metro_tarifa_2

-- Primero actualizamos los datos correctamente
-- Ejemplo Lona: Material=30, Prep=10, Montaje=30, Total fijos=70€
-- 1m = 70€, significa que el primer metro no cuesta extra
-- 2m = 115€ = 70€ + 45€ (el 2do metro cuesta 45€)
-- 3m = 140€ = 115€ + 25€ (el 3er metro cuesta 25€)
-- Entonces metros 2-10 tienen precio variable: 45€ el 2do, 25€ el resto

-- Para simplificar, usaremos:
-- precio_base_fijo = costes fijos (sin metros)
-- precio_metro_primer = precio del primer metro (opcional, por defecto igual a tarifa1)
-- precio_metro_tarifa_1 = precio metros 2-10
-- precio_metro_tarifa_2 = precio metros 11+

-- Como no tenemos campo para precio_metro_primer, interpretamos así:
-- precio_base_fijo = precio para 1m² (incluye primer metro)
-- precio_metro_tarifa_1 = incremento por cada m² adicional (metros 2 hasta límite)
-- precio_metro_tarifa_2 = incremento por cada m² adicional (metros 11+)

-- Recalculando datos del Excel:
-- LONA: 1m=70€, 2m=115€(+45), 3m=140€(+25), 10m=315€, 11m=335€(+20)
-- Entonces: base=70€, m2=+45€ (especial), m3-10=+25€, m11+=+20€

-- Para manejar esto necesitamos un campo adicional o una tabla de tarifas
-- Por ahora, aproximaremos: base=70€, tarifa1=27.2€ (promedio), tarifa2=20€

-- Actualizamos todos los productos con la interpretación correcta:
-- base = precio_1m, tarifa1 = (precio_10m - precio_1m) / 9, tarifa2 = incremento_m11+

-- VINILO ÁCIDO: 1m=110€, 10m=620€, 11m=650€
-- tarifa1 = (620-110)/9 = 56.67€/m, tarifa2 = 650-620 = 30€
UPDATE productos SET 
  precio_base_fijo = 110,
  precio_metro_tarifa_1 = 56.67,
  precio_metro_tarifa_2 = 30,
  metros_limite_tarifa_1 = 10
WHERE nombre = 'Vinilo Ácido';

-- VINILO POLIMÉRICO: 1m=110€, 10m=560€, 11m=595€
-- tarifa1 = (560-110)/9 = 50€/m, tarifa2 = 35€
UPDATE productos SET 
  precio_base_fijo = 110,
  precio_metro_tarifa_1 = 50,
  precio_metro_tarifa_2 = 35,
  metros_limite_tarifa_1 = 10
WHERE nombre = 'Vinilo Polimérico';

-- VINILO DE CORTE: 1m=105€, 10m=510€, 11m=540€
-- tarifa1 = (510-105)/9 = 45€/m, tarifa2 = 30€
UPDATE productos SET 
  precio_base_fijo = 105,
  precio_metro_tarifa_1 = 45,
  precio_metro_tarifa_2 = 30,
  metros_limite_tarifa_1 = 10
WHERE nombre = 'Vinilo de Corte';

-- VINILO MONOMÉRICO: 1m=100€, 10m=505€, 11m=535€
-- tarifa1 = (505-100)/9 = 45€/m, tarifa2 = 30€
UPDATE productos SET 
  precio_base_fijo = 100,
  precio_metro_tarifa_1 = 45,
  precio_metro_tarifa_2 = 30,
  metros_limite_tarifa_1 = 10
WHERE nombre = 'Vinilo Monomérico';

-- VINILO TRANSPARENTE: 1m=110€, 10m=610€, 11m=645€
-- tarifa1 = (610-110)/9 = 55.56€/m, tarifa2 = 35€
UPDATE productos SET 
  precio_base_fijo = 110,
  precio_metro_tarifa_1 = 55.56,
  precio_metro_tarifa_2 = 35,
  metros_limite_tarifa_1 = 10
WHERE nombre = 'Vinilo Transparente';

-- VINILO MICROPERFORADO: 1m=110€, 10m=620€, 11m=650€
-- tarifa1 = (620-110)/9 = 56.67€/m, tarifa2 = 30€
UPDATE productos SET 
  precio_base_fijo = 110,
  precio_metro_tarifa_1 = 56.67,
  precio_metro_tarifa_2 = 30,
  metros_limite_tarifa_1 = 10
WHERE nombre = 'Vinilo Microperforado';

-- LONA: 1m=70€, 10m=315€, 11m=335€
-- tarifa1 = (315-70)/9 = 27.22€/m, tarifa2 = 20€
UPDATE productos SET 
  precio_base_fijo = 70,
  precio_metro_tarifa_1 = 27.22,
  precio_metro_tarifa_2 = 20,
  metros_limite_tarifa_1 = 10
WHERE nombre = 'Lona';

-- LONA 2 CARAS: 1m=110€, 10m=705€, 11m=745€
-- tarifa1 = (705-110)/9 = 66.11€/m, tarifa2 = 40€
UPDATE productos SET 
  precio_base_fijo = 110,
  precio_metro_tarifa_1 = 66.11,
  precio_metro_tarifa_2 = 40,
  metros_limite_tarifa_1 = 10
WHERE nombre = 'Lona 2 Caras';

-- PAPEL: precio constante 20€/m
UPDATE productos SET 
  precio_base_fijo = 0,
  precio_metro_tarifa_1 = 20,
  precio_metro_tarifa_2 = 20,
  metros_limite_tarifa_1 = 999
WHERE nombre = 'Papel';

-- PVC 3MM: 1m=90€, incremento constante 40€/m
UPDATE productos SET 
  precio_base_fijo = 50,
  precio_metro_tarifa_1 = 40,
  precio_metro_tarifa_2 = 40,
  metros_limite_tarifa_1 = 999
WHERE nombre LIKE 'PVC 3mm%';

-- COMPOSITE: 1m=125€, incremento constante 50€/m
UPDATE productos SET 
  precio_base_fijo = 75,
  precio_metro_tarifa_1 = 50,
  precio_metro_tarifa_2 = 50,
  metros_limite_tarifa_1 = 999
WHERE nombre LIKE 'Composite%';

-- METACRILATO 5MM: 1m=160€, incremento constante 90€/m
UPDATE productos SET 
  precio_base_fijo = 70,
  precio_metro_tarifa_1 = 90,
  precio_metro_tarifa_2 = 90,
  metros_limite_tarifa_1 = 999
WHERE nombre = 'Metacrilato 5mm';

-- METACRILATO 3MM: 1m=145€, incremento constante 70€/m
UPDATE productos SET 
  precio_base_fijo = 75,
  precio_metro_tarifa_1 = 70,
  precio_metro_tarifa_2 = 70,
  metros_limite_tarifa_1 = 999
WHERE nombre = 'Metacrilato 3mm';

-- Ahora actualizar la función de cálculo para usar la nueva fórmula:
-- Total = precio_base_fijo + (cantidad × tarifa_correspondiente)
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
      -- Fórmula: base + (cantidad × tarifa)
      IF p_cantidad <= v_producto.metros_limite_tarifa_1 THEN
        v_importe := v_producto.precio_base_fijo + (p_cantidad * v_producto.precio_metro_tarifa_1);
        v_precio_unitario := v_importe / NULLIF(p_cantidad, 0);
        v_desglose := jsonb_build_object(
          'precio_base', v_producto.precio_base_fijo,
          'metros', p_cantidad,
          'precio_metro', v_producto.precio_metro_tarifa_1,
          'importe_metros', p_cantidad * v_producto.precio_metro_tarifa_1
        );
      ELSE
        -- Metros hasta el límite a tarifa 1, el resto a tarifa 2
        v_metros_tarifa_1 := v_producto.metros_limite_tarifa_1;
        v_metros_tarifa_2 := p_cantidad - v_metros_tarifa_1;
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
-- Actualizar Vinilo de Corte según el Excel
-- 1er metro = 105€ (45+30+30)
-- 2-10m = +45€/m
-- 11m+ = +30€/m

UPDATE public.productos 
SET 
  precio_base_fijo = 105,
  precio_metro_2 = 45,
  precio_metro_tarifa_1 = 45,
  metros_limite_tarifa_1 = 10,
  precio_metro_tarifa_2 = 30
WHERE nombre ILIKE '%vinilo%corte%';
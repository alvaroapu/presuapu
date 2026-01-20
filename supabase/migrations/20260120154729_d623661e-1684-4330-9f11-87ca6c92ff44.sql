
-- Corregir precios según el Excel

-- Lona 2 Caras: precio_metro_2 = 75€ (2do metro), precio_metro_tarifa_1 = 65€ (3-10m)
UPDATE public.productos 
SET precio_metro_2 = 75, precio_metro_tarifa_1 = 65
WHERE nombre ILIKE '%lona 2 caras%';

-- PVC 3mm: precio_base_fijo = 90€ (40+40+10), precio_metro_2 = 40€
UPDATE public.productos 
SET precio_base_fijo = 90, precio_metro_2 = 40
WHERE nombre ILIKE 'pvc 3mm';

-- PVC 3mm / Cartón Pluma: mismo precio que PVC 3mm
UPDATE public.productos 
SET precio_base_fijo = 90, precio_metro_2 = 40
WHERE nombre ILIKE '%pvc 3mm%cartón%';

-- Composite-Dibond 3mm: precio_base_fijo = 125€ (55+50+20), precio_metro_2 = 50€
UPDATE public.productos 
SET precio_base_fijo = 125, precio_metro_2 = 50
WHERE nombre ILIKE '%composite%' OR nombre ILIKE '%dibond%';

-- Metacrilato 5mm: precio_base_fijo = 160€ (70+70+20), precio_metro_2 = 90€
UPDATE public.productos 
SET precio_base_fijo = 160, precio_metro_2 = 90
WHERE nombre ILIKE '%metacrilato 5mm%';

-- Metacrilato 3mm: precio_base_fijo = 145€ (55+70+20), precio_metro_2 = 70€
UPDATE public.productos 
SET precio_base_fijo = 145, precio_metro_2 = 70
WHERE nombre ILIKE '%metacrilato 3mm%';

-- Insertar categorías si no existen
INSERT INTO public.categorias (nombre, descripcion, orden, activa) VALUES
('Vinilos', 'Vinilos adhesivos para rotulación', 1, true),
('Lonas', 'Lonas para impresión gran formato', 2, true),
('Papel', 'Papel para impresión', 3, true),
('Rígidos', 'Materiales rígidos (PVC, Composite, Metacrilato)', 4, true),
('Servicios', 'Servicios de diseño y otros', 5, true)
ON CONFLICT DO NOTHING;

-- Productos de Vinilos
INSERT INTO public.productos (nombre, categoria_id, tipo_calculo, precio_material, precio_preparacion, precio_montaje, precio_metro_tarifa_1, metros_limite_tarifa_1, precio_metro_tarifa_2, precio_base_fijo, activo)
SELECT 
  'Vinilo Ácido',
  (SELECT id FROM public.categorias WHERE nombre = 'Vinilos'),
  'por_metro',
  50, 30, 30, 55, 10, 30, 55, true
WHERE NOT EXISTS (SELECT 1 FROM public.productos WHERE nombre = 'Vinilo Ácido');

INSERT INTO public.productos (nombre, categoria_id, tipo_calculo, precio_material, precio_preparacion, precio_montaje, precio_metro_tarifa_1, metros_limite_tarifa_1, precio_metro_tarifa_2, precio_base_fijo, activo)
SELECT 
  'Vinilo Polimérico',
  (SELECT id FROM public.categorias WHERE nombre = 'Vinilos'),
  'por_metro',
  50, 30, 30, 50, 10, 35, 50, true
WHERE NOT EXISTS (SELECT 1 FROM public.productos WHERE nombre = 'Vinilo Polimérico');

INSERT INTO public.productos (nombre, categoria_id, tipo_calculo, precio_material, precio_preparacion, precio_montaje, precio_metro_tarifa_1, metros_limite_tarifa_1, precio_metro_tarifa_2, precio_base_fijo, activo)
SELECT 
  'Vinilo de Corte',
  (SELECT id FROM public.categorias WHERE nombre = 'Vinilos'),
  'por_metro',
  45, 30, 30, 45, 10, 30, 45, true
WHERE NOT EXISTS (SELECT 1 FROM public.productos WHERE nombre = 'Vinilo de Corte');

INSERT INTO public.productos (nombre, categoria_id, tipo_calculo, precio_material, precio_preparacion, precio_montaje, precio_metro_tarifa_1, metros_limite_tarifa_1, precio_metro_tarifa_2, precio_base_fijo, activo)
SELECT 
  'Vinilo Monomérico',
  (SELECT id FROM public.categorias WHERE nombre = 'Vinilos'),
  'por_metro',
  45, 25, 30, 45, 10, 30, 45, true
WHERE NOT EXISTS (SELECT 1 FROM public.productos WHERE nombre = 'Vinilo Monomérico');

INSERT INTO public.productos (nombre, categoria_id, tipo_calculo, precio_material, precio_preparacion, precio_montaje, precio_metro_tarifa_1, metros_limite_tarifa_1, precio_metro_tarifa_2, precio_base_fijo, activo)
SELECT 
  'Vinilo Transparente',
  (SELECT id FROM public.categorias WHERE nombre = 'Vinilos'),
  'por_metro',
  50, 30, 30, 55, 10, 35, 55, true
WHERE NOT EXISTS (SELECT 1 FROM public.productos WHERE nombre = 'Vinilo Transparente');

INSERT INTO public.productos (nombre, categoria_id, tipo_calculo, precio_material, precio_preparacion, precio_montaje, precio_metro_tarifa_1, metros_limite_tarifa_1, precio_metro_tarifa_2, precio_base_fijo, activo)
SELECT 
  'Vinilo Microperforado',
  (SELECT id FROM public.categorias WHERE nombre = 'Vinilos'),
  'por_metro',
  50, 30, 30, 55, 10, 30, 55, true
WHERE NOT EXISTS (SELECT 1 FROM public.productos WHERE nombre = 'Vinilo Microperforado');

-- Productos de Lonas
INSERT INTO public.productos (nombre, categoria_id, tipo_calculo, precio_material, precio_preparacion, precio_montaje, precio_metro_tarifa_1, metros_limite_tarifa_1, precio_metro_tarifa_2, precio_base_fijo, activo)
SELECT 
  'Lona',
  (SELECT id FROM public.categorias WHERE nombre = 'Lonas'),
  'por_metro',
  30, 10, 30, 25, 10, 20, 25, true
WHERE NOT EXISTS (SELECT 1 FROM public.productos WHERE nombre = 'Lona');

INSERT INTO public.productos (nombre, categoria_id, tipo_calculo, precio_material, precio_preparacion, precio_montaje, precio_metro_tarifa_1, metros_limite_tarifa_1, precio_metro_tarifa_2, precio_base_fijo, activo)
SELECT 
  'Lona 2 Caras',
  (SELECT id FROM public.categorias WHERE nombre = 'Lonas'),
  'por_metro',
  60, 20, 30, 65, 10, 40, 65, true
WHERE NOT EXISTS (SELECT 1 FROM public.productos WHERE nombre = 'Lona 2 Caras');

-- Producto de Papel
INSERT INTO public.productos (nombre, categoria_id, tipo_calculo, precio_material, precio_preparacion, precio_montaje, precio_metro_tarifa_1, metros_limite_tarifa_1, precio_metro_tarifa_2, precio_base_fijo, activo)
SELECT 
  'Papel',
  (SELECT id FROM public.categorias WHERE nombre = 'Papel'),
  'por_metro',
  20, 0, 0, 20, 10, 20, 20, true
WHERE NOT EXISTS (SELECT 1 FROM public.productos WHERE nombre = 'Papel');

-- Productos Rígidos
INSERT INTO public.productos (nombre, categoria_id, tipo_calculo, precio_material, precio_preparacion, precio_montaje, precio_metro_tarifa_1, metros_limite_tarifa_1, precio_metro_tarifa_2, precio_base_fijo, activo)
SELECT 
  'PVC 3mm',
  (SELECT id FROM public.categorias WHERE nombre = 'Rígidos'),
  'por_metro',
  40, 40, 10, 40, 10, 40, 40, true
WHERE NOT EXISTS (SELECT 1 FROM public.productos WHERE nombre = 'PVC 3mm');

INSERT INTO public.productos (nombre, categoria_id, tipo_calculo, precio_material, precio_preparacion, precio_montaje, precio_metro_tarifa_1, metros_limite_tarifa_1, precio_metro_tarifa_2, precio_base_fijo, activo)
SELECT 
  'Composite/Dibond 3mm',
  (SELECT id FROM public.categorias WHERE nombre = 'Rígidos'),
  'por_metro',
  55, 50, 20, 50, 10, 50, 50, true
WHERE NOT EXISTS (SELECT 1 FROM public.productos WHERE nombre = 'Composite/Dibond 3mm');

INSERT INTO public.productos (nombre, categoria_id, tipo_calculo, precio_material, precio_preparacion, precio_montaje, precio_metro_tarifa_1, metros_limite_tarifa_1, precio_metro_tarifa_2, precio_base_fijo, activo, precio_placa_a3, precio_placa_a4)
SELECT 
  'Metacrilato 5mm',
  (SELECT id FROM public.categorias WHERE nombre = 'Rígidos'),
  'por_placa',
  70, 70, 20, 90, 10, 90, 90, true, 100, 80
WHERE NOT EXISTS (SELECT 1 FROM public.productos WHERE nombre = 'Metacrilato 5mm');

INSERT INTO public.productos (nombre, categoria_id, tipo_calculo, precio_material, precio_preparacion, precio_montaje, precio_metro_tarifa_1, metros_limite_tarifa_1, precio_metro_tarifa_2, precio_base_fijo, activo, precio_placa_a3, precio_placa_a4)
SELECT 
  'Metacrilato 3mm',
  (SELECT id FROM public.categorias WHERE nombre = 'Rígidos'),
  'por_placa',
  55, 70, 20, 70, 10, 70, 70, true, 70, 50
WHERE NOT EXISTS (SELECT 1 FROM public.productos WHERE nombre = 'Metacrilato 3mm');

-- Producto por unidad
INSERT INTO public.productos (nombre, categoria_id, tipo_calculo, precio_por_unidad, activo)
SELECT 
  'Polipropileno',
  (SELECT id FROM public.categorias WHERE nombre = 'Rígidos'),
  'por_unidad',
  17, true
WHERE NOT EXISTS (SELECT 1 FROM public.productos WHERE nombre = 'Polipropileno');

-- Servicio por hora
INSERT INTO public.productos (nombre, categoria_id, tipo_calculo, precio_por_hora, activo)
SELECT 
  'Diseño Gráfico',
  (SELECT id FROM public.categorias WHERE nombre = 'Servicios'),
  'por_hora',
  28.57, true
WHERE NOT EXISTS (SELECT 1 FROM public.productos WHERE nombre = 'Diseño Gráfico');
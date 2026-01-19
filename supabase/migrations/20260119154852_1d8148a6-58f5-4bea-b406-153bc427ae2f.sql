-- Actualizar precios de productos según el Excel corregido
-- Fórmula: precio_base_fijo = precio 1m², precio_metro_tarifa_1 = incremento m2-10, precio_metro_tarifa_2 = incremento m11+

-- Vinilo Ácido: 1m=110€, diff(2m)=55€, diff(11m)=30€
UPDATE productos SET 
  precio_base_fijo = 110,
  precio_metro_tarifa_1 = 55,
  precio_metro_tarifa_2 = 30,
  metros_limite_tarifa_1 = 10,
  precio_material = 50,
  precio_preparacion = 30,
  precio_montaje = 30
WHERE nombre = 'Vinilo Ácido';

-- Vinilo Polimérico: 1m=110€, diff=50€, diff11=35€
UPDATE productos SET 
  precio_base_fijo = 110,
  precio_metro_tarifa_1 = 50,
  precio_metro_tarifa_2 = 35,
  metros_limite_tarifa_1 = 10,
  precio_material = 50,
  precio_preparacion = 30,
  precio_montaje = 30
WHERE nombre = 'Vinilo Polimérico';

-- Vinilo de Corte: 1m=105€, diff=45€, diff11=30€
UPDATE productos SET 
  precio_base_fijo = 105,
  precio_metro_tarifa_1 = 45,
  precio_metro_tarifa_2 = 30,
  metros_limite_tarifa_1 = 10,
  precio_material = 45,
  precio_preparacion = 30,
  precio_montaje = 30
WHERE nombre = 'Vinilo de Corte';

-- Vinilo Monomérico: 1m=100€, diff=45€, diff11=30€
UPDATE productos SET 
  precio_base_fijo = 100,
  precio_metro_tarifa_1 = 45,
  precio_metro_tarifa_2 = 30,
  metros_limite_tarifa_1 = 10,
  precio_material = 45,
  precio_preparacion = 25,
  precio_montaje = 30
WHERE nombre = 'Vinilo Monomérico';

-- Vinilo Transparente: 1m=110€, diff=55€, diff11=35€
UPDATE productos SET 
  precio_base_fijo = 110,
  precio_metro_tarifa_1 = 55,
  precio_metro_tarifa_2 = 35,
  metros_limite_tarifa_1 = 10,
  precio_material = 50,
  precio_preparacion = 30,
  precio_montaje = 30
WHERE nombre = 'Vinilo Transparente';

-- Vinilo Microperforado: 1m=110€, diff=55€, diff11=30€
UPDATE productos SET 
  precio_base_fijo = 110,
  precio_metro_tarifa_1 = 55,
  precio_metro_tarifa_2 = 30,
  metros_limite_tarifa_1 = 10,
  precio_material = 50,
  precio_preparacion = 30,
  precio_montaje = 30
WHERE nombre = 'Vinilo Microperforado';

-- Lona: 1m=70€, diff(2m)=45€ (especial), diff(3-10)=25€, diff11=20€
-- Ajustamos: base=70€, tarifa1=25€ (metros 2-10 standard), tarifa2=20€
UPDATE productos SET 
  precio_base_fijo = 70,
  precio_metro_tarifa_1 = 25,
  precio_metro_tarifa_2 = 20,
  metros_limite_tarifa_1 = 10,
  precio_material = 30,
  precio_preparacion = 10,
  precio_montaje = 30
WHERE nombre = 'Lona';

-- Lona 2 Caras: 1m=110€, diff=65€, diff11=40€
UPDATE productos SET 
  precio_base_fijo = 110,
  precio_metro_tarifa_1 = 65,
  precio_metro_tarifa_2 = 40,
  metros_limite_tarifa_1 = 10,
  precio_material = 60,
  precio_preparacion = 20,
  precio_montaje = 30
WHERE nombre = 'Lona 2 Caras';

-- Papel: 1m=20€, diff=20€, sin cambio de tarifa
UPDATE productos SET 
  precio_base_fijo = 20,
  precio_metro_tarifa_1 = 20,
  precio_metro_tarifa_2 = 20,
  metros_limite_tarifa_1 = 999,
  precio_material = 20,
  precio_preparacion = 0,
  precio_montaje = 0
WHERE nombre = 'Papel';

-- Polipropileno: precio por unidad = 17€
UPDATE productos SET 
  precio_por_unidad = 17,
  tipo_calculo = 'por_unidad',
  precio_base_fijo = 0,
  precio_metro_tarifa_1 = 0,
  precio_metro_tarifa_2 = 0
WHERE nombre = 'Polipropileno';

-- PVC 3mm: 1m=90€, diff=40€, sin cambio de tarifa
UPDATE productos SET 
  precio_base_fijo = 90,
  precio_metro_tarifa_1 = 40,
  precio_metro_tarifa_2 = 40,
  metros_limite_tarifa_1 = 999,
  precio_material = 40,
  precio_preparacion = 40,
  precio_montaje = 10
WHERE nombre LIKE 'PVC 3mm%';

-- Composite-Dibond 3mm: 1m=125€, diff=50€
UPDATE productos SET 
  precio_base_fijo = 125,
  precio_metro_tarifa_1 = 50,
  precio_metro_tarifa_2 = 50,
  metros_limite_tarifa_1 = 999,
  precio_material = 55,
  precio_preparacion = 50,
  precio_montaje = 20
WHERE nombre LIKE 'Composite%';

-- Metacrilato 5mm: 1m=160€, diff=90€, placas A3=100€, A4=80€
UPDATE productos SET 
  precio_base_fijo = 160,
  precio_metro_tarifa_1 = 90,
  precio_metro_tarifa_2 = 90,
  metros_limite_tarifa_1 = 999,
  precio_material = 70,
  precio_preparacion = 70,
  precio_montaje = 20,
  precio_placa_a3 = 100,
  precio_placa_a4 = 80
WHERE nombre = 'Metacrilato 5mm';

-- Metacrilato 3mm: 1m=145€, diff=70€, placas A3=70€, A4=50€
UPDATE productos SET 
  precio_base_fijo = 145,
  precio_metro_tarifa_1 = 70,
  precio_metro_tarifa_2 = 70,
  metros_limite_tarifa_1 = 999,
  precio_material = 55,
  precio_preparacion = 70,
  precio_montaje = 20,
  precio_placa_a3 = 70,
  precio_placa_a4 = 50
WHERE nombre = 'Metacrilato 3mm';

-- Diseño Gráfico: 28.57€/hora
UPDATE productos SET 
  precio_por_hora = 28.57,
  tipo_calculo = 'por_hora'
WHERE nombre = 'Diseño Gráfico';
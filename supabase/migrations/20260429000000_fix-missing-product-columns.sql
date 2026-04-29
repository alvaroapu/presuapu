-- Ensure metros_gratis and bonificacion_cada_n_metros columns exist.
-- These may not have been applied to all environments even though migration
-- files 20260202135911 and 20260225000000 exist in the repo.
ALTER TABLE public.productos
  ADD COLUMN IF NOT EXISTS metros_gratis numeric DEFAULT 0,
  ADD COLUMN IF NOT EXISTS bonificacion_cada_n_metros numeric DEFAULT 0;

-- Drop and recreate the view to pick up all current columns from productos.
-- PostgreSQL resolves p.* at view creation time, so new columns added
-- after the original CREATE VIEW are invisible until the view is recreated.
DROP VIEW IF EXISTS public.v_productos_con_categoria;

CREATE VIEW public.v_productos_con_categoria AS
SELECT
  p.*,
  c.nombre  AS categoria_nombre,
  c.orden   AS categoria_orden
FROM public.productos p
JOIN public.categorias c ON p.categoria_id = c.id
WHERE p.activo = true AND c.activa = true
ORDER BY c.orden, p.nombre;

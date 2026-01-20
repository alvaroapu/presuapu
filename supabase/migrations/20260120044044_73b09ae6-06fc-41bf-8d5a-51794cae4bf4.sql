-- Fix the view to not use security definer implicitly
DROP VIEW IF EXISTS public.v_facturas_completas;

CREATE VIEW public.v_facturas_completas 
WITH (security_invoker = on)
AS
SELECT 
  f.*,
  c.email as cliente_email_actual,
  c.telefono as cliente_telefono_actual,
  (SELECT COUNT(*) FROM public.factura_lineas fl WHERE fl.factura_id = f.id) as num_lineas
FROM public.facturas f
LEFT JOIN public.clientes c ON f.cliente_id = c.id;
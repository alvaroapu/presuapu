-- Add metodo_pago column to presupuestos
ALTER TABLE public.presupuestos 
ADD COLUMN metodo_pago text DEFAULT 'transferencia';

-- Add metodo_pago column to facturas
ALTER TABLE public.facturas 
ADD COLUMN metodo_pago text DEFAULT 'transferencia';
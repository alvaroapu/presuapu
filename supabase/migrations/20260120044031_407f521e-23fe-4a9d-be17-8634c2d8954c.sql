-- Add invoice configuration columns to empresa_config
ALTER TABLE public.empresa_config
ADD COLUMN IF NOT EXISTS prefijo_factura text DEFAULT 'FAC',
ADD COLUMN IF NOT EXISTS siguiente_numero_factura integer DEFAULT 1,
ADD COLUMN IF NOT EXISTS texto_factura_cabecera text DEFAULT 'Factura correspondiente a los servicios prestados.',
ADD COLUMN IF NOT EXISTS texto_factura_pie text DEFAULT 'Forma de pago: Transferencia bancaria a la cuenta indicada en un plazo de 30 días.',
ADD COLUMN IF NOT EXISTS cuenta_bancaria text,
ADD COLUMN IF NOT EXISTS iban text;

-- Create facturas table
CREATE TABLE IF NOT EXISTS public.facturas (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  numero text NOT NULL UNIQUE,
  presupuesto_id uuid REFERENCES public.presupuestos(id) ON DELETE SET NULL,
  
  cliente_id uuid REFERENCES public.clientes(id) ON DELETE SET NULL,
  cliente_nombre text NOT NULL,
  cliente_nombre_comercial text,
  cliente_documento text,
  cliente_email text,
  cliente_telefono text,
  cliente_direccion text,
  cliente_ciudad text,
  cliente_codigo_postal text,
  
  fecha_emision date NOT NULL DEFAULT CURRENT_DATE,
  fecha_vencimiento date,
  
  subtotal numeric(12,2) DEFAULT 0,
  descuento_tipo text DEFAULT 'porcentaje',
  descuento_valor numeric(10,2) DEFAULT 0,
  descuento_importe numeric(12,2) DEFAULT 0,
  base_imponible numeric(12,2) DEFAULT 0,
  iva_porcentaje numeric(5,2) DEFAULT 21.00,
  iva_importe numeric(12,2) DEFAULT 0,
  total numeric(12,2) DEFAULT 0,
  
  estado text DEFAULT 'emitida' CHECK (estado IN ('emitida', 'pagada', 'vencida', 'anulada')),
  fecha_pago timestamp with time zone,
  
  notas text,
  notas_internas text,
  
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Create factura_lineas table
CREATE TABLE IF NOT EXISTS public.factura_lineas (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  factura_id uuid NOT NULL REFERENCES public.facturas(id) ON DELETE CASCADE,
  producto_id uuid REFERENCES public.productos(id) ON DELETE SET NULL,
  producto_nombre text NOT NULL,
  producto_categoria text,
  cantidad numeric(10,2) NOT NULL,
  tipo_cantidad text NOT NULL DEFAULT 'unidades',
  descripcion text,
  precio_unitario numeric(10,2) NOT NULL,
  importe numeric(12,2) NOT NULL,
  orden integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.facturas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.factura_lineas ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Authenticated users can manage facturas"
ON public.facturas FOR ALL
USING (is_authenticated())
WITH CHECK (is_authenticated());

CREATE POLICY "Authenticated users can manage factura_lineas"
ON public.factura_lineas FOR ALL
USING (is_authenticated())
WITH CHECK (is_authenticated());

-- Create trigger for updated_at
CREATE TRIGGER update_facturas_updated_at
BEFORE UPDATE ON public.facturas
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Function to generate invoice number
CREATE OR REPLACE FUNCTION public.generar_numero_factura()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_prefijo TEXT;
  v_year TEXT;
  v_siguiente INTEGER;
  v_numero TEXT;
BEGIN
  SELECT COALESCE(prefijo_factura, 'FAC') INTO v_prefijo
  FROM public.empresa_config LIMIT 1;
  
  IF v_prefijo IS NULL THEN
    v_prefijo := 'FAC';
  END IF;
  
  v_year := EXTRACT(YEAR FROM CURRENT_DATE)::TEXT;
  
  SELECT COUNT(*) + 1 INTO v_siguiente
  FROM public.facturas
  WHERE numero LIKE v_prefijo || '-' || v_year || '-%';
  
  v_numero := v_prefijo || '-' || v_year || '-' || LPAD(v_siguiente::TEXT, 4, '0');
  
  RETURN v_numero;
END;
$$;

-- Create view for facturas with client data
CREATE OR REPLACE VIEW public.v_facturas_completas AS
SELECT 
  f.*,
  c.email as cliente_email_actual,
  c.telefono as cliente_telefono_actual,
  (SELECT COUNT(*) FROM public.factura_lineas fl WHERE fl.factura_id = f.id) as num_lineas
FROM public.facturas f
LEFT JOIN public.clientes c ON f.cliente_id = c.id;
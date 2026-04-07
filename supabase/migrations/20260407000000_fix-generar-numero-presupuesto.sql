-- Fix generar_numero_presupuesto: COUNT(*)+1 causes collisions when there
-- are gaps in the sequence (deleted rows). Use MAX of the numeric suffix
-- instead so we always pick a value above every existing number.
CREATE OR REPLACE FUNCTION public.generar_numero_presupuesto()
RETURNS TEXT AS $$
DECLARE
  v_prefijo TEXT;
  v_año TEXT;
  v_siguiente INTEGER;
  v_numero TEXT;
BEGIN
  SELECT COALESCE(prefijo_presupuesto, 'PRES') INTO v_prefijo
  FROM public.empresa_config LIMIT 1;

  IF v_prefijo IS NULL THEN
    v_prefijo := 'PRES';
  END IF;

  v_año := EXTRACT(YEAR FROM CURRENT_DATE)::TEXT;

  SELECT COALESCE(
    MAX(NULLIF(regexp_replace(numero, '^' || v_prefijo || '-' || v_año || '-', ''), '')::INTEGER),
    0
  ) + 1
  INTO v_siguiente
  FROM public.presupuestos
  WHERE numero ~ ('^' || v_prefijo || '-' || v_año || '-[0-9]+$');

  v_numero := v_prefijo || '-' || v_año || '-' || LPAD(v_siguiente::TEXT, 4, '0');

  RETURN v_numero;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Add marca (brand) and informacion_interna (internal notes) fields to productos table

ALTER TABLE productos
  ADD COLUMN IF NOT EXISTS marca text,
  ADD COLUMN IF NOT EXISTS informacion_interna text;

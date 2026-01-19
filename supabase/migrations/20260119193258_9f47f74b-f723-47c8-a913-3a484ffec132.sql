-- Drop and recreate the view with security_invoker = true
DROP VIEW IF EXISTS v_clientes_con_stats;

CREATE VIEW v_clientes_con_stats
WITH (security_invoker = on)
AS
SELECT 
    c.id,
    c.nombre,
    c.nombre_comercial,
    c.tipo_documento,
    c.numero_documento,
    c.email,
    c.telefono,
    c.telefono_secundario,
    c.direccion,
    c.ciudad,
    c.provincia,
    c.codigo_postal,
    c.pais,
    c.persona_contacto,
    c.notas,
    c.activo,
    c.created_at,
    c.updated_at,
    count(p.id) AS total_presupuestos,
    count(p.id) FILTER (WHERE p.estado = 'aceptado'::text) AS presupuestos_aceptados,
    sum(p.total) FILTER (WHERE p.estado = 'aceptado'::text) AS facturacion_total,
    max(p.fecha_emision) AS ultimo_presupuesto
FROM clientes c
LEFT JOIN presupuestos p ON c.id = p.cliente_id
GROUP BY c.id
ORDER BY c.nombre;
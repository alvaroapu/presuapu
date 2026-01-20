import { useParams, useNavigate } from "react-router-dom";
import { usePresupuesto, usePresupuestoLineas } from "@/hooks/usePresupuestos";
import { useCliente } from "@/hooks/useClientes";
import { PresupuestoForm, LineaLocal } from "@/components/presupuestos/PresupuestoForm";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";

export default function PresupuestoEditar() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: presupuesto, isLoading: loadingPresupuesto } = usePresupuesto(id);
  const { data: lineas, isLoading: loadingLineas } = usePresupuestoLineas(id);
  const { data: cliente, isLoading: loadingCliente } = useCliente(presupuesto?.cliente_id);

  const isLoading = loadingPresupuesto || loadingLineas || loadingCliente;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-12 w-64" />
        <Skeleton className="h-48 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!presupuesto) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Presupuesto no encontrado</p>
        <Button variant="link" onClick={() => navigate('/presupuestos')}>
          Volver a presupuestos
        </Button>
      </div>
    );
  }

  // Transform lines to local format
  const initialLineas: LineaLocal[] = (lineas || []).map(l => ({
    id: l.id,
    producto_id: l.producto_id,
    producto_nombre: l.producto_nombre,
    producto_categoria: l.producto_categoria || '',
    cantidad: l.cantidad,
    tipo_cantidad: l.tipo_cantidad,
    descripcion: l.descripcion || '',
    precio_unitario: l.precio_unitario,
    importe: l.importe
  }));

  return (
    <PresupuestoForm 
      mode="edit"
      presupuestoId={id}
      numero={presupuesto.numero}
      initialCliente={cliente || null}
      initialLineas={initialLineas}
      initialDescuentoTipo={(presupuesto.descuento_tipo as 'porcentaje' | 'importe') || 'porcentaje'}
      initialDescuentoValor={presupuesto.descuento_valor || 0}
      initialIvaPorcentaje={presupuesto.iva_porcentaje || 21}
      initialNotas={presupuesto.notas || ''}
      initialNotasInternas={presupuesto.notas_internas || ''}
      initialMetodoPago={(presupuesto as any).metodo_pago || 'transferencia'}
    />
  );
}

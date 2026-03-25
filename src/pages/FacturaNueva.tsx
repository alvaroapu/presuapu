import { useGenerarNumeroFactura } from "@/hooks/useFacturas";
import { PresupuestoForm } from "@/components/presupuestos/PresupuestoForm";
import { Skeleton } from "@/components/ui/skeleton";

export default function FacturaNueva() {
  const { data: numero, isLoading } = useGenerarNumeroFactura();

  if (isLoading || !numero) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-12 w-64" />
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  return (
    <PresupuestoForm
      mode="create"
      target="factura"
      numero={numero}
    />
  );
}

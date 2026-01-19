import { useGenerarNumeroPresupuesto } from "@/hooks/usePresupuestos";
import { PresupuestoForm } from "@/components/presupuestos/PresupuestoForm";
import { Skeleton } from "@/components/ui/skeleton";

export default function PresupuestoNuevo() {
  const { data: numero, isLoading } = useGenerarNumeroPresupuesto();

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
      numero={numero}
    />
  );
}

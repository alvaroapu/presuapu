import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search } from "lucide-react";
import { useClientesConStats } from "@/hooks/useClientes";
import { formatCurrency, formatDate } from "@/lib/formatters";
import { Skeleton } from "@/components/ui/skeleton";
import { useState } from "react";

export default function Clientes() {
  const [busqueda, setBusqueda] = useState("");
  const { data: clientes, isLoading } = useClientesConStats();

  const clientesFiltrados = clientes?.filter(c => 
    !busqueda || 
    c.nombre?.toLowerCase().includes(busqueda.toLowerCase()) ||
    c.nombre_comercial?.toLowerCase().includes(busqueda.toLowerCase()) ||
    c.email?.toLowerCase().includes(busqueda.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Clientes</h1>
        <Button asChild>
          <Link to="/clientes/nuevo">
            <Plus className="w-4 h-4 mr-2" />
            Nuevo Cliente
          </Link>
        </Button>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Buscar por nombre, empresa o email..."
          className="pl-10"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
        />
      </div>

      <div className="border rounded-lg">
        <div className="grid grid-cols-[1fr_1fr_1fr_auto_auto] gap-4 p-4 border-b bg-muted/50 font-medium text-sm">
          <div>Nombre</div>
          <div>Empresa</div>
          <div>Email</div>
          <div className="text-right">Presupuestos</div>
          <div className="text-right">Facturación</div>
        </div>
        
        {isLoading ? (
          <div className="p-4 space-y-4">
            {[1,2,3,4,5].map(i => <Skeleton key={i} className="h-12 w-full" />)}
          </div>
        ) : clientesFiltrados?.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">
            No hay clientes
          </div>
        ) : (
          clientesFiltrados?.map((c) => (
            <Link
              key={c.id}
              to={`/clientes/${c.id}`}
              className="grid grid-cols-[1fr_1fr_1fr_auto_auto] gap-4 p-4 border-b last:border-0 items-center hover:bg-muted/30"
            >
              <div className="font-medium">{c.nombre}</div>
              <div className="text-muted-foreground">{c.nombre_comercial || '-'}</div>
              <div className="text-muted-foreground truncate">{c.email || '-'}</div>
              <div className="text-right">{c.total_presupuestos || 0}</div>
              <div className="text-right font-medium">{formatCurrency(c.facturacion_total || 0)}</div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}

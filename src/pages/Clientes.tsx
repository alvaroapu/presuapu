import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, Search } from "lucide-react";
import { useClientesConStats } from "@/hooks/useClientes";
import { formatCurrency } from "@/lib/formatters";
import { Skeleton } from "@/components/ui/skeleton";
import { useState } from "react";
import { ImportExportClientes } from "@/components/clientes/ImportExportClientes";

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
    <div className="space-y-4 md:space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl md:text-3xl font-bold">Clientes</h1>
        <div className="flex items-center gap-2">
          <ImportExportClientes clientes={clientes} />
          <Button asChild size="sm" className="flex-1 sm:flex-none">
            <Link to="/clientes/nuevo">
              <Plus className="w-4 h-4 sm:mr-2" />
              <span className="hidden sm:inline">Nuevo Cliente</span>
              <span className="sm:hidden">Nuevo</span>
            </Link>
          </Button>
        </div>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Buscar..."
          className="pl-10"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
        />
      </div>

      {/* Desktop Table */}
      <div className="border rounded-lg hidden md:block">
        <div className="grid grid-cols-[1fr_1fr_1fr_140px_100px_140px] gap-4 p-4 border-b bg-muted/50 font-medium text-sm">
          <div>Nombre</div>
          <div>Empresa</div>
          <div>Email</div>
          <div>Teléfono</div>
          <div className="text-right">Presup.</div>
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
              className="grid grid-cols-[1fr_1fr_1fr_140px_100px_140px] gap-4 p-4 border-b last:border-0 items-center hover:bg-muted/30"
            >
              <div className="font-medium">{c.nombre}</div>
              <div className="text-muted-foreground">{c.nombre_comercial || '-'}</div>
              <div className="text-muted-foreground truncate">{c.email || '-'}</div>
              <div className="text-muted-foreground">{c.telefono || '-'}</div>
              <div className="text-right">{c.total_presupuestos || 0}</div>
              <div className="text-right font-medium">{formatCurrency(c.facturacion_total || 0)}</div>
            </Link>
          ))
        )}
      </div>

      {/* Mobile Cards */}
      <div className="space-y-3 md:hidden">
        {isLoading ? (
          <div className="space-y-3">
            {[1,2,3].map(i => <Skeleton key={i} className="h-24 w-full" />)}
          </div>
        ) : clientesFiltrados?.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground border rounded-lg">
            No hay clientes
          </div>
        ) : (
          clientesFiltrados?.map((c) => (
            <Card key={c.id} className="overflow-hidden">
              <Link to={`/clientes/${c.id}`}>
                <CardContent className="p-3">
                  <div className="font-medium">{c.nombre}</div>
                  {c.nombre_comercial && (
                    <p className="text-sm text-muted-foreground">{c.nombre_comercial}</p>
                  )}
                  <div className="flex items-center gap-4 mt-2 text-sm">
                    {c.email && (
                      <span className="text-muted-foreground truncate max-w-[150px]">{c.email}</span>
                    )}
                    {c.telefono && (
                      <span className="text-muted-foreground">{c.telefono}</span>
                    )}
                  </div>
                  <div className="flex items-center justify-between mt-2 text-sm">
                    <span className="text-muted-foreground">
                      {c.total_presupuestos || 0} presupuestos
                    </span>
                    <span className="font-medium">{formatCurrency(c.facturacion_total || 0)}</span>
                  </div>
                </CardContent>
              </Link>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}

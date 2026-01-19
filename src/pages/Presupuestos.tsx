import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, MoreHorizontal, Eye, Edit, Copy, FileDown } from "lucide-react";
import { usePresupuestos, useUpdatePresupuesto } from "@/hooks/usePresupuestos";
import { formatCurrency, formatDate, getEstadoColor, getEstadoLabel } from "@/lib/formatters";
import { Skeleton } from "@/components/ui/skeleton";
import { useState } from "react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function Presupuestos() {
  const [busqueda, setBusqueda] = useState("");
  const [estadoFiltro, setEstadoFiltro] = useState<string>("todos");
  const { data: presupuestos, isLoading } = usePresupuestos({
    busqueda: busqueda || undefined,
    estado: estadoFiltro !== "todos" ? estadoFiltro : undefined
  });
  const updatePresupuesto = useUpdatePresupuesto();
  const { toast } = useToast();

  const cambiarEstado = async (id: string, estado: string) => {
    try {
      await updatePresupuesto.mutateAsync({ id, estado });
      toast({ title: "Estado actualizado" });
    } catch {
      toast({ title: "Error al actualizar", variant: "destructive" });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Presupuestos</h1>
        <Button asChild>
          <Link to="/presupuestos/nuevo">
            <Plus className="w-4 h-4 mr-2" />
            Nuevo Presupuesto
          </Link>
        </Button>
      </div>

      <div className="flex gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por número o cliente..."
            className="pl-10"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
        </div>
        <Select value={estadoFiltro} onValueChange={setEstadoFiltro}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Estado" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos</SelectItem>
            <SelectItem value="borrador">Borrador</SelectItem>
            <SelectItem value="enviado">Enviado</SelectItem>
            <SelectItem value="aceptado">Aceptado</SelectItem>
            <SelectItem value="rechazado">Rechazado</SelectItem>
            <SelectItem value="facturado">Facturado</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="border rounded-lg">
        <div className="grid grid-cols-[1fr_1fr_auto_auto_auto_auto] gap-4 p-4 border-b bg-muted/50 font-medium text-sm">
          <div>Nº Presupuesto</div>
          <div>Cliente</div>
          <div className="text-right">Total</div>
          <div>Estado</div>
          <div>Fecha</div>
          <div></div>
        </div>
        
        {isLoading ? (
          <div className="p-4 space-y-4">
            {[1,2,3,4,5].map(i => <Skeleton key={i} className="h-12 w-full" />)}
          </div>
        ) : presupuestos?.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">
            No hay presupuestos
          </div>
        ) : (
          presupuestos?.map((p) => (
            <div key={p.id} className="grid grid-cols-[1fr_1fr_auto_auto_auto_auto] gap-4 p-4 border-b last:border-0 items-center hover:bg-muted/30">
              <div className="font-mono text-sm">{p.numero}</div>
              <div className="font-medium truncate">{p.cliente_nombre}</div>
              <div className="text-right font-medium">{formatCurrency(p.total || 0)}</div>
              <div>
                <Badge variant="outline" className={getEstadoColor(p.estado || '')}>
                  {getEstadoLabel(p.estado || '')}
                </Badge>
              </div>
              <div className="text-sm text-muted-foreground">{formatDate(p.fecha_emision)}</div>
              <div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreHorizontal className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem asChild>
                      <Link to={`/presupuestos/${p.id}`}>
                        <Eye className="w-4 h-4 mr-2" /> Ver
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to={`/presupuestos/${p.id}/editar`}>
                        <Edit className="w-4 h-4 mr-2" /> Editar
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to={`/presupuestos/${p.id}/duplicar`}>
                        <Copy className="w-4 h-4 mr-2" /> Duplicar
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to={`/presupuestos/${p.id}`}>
                        <FileDown className="w-4 h-4 mr-2" /> PDF
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => cambiarEstado(p.id!, 'enviado')}>
                      Marcar como Enviado
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => cambiarEstado(p.id!, 'aceptado')}>
                      Marcar como Aceptado
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => cambiarEstado(p.id!, 'rechazado')}>
                      Marcar como Rechazado
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

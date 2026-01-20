import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, MoreHorizontal, Eye, FileDown } from "lucide-react";
import { useFacturas, useUpdateFactura } from "@/hooks/useFacturas";
import { formatCurrency, formatDate, getEstadoFacturaColor, getEstadoFacturaLabel } from "@/lib/formatters";
import { Skeleton } from "@/components/ui/skeleton";
import { useState } from "react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ExportFacturas } from "@/components/facturas/ExportFacturas";

export default function Facturas() {
  const currentYear = new Date().getFullYear();
  const [busqueda, setBusqueda] = useState("");
  const [estadoFiltro, setEstadoFiltro] = useState<string>("todos");
  const [añoFiltro, setAñoFiltro] = useState<number>(currentYear);
  const [mesFiltro, setMesFiltro] = useState<string>("todos");
  
  const { data: facturas, isLoading } = useFacturas({
    busqueda: busqueda || undefined,
    estado: estadoFiltro !== "todos" ? estadoFiltro : undefined,
    año: añoFiltro,
    mes: mesFiltro !== "todos" ? parseInt(mesFiltro) : undefined
  });
  const updateFactura = useUpdateFactura();
  const { toast } = useToast();

  const años = Array.from({ length: 10 }, (_, i) => currentYear - i);
  const meses = [
    { value: "1", label: "Enero" },
    { value: "2", label: "Febrero" },
    { value: "3", label: "Marzo" },
    { value: "4", label: "Abril" },
    { value: "5", label: "Mayo" },
    { value: "6", label: "Junio" },
    { value: "7", label: "Julio" },
    { value: "8", label: "Agosto" },
    { value: "9", label: "Septiembre" },
    { value: "10", label: "Octubre" },
    { value: "11", label: "Noviembre" },
    { value: "12", label: "Diciembre" },
  ];

  const cambiarEstado = async (id: string, estado: string) => {
    try {
      await updateFactura.mutateAsync({ id, estado });
      toast({ title: "Estado actualizado" });
    } catch {
      toast({ title: "Error al actualizar", variant: "destructive" });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Facturas</h1>
        <ExportFacturas />
      </div>

      <div className="flex flex-wrap gap-4">
        <div className="relative flex-1 min-w-[200px] max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por número o cliente..."
            className="pl-10"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
        </div>
        <Select value={añoFiltro.toString()} onValueChange={(v) => setAñoFiltro(parseInt(v))}>
          <SelectTrigger className="w-28">
            <SelectValue placeholder="Año" />
          </SelectTrigger>
          <SelectContent>
            {años.map((año) => (
              <SelectItem key={año} value={año.toString()}>{año}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={mesFiltro} onValueChange={setMesFiltro}>
          <SelectTrigger className="w-36">
            <SelectValue placeholder="Mes" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos los meses</SelectItem>
            {meses.map((mes) => (
              <SelectItem key={mes.value} value={mes.value}>{mes.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={estadoFiltro} onValueChange={setEstadoFiltro}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Estado" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos</SelectItem>
            <SelectItem value="emitida">Emitida</SelectItem>
            <SelectItem value="pagada">Pagada</SelectItem>
            <SelectItem value="vencida">Vencida</SelectItem>
            <SelectItem value="anulada">Anulada</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="border rounded-lg">
        <div className="grid grid-cols-[1fr_1fr_auto_auto_auto_auto] gap-4 p-4 border-b bg-muted/50 font-medium text-sm">
          <div>Nº Factura</div>
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
        ) : facturas?.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">
            No hay facturas
          </div>
        ) : (
          facturas?.map((f) => (
            <div key={f.id} className="grid grid-cols-[1fr_1fr_auto_auto_auto_auto] gap-4 p-4 border-b last:border-0 items-center hover:bg-muted/30">
              <div className="font-mono text-sm">{f.numero}</div>
              <div className="font-medium truncate">{f.cliente_nombre}</div>
              <div className="text-right font-medium">{formatCurrency(f.total || 0)}</div>
              <div>
                <Badge variant="outline" className={getEstadoFacturaColor(f.estado || '')}>
                  {getEstadoFacturaLabel(f.estado || '')}
                </Badge>
              </div>
              <div className="text-sm text-muted-foreground">{formatDate(f.fecha_emision)}</div>
              <div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreHorizontal className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem asChild>
                      <Link to={`/facturas/${f.id}`}>
                        <Eye className="w-4 h-4 mr-2" /> Ver
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to={`/facturas/${f.id}`}>
                        <FileDown className="w-4 h-4 mr-2" /> PDF
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => cambiarEstado(f.id!, 'pagada')}>
                      Marcar como Pagada
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => cambiarEstado(f.id!, 'vencida')}>
                      Marcar como Vencida
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => cambiarEstado(f.id!, 'anulada')}>
                      Marcar como Anulada
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

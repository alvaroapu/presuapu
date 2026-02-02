import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, Search, MoreHorizontal, Eye, Edit, Copy, FileDown, Receipt, Trash2 } from "lucide-react";
import { usePresupuestos, useUpdatePresupuesto, useDeletePresupuesto } from "@/hooks/usePresupuestos";
import { useConvertirPresupuestoAFactura } from "@/hooks/useFacturas";
import { formatCurrency, formatDate, getEstadoColor, getEstadoLabel } from "@/lib/formatters";
import { Skeleton } from "@/components/ui/skeleton";
import { useState } from "react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function Presupuestos() {
  const currentYear = new Date().getFullYear();
  const [busqueda, setBusqueda] = useState("");
  const [estadoFiltro, setEstadoFiltro] = useState<string>("todos");
  const [añoFiltro, setAñoFiltro] = useState<number>(currentYear);
  const [mesFiltro, setMesFiltro] = useState<string>("todos");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  
  const { data: presupuestos, isLoading } = usePresupuestos({
    busqueda: busqueda || undefined,
    estado: estadoFiltro !== "todos" ? estadoFiltro : undefined,
    año: añoFiltro,
    mes: mesFiltro !== "todos" ? parseInt(mesFiltro) : undefined
  });
  const updatePresupuesto = useUpdatePresupuesto();
  const deletePresupuesto = useDeletePresupuesto();
  const convertirAFactura = useConvertirPresupuestoAFactura();
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
      await updatePresupuesto.mutateAsync({ id, estado });
      toast({ title: "Estado actualizado" });
    } catch {
      toast({ title: "Error al actualizar", variant: "destructive" });
    }
  };

  const handleConvertirAFactura = async (id: string) => {
    try {
      const factura = await convertirAFactura.mutateAsync({ presupuestoId: id });
      toast({ title: `Factura ${factura.numero} creada correctamente` });
    } catch {
      toast({ title: "Error al crear factura", variant: "destructive" });
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deletePresupuesto.mutateAsync(deleteId);
      toast({ title: "Presupuesto eliminado" });
      setDeleteId(null);
    } catch {
      toast({ title: "Error al eliminar", variant: "destructive" });
    }
  };

  return (
    <>
      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar presupuesto?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Se eliminarán el presupuesto y todas sus líneas.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <div className="space-y-4 md:space-y-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h1 className="text-2xl md:text-3xl font-bold">Presupuestos</h1>
          <Button asChild size="sm" className="w-full sm:w-auto">
            <Link to="/presupuestos/nuevo">
              <Plus className="w-4 h-4 mr-2" />
              Nuevo Presupuesto
            </Link>
          </Button>
        </div>

        {/* Filters */}
        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:gap-4">
          <div className="relative flex-1 min-w-0 sm:min-w-[200px] sm:max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Buscar..."
              className="pl-10"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            <Select value={añoFiltro.toString()} onValueChange={(v) => setAñoFiltro(parseInt(v))}>
              <SelectTrigger className="w-24">
                <SelectValue placeholder="Año" />
              </SelectTrigger>
              <SelectContent>
                {años.map((año) => (
                  <SelectItem key={año} value={año.toString()}>{año}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={mesFiltro} onValueChange={setMesFiltro}>
              <SelectTrigger className="w-28 sm:w-36">
                <SelectValue placeholder="Mes" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos</SelectItem>
                {meses.map((mes) => (
                  <SelectItem key={mes.value} value={mes.value}>{mes.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={estadoFiltro} onValueChange={setEstadoFiltro}>
              <SelectTrigger className="w-28 sm:w-40">
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
        </div>

        {/* Desktop Table */}
        <div className="border rounded-lg overflow-x-auto hidden md:block">
          <div className="grid grid-cols-[140px_1fr_100px_110px_100px_48px] gap-4 p-4 border-b bg-muted/50 font-medium text-sm min-w-[700px]">
            <div>Nº Presupuesto</div>
            <div>Cliente</div>
            <div className="text-right">Total</div>
            <div className="text-center">Estado</div>
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
              <div key={p.id} className="grid grid-cols-[140px_1fr_100px_110px_100px_48px] gap-4 p-4 border-b last:border-0 items-center hover:bg-muted/30 min-w-[700px]">
                <div className="font-mono text-sm">{p.numero}</div>
                <div className="font-medium truncate">{p.cliente_nombre}</div>
                <div className="text-right font-medium">{formatCurrency(p.total || 0)}</div>
                <div className="text-center">
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
                      {p.estado !== 'facturado' && p.estado !== 'cancelado' && (
                        <>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            onClick={() => handleConvertirAFactura(p.id!)}
                            disabled={convertirAFactura.isPending}
                          >
                            <Receipt className="w-4 h-4 mr-2" /> 
                            {convertirAFactura.isPending ? 'Creando...' : 'Convertir a Factura'}
                          </DropdownMenuItem>
                        </>
                      )}
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
                      <DropdownMenuSeparator />
                      <DropdownMenuItem 
                        onClick={() => setDeleteId(p.id!)}
                        className="text-destructive focus:text-destructive"
                      >
                        <Trash2 className="w-4 h-4 mr-2" /> Eliminar
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Mobile Cards */}
        <div className="space-y-3 md:hidden">
          {isLoading ? (
            <div className="space-y-3">
              {[1,2,3].map(i => <Skeleton key={i} className="h-24 w-full" />)}
            </div>
          ) : presupuestos?.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground border rounded-lg">
              No hay presupuestos
            </div>
          ) : (
            presupuestos?.map((p) => (
              <Card key={p.id} className="overflow-hidden">
                <CardContent className="p-3">
                  <div className="flex items-start justify-between gap-2">
                    <Link to={`/presupuestos/${p.id}`} className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-mono text-xs">{p.numero}</span>
                        <Badge variant="outline" className={`text-xs ${getEstadoColor(p.estado || '')}`}>
                          {getEstadoLabel(p.estado || '')}
                        </Badge>
                      </div>
                      <p className="font-medium truncate">{p.cliente_nombre}</p>
                      <div className="flex items-center gap-3 mt-1 text-sm">
                        <span className="font-semibold">{formatCurrency(p.total || 0)}</span>
                        <span className="text-muted-foreground text-xs">{formatDate(p.fecha_emision)}</span>
                      </div>
                    </Link>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="shrink-0">
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
                        {p.estado !== 'facturado' && p.estado !== 'cancelado' && (
                          <>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => handleConvertirAFactura(p.id!)}>
                              <Receipt className="w-4 h-4 mr-2" /> Facturar
                            </DropdownMenuItem>
                          </>
                        )}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => cambiarEstado(p.id!, 'aceptado')}>
                          Aceptar
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => cambiarEstado(p.id!, 'rechazado')}>
                          Rechazar
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          onClick={() => setDeleteId(p.id!)}
                          className="text-destructive focus:text-destructive"
                        >
                          <Trash2 className="w-4 h-4 mr-2" /> Eliminar
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </>
  );
}

import { useState } from "react";
import { useStockUbicaciones, useStockProductos } from "@/hooks/useStock";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CreateUbicacionDialog } from "@/components/stock/CreateUbicacionDialog";
import { EditUbicacionDialog } from "@/components/stock/EditUbicacionDialog";
import { AddStockProductoDialog } from "@/components/stock/AddStockProductoDialog";
import { EditStockProductoDialog } from "@/components/stock/EditStockProductoDialog";
import { ListaCompra } from "@/components/stock/ListaCompra";
import { TelegramConfigDialog } from "@/components/stock/TelegramConfigDialog";
import { RegistrarCompraDialog } from "@/components/stock/RegistrarCompraDialog";
import { ResumenGastos } from "@/components/stock/HistorialCompras";
import type { StockUbicacion } from "@/hooks/useStock";
import {
  Warehouse,
  Cog,
  FolderOpen,
  Search,
  Pencil,
  AlertTriangle,
  Copy,
} from "lucide-react";
import { useCreateStockProducto } from "@/hooks/useStock";
import { useToast } from "@/hooks/use-toast";

export default function Stock() {
  const { data: ubicaciones, isLoading: loadingUbicaciones } = useStockUbicaciones();
  const { data: productos, isLoading: loadingProductos } = useStockProductos();
  const [search, setSearch] = useState("");
  const [editingUbicacion, setEditingUbicacion] = useState<StockUbicacion | null>(null);
  const [editingProducto, setEditingProducto] = useState<any>(null);
  const [activeTab, setActiveTab] = useState("todos");
  const createProducto = useCreateStockProducto();
  const { toast } = useToast();

  const handleDuplicate = async (p: any) => {
    try {
      await createProducto.mutateAsync({
        nombre: p.nombre + " (copia)",
        codigo: p.codigo ? p.codigo + "-copia" : null,
        descripcion: p.descripcion || null,
        cantidad: p.cantidad,
        unidad: p.unidad,
        cantidad_minima: p.cantidad_minima || 0,
        precio_unitario: p.precio_unitario || 0,
        proveedor: p.proveedor || null,
        ubicacion_id: p.ubicacion_id,
        notas: p.notas || null,
      });
      toast({ title: "Producto duplicado correctamente" });
    } catch {
      toast({ title: "Error al duplicar", variant: "destructive" });
    }
  };

  const maquinas = ubicaciones?.filter((u) => u.tipo === "maquina") || [];
  const apartados = ubicaciones?.filter((u) => u.tipo === "apartado") || [];

  const filteredProductos = productos?.filter((p: any) => {
    const matchesSearch =
      !search ||
      p.nombre.toLowerCase().includes(search.toLowerCase()) ||
      (p.codigo && p.codigo.toLowerCase().includes(search.toLowerCase()));

    if (activeTab === "todos") return matchesSearch;
    return matchesSearch && p.ubicacion_id === activeTab;
  });

  const getProductosForUbicacion = (ubicacionId: string) =>
    productos?.filter((p: any) => p.ubicacion_id === ubicacionId) || [];

  if (loadingUbicaciones || loadingProductos) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Stock Interno</h1>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-32 w-full" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Warehouse className="w-8 h-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold">Stock Interno</h1>
            <p className="text-muted-foreground text-sm">
              Gestión de productos por máquina y apartado
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <TelegramConfigDialog />
          <RegistrarCompraDialog />
          <AddStockProductoDialog />
          <CreateUbicacionDialog />
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Ubicaciones
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{ubicaciones?.length || 0}</div>
            <p className="text-xs text-muted-foreground">
              {maquinas.length} máquinas, {apartados.length} apartados
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Productos en Stock
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{productos?.length || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-1">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              Stock Bajo
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600">
              {productos?.filter(
                (p: any) =>
                  p.cantidad_minima && p.cantidad <= p.cantidad_minima
              ).length || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Productos bajo mínimo
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Lista de Compra */}
      <ListaCompra />

      {/* Facturación Interna */}
      <ResumenGastos />

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Buscar producto..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Tabs by ubicacion */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="flex-wrap h-auto gap-1">
          <TabsTrigger value="todos">Todos</TabsTrigger>
          {ubicaciones?.map((u) => (
            <TabsTrigger key={u.id} value={u.id} className="gap-1.5">
              {u.tipo === "maquina" ? (
                <Cog className="w-3.5 h-3.5" />
              ) : (
                <FolderOpen className="w-3.5 h-3.5" />
              )}
              {u.nombre}
              <Badge variant="secondary" className="ml-1 text-xs px-1.5 py-0">
                {getProductosForUbicacion(u.id).length}
              </Badge>
            </TabsTrigger>
          ))}
        </TabsList>

        {/* All products view */}
        <TabsContent value="todos" className="mt-4">
          <ProductosTable
            productos={filteredProductos || []}
            showUbicacion
            onEdit={setEditingProducto}
            onDuplicate={handleDuplicate}
          />
        </TabsContent>

        {/* Per-ubicacion views */}
        {ubicaciones?.map((u) => (
          <TabsContent key={u.id} value={u.id} className="mt-4 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Badge variant={u.tipo === "maquina" ? "default" : "secondary"}>
                  {u.tipo === "maquina" ? "Máquina" : "Apartado"}
                </Badge>
                {u.descripcion && (
                  <span className="text-sm text-muted-foreground">
                    {u.descripcion}
                  </span>
                )}
              </div>
              <div className="flex gap-2">
                <AddStockProductoDialog preselectedUbicacionId={u.id} />
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setEditingUbicacion(u)}
                >
                  <Pencil className="w-4 h-4 mr-1" />
                  Editar Ubicación
                </Button>
              </div>
            </div>
            <ProductosTable
              productos={filteredProductos || []}
              onEdit={setEditingProducto}
              onDuplicate={handleDuplicate}
            />
          </TabsContent>
        ))}
      </Tabs>

      {/* Edit dialogs */}
      {editingUbicacion && (
        <EditUbicacionDialog
          ubicacion={editingUbicacion}
          open={!!editingUbicacion}
          onOpenChange={(open) => !open && setEditingUbicacion(null)}
        />
      )}
      {editingProducto && (
        <EditStockProductoDialog
          producto={editingProducto}
          open={!!editingProducto}
          onOpenChange={(open) => !open && setEditingProducto(null)}
        />
      )}
    </div>
  );
}

function ProductosTable({
  productos,
  showUbicacion = false,
  onEdit,
  onDuplicate,
}: {
  productos: any[];
  showUbicacion?: boolean;
  onEdit: (p: any) => void;
  onDuplicate: (p: any) => void;
}) {
  if (!productos.length) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">
          No hay productos en esta ubicación.
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b text-left text-sm text-muted-foreground">
              <th className="p-3 font-medium">Producto</th>
              <th className="p-3 font-medium">Código</th>
              {showUbicacion && <th className="p-3 font-medium">Ubicación</th>}
              <th className="p-3 font-medium text-right">Cantidad</th>
              <th className="p-3 font-medium">Unidad</th>
              <th className="p-3 font-medium text-right">Mín.</th>
              <th className="p-3 font-medium text-right">Precio</th>
              <th className="p-3 font-medium">Estado</th>
              <th className="p-3 font-medium"></th>
            </tr>
          </thead>
          <tbody>
            {productos.map((p: any) => {
              const isLow =
                p.cantidad_minima && p.cantidad <= p.cantidad_minima;
              const ubicacion = p.stock_ubicaciones;

              return (
                <tr
                  key={p.id}
                  className="border-b hover:bg-muted/50 cursor-pointer"
                  onClick={() => onEdit(p)}
                >
                  <td className="p-3">
                    <div className="font-medium">{p.nombre}</div>
                    {p.descripcion && (
                      <div className="text-xs text-muted-foreground">
                        {p.descripcion}
                      </div>
                    )}
                  </td>
                  <td className="p-3 text-sm text-muted-foreground">
                    {p.codigo || "—"}
                  </td>
                  {showUbicacion && (
                    <td className="p-3">
                      <div className="flex items-center gap-1.5">
                        {ubicacion?.tipo === "maquina" ? (
                          <Cog className="w-3.5 h-3.5 text-muted-foreground" />
                        ) : (
                          <FolderOpen className="w-3.5 h-3.5 text-muted-foreground" />
                        )}
                        <span className="text-sm">{ubicacion?.nombre}</span>
                      </div>
                    </td>
                  )}
                  <td className="p-3 text-right font-medium tabular-nums">
                    {p.cantidad}
                  </td>
                  <td className="p-3 text-sm text-muted-foreground">
                    {p.unidad}
                  </td>
                  <td className="p-3 text-right text-sm text-muted-foreground tabular-nums">
                    {p.cantidad_minima || "—"}
                  </td>
                  <td className="p-3 text-right text-sm tabular-nums">
                    {p.precio_unitario ? `${Number(p.precio_unitario).toFixed(2)} €` : "—"}
                  </td>
                  <td className="p-3">
                    {isLow ? (
                      <Badge variant="destructive" className="text-xs">
                        Bajo
                      </Badge>
                    ) : (
                      <Badge
                        variant="secondary"
                        className="text-xs bg-green-100 text-green-800"
                      >
                        OK
                      </Badge>
                    )}
                  </td>
                  <td className="p-3">
                    <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
                      <RegistrarCompraDialog
                        preselectedProductoId={p.id}
                        preselectedProductoNombre={p.nombre}
                      />
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => onDuplicate(p)}
                        title="Duplicar producto"
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => onEdit(p)}
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

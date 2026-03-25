import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useStockComprasResumen, useDeleteStockCompra } from "@/hooks/useStockCompras";
import { useToast } from "@/hooks/use-toast";
import { Receipt, TrendingUp, Trash2, Euro, ShoppingCart, CalendarDays } from "lucide-react";

export function ResumenGastos() {
  const { data: resumen, isLoading } = useStockComprasResumen();
  const [detailProductoId, setDetailProductoId] = useState<string | null>(null);
  const deleteCompra = useDeleteStockCompra();
  const { toast } = useToast();

  if (isLoading) {
    return <Skeleton className="h-32 w-full" />;
  }

  if (!resumen || resumen.totalCompras === 0) {
    return null;
  }

  const productosOrdenados = Object.entries(resumen.porProducto)
    .sort(([, a], [, b]) => b.totalGastado - a.totalGastado);

  const detailProducto = detailProductoId ? resumen.porProducto[detailProductoId] : null;
  const detailCompras = detailProductoId
    ? resumen.compras.filter((c) => c.stock_producto_id === detailProductoId)
    : [];

  const handleDeleteCompra = async (id: string) => {
    if (!confirm("¿Eliminar este registro de compra?")) return;
    try {
      await deleteCompra.mutateAsync(id);
      toast({ title: "Registro eliminado" });
    } catch {
      toast({ title: "Error al eliminar", variant: "destructive" });
    }
  };

  return (
    <>
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Receipt className="w-5 h-5 text-primary" />
            Facturación Interna {resumen.year}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Summary row */}
          <div className="grid gap-3 grid-cols-2 md:grid-cols-3">
            <div className="p-3 bg-muted rounded-lg">
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1">
                <Euro className="w-3.5 h-3.5" />
                Total gastado
              </div>
              <div className="text-xl font-bold">{resumen.totalGastado.toFixed(2)} €</div>
            </div>
            <div className="p-3 bg-muted rounded-lg">
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1">
                <ShoppingCart className="w-3.5 h-3.5" />
                Compras realizadas
              </div>
              <div className="text-xl font-bold">{resumen.totalCompras}</div>
            </div>
            <div className="p-3 bg-muted rounded-lg">
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1">
                <TrendingUp className="w-3.5 h-3.5" />
                Media por compra
              </div>
              <div className="text-xl font-bold">
                {resumen.totalCompras > 0
                  ? (resumen.totalGastado / resumen.totalCompras).toFixed(2)
                  : "0.00"} €
              </div>
            </div>
          </div>

          {/* Per product breakdown */}
          {productosOrdenados.length > 0 && (
            <div className="space-y-1">
              <h4 className="text-sm font-medium text-muted-foreground mb-2">
                Gasto por producto
              </h4>
              <div className="space-y-1">
                {productosOrdenados.map(([id, prod]) => (
                  <div
                    key={id}
                    className="flex items-center justify-between p-2 rounded hover:bg-muted/50 cursor-pointer"
                    onClick={() => setDetailProductoId(id)}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">{prod.nombre}</span>
                      <Badge variant="secondary" className="text-xs">
                        {prod.compras} {prod.compras === 1 ? "compra" : "compras"}
                      </Badge>
                    </div>
                    <div className="text-sm font-medium tabular-nums">
                      {prod.totalGastado.toFixed(2)} €
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Detail dialog for a specific product */}
      {detailProducto && (
        <Dialog open={!!detailProductoId} onOpenChange={(open) => !open && setDetailProductoId(null)}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Compras de {detailProducto.nombre}</DialogTitle>
            </DialogHeader>
            <div className="space-y-3">
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="p-2 bg-muted rounded">
                  <div className="text-xs text-muted-foreground">Total gastado</div>
                  <div className="font-bold">{detailProducto.totalGastado.toFixed(2)} €</div>
                </div>
                <div className="p-2 bg-muted rounded">
                  <div className="text-xs text-muted-foreground">Compras</div>
                  <div className="font-bold">{detailProducto.compras}</div>
                </div>
                <div className="p-2 bg-muted rounded">
                  <div className="text-xs text-muted-foreground">Total comprado</div>
                  <div className="font-bold">{detailProducto.totalCantidad} {detailProducto.unidad}</div>
                </div>
              </div>

              <div className="max-h-64 overflow-y-auto space-y-2">
                {detailCompras.map((c) => (
                  <div
                    key={c.id}
                    className="flex items-center justify-between p-2 border rounded text-sm"
                  >
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <CalendarDays className="w-3.5 h-3.5 text-muted-foreground" />
                        <span>{new Date(c.fecha).toLocaleDateString('es-ES')}</span>
                        {c.proveedor && (
                          <Badge variant="outline" className="text-xs">
                            {c.proveedor}
                          </Badge>
                        )}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {c.cantidad} {detailProducto.unidad} x {c.precio_unitario.toFixed(2)} €
                        {c.notas && ` — ${c.notas}`}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium tabular-nums">{c.precio_total.toFixed(2)} €</span>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive"
                        onClick={() => handleDeleteCompra(c.id)}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}

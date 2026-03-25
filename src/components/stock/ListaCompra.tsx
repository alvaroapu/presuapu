import { useListaCompra, useMarcarComprado, useLimpiarListaCompra, useDeleteListaCompraItem } from "@/hooks/useListaCompra";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ShoppingCart, Check, Trash2, CheckCheck } from "lucide-react";

export function ListaCompra() {
  const { data: items, isLoading } = useListaCompra(true);
  const marcarComprado = useMarcarComprado();
  const limpiarLista = useLimpiarListaCompra();
  const deleteItem = useDeleteListaCompraItem();

  if (isLoading) {
    return <Skeleton className="h-48 w-full" />;
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShoppingCart className="w-5 h-5 text-primary" />
            <CardTitle className="text-lg">Lista de Compra</CardTitle>
            {items?.length ? (
              <Badge variant="secondary">{items.length}</Badge>
            ) : null}
          </div>
          {items && items.length > 0 && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => limpiarLista.mutate()}
              disabled={limpiarLista.isPending}
            >
              <CheckCheck className="w-4 h-4 mr-1" />
              Marcar todo comprado
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {!items?.length ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            No hay productos pendientes de compra.
          </p>
        ) : (
          <div className="space-y-2">
            {items.map((item: any) => (
              <div
                key={item.id}
                className="flex items-center justify-between rounded-lg border p-3 hover:bg-muted/50"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm">{item.producto_nombre}</span>
                    {item.cantidad_actual === 0 ? (
                      <Badge variant="destructive" className="text-xs">Agotado</Badge>
                    ) : (
                      <Badge className="text-xs bg-amber-100 text-amber-800">Bajo</Badge>
                    )}
                  </div>
                  <div className="text-xs text-muted-foreground mt-0.5">
                    {item.cantidad_actual}/{item.cantidad_minima} {item.unidad}
                    {item.ubicacion_nombre && ` — ${item.ubicacion_nombre}`}
                  </div>
                </div>
                <div className="flex gap-1 shrink-0">
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8 text-green-600 hover:text-green-700 hover:bg-green-50"
                    onClick={() => marcarComprado.mutate(item.id)}
                    title="Marcar como comprado"
                  >
                    <Check className="w-4 h-4" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8 text-muted-foreground hover:text-destructive"
                    onClick={() => deleteItem.mutate(item.id)}
                    title="Eliminar"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

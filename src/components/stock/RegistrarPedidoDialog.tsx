import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ClipboardList, Plus, Trash2 } from "lucide-react";
import { useStockProductos } from "@/hooks/useStock";
import { useCreateStockPedido } from "@/hooks/useStockCompras";
import { useToast } from "@/hooks/use-toast";

interface PedidoItem {
  stock_producto_id: string;
  nombre: string;
  unidad: string;
  cantidad: string;
  precio_unitario: string;
}

export function RegistrarPedidoDialog() {
  const [open, setOpen] = useState(false);
  const [fecha, setFecha] = useState(new Date().toISOString().split("T")[0]);
  const [proveedor, setProveedor] = useState("");
  const [notas, setNotas] = useState("");
  const [items, setItems] = useState<PedidoItem[]>([]);
  const [productoSeleccionado, setProductoSeleccionado] = useState("");

  const { data: productos } = useStockProductos();
  const createPedido = useCreateStockPedido();
  const { toast } = useToast();

  const productosDisponibles = productos?.filter(
    (p: any) => !items.some((i) => i.stock_producto_id === p.id)
  );

  const addItem = (productoId: string) => {
    const prod = productos?.find((p: any) => p.id === productoId);
    if (!prod) return;
    setItems((prev) => [
      ...prev,
      {
        stock_producto_id: prod.id,
        nombre: prod.nombre,
        unidad: prod.unidad,
        cantidad: "",
        precio_unitario: prod.precio_unitario > 0 ? String(prod.precio_unitario) : "",
      },
    ]);
    setProductoSeleccionado("");
  };

  const removeItem = (id: string) => {
    setItems((prev) => prev.filter((i) => i.stock_producto_id !== id));
  };

  const updateItem = (id: string, field: "cantidad" | "precio_unitario", value: string) => {
    setItems((prev) =>
      prev.map((i) => (i.stock_producto_id === id ? { ...i, [field]: value } : i))
    );
  };

  const total = items.reduce((sum, i) => {
    return sum + (Number(i.cantidad) || 0) * (Number(i.precio_unitario) || 0);
  }, 0);

  const canSubmit =
    items.length > 0 && items.every((i) => Number(i.cantidad) > 0);

  const resetForm = () => {
    setFecha(new Date().toISOString().split("T")[0]);
    setProveedor("");
    setNotas("");
    setItems([]);
    setProductoSeleccionado("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;

    try {
      await createPedido.mutateAsync({
        items: items.map((i) => ({
          stock_producto_id: i.stock_producto_id,
          cantidad: Number(i.cantidad),
          precio_unitario: Number(i.precio_unitario) || 0,
          precio_total: (Number(i.cantidad) || 0) * (Number(i.precio_unitario) || 0),
          proveedor: proveedor.trim() || null,
          notas: notas.trim() || null,
          fecha,
        })),
      });
      toast({
        title: "Pedido registrado",
        description: `Se registraron ${items.length} producto${items.length !== 1 ? "s" : ""} en el stock`,
      });
      resetForm();
      setOpen(false);
    } catch {
      toast({ title: "Error al registrar el pedido", variant: "destructive" });
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) resetForm(); }}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline">
          <ClipboardList className="w-4 h-4 mr-2" />
          Registrar Pedido
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Registrar Pedido</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Shared fields */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Fecha del pedido</Label>
              <Input
                type="date"
                value={fecha}
                onChange={(e) => setFecha(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Proveedor</Label>
              <Input
                value={proveedor}
                onChange={(e) => setProveedor(e.target.value)}
                placeholder="Nombre del proveedor"
              />
            </div>
          </div>

          {/* Product selector */}
          <div className="space-y-2">
            <Label>Añadir producto al pedido</Label>
            <div className="flex gap-2">
              <Select value={productoSeleccionado} onValueChange={setProductoSeleccionado}>
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder="Seleccionar producto..." />
                </SelectTrigger>
                <SelectContent>
                  {productosDisponibles?.map((p: any) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.nombre} {p.codigo ? `(${p.codigo})` : ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                type="button"
                size="sm"
                onClick={() => productoSeleccionado && addItem(productoSeleccionado)}
                disabled={!productoSeleccionado}
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Items table */}
          {items.length > 0 && (
            <div className="border rounded-lg overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="p-2 text-left font-medium">Producto</th>
                    <th className="p-2 text-right font-medium w-28">Cantidad</th>
                    <th className="p-2 text-right font-medium w-32">Precio unit.</th>
                    <th className="p-2 text-right font-medium w-24">Total</th>
                    <th className="p-2 w-10"></th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item) => {
                    const lineTotal =
                      (Number(item.cantidad) || 0) * (Number(item.precio_unitario) || 0);
                    return (
                      <tr key={item.stock_producto_id} className="border-t">
                        <td className="p-2">
                          <div className="font-medium">{item.nombre}</div>
                          <div className="text-xs text-muted-foreground">{item.unidad}</div>
                        </td>
                        <td className="p-2">
                          <Input
                            type="number"
                            step="any"
                            min="0"
                            value={item.cantidad}
                            onChange={(e) =>
                              updateItem(item.stock_producto_id, "cantidad", e.target.value)
                            }
                            className="text-right h-8"
                            placeholder="0"
                          />
                        </td>
                        <td className="p-2">
                          <Input
                            type="number"
                            step="any"
                            min="0"
                            value={item.precio_unitario}
                            onChange={(e) =>
                              updateItem(
                                item.stock_producto_id,
                                "precio_unitario",
                                e.target.value
                              )
                            }
                            className="text-right h-8"
                            placeholder="0.00 €"
                          />
                        </td>
                        <td className="p-2 text-right tabular-nums">
                          {lineTotal > 0 ? `${lineTotal.toFixed(2)} €` : "—"}
                        </td>
                        <td className="p-2">
                          <Button
                            type="button"
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8"
                            onClick={() => removeItem(item.stock_producto_id)}
                          >
                            <Trash2 className="w-4 h-4 text-destructive" />
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {items.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-4">
              Añade productos al pedido usando el selector de arriba.
            </p>
          )}

          {/* Total */}
          {total > 0 && (
            <div className="p-3 bg-blue-50 dark:bg-blue-950 rounded-lg flex items-center justify-between">
              <span className="text-sm font-medium">Total del pedido:</span>
              <span className="text-lg font-bold text-blue-700 dark:text-blue-300">
                {total.toFixed(2)} €
              </span>
            </div>
          )}

          <div className="space-y-2">
            <Label>Notas</Label>
            <Textarea
              value={notas}
              onChange={(e) => setNotas(e.target.value)}
              rows={2}
              placeholder="Notas sobre este pedido..."
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={!canSubmit || createPedido.isPending}>
              {createPedido.isPending
                ? "Registrando..."
                : `Registrar Pedido${items.length > 0 ? ` (${items.length})` : ""}`}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

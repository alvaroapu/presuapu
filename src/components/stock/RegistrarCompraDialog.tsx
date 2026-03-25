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
import { ShoppingCart } from "lucide-react";
import { useStockProductos } from "@/hooks/useStock";
import { useCreateStockCompra } from "@/hooks/useStockCompras";
import { useToast } from "@/hooks/use-toast";

interface Props {
  preselectedProductoId?: string;
  preselectedProductoNombre?: string;
}

export function RegistrarCompraDialog({ preselectedProductoId, preselectedProductoNombre }: Props) {
  const [open, setOpen] = useState(false);
  const [productoId, setProductoId] = useState(preselectedProductoId || "");
  const [cantidad, setCantidad] = useState("");
  const [precioUnitario, setPrecioUnitario] = useState("");
  const [proveedor, setProveedor] = useState("");
  const [fecha, setFecha] = useState(new Date().toISOString().split("T")[0]);
  const [notas, setNotas] = useState("");

  const { data: productos } = useStockProductos();
  const createCompra = useCreateStockCompra();
  const { toast } = useToast();

  const selectedProducto = productos?.find((p: any) => p.id === productoId);
  const precioTotal = (Number(cantidad) || 0) * (Number(precioUnitario) || 0);

  const resetForm = () => {
    setProductoId(preselectedProductoId || "");
    setCantidad("");
    setPrecioUnitario("");
    setProveedor("");
    setFecha(new Date().toISOString().split("T")[0]);
    setNotas("");
  };

  const handleOpen = (isOpen: boolean) => {
    setOpen(isOpen);
    if (isOpen && preselectedProductoId) {
      setProductoId(preselectedProductoId);
      // Pre-fill price from product if available
      const prod = productos?.find((p: any) => p.id === preselectedProductoId);
      if (prod && (prod as any).precio_unitario > 0) {
        setPrecioUnitario(String((prod as any).precio_unitario));
      }
      if (prod && (prod as any).proveedor) {
        setProveedor((prod as any).proveedor);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!productoId || !cantidad || Number(cantidad) <= 0) return;

    try {
      await createCompra.mutateAsync({
        stock_producto_id: productoId,
        cantidad: Number(cantidad),
        precio_unitario: Number(precioUnitario) || 0,
        precio_total: precioTotal,
        proveedor: proveedor.trim() || null,
        fecha,
        notas: notas.trim() || null,
      });
      toast({
        title: "Compra registrada",
        description: `Se añadieron ${cantidad} ${selectedProducto?.unidad || 'unidades'} al stock`,
      });
      resetForm();
      setOpen(false);
    } catch {
      toast({ title: "Error al registrar compra", variant: "destructive" });
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline">
          <ShoppingCart className="w-4 h-4 mr-2" />
          {preselectedProductoId ? "Registrar Compra" : "Registrar Compra"}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Registrar Compra de Stock</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {!preselectedProductoId ? (
            <div className="space-y-2">
              <Label>Producto *</Label>
              <Select value={productoId} onValueChange={(val) => {
                setProductoId(val);
                const prod = productos?.find((p: any) => p.id === val);
                if (prod && (prod as any).precio_unitario > 0) {
                  setPrecioUnitario(String((prod as any).precio_unitario));
                }
                if (prod && (prod as any).proveedor) {
                  setProveedor((prod as any).proveedor);
                }
              }}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar producto..." />
                </SelectTrigger>
                <SelectContent>
                  {productos?.map((p: any) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.nombre} {p.codigo ? `(${p.codigo})` : ''}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ) : (
            <div className="p-3 bg-muted rounded-lg">
              <span className="text-sm text-muted-foreground">Producto:</span>{" "}
              <span className="font-medium">{preselectedProductoNombre}</span>
            </div>
          )}

          <div className="grid gap-4 grid-cols-2">
            <div className="space-y-2">
              <Label>Cantidad comprada *</Label>
              <Input
                type="number"
                step="any"
                min="0"
                value={cantidad}
                onChange={(e) => setCantidad(e.target.value)}
                placeholder="0"
                autoFocus
              />
              {selectedProducto && (
                <p className="text-xs text-muted-foreground">
                  Stock actual: {selectedProducto.cantidad} {selectedProducto.unidad}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label>Precio unitario</Label>
              <Input
                type="number"
                step="any"
                min="0"
                value={precioUnitario}
                onChange={(e) => setPrecioUnitario(e.target.value)}
                placeholder="0.00 €"
              />
            </div>
            <div className="space-y-2">
              <Label>Fecha de compra</Label>
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

          {precioTotal > 0 && (
            <div className="p-3 bg-blue-50 dark:bg-blue-950 rounded-lg flex items-center justify-between">
              <span className="text-sm font-medium">Total de la compra:</span>
              <span className="text-lg font-bold text-blue-700 dark:text-blue-300">
                {precioTotal.toFixed(2)} €
              </span>
            </div>
          )}

          <div className="space-y-2">
            <Label>Notas</Label>
            <Textarea
              value={notas}
              onChange={(e) => setNotas(e.target.value)}
              rows={2}
              placeholder="Notas sobre esta compra..."
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={!productoId || !cantidad || Number(cantidad) <= 0 || createCompra.isPending}
            >
              {createCompra.isPending ? "Registrando..." : "Registrar Compra"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

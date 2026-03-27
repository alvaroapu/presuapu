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
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useUpdateStockProducto, useDeleteStockProducto, useCreateStockProducto, useStockUbicaciones } from "@/hooks/useStock";
import { useToast } from "@/hooks/use-toast";
import { Copy } from "lucide-react";

interface StockProductoRow {
  id: string;
  nombre: string;
  codigo: string | null;
  descripcion: string | null;
  cantidad: number;
  unidad: string;
  cantidad_minima: number | null;
  precio_unitario: number | null;
  proveedor: string | null;
  ubicacion_id: string;
  notas: string | null;
}

interface Props {
  producto: StockProductoRow;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditStockProductoDialog({ producto, open, onOpenChange }: Props) {
  const [nombre, setNombre] = useState(producto.nombre);
  const [codigo, setCodigo] = useState(producto.codigo || "");
  const [descripcion, setDescripcion] = useState(producto.descripcion || "");
  const [cantidad, setCantidad] = useState(String(producto.cantidad));
  const [unidad, setUnidad] = useState(producto.unidad);
  const [cantidadMinima, setCantidadMinima] = useState(String(producto.cantidad_minima || 0));
  const [precioUnitario, setPrecioUnitario] = useState(String(producto.precio_unitario || 0));
  const [proveedor, setProveedor] = useState(producto.proveedor || "");
  const [ubicacionId, setUbicacionId] = useState(producto.ubicacion_id);
  const [notas, setNotas] = useState(producto.notas || "");

  const { data: ubicaciones } = useStockUbicaciones();
  const updateProducto = useUpdateStockProducto();
  const deleteProducto = useDeleteStockProducto();
  const createProducto = useCreateStockProducto();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre.trim()) return;

    try {
      await updateProducto.mutateAsync({
        id: producto.id,
        nombre: nombre.trim(),
        codigo: codigo.trim() || null,
        descripcion: descripcion.trim() || null,
        cantidad: Number(cantidad) || 0,
        unidad,
        cantidad_minima: Number(cantidadMinima) || 0,
        precio_unitario: Number(precioUnitario) || 0,
        proveedor: proveedor.trim() || null,
        ubicacion_id: ubicacionId,
        notas: notas.trim() || null,
      });
      toast({ title: "Producto actualizado" });
      onOpenChange(false);
    } catch {
      toast({ title: "Error al actualizar", variant: "destructive" });
    }
  };

  const handleDelete = async () => {
    if (!confirm("¿Eliminar este producto del stock?")) return;
    try {
      await deleteProducto.mutateAsync(producto.id);
      toast({ title: "Producto eliminado del stock" });
      onOpenChange(false);
    } catch {
      toast({ title: "Error al eliminar", variant: "destructive" });
    }
  };

  const handleDuplicate = async () => {
    try {
      await createProducto.mutateAsync({
        nombre: nombre.trim() + " (copia)",
        codigo: codigo.trim() ? codigo.trim() + "-copia" : null,
        descripcion: descripcion.trim() || null,
        cantidad: Number(cantidad) || 0,
        unidad,
        cantidad_minima: Number(cantidadMinima) || 0,
        precio_unitario: Number(precioUnitario) || 0,
        proveedor: proveedor.trim() || null,
        ubicacion_id: ubicacionId,
        notas: notas.trim() || null,
      });
      toast({ title: "Producto duplicado correctamente" });
      onOpenChange(false);
    } catch {
      toast({ title: "Error al duplicar", variant: "destructive" });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Editar Producto de Stock</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Ubicación</Label>
            <Select value={ubicacionId} onValueChange={setUbicacionId}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ubicaciones?.map((u) => (
                  <SelectItem key={u.id} value={u.id}>
                    {u.nombre} ({u.tipo === 'maquina' ? 'Máquina' : 'Apartado'})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-4 grid-cols-2">
            <div className="space-y-2 col-span-2">
              <Label>Nombre del producto *</Label>
              <Input
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                autoFocus
              />
            </div>
            <div className="space-y-2">
              <Label>Código</Label>
              <Input
                value={codigo}
                onChange={(e) => setCodigo(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Unidad</Label>
              <Select value={unidad} onValueChange={setUnidad}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="unidades">Unidades</SelectItem>
                  <SelectItem value="metros">Metros</SelectItem>
                  <SelectItem value="rollos">Rollos</SelectItem>
                  <SelectItem value="litros">Litros</SelectItem>
                  <SelectItem value="kg">Kg</SelectItem>
                  <SelectItem value="cajas">Cajas</SelectItem>
                  <SelectItem value="bobinas">Bobinas</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Cantidad</Label>
              <Input
                type="number"
                step="any"
                value={cantidad}
                onChange={(e) => setCantidad(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Cantidad mínima</Label>
              <Input
                type="number"
                step="any"
                value={cantidadMinima}
                onChange={(e) => setCantidadMinima(e.target.value)}
              />
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
              <Label>Proveedor</Label>
              <Input
                value={proveedor}
                onChange={(e) => setProveedor(e.target.value)}
                placeholder="Nombre del proveedor"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Descripción</Label>
            <Input
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label>Notas</Label>
            <Textarea
              value={notas}
              onChange={(e) => setNotas(e.target.value)}
              rows={2}
            />
          </div>

          <div className="flex justify-between">
            <Button
              type="button"
              variant="destructive"
              onClick={handleDelete}
              disabled={deleteProducto.isPending}
            >
              Eliminar
            </Button>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={handleDuplicate}
                disabled={createProducto.isPending}
              >
                <Copy className="w-4 h-4 mr-1" />
                {createProducto.isPending ? "Duplicando..." : "Duplicar"}
              </Button>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={!nombre.trim() || updateProducto.isPending}>
                {updateProducto.isPending ? "Guardando..." : "Guardar"}
              </Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

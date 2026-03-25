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
import { Plus } from "lucide-react";
import { useCreateStockProducto } from "@/hooks/useStock";
import { useStockUbicaciones } from "@/hooks/useStock";
import { useToast } from "@/hooks/use-toast";

interface Props {
  preselectedUbicacionId?: string;
}

export function AddStockProductoDialog({ preselectedUbicacionId }: Props) {
  const [open, setOpen] = useState(false);
  const [nombre, setNombre] = useState("");
  const [codigo, setCodigo] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [cantidad, setCantidad] = useState("");
  const [unidad, setUnidad] = useState("unidades");
  const [cantidadMinima, setCantidadMinima] = useState("");
  const [precioUnitario, setPrecioUnitario] = useState("");
  const [proveedor, setProveedor] = useState("");
  const [ubicacionId, setUbicacionId] = useState(preselectedUbicacionId || "");
  const [notas, setNotas] = useState("");

  const { data: ubicaciones } = useStockUbicaciones();
  const createProducto = useCreateStockProducto();
  const { toast } = useToast();

  const resetForm = () => {
    setNombre("");
    setCodigo("");
    setDescripcion("");
    setCantidad("");
    setUnidad("unidades");
    setCantidadMinima("");
    setPrecioUnitario("");
    setProveedor("");
    setUbicacionId(preselectedUbicacionId || "");
    setNotas("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre.trim() || !ubicacionId) return;

    try {
      await createProducto.mutateAsync({
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
      toast({ title: "Producto añadido al stock" });
      resetForm();
      setOpen(false);
    } catch {
      toast({ title: "Error al añadir producto", variant: "destructive" });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline">
          <Plus className="w-4 h-4 mr-2" />
          Añadir Producto
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Añadir Producto al Stock</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {!preselectedUbicacionId && (
            <div className="space-y-2">
              <Label>Ubicación *</Label>
              <Select value={ubicacionId} onValueChange={setUbicacionId}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar ubicación..." />
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
          )}

          <div className="grid gap-4 grid-cols-2">
            <div className="space-y-2 col-span-2">
              <Label>Nombre del producto *</Label>
              <Input
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                placeholder="Ej: Vinilo blanco mate"
                autoFocus
              />
            </div>
            <div className="space-y-2">
              <Label>Código</Label>
              <Input
                value={codigo}
                onChange={(e) => setCodigo(e.target.value)}
                placeholder="Ej: VIN-001"
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
                placeholder="0"
              />
            </div>
            <div className="space-y-2">
              <Label>Cantidad mínima</Label>
              <Input
                type="number"
                step="any"
                value={cantidadMinima}
                onChange={(e) => setCantidadMinima(e.target.value)}
                placeholder="0"
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
              placeholder="Descripción breve del producto"
            />
          </div>

          <div className="space-y-2">
            <Label>Notas</Label>
            <Textarea
              value={notas}
              onChange={(e) => setNotas(e.target.value)}
              rows={2}
              placeholder="Notas internas..."
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={!nombre.trim() || !ubicacionId || createProducto.isPending}>
              {createProducto.isPending ? "Añadiendo..." : "Añadir"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

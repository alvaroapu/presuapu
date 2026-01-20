import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { formatCurrency } from "@/lib/formatters";
import { useCategorias } from "@/hooks/useCategorias";
import { useCreateProducto } from "@/hooks/useProductos";
import { useToast } from "@/hooks/use-toast";
import { Save, Package } from "lucide-react";

interface LineaLocal {
  id: string;
  producto_id: string | null;
  producto_nombre: string;
  producto_categoria: string;
  cantidad: number;
  tipo_cantidad: string;
  descripcion: string;
  precio_unitario: number;
  importe: number;
}

interface ProductoPersonalizadoDialogProps {
  open: boolean;
  onClose: () => void;
  onAdd: (linea: LineaLocal) => void;
}

const TIPOS_CANTIDAD = [
  { value: 'unidades', label: 'Unidades', suffix: 'uds' },
  { value: 'metros', label: 'Metros cuadrados', suffix: 'm²' },
  { value: 'horas', label: 'Horas', suffix: 'h' },
];

export function ProductoPersonalizadoDialog({ open, onClose, onAdd }: ProductoPersonalizadoDialogProps) {
  const { data: categorias } = useCategorias();
  const createProducto = useCreateProducto();
  const { toast } = useToast();

  const [nombre, setNombre] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [cantidadStr, setCantidadStr] = useState("1");
  const [tipoCantidad, setTipoCantidad] = useState("unidades");
  const [precioUnitarioStr, setPrecioUnitarioStr] = useState("");
  const [guardarEnCatalogo, setGuardarEnCatalogo] = useState(false);
  const [categoriaId, setCategoriaId] = useState<string>("");
  const [saving, setSaving] = useState(false);

  const cantidad = cantidadStr === '' ? 0 : Number(cantidadStr);
  const precioUnitario = precioUnitarioStr === '' ? 0 : Number(precioUnitarioStr);
  const importe = cantidad * precioUnitario;

  // Reset on open
  useEffect(() => {
    if (open) {
      setNombre("");
      setDescripcion("");
      setCantidadStr("1");
      setTipoCantidad("unidades");
      setPrecioUnitarioStr("");
      setGuardarEnCatalogo(false);
      setCategoriaId("");
      setSaving(false);
    }
  }, [open]);

  const tipoSeleccionado = TIPOS_CANTIDAD.find(t => t.value === tipoCantidad);

  const canAdd = nombre.trim() && cantidad > 0 && precioUnitario > 0;
  const canSave = canAdd && guardarEnCatalogo && categoriaId;

  const handleAdd = async () => {
    if (!canAdd) return;

    setSaving(true);
    let productoId: string | null = null;
    let categoriaNombre = "Personalizado";

    try {
      // Si quiere guardar en catálogo, primero creamos el producto
      if (guardarEnCatalogo && categoriaId) {
        const tipoCalculo = tipoCantidad === 'metros' ? 'por_metro' : 
                           tipoCantidad === 'horas' ? 'por_hora' : 'por_unidad';
        
        const nuevoProducto = await createProducto.mutateAsync({
          nombre: nombre.trim(),
          descripcion: descripcion.trim() || null,
          categoria_id: categoriaId,
          tipo_calculo: tipoCalculo,
          precio_por_unidad: tipoCantidad === 'unidades' ? precioUnitario : null,
          precio_por_hora: tipoCantidad === 'horas' ? precioUnitario : null,
          precio_metro_tarifa_1: tipoCantidad === 'metros' ? precioUnitario : null,
          precio_metro_tarifa_2: tipoCantidad === 'metros' ? precioUnitario : null,
          metros_limite_tarifa_1: 0,
          precio_base_fijo: 0,
          precio_material: 0,
          precio_preparacion: 0,
          precio_montaje: 0,
          activo: true,
        });
        
        productoId = nuevoProducto.id;
        categoriaNombre = categorias?.find(c => c.id === categoriaId)?.nombre || "Personalizado";
        toast({ title: "Producto guardado en el catálogo" });
      }

      onAdd({
        id: '',
        producto_id: productoId,
        producto_nombre: nombre.trim(),
        producto_categoria: categoriaNombre,
        cantidad,
        tipo_cantidad: tipoCantidad,
        descripcion: descripcion.trim(),
        precio_unitario: precioUnitario,
        importe
      });

      onClose();
    } catch (error) {
      console.error(error);
      toast({ title: "Error al guardar el producto", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="w-5 h-5" />
            Producto Personalizado
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Nombre */}
          <div className="space-y-2">
            <Label htmlFor="nombre">Nombre del producto *</Label>
            <Input
              id="nombre"
              value={nombre}
              onChange={e => setNombre(e.target.value)}
              placeholder="Ej: Desplazamiento, Montaje extra..."
            />
          </div>

          {/* Tipo y Cantidad */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Tipo de cantidad</Label>
              <Select value={tipoCantidad} onValueChange={setTipoCantidad}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TIPOS_CANTIDAD.map(tipo => (
                    <SelectItem key={tipo.value} value={tipo.value}>
                      {tipo.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Cantidad *</Label>
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  min={0.01}
                  step={0.01}
                  value={cantidadStr}
                  onChange={e => setCantidadStr(e.target.value)}
                />
                <span className="text-muted-foreground text-sm w-10">
                  {tipoSeleccionado?.suffix}
                </span>
              </div>
            </div>
          </div>

          {/* Precio Unitario */}
          <div className="space-y-2">
            <Label>Precio unitario *</Label>
            <div className="flex items-center gap-2">
              <Input
                type="number"
                min={0}
                step={0.01}
                value={precioUnitarioStr}
                onChange={e => setPrecioUnitarioStr(e.target.value)}
                placeholder="0.00"
              />
              <span className="text-muted-foreground text-sm">€/{tipoSeleccionado?.suffix}</span>
            </div>
          </div>

          {/* Total */}
          {cantidad > 0 && precioUnitario > 0 && (
            <div className="bg-muted/50 rounded-lg p-4">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">
                  {cantidad} {tipoSeleccionado?.suffix} × {formatCurrency(precioUnitario)}
                </span>
                <span className="text-lg font-bold">{formatCurrency(importe)}</span>
              </div>
            </div>
          )}

          {/* Descripción */}
          <div className="space-y-2">
            <Label>Descripción (opcional)</Label>
            <Textarea
              value={descripcion}
              onChange={e => setDescripcion(e.target.value)}
              placeholder="Descripción adicional para el presupuesto"
              rows={2}
            />
          </div>

          {/* Guardar en catálogo */}
          <div className="border rounded-lg p-4 space-y-3">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="guardar"
                checked={guardarEnCatalogo}
                onCheckedChange={(checked) => setGuardarEnCatalogo(checked === true)}
              />
              <Label htmlFor="guardar" className="font-normal cursor-pointer">
                Guardar producto en el catálogo
              </Label>
            </div>
            
            {guardarEnCatalogo && (
              <div className="space-y-2 pl-6">
                <Label>Categoría *</Label>
                <Select value={categoriaId} onValueChange={setCategoriaId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona una categoría" />
                  </SelectTrigger>
                  <SelectContent>
                    {categorias?.map(cat => (
                      <SelectItem key={cat.id} value={cat.id}>
                        {cat.nombre}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={onClose} disabled={saving}>
              Cancelar
            </Button>
            <Button 
              onClick={handleAdd} 
              disabled={!canAdd || (guardarEnCatalogo && !categoriaId) || saving}
            >
              {saving ? (
                "Guardando..."
              ) : guardarEnCatalogo ? (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Añadir y Guardar
                </>
              ) : (
                "Añadir al presupuesto"
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
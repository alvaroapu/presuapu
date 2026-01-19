import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useProducto, useCalcularPrecio } from "@/hooks/useProductos";
import { formatCurrency, formatNumber } from "@/lib/formatters";

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

interface LineaEditDialogProps {
  open: boolean;
  linea: LineaLocal | null;
  onClose: () => void;
  onSave: (linea: LineaLocal) => void;
}

export function LineaEditDialog({ open, linea, onClose, onSave }: LineaEditDialogProps) {
  const [cantidadStr, setCantidadStr] = useState("1");
  const [tipoCantidad, setTipoCantidad] = useState("metros");
  const [descripcion, setDescripcion] = useState("");

  const { data: producto } = useProducto(linea?.producto_id || undefined);
  
  const cantidad = cantidadStr === '' ? 0 : Number(cantidadStr);
  
  const { data: precio, isLoading: loadingPrecio } = useCalcularPrecio(
    linea?.producto_id || undefined,
    cantidad,
    tipoCantidad
  );

  // Initialize values when linea changes
  useEffect(() => {
    if (linea) {
      setCantidadStr(String(linea.cantidad));
      setTipoCantidad(linea.tipo_cantidad);
      setDescripcion(linea.descripcion || "");
    }
  }, [linea]);

  const handleSave = () => {
    if (!linea || !precio) return;

    onSave({
      ...linea,
      cantidad,
      tipo_cantidad: tipoCantidad,
      descripcion,
      precio_unitario: precio.precio_unitario,
      importe: precio.importe_total
    });
    onClose();
  };

  const getUnitLabel = () => {
    switch (tipoCantidad) {
      case 'metros': return 'm²';
      case 'horas': return 'h';
      case 'unidades': return 'uds';
      default: return 'placas';
    }
  };

  if (!linea) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Editar Línea</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Product info */}
          <div className="p-3 bg-muted/50 rounded-lg">
            <p className="font-medium">{linea.producto_nombre}</p>
            <p className="text-sm text-muted-foreground">{linea.producto_categoria}</p>
          </div>

          {/* Quantity Input */}
          <div className="space-y-2">
            <Label>
              {producto?.tipo_calculo === 'por_metro' && 'Metros cuadrados'}
              {producto?.tipo_calculo === 'por_hora' && 'Horas'}
              {producto?.tipo_calculo === 'por_unidad' && 'Unidades'}
              {producto?.tipo_calculo === 'por_placa' && 'Cantidad de placas'}
              {!producto && 'Cantidad'}
            </Label>
            <div className="flex items-center gap-2">
              <Input
                type="number"
                min={0.1}
                step={0.1}
                value={cantidadStr}
                onChange={e => setCantidadStr(e.target.value)}
                className="w-32"
              />
              <span className="text-muted-foreground">{getUnitLabel()}</span>
            </div>
          </div>

          {/* Placa type selector */}
          {producto?.tipo_calculo === 'por_placa' && (
            <div className="space-y-2">
              <Label>Tamaño de placa</Label>
              <RadioGroup value={tipoCantidad} onValueChange={setTipoCantidad}>
                <div className="flex items-center gap-4">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="placas_a4" id="edit-a4" />
                    <Label htmlFor="edit-a4">A4 ({formatCurrency(producto.precio_placa_a4 || 0)})</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="placas_a3" id="edit-a3" />
                    <Label htmlFor="edit-a3">A3 ({formatCurrency(producto.precio_placa_a3 || 0)})</Label>
                  </div>
                </div>
              </RadioGroup>
            </div>
          )}

          {/* Price Breakdown */}
          {loadingPrecio ? (
            <div className="text-sm text-muted-foreground">Calculando precio...</div>
          ) : precio ? (
            <div className="bg-muted/50 rounded-lg p-4 space-y-2">
              <h4 className="font-medium text-sm">Cálculo del precio</h4>
              {precio.desglose.precio_fijo !== undefined && precio.desglose.precio_fijo > 0 && (
                <div className="flex justify-between text-sm">
                  <span>Precio base (1er m²):</span>
                  <span>{formatCurrency(precio.desglose.precio_fijo)}</span>
                </div>
              )}
              {precio.desglose.importe_metro_2 !== undefined && precio.desglose.importe_metro_2 > 0 && (
                <div className="flex justify-between text-sm">
                  <span>2º metro:</span>
                  <span>{formatCurrency(precio.desglose.importe_metro_2)}</span>
                </div>
              )}
              {precio.desglose.metros_tarifa_1 !== undefined && precio.desglose.metros_tarifa_1 > 0 && (
                <div className="flex justify-between text-sm">
                  <span>{formatNumber(precio.desglose.metros_tarifa_1)} m² × {formatCurrency(precio.desglose.precio_metro_tarifa_1 || 0)}:</span>
                  <span>{formatCurrency(precio.desglose.importe_tarifa_1 || 0)}</span>
                </div>
              )}
              {precio.desglose.metros_tarifa_2 !== undefined && precio.desglose.metros_tarifa_2 > 0 && (
                <div className="flex justify-between text-sm">
                  <span>{formatNumber(precio.desglose.metros_tarifa_2)} m² × {formatCurrency(precio.desglose.precio_metro_tarifa_2 || 0)}:</span>
                  <span>{formatCurrency(precio.desglose.importe_tarifa_2 || 0)}</span>
                </div>
              )}
              <div className="flex justify-between font-medium border-t pt-2">
                <span>TOTAL:</span>
                <span className="text-primary">{formatCurrency(precio.importe_total)}</span>
              </div>
              <p className="text-xs text-muted-foreground">
                Precio medio: {formatCurrency(precio.precio_unitario)}/{getUnitLabel()}
              </p>
            </div>
          ) : null}

          {/* Description */}
          <div className="space-y-2">
            <Label>Descripción adicional (opcional)</Label>
            <Textarea
              value={descripcion}
              onChange={e => setDescripcion(e.target.value)}
              placeholder="Ej: Rotulación fachada principal"
              rows={2}
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={onClose}>Cancelar</Button>
            <Button 
              onClick={handleSave} 
              disabled={!precio || cantidad <= 0}
            >
              Guardar Cambios
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

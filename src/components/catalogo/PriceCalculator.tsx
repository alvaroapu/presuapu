import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCalcularPrecio } from "@/hooks/useProductos";
import { formatCurrency, formatNumber } from "@/lib/formatters";
import { Calculator, X } from "lucide-react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import type { ProductoConCategoria } from "@/hooks/useProductos";

interface PriceCalculatorProps {
  producto: ProductoConCategoria;
  onClose: () => void;
}

export function PriceCalculator({ producto, onClose }: PriceCalculatorProps) {
  const [cantidadStr, setCantidadStr] = useState("1");
  const [tipoCantidad, setTipoCantidad] = useState(() => {
    switch (producto.tipo_calculo) {
      case 'por_metro': return 'metros';
      case 'por_hora': return 'horas';
      case 'por_unidad': return 'unidades';
      case 'por_placa': return 'placas_a4';
      default: return 'metros';
    }
  });

  const cantidad = cantidadStr === '' ? 0 : Number(cantidadStr);

  const { data: precio, isLoading } = useCalcularPrecio(
    producto.id || undefined,
    cantidad,
    tipoCantidad
  );

  const getUnitLabel = () => {
    switch (tipoCantidad) {
      case 'metros': return 'm²';
      case 'horas': return 'h';
      case 'unidades': return 'uds';
      default: return 'placas';
    }
  };

  return (
    <div className="mt-4 p-4 bg-muted/50 rounded-lg border space-y-4" onClick={(e) => e.stopPropagation()}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Calculator className="w-4 h-4 text-primary" />
          <span className="font-medium text-sm">Calculadora de precios</span>
        </div>
        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={onClose}>
          <X className="w-4 h-4" />
        </Button>
      </div>

      {/* Quantity Input */}
      <div className="space-y-2">
        <Label className="text-sm">
          {producto.tipo_calculo === 'por_metro' && 'Metros cuadrados'}
          {producto.tipo_calculo === 'por_hora' && 'Horas'}
          {producto.tipo_calculo === 'por_unidad' && 'Unidades'}
          {producto.tipo_calculo === 'por_placa' && 'Cantidad de placas'}
        </Label>
        <div className="flex items-center gap-2">
          <Input
            type="number"
            min={0.1}
            step={0.1}
            value={cantidadStr}
            onChange={e => setCantidadStr(e.target.value)}
            className="w-24 h-8 text-sm"
            onClick={(e) => e.stopPropagation()}
          />
          <span className="text-sm text-muted-foreground">{getUnitLabel()}</span>
        </div>
      </div>

      {/* Placa type selector */}
      {producto.tipo_calculo === 'por_placa' && (
        <div className="space-y-2">
          <Label className="text-sm">Tamaño de placa</Label>
          <RadioGroup value={tipoCantidad} onValueChange={setTipoCantidad} className="flex gap-4">
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="placas_a4" id={`a4-${producto.id}`} />
              <Label htmlFor={`a4-${producto.id}`} className="text-sm">
                A4 ({formatCurrency(producto.precio_placa_a4 || 0)})
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="placas_a3" id={`a3-${producto.id}`} />
              <Label htmlFor={`a3-${producto.id}`} className="text-sm">
                A3 ({formatCurrency(producto.precio_placa_a3 || 0)})
              </Label>
            </div>
          </RadioGroup>
        </div>
      )}

      {/* Price Result */}
      {isLoading ? (
        <div className="text-sm text-muted-foreground">Calculando...</div>
      ) : precio ? (
        <div className="space-y-2 pt-2 border-t">
          {precio.desglose.precio_fijo !== undefined && precio.desglose.precio_fijo > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Precio base (1er m²):</span>
              <span>{formatCurrency(precio.desglose.precio_fijo)}</span>
            </div>
          )}
          {precio.desglose.importe_metro_2 !== undefined && precio.desglose.importe_metro_2 > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">2º metro:</span>
              <span>{formatCurrency(precio.desglose.importe_metro_2)}</span>
            </div>
          )}
          {precio.desglose.metros_tarifa_1 !== undefined && precio.desglose.metros_tarifa_1 > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">
                {formatNumber(precio.desglose.metros_tarifa_1)} m² × {formatCurrency(precio.desglose.precio_metro_tarifa_1 || 0)}:
              </span>
              <span>{formatCurrency(precio.desglose.importe_tarifa_1 || 0)}</span>
            </div>
          )}
          {precio.desglose.metros_tarifa_2 !== undefined && precio.desglose.metros_tarifa_2 > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">
                {formatNumber(precio.desglose.metros_tarifa_2)} m² × {formatCurrency(precio.desglose.precio_metro_tarifa_2 || 0)}:
              </span>
              <span>{formatCurrency(precio.desglose.importe_tarifa_2 || 0)}</span>
            </div>
          )}
          <div className="flex justify-between font-semibold text-lg border-t pt-2">
            <span>TOTAL:</span>
            <span className="text-primary">{formatCurrency(precio.importe_total)}</span>
          </div>
          <p className="text-xs text-muted-foreground">
            Precio medio: {formatCurrency(precio.precio_unitario)}/{getUnitLabel()}
          </p>
        </div>
      ) : null}
    </div>
  );
}

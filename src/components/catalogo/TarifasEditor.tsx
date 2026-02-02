import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Trash2, GripVertical } from "lucide-react";
import { formatCurrency } from "@/lib/formatters";

export interface Tarifa {
  id?: string;
  cantidad_desde: number;
  cantidad_hasta: number | null;
  precio_unitario: number;
  orden: number;
}

interface TarifasEditorProps {
  tarifas: Tarifa[];
  onChange: (tarifas: Tarifa[]) => void;
  unidad: string; // "m²", "uds", "h"
}

export function TarifasEditor({ tarifas, onChange, unidad }: TarifasEditorProps) {
  const addTarifa = () => {
    const lastTarifa = tarifas[tarifas.length - 1];
    const newDesde = lastTarifa ? (lastTarifa.cantidad_hasta ?? lastTarifa.cantidad_desde) + 1 : 1;
    
    // Si la última tarifa tenía cantidad_hasta null, actualizarla
    const updatedTarifas = tarifas.map((t, i) => {
      if (i === tarifas.length - 1 && t.cantidad_hasta === null) {
        return { ...t, cantidad_hasta: newDesde - 1 };
      }
      return t;
    });
    
    onChange([
      ...updatedTarifas,
      {
        cantidad_desde: newDesde,
        cantidad_hasta: null,
        precio_unitario: 0,
        orden: tarifas.length
      }
    ]);
  };

  const updateTarifa = (index: number, field: keyof Tarifa, value: number | null) => {
    const updated = tarifas.map((t, i) => {
      if (i === index) {
        return { ...t, [field]: value };
      }
      return t;
    });
    onChange(updated);
  };

  const removeTarifa = (index: number) => {
    const updated = tarifas.filter((_, i) => i !== index);
    // Reordenar
    onChange(updated.map((t, i) => ({ ...t, orden: i })));
  };

  const getRangoLabel = (tarifa: Tarifa) => {
    if (tarifa.cantidad_hasta === null) {
      return `${tarifa.cantidad_desde}+ ${unidad}`;
    }
    if (tarifa.cantidad_desde === tarifa.cantidad_hasta) {
      return `${tarifa.cantidad_desde} ${unidad}`;
    }
    return `${tarifa.cantidad_desde} - ${tarifa.cantidad_hasta} ${unidad}`;
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">Tarifas por cantidad</CardTitle>
          <Button type="button" variant="outline" size="sm" onClick={addTarifa}>
            <Plus className="w-4 h-4 mr-1" />
            Añadir rango
          </Button>
        </div>
        <p className="text-sm text-muted-foreground">
          Define precios diferentes según la cantidad. El precio se aplica a todas las unidades del pedido según el rango en que caiga la cantidad total.
        </p>
      </CardHeader>
      <CardContent className="space-y-3">
        {tarifas.length === 0 ? (
          <div className="text-center py-6 text-muted-foreground border-2 border-dashed rounded-lg">
            <p className="text-sm">No hay tarifas definidas</p>
            <p className="text-xs mt-1">Se usará el precio base del producto</p>
          </div>
        ) : (
          <div className="space-y-2">
            {/* Header */}
            <div className="grid grid-cols-12 gap-2 text-xs text-muted-foreground font-medium px-2">
              <div className="col-span-1"></div>
              <div className="col-span-3">Desde</div>
              <div className="col-span-3">Hasta</div>
              <div className="col-span-4">Precio/{unidad}</div>
              <div className="col-span-1"></div>
            </div>
            
            {tarifas.map((tarifa, index) => (
              <div 
                key={tarifa.id || index} 
                className="grid grid-cols-12 gap-2 items-center p-2 bg-muted/30 rounded-lg"
              >
                <div className="col-span-1 flex justify-center">
                  <GripVertical className="w-4 h-4 text-muted-foreground" />
                </div>
                <div className="col-span-3">
                  <Input
                    type="number"
                    min={1}
                    step={1}
                    value={tarifa.cantidad_desde}
                    onChange={(e) => updateTarifa(index, 'cantidad_desde', Number(e.target.value))}
                    className="h-8 text-sm"
                  />
                </div>
                <div className="col-span-3">
                  <Input
                    type="number"
                    min={tarifa.cantidad_desde}
                    step={1}
                    value={tarifa.cantidad_hasta ?? ''}
                    onChange={(e) => updateTarifa(index, 'cantidad_hasta', e.target.value === '' ? null : Number(e.target.value))}
                    placeholder="∞"
                    className="h-8 text-sm"
                  />
                </div>
                <div className="col-span-4">
                  <div className="relative">
                    <Input
                      type="number"
                      min={0}
                      step={0.01}
                      value={tarifa.precio_unitario}
                      onChange={(e) => updateTarifa(index, 'precio_unitario', Number(e.target.value))}
                      className="h-8 text-sm pr-8"
                    />
                    <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">€</span>
                  </div>
                </div>
                <div className="col-span-1 flex justify-center">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-destructive hover:text-destructive"
                    onClick={() => removeTarifa(index)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
        
        {/* Preview */}
        {tarifas.length > 0 && (
          <div className="mt-4 pt-4 border-t">
            <Label className="text-xs text-muted-foreground">Vista previa:</Label>
            <div className="flex flex-wrap gap-2 mt-2">
              {tarifas.map((tarifa, index) => (
                <div key={index} className="px-2 py-1 bg-primary/10 rounded text-xs">
                  {getRangoLabel(tarifa)}: {formatCurrency(tarifa.precio_unitario)}/{unidad}
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

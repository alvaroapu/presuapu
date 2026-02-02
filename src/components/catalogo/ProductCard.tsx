import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Calculator, Check } from "lucide-react";
import { formatCurrency } from "@/lib/formatters";
import type { ProductoConCategoria } from "@/hooks/useProductos";

interface ProductCardProps {
  producto: ProductoConCategoria;
  selectionMode: boolean;
  isSelected: boolean;
  showCalculator: boolean;
  onToggleSelection: (e: React.MouseEvent) => void;
  onToggleCalculator: (e: React.MouseEvent) => void;
}

const getTipoLabel = (tipo: string) => {
  switch (tipo) {
    case 'por_metro': return 'm²';
    case 'por_hora': return 'hora';
    case 'por_unidad': return 'ud';
    case 'por_placa': return 'placa';
    default: return tipo;
  }
};

export function ProductCard({
  producto: p,
  selectionMode,
  isSelected,
  showCalculator,
  onToggleSelection,
  onToggleCalculator,
}: ProductCardProps) {
  if (selectionMode) {
    return (
      <div
        onClick={onToggleSelection}
        className={`p-3 cursor-pointer transition-colors ${isSelected ? 'bg-primary/10' : 'hover:bg-muted/30'}`}
      >
        <div className="flex items-start gap-3">
          <Checkbox 
            checked={isSelected}
            onClick={(e) => e.stopPropagation()}
            onCheckedChange={() => {}}
          />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-medium">{p.nombre}</span>
              <Badge variant="outline" className="text-xs">
                {getTipoLabel(p.tipo_calculo || '')}
              </Badge>
              {p.activo ? (
                <Check className="w-4 h-4 text-primary" />
              ) : (
                <Badge variant="secondary" className="text-xs">Inactivo</Badge>
              )}
            </div>
            {p.descripcion && (
              <p className="text-xs text-muted-foreground truncate mt-1">{p.descripcion}</p>
            )}
            <div className="flex items-center gap-4 mt-2 text-sm">
              <span className="font-medium">
                {p.tipo_calculo === 'por_metro' && formatCurrency(p.precio_metro_tarifa_1 || 0)}
                {p.tipo_calculo === 'por_hora' && formatCurrency(p.precio_por_hora || 0)}
                {p.tipo_calculo === 'por_unidad' && formatCurrency(p.precio_por_unidad || 0)}
                {p.tipo_calculo === 'por_placa' && `A4: ${formatCurrency(p.precio_placa_a4 || 0)}`}
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <Link
      to={`/catalogo/productos/${p.id}`}
      className="block p-3 hover:bg-muted/30 transition-colors"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-medium">{p.nombre}</span>
            <Badge variant="outline" className="text-xs">
              {getTipoLabel(p.tipo_calculo || '')}
            </Badge>
            {p.activo ? (
              <Check className="w-4 h-4 text-primary" />
            ) : (
              <Badge variant="secondary" className="text-xs">Inactivo</Badge>
            )}
          </div>
          {p.descripcion && (
            <p className="text-xs text-muted-foreground truncate mt-1">{p.descripcion}</p>
          )}
          <div className="flex items-center gap-4 mt-2 text-sm flex-wrap">
            <div>
              <span className="text-muted-foreground text-xs">Precio: </span>
              <span className="font-medium">
                {p.tipo_calculo === 'por_metro' && formatCurrency(p.precio_metro_tarifa_1 || 0)}
                {p.tipo_calculo === 'por_hora' && formatCurrency(p.precio_por_hora || 0)}
                {p.tipo_calculo === 'por_unidad' && formatCurrency(p.precio_por_unidad || 0)}
                {p.tipo_calculo === 'por_placa' && `A4: ${formatCurrency(p.precio_placa_a4 || 0)}`}
              </span>
            </div>
            {p.precio_montaje && p.precio_montaje > 0 && (
              <div>
                <span className="text-muted-foreground text-xs">Montaje: </span>
                <span className="text-primary font-medium">{formatCurrency(p.precio_montaje)}</span>
              </div>
            )}
            {p.tipo_calculo === 'por_metro' && p.precio_metro_tarifa_2 && (
              <div>
                <span className="text-muted-foreground text-xs">Tarifa 2: </span>
                <span>{formatCurrency(p.precio_metro_tarifa_2)}</span>
              </div>
            )}
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 shrink-0"
          onClick={onToggleCalculator}
        >
          <Calculator className={`w-4 h-4 ${showCalculator ? 'text-primary' : 'text-muted-foreground'}`} />
        </Button>
      </div>
    </Link>
  );
}
